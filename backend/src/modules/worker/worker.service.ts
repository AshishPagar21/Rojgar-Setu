import { prisma } from "../../config/prisma";
import { HTTP_STATUS } from "../../utils/constants";
import { ApiError } from "../../utils/response";

export const workerService = {
  /**
   * Get worker dashboard data
   */
  async getWorkerDashboard(workerId: number) {
    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
    });

    if (!worker) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Worker not found");
    }

    // Get total applications
    const totalApplications = await prisma.jobApplication.count({
      where: { workerId },
    });

    // Get selected jobs count
    const selectedJobsCount = await prisma.jobApplication.count({
      where: { workerId, status: "SELECTED" },
    });

    // Get payment received count
    const paymentReceivedCount = await prisma.payment.count({
      where: { workerId, status: "COMPLETED" },
    });

    const attendanceRecords = await prisma.attendance.findMany({
      where: { workerId },
      select: { status: true },
    });

    const attendanceCount = attendanceRecords.length;
    const attendedCount = attendanceRecords.filter(
      (record) => record.status === "APPROVED",
    ).length;
    const attendancePercentage =
      attendanceCount > 0 ? (attendedCount / attendanceCount) * 100 : 100;

    // Get recent applications
    const recentApplications = await prisma.jobApplication.findMany({
      where: { workerId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
            jobDate: true,
          },
        },
      },
      orderBy: { appliedAt: "desc" },
      take: 5,
    });

    // Get recent assigned jobs
    const recentAssignedJobs = await prisma.jobApplication.findMany({
      where: { workerId, status: { in: ["SELECTED", "COMPLETED"] } },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            jobDate: true,
            employer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    return {
      worker,
      totalJobsCompleted: worker.totalJobsCompleted,
      reliabilityScore: worker.reliabilityScore,
      attendancePercentage,
      totalApplications,
      selectedJobsCount,
      paymentReceivedCount,
      recentApplications,
      recentAssignedJobs,
    };
  },
};
