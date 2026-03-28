import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";
import { jobApplicationService } from "./jobApplication.service";
import { prisma } from "../../config/prisma";

export const jobApplicationController = {
  /**
   * POST /api/job-applications/:jobId/apply - Worker applies to a job
   */
  async applyToJob(
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

      const worker = await prisma.worker.findUnique({
        where: { userId },
      });

      if (!worker) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: "Worker profile not found",
        });
        return;
      }

      const jobId = parseInt(req.params.jobId as string, 10);
      const application = await jobApplicationService.applyToJob(
        jobId,
        worker.id,
      );
      sendSuccess(
        res,
        HTTP_STATUS.CREATED,
        "Application submitted successfully",
        application,
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/job-applications/my - Get worker's applications
   */
  async getMyApplications(
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

      const worker = await prisma.worker.findUnique({
        where: { userId },
      });

      if (!worker) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: "Worker profile not found",
        });
        return;
      }

      const applications = await jobApplicationService.getWorkerApplications(
        worker.id,
      );
      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Applications retrieved successfully",
        applications,
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/job-applications/my-assigned - Get worker's assigned jobs
   */
  async getMyAssignedJobs(
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

      const worker = await prisma.worker.findUnique({
        where: { userId },
      });

      if (!worker) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: "Worker profile not found",
        });
        return;
      }

      const jobs = await jobApplicationService.getWorkerAssignedJobs(worker.id);
      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Assigned jobs retrieved successfully",
        jobs,
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/job-applications/job/:jobId - Get applicants for a job
   */
  async getJobApplicants(
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
      const applicants = await jobApplicationService.getJobApplicants(
        jobId,
        employer.id,
      );
      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Applicants retrieved successfully",
        applicants,
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/job-applications/job/:jobId/select - Select workers for a job
   */
  async selectWorkers(
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
      const { workerIds } = req.body as { workerIds: number[] };
      const applications = await jobApplicationService.selectWorkersForJob(
        jobId,
        employer.id,
        workerIds,
      );
      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Workers selected successfully",
        applications,
      );
    } catch (error) {
      next(error);
    }
  },
};
