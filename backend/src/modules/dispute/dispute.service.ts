import { prisma } from "../../config/prisma";
import { emitToUsers, SOCKET_EVENTS } from "../../socket/socket.server";
import { HTTP_STATUS } from "../../utils/constants";
import { ApiError } from "../../utils/response";

export const disputeService = {
  async createDispute(
    userId: number,
    payload: {
      jobId: number;
      attendanceId?: number;
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
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Job not found");
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

    const attendance = payload.attendanceId
      ? await prisma.attendance.findUnique({
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
        })
      : null;

    if (payload.attendanceId && (!attendance || attendance.jobId !== job.id)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Attendance does not belong to this job",
      );
    }

    if (
      attendance &&
      user.role === "WORKER" &&
      attendance.worker.userId !== userId
    ) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only raise disputes for your own attendance",
      );
    }

    const dispute = await prisma.dispute.create({
      data: {
        jobId: payload.jobId,
        attendanceId: attendance?.id,
        workerId: attendance?.workerId ?? workerProfile?.id ?? null,
        employerId: job.employerId,
        raisedById: userId,
        reason: payload.reason,
        description: payload.description,
      },
    });

    const recipients = new Set<number>([userId, job.employer.userId]);

    if (attendance?.worker.userId) {
      recipients.add(attendance.worker.userId);
    }

    emitToUsers(Array.from(recipients), SOCKET_EVENTS.disputeCreated, dispute);

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
    const dispute = await prisma.dispute.update({
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

    const recipients = new Set<number>([
      dispute.raisedById,
      dispute.job.employer.userId,
    ]);

    if (dispute.attendance?.worker.userId) {
      recipients.add(dispute.attendance.worker.userId);
    }

    emitToUsers(Array.from(recipients), SOCKET_EVENTS.disputeUpdated, dispute);

    return dispute;
  },
};
