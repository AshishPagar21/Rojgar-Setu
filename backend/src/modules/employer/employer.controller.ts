import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";
import { employerService } from "./employer.service";
import { prisma } from "../../config/prisma";

export const employerController = {
  /**
   * GET /api/employer/dashboard - Get employer dashboard
   */
  async getDashboard(
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

      const dashboard = await employerService.getEmployerDashboard(employer.id);
      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Dashboard retrieved successfully",
        dashboard,
      );
    } catch (error) {
      next(error);
    }
  },
};
