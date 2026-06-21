import { prisma } from "../../config/prisma";
import { emitToUsers, SOCKET_EVENTS } from "../../socket/socket.server";
import { HTTP_STATUS } from "../../utils/constants";
import { ApiError } from "../../utils/response";
import { notificationService } from "../notification/notification.service";

export const disputeService = {
  async createDispute(
    userId: number,
    payload: {
      jobId: number;
      attendanceId: number;
      reason: string;
      description: string;
    },
  ) {
    const [job, user, employerProfile, workerProfile] = await Promise.all([
      prisma.job.findUnique({
        where: { id: payload.jobId },
        include: {
          jobApplications: true,
          employer: {
            include: {
              user: true,
            },
          },
        },
      }),
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.employer.findUnique({ where: { userId } }),
      prisma.worker.findUnique({ where: { userId } }),
    ]);

    if (!job || !user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Job or user not found");
    }

    const isEmployer =
      user.role === "EMPLOYER" && job.employerId === employerProfile?.id;
    const isWorker =
      user.role === "WORKER" &&
      !!workerProfile &&
      job.jobApplications.some(
        (application) => application.workerId === workerProfile.id,
      );

    if (!isEmployer && !isWorker) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only raise disputes for your own jobs",
      );
    }

    const attendance = await prisma.attendance.findUnique({
      where: { id: payload.attendanceId },
      include: {
        worker: {
          include: {
            user: true,
          },
        },
        job: {
          include: {
            employer: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!attendance || attendance.jobId !== job.id) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Attendance record not found or does not belong to this job",
      );
    }

    if (user.role === "WORKER" && attendance.worker.userId !== userId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only raise disputes for your own attendance",
      );
    }

    // Check if a dispute already exists for this attendance record
    const existingDispute = await prisma.dispute.findFirst({
      where: { attendanceId: payload.attendanceId },
    });

    let dispute;

    if (!existingDispute) {
      // 1. Raise initial claim
      dispute = await prisma.dispute.create({
        data: {
          jobId: payload.jobId,
          attendanceId: payload.attendanceId,
          workerId: attendance.workerId,
          employerId: job.employerId,
          raisedById: userId,
          raisedByType: user.role,
          reason: payload.reason,
          initialDescription: payload.description,
          status: "OPEN",
        },
      });

      // Update attendance status to ISSUE_REPORTED and sync notes
      await prisma.attendance.update({
        where: { id: payload.attendanceId },
        data: {
          status: "ISSUE_REPORTED",
          notes: payload.description,
        },
      });

      const oppositeUserId =
        user.role === "EMPLOYER" ? attendance.worker.userId : job.employer.user.id;

      // Send in-app notification to the other party
      await notificationService.createNotification({
        userId: oppositeUserId,
        title: "New Dispute Filed Against You",
        message: `An employer has raised a dispute regarding your attendance on job: "${job.title}". Reason: ${payload.reason}.`,
        type: "DISPUTE_CREATED",
      });

      const recipients = new Set<number>([userId, oppositeUserId]);
      emitToUsers(
        Array.from(recipients),
        SOCKET_EVENTS.disputeCreated,
        dispute,
      );
    } else {
      // 2. Raise counter claim
      if (existingDispute.status !== "OPEN") {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "This dispute has already been countered or resolved.",
        );
      }

      if (existingDispute.raisedByType === user.role) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          "You have already filed a claim. Waiting for counter response.",
        );
      }

      dispute = await prisma.dispute.update({
        where: { id: existingDispute.id },
        data: {
          counterDescription: payload.description,
          status: "COUNTERED",
        },
      });

      // Update attendance notes to reflect that both claims are in
      await prisma.attendance.update({
        where: { id: payload.attendanceId },
        data: {
          notes: `[Initial Claim]: ${existingDispute.initialDescription}\n[Counter Claim]: ${payload.description}`,
        },
      });

      // Notify the original creator
      await notificationService.createNotification({
        userId: existingDispute.raisedById,
        title: "Counter Dispute Submitted",
        message: `The worker has responded to your dispute on job: "${job.title}". Both submissions are now locked for admin review.`,
        type: "DISPUTE_COUNTERED",
      });

      const recipients = new Set<number>([userId, existingDispute.raisedById]);
      emitToUsers(
        Array.from(recipients),
        SOCKET_EVENTS.disputeCountered || "dispute:countered",
        dispute,
      );
      emitToUsers(
        Array.from(recipients),
        SOCKET_EVENTS.disputeUpdated,
        dispute,
      );
    }

    return dispute;
  },

  async getMyDisputes(userId: number) {
    return prisma.dispute.findMany({
      where: { raisedById: userId },
      include: { job: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getAllDisputes() {
    return prisma.dispute.findMany({
      include: {
        job: true,
        raisedBy: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async resolveDispute(disputeId: number, status: "RESOLVED" | "REJECTED") {
    return prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.findUnique({
        where: { id: disputeId },
        include: {
          attendance: true,
          job: {
            include: {
              employer: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      if (!dispute) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Dispute not found");
      }

      const updatedDispute = await tx.dispute.update({
        where: { id: disputeId },
        data: { status },
        include: {
          job: {
            include: {
              employer: {
                include: {
                  user: true,
                },
              },
            },
          },
          raisedBy: true,
          attendance: {
            include: {
              worker: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      const workerId = dispute.workerId || dispute.attendance?.workerId;
      const jobId = dispute.jobId || dispute.attendance?.jobId;

      if (workerId && jobId) {
        if (status === "RESOLVED") {
          await tx.payment.updateMany({
            where: { jobId, workerId },
            data: { status: "COMPLETED", paidAt: new Date() },
          });
          await tx.attendance.update({
            where: { id: dispute.attendanceId },
            data: { status: "APPROVED" },
          });
        } else if (status === "REJECTED") {
          await tx.payment.updateMany({
            where: { jobId, workerId },
            data: { status: "DISPUTED" },
          });
          await tx.attendance.update({
            where: { id: dispute.attendanceId },
            data: { status: "APPROVED" }, // resolve settles it, closes review state
          });
        }
      }

      const recipients = new Set<number>([
        updatedDispute.raisedById,
        updatedDispute.job.employer.userId,
      ]);

      if (updatedDispute.attendance?.worker.userId) {
        recipients.add(updatedDispute.attendance.worker.userId);
      }

      emitToUsers(
        Array.from(recipients),
        SOCKET_EVENTS.disputeUpdated,
        updatedDispute,
      );

      return updatedDispute;
    });
  },
};
