import { prisma } from "../../config/prisma";
import { HTTP_STATUS } from "../../utils/constants";
import { ApiError } from "../../utils/response";

export const jobApplicationService = {
  /**
   * Worker applies to a job
   */
  async applyToJob(jobId: number, workerId: number) {
    // Check if job exists and is OPEN
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Job not found");
    }

    if (job.status !== "OPEN") {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Job is not open for applications",
      );
    }

    // Check if worker already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: { jobId_workerId: { jobId, workerId } },
    });

    if (existingApplication) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "You have already applied to this job",
      );
    }

    // Create application
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        workerId,
        status: "APPLIED",
      },
      include: {
        job: true,
        worker: true,
      },
    });

    // TODO: Send notification to employer
    // notificationService.notifyWorkerApplied(job.employerId, workerId, jobId);

    return application;
  },

  /**
   * Get worker's applications
   */
  async getWorkerApplications(workerId: number) {
    return prisma.jobApplication.findMany({
      where: { workerId },
      include: {
        job: {
          include: {
            employer: {
              select: {
                id: true,
                name: true,
                rating: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });
  },

  /**
   * Get worker's assigned jobs
   */
  async getWorkerAssignedJobs(workerId: number) {
    return prisma.jobApplication.findMany({
      where: { workerId, status: "SELECTED" },
      include: {
        job: {
          include: {
            employer: {
              select: {
                id: true,
                name: true,
                rating: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  },

  /**
   * Get all applicants for a job
   */
  async getJobApplicants(jobId: number, employerId: number) {
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
        "You can only view applicants for your own jobs",
      );
    }

    return prisma.jobApplication.findMany({
      where: { jobId },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            rating: true,
            totalRatings: true,
            totalJobsCompleted: true,
          },
        },
      },
      orderBy: [{ worker: { rating: "desc" } }, { appliedAt: "desc" }],
    });
  },

  /**
   * Employer selects workers for a job
   */
  async selectWorkersForJob(
    jobId: number,
    employerId: number,
    workerIds: number[],
  ) {
    return await prisma.$transaction(async (tx) => {
      // Verify job exists and belongs to employer
      const job = await tx.job.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Job not found");
      }

      if (job.employerId !== employerId) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          "You can only select workers for your own jobs",
        );
      }

      if (job.status !== "OPEN") {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Job must be in OPEN status to select workers",
        );
      }

      // Verify worker IDs count doesn't exceed required workers
      if (workerIds.length > job.requiredWorkers) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          `Cannot select more than ${job.requiredWorkers} workers`,
        );
      }

      // Get current APPLIED applications
      const currentApplications = await tx.jobApplication.findMany({
        where: { jobId },
      });

      // Verify all worker IDs are in APPLIED status
      for (const workerId of workerIds) {
        const app = currentApplications.find(
          (a) => a.workerId === workerId && a.status === "APPLIED",
        );
        if (!app) {
          throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            `Worker ${workerId} has not applied or is not in APPLIED status`,
          );
        }
      }

      // Update selected workers to SELECTED
      await tx.jobApplication.updateMany({
        where: { jobId, workerId: { in: workerIds } },
        data: { status: "SELECTED" },
      });

      // If we have enough selected workers, mark remaining APPLIED as REJECTED
      if (workerIds.length === job.requiredWorkers) {
        const appliedWorkerIds = currentApplications
          .filter(
            (a) => a.status === "APPLIED" && !workerIds.includes(a.workerId),
          )
          .map((a) => a.workerId);

        if (appliedWorkerIds.length > 0) {
          await tx.jobApplication.updateMany({
            where: { jobId, workerId: { in: appliedWorkerIds } },
            data: { status: "REJECTED" },
          });
        }

        // Update job status to ASSIGNED
        await tx.job.update({
          where: { id: jobId },
          data: { status: "ASSIGNED" },
        });
      }

      // Fetch updated applications
      return tx.jobApplication.findMany({
        where: { jobId },
        include: {
          worker: {
            select: {
              id: true,
              name: true,
              rating: true,
            },
          },
        },
      });
    });
  },
};
