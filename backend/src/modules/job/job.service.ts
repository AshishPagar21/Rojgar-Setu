import { prisma } from "../../config/prisma";
import { HTTP_STATUS } from "../../utils/constants";
import { ApiError } from "../../utils/response";
import type { CreateJobPayload } from "./job.types";

export const jobService = {
  /**
   * Create a new job
   */
  async createJob(employerId: number, payload: CreateJobPayload) {
    const job = await prisma.job.create({
      data: {
        employerId,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        wage: payload.wage,
        jobDate: new Date(payload.jobDate),
        requiredWorkers: payload.requiredWorkers,
        latitude: payload.latitude,
        longitude: payload.longitude,
        status: "OPEN",
      },
    });

    // Increment employer's totalJobsPosted
    await prisma.employer.update({
      where: { id: employerId },
      data: { totalJobsPosted: { increment: 1 } },
    });

    return job;
  },

  /**
   * Get all jobs posted by an employer
   */
  async getEmployerJobs(employerId: number) {
    return prisma.job.findMany({
      where: { employerId },
      include: {
        jobApplications: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Get all open jobs (for workers to browse)
   */
  async getOpenJobs(filters?: { category?: string; date?: string }) {
    const where: any = { status: "OPEN" };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.date) {
      const startDate = new Date(filters.date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      where.jobDate = {
        gte: startDate,
        lt: endDate,
      };
    }

    return prisma.job.findMany({
      where,
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            rating: true,
          },
        },
        jobApplications: {
          select: {
            workerId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Get single job details
   */
  async getJobById(jobId: number) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            rating: true,
          },
        },
        jobApplications: {
          include: {
            worker: {
              select: {
                id: true,
                name: true,
                rating: true,
              },
            },
          },
        },
        attendance: true,
        payments: true,
      },
    });

    if (!job) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Job not found");
    }

    return job;
  },

  /**
   * Cancel a job (employer only)
   */
  async cancelJob(jobId: number, employerId: number) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Job not found");
    }

    if (job.employerId !== employerId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only cancel your own jobs",
      );
    }

    if (job.status === "COMPLETED") {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot cancel a completed job",
      );
    }

    return prisma.job.update({
      where: { id: jobId },
      data: { status: "CANCELLED" },
    });
  },

  /**
   * Mark job as completed (employer only)
   */
  async completeJob(jobId: number, employerId: number) {
    return await prisma.$transaction(async (tx) => {
      const job = await tx.job.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Job not found");
      }

      if (job.employerId !== employerId) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          "You can only complete your own jobs",
        );
      }

      if (job.status !== "ASSIGNED") {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Job must be in ASSIGNED status to complete",
        );
      }

      // Get all selected workers
      const selectedApplications = await tx.jobApplication.findMany({
        where: { jobId, status: "SELECTED" },
        select: { workerId: true },
      });

      // Update job status
      const updatedJob = await tx.job.update({
        where: { id: jobId },
        data: { status: "COMPLETED" },
      });

      // Update employer totalJobsCompleted
      await tx.employer.update({
        where: { id: employerId },
        data: { totalJobsCompleted: { increment: 1 } },
      });

      // Update each worker's totalJobsCompleted
      for (const app of selectedApplications) {
        await tx.worker.update({
          where: { id: app.workerId },
          data: { totalJobsCompleted: { increment: 1 } },
        });
      }

      return updatedJob;
    });
  },
};
