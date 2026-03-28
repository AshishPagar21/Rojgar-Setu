import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";
import { workerService } from "./worker.service";
import { prisma } from "../../config/prisma";

export const workerController = {
  /**
   * GET /api/worker/dashboard - Get worker dashboard
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

      const dashboard = await workerService.getWorkerDashboard(worker.id);
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
