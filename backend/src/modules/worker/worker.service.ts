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
      where: { workerId, paymentStatus: "SUCCESS" },
    });

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
      where: { workerId, status: "SELECTED" },
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
      totalApplications,
      selectedJobsCount,
      paymentReceivedCount,
      recentApplications,
      recentAssignedJobs,
    };
  },
};
