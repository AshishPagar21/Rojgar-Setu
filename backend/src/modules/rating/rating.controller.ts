import type { NextFunction, Request, Response } from "express";

import { prisma } from "../../config/prisma";
import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";
import { ratingService } from "./rating.service";

export const ratingController = {
  /**
   * GET /api/ratings/jobs/:jobId/eligible-workers
   */
  async getEligibleWorkers(
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

      const workers = await ratingService.getEligibleWorkers(
        jobId,
        employer.id,
        userId,
      );

      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Eligible workers retrieved successfully",
        workers,
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/ratings
   */
  async createRating(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { jobId, toUserId, ratingValue, reviewText } = req.body as {
        jobId: number;
        toUserId: number;
        ratingValue: number;
        reviewText?: string;
      };

      if (role === "EMPLOYER") {
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

        const rating = await ratingService.createRating(
          jobId,
          userId,
          employer.id,
          toUserId,
          ratingValue,
          reviewText,
        );

        sendSuccess(
          res,
          HTTP_STATUS.CREATED,
          "Rating submitted successfully",
          rating,
        );
        return;
      }

      if (role === "WORKER") {
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

        const rating = await ratingService.createWorkerRating(
          jobId,
          userId,
          worker.id,
          toUserId,
          ratingValue,
          reviewText,
        );

        sendSuccess(
          res,
          HTTP_STATUS.CREATED,
          "Rating submitted successfully",
          rating,
        );
        return;
      }

      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Forbidden",
      });
      return;
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/ratings/my-received
   */
  async getReceivedRatings(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const ratings =
        role === "EMPLOYER"
          ? await ratingService.getEmployerReceivedRatings(userId)
          : await ratingService.getReceivedRatings(userId);

      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Received ratings retrieved successfully",
        ratings,
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/ratings/job/:jobId
   */
  async getJobRatings(
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

      const jobId = parseInt(req.params.jobId as string, 10);
      const ratings = await ratingService.getJobRatings(jobId, userId);

      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Job ratings retrieved successfully",
        ratings,
      );
    } catch (error) {
      next(error);
    }
  },
};