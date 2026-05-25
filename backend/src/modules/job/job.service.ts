import { prisma } from "../../config/prisma";
import { HTTP_STATUS } from "../../utils/constants";
import { ApiError } from "../../utils/response";
import { calculateDistance } from "../../utils/geolocation";
import type { CreateJobPayload, JobFilters } from "./job.types";

const buildDescriptionWithLocation = (payload: CreateJobPayload) => {
  const baseDescription = payload.description.trim();
  const locationLine1 = payload.locationLine1.trim();
  const city = payload.city.trim();
  const landmark = payload.landmark.trim();

  return `${baseDescription}\n\nLocation: ${locationLine1}, ${city}, ${landmark}`;
};

export const jobService = {
  /**
   * Create a new job
   */
  async createJob(employerId: number, payload: CreateJobPayload) {
    // Validate coordinates
    if (!payload.latitude || !payload.longitude) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Location coordinates (latitude and longitude) are required",
      );
    }

    const job = await prisma.job.create({
      data: {
        employerId,
        title: payload.title,
        description: buildDescriptionWithLocation(payload),
        category: payload.category,
        wage: payload.wage,
        jobDate: new Date(payload.jobDate),
        requiredWorkers: payload.requiredWorkers,
        locationLine1: payload.locationLine1,
        city: payload.city,
        landmark: payload.landmark,
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
   * If worker coordinates are provided, filters jobs within 10km radius
   */
  async getOpenJobs(filters?: JobFilters) {
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

    const jobs = await prisma.job.findMany({
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

    // Filter by distance if worker location is provided
    if (filters?.latitude && filters?.longitude) {
      const radius = filters.radius || 10; // Default 10km radius

      // Calculate distance for each job, filter by radius and sort by nearest
      const jobsWithDistance = jobs
        .map((job) => ({
          ...job,
          distance: calculateDistance(
            filters.latitude!,
            filters.longitude!,
            job.latitude,
            job.longitude,
          ),
        }))
        .filter((j) => j.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      return jobsWithDistance;
    }

    return jobs;
  },

  /**
   * Get nearby open jobs within a radius (returns reduced payload with distance)
   */
  async getNearbyJobs(filters: JobFilters) {
    if (!filters?.latitude || !filters?.longitude) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "latitude and longitude are required");
    }

    const radius = filters.radius || 10;

    // Fetch OPEN jobs (keep includes minimal to avoid heavy payload)
    const jobs = await prisma.job.findMany({
      where: { status: "OPEN" },
      select: {
        id: true,
        title: true,
        city: true,
        landmark: true,
        wage: true,
        latitude: true,
        longitude: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const jobsWithDistance = jobs
      .map((job) => ({
        id: job.id,
        title: job.title,
        city: job.city,
        landmark: job.landmark,
        wage: job.wage,
        latitude: job.latitude,
        longitude: job.longitude,
        distance: calculateDistance(
          filters.latitude!,
          filters.longitude!,
          job.latitude,
          job.longitude,
        ),
      }))
      .filter((j) => j.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return jobsWithDistance;
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
