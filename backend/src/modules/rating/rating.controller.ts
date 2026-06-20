import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";
import { ratingService } from "./rating.service";
import type { CreateRatingPayload } from "./rating.types";
import { prisma } from "../../config/prisma";

export const ratingController = {
  /**
   * POST /api/ratings - Create a rating
   */
  async createRating(
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

      const rating = await ratingService.createRating(
        userId,
        req.body as CreateRatingPayload,
      );
      sendSuccess(
        res,
        HTTP_STATUS.CREATED,
        "Rating created successfully",
        rating,
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/ratings/my-received - Get ratings received by logged-in user
   */
  async getReceivedRatings(
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

      const ratings = await ratingService.getReceivedRatings(userId);
      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Ratings retrieved successfully",
        ratings,
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/ratings/job/:jobId - Get all ratings for a job
   */
  async getJobRatings(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const jobId = parseInt(req.params.jobId as string, 10);
      const ratings = await ratingService.getJobRatings(jobId);
      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Ratings retrieved successfully",
        ratings,
      );
    } catch (error) {
      next(error);
    }
  },
};
