import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";
import { jobService } from "./job.service";
import type { CreateJobPayload, JobFilters } from "./job.types";
import { prisma } from "../../config/prisma";

export const jobController = {
  /**
   * POST /api/jobs - Create a new job
   */
  async createJob(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      // Get employer ID from userId
      const employer = await prisma.employer.findUnique({
        where: { userId },
      });

      if (!employer) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: "Employer profile not found",
        });
        return;
      }

      const job = await jobService.createJob(
        employer.id,
        req.body as CreateJobPayload,
      );
      sendSuccess(res, HTTP_STATUS.CREATED, "Job created successfully", job);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/jobs/my - Get all jobs posted by logged-in employer
   */
  async getMyJobs(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const employer = await prisma.employer.findUnique({
        where: { userId },
      });

      if (!employer) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: "Employer profile not found",
        });
        return;
      }

      const jobs = await jobService.getEmployerJobs(employer.id);
      sendSuccess(res, HTTP_STATUS.OK, "Jobs retrieved successfully", jobs);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/jobs/open - Get all open jobs
   * Query parameters:
   * - category: job category
   * - date: job date (ISO format)
   * - latitude: worker's latitude (for distance filtering)
   * - longitude: worker's longitude (for distance filtering)
   * - radius: search radius in km (default 10)
   */
  async getOpenJobs(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const filters: JobFilters = {
        category: req.query.category as string,
        date: req.query.date as string,
        latitude: req.query.latitude
          ? parseFloat(req.query.latitude as string)
          : undefined,
        longitude: req.query.longitude
          ? parseFloat(req.query.longitude as string)
          : undefined,
        radius: req.query.radius ? parseFloat(req.query.radius as string) : 10, // Default 10km
      };

      const jobs = await jobService.getOpenJobs(filters);
      sendSuccess(res, HTTP_STATUS.OK, "Jobs retrieved successfully", jobs);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/jobs/nearby - Get nearby open jobs (returns reduced job fields with distance)
   * Query parameters: latitude, longitude, radius
   */
  async getNearbyJobs(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const filters: JobFilters = {
        latitude: req.query.latitude
          ? parseFloat(req.query.latitude as string)
          : undefined,
        longitude: req.query.longitude
          ? parseFloat(req.query.longitude as string)
          : undefined,
        radius: req.query.radius ? parseFloat(req.query.radius as string) : 10,
      };

      const jobs = await jobService.getNearbyJobs(filters);
      sendSuccess(res, HTTP_STATUS.OK, "Nearby jobs retrieved successfully", jobs);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/jobs/:jobId - Get single job details
   */
  async getJobById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const jobId = parseInt(req.params.jobId as string, 10);
      const job = await jobService.getJobById(jobId);
      sendSuccess(res, HTTP_STATUS.OK, "Job retrieved successfully", job);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/jobs/:jobId/cancel - Cancel a job
   */
  async cancelJob(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const employer = await prisma.employer.findUnique({
        where: { userId },
      });

      if (!employer) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: "Employer profile not found",
        });
        return;
      }

      const jobId = parseInt(req.params.jobId as string, 10);
      const job = await jobService.cancelJob(jobId, employer.id);
      sendSuccess(res, HTTP_STATUS.OK, "Job cancelled successfully", job);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/jobs/:jobId/complete - Mark job as completed
   */
  async completeJob(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const employer = await prisma.employer.findUnique({
        where: { userId },
      });

      if (!employer) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: "Employer profile not found",
        });
        return;
      }

      const jobId = parseInt(req.params.jobId as string, 10);
      const job = await jobService.completeJob(jobId, employer.id);
      sendSuccess(res, HTTP_STATUS.OK, "Job completed successfully", job);
    } catch (error) {
      next(error);
    }
  },
};
