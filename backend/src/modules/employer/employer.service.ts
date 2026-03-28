import { prisma } from "../../config/prisma";
import { HTTP_STATUS } from "../../utils/constants";
import { ApiError } from "../../utils/response";

export const employerService = {
  /**
   * Get employer dashboard data
   */
  async getEmployerDashboard(employerId: number) {
    const employer = await prisma.employer.findUnique({
      where: { id: employerId },
    });

    if (!employer) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Employer not found");
    }

    // Get all jobs grouped by status
    const jobs = await prisma.job.findMany({
      where: { employerId },
    });

    const openJobsCount = jobs.filter((j) => j.status === "OPEN").length;
    const assignedJobsCount = jobs.filter(
      (j) => j.status === "ASSIGNED",
    ).length;
    const completedJobsCount = jobs.filter(
      (j) => j.status === "COMPLETED",
    ).length;

    // Get recent jobs
    const recentJobs = await prisma.job.findMany({
      where: { employerId },
      include: {
        jobApplications: {
          where: { status: "SELECTED" },
          select: { workerId: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return {
      employer,
      totalJobsPosted: employer.totalJobsPosted,
      totalJobsCompleted: employer.totalJobsCompleted,
      openJobsCount,
      assignedJobsCount,
      completedJobsCount,
      recentJobs,
    };
  },
};
