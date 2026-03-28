import { prisma } from "../../config/prisma";
import { HTTP_STATUS } from "../../utils/constants";
import { ApiError } from "../../utils/response";

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
          data: { checkInTime: new Date() },
        })
      : await prisma.attendance.create({
          data: {
            jobId,
            workerId,
            checkInTime: new Date(),
          },
        });

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
      },
    });

    return updatedAttendance;
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
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
