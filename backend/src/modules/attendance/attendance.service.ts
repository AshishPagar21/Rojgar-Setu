import { prisma } from "../../config/prisma";
import { HTTP_STATUS } from "../../utils/constants";
import { ApiError } from "../../utils/response";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const updateWorkerReliability = async (
  workerId: number,
  status: "PRESENT" | "ABSENT" | "LEFT_EARLY" | "COMPLETED",
) => {
  const worker = await prisma.worker.findUnique({ where: { id: workerId } });

  if (!worker) {
    return;
  }

  const delta =
    status === "COMPLETED"
      ? 2
      : status === "PRESENT"
        ? 1
        : status === "LEFT_EARLY"
          ? -5
          : -10;

  await prisma.worker.update({
    where: { id: workerId },
    data: {
      reliabilityScore: clamp(worker.reliabilityScore + delta, 0, 100),
    },
  });
};

export const attendanceService = {
  /**
   * Worker checks in to a job
   */
  async checkIn(jobId: number, workerId: number) {
    // Verify worker has SELECTED status for this job
    const jobApplication = await prisma.jobApplication.findUnique({
      where: { jobId_workerId: { jobId, workerId } },
    });

    if (!jobApplication || jobApplication.status !== "SELECTED") {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You are not selected for this job",
      );
    }

    // Verify job is ASSIGNED
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Job not found");
    }

    if (job.status !== "ASSIGNED") {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Job is not in ASSIGNED status",
      );
    }

    // Check if already checked in
    const existingAttendance = await prisma.attendance.findFirst({
      where: { jobId, workerId, checkInTime: { not: null } },
    });

    if (existingAttendance && !existingAttendance.checkOutTime) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "You have already checked in for this job",
      );
    }

    // Create a new attendance record or refresh check-in on latest record.
    const latestAttendance = await prisma.attendance.findFirst({
      where: { jobId, workerId },
      orderBy: { createdAt: "desc" },
    });

    const attendance = latestAttendance
      ? await prisma.attendance.update({
          where: { id: latestAttendance.id },
          data: { checkInTime: new Date(), status: "PRESENT" },
        })
      : await prisma.attendance.create({
          data: {
            jobId,
            workerId,
            checkInTime: new Date(),
            status: "PRESENT",
          },
        });

    await updateWorkerReliability(workerId, "PRESENT");

    return attendance;
  },

  /**
   * Worker checks out from a job
   */
  async checkOut(jobId: number, workerId: number) {
    const attendance = await prisma.attendance.findFirst({
      where: { jobId, workerId, checkInTime: { not: null } },
    });

    if (!attendance) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "No check-in found for this job",
      );
    }

    if (attendance.checkOutTime) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "You have already checked out for this job",
      );
    }

    const checkOutTime = new Date();
    const totalHours = attendance.checkInTime
      ? (checkOutTime.getTime() - attendance.checkInTime.getTime()) /
        (1000 * 60 * 60)
      : 0;

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime: checkOutTime,
        totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimals
        status: "COMPLETED",
      },
    });

    await prisma.jobApplication.update({
      where: { jobId_workerId: { jobId, workerId } },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    await updateWorkerReliability(workerId, "COMPLETED");

    return updatedAttendance;
  },

  async markAttendanceByEmployer(
    jobId: number,
    employerId: number,
    workerId: number,
    status: "PRESENT" | "ABSENT" | "LEFT_EARLY" | "COMPLETED",
    notes?: string,
  ) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Job not found");
    }

    if (job.employerId !== employerId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only mark attendance for your own jobs",
      );
    }

    const application = await prisma.jobApplication.findUnique({
      where: { jobId_workerId: { jobId, workerId } },
    });

    if (!application || application.status !== "SELECTED") {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Only selected workers can be marked for attendance",
      );
    }

    const attendance = await prisma.attendance.upsert({
      where: { jobId_workerId: { jobId, workerId } },
      create: {
        jobId,
        workerId,
        status,
        notes,
        checkInTime:
          status === "PRESENT" || status === "COMPLETED" ? new Date() : null,
        checkOutTime: status === "COMPLETED" ? new Date() : null,
      },
      update: {
        status,
        notes,
        checkInTime:
          status === "PRESENT" || status === "COMPLETED"
            ? new Date()
            : undefined,
        checkOutTime: status === "COMPLETED" ? new Date() : undefined,
      },
    });

    if (status === "COMPLETED") {
      await prisma.jobApplication.update({
        where: { jobId_workerId: { jobId, workerId } },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
    }

    if (status === "ABSENT") {
      await prisma.notification.create({
        data: {
          userId: application.workerId,
          title: "Attendance Update",
          message: `You were marked absent for ${job.title}.`,
          type: "ATTENDANCE_ABSENT",
        },
      });
    }

    await updateWorkerReliability(workerId, status);

    return attendance;
  },

  /**
   * Get worker's attendance history
   */
  async getWorkerAttendance(workerId: number) {
    return prisma.attendance.findMany({
      where: { workerId },
      include: {
        job: {
          include: {
            employer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Get job's attendance records (employer view)
   */
  async getJobAttendance(jobId: number, employerId: number) {
    // Verify job belongs to employer
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Job not found");
    }

    if (job.employerId !== employerId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only view attendance for your own jobs",
      );
    }

    return prisma.attendance.findMany({
      where: { jobId },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            reliabilityScore: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
