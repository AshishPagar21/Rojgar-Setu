import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";
import { attendanceService } from "./attendance.service";
import { prisma } from "../../config/prisma";

export const attendanceController = {
  /**
   * POST /api/attendance/:jobId/check-in - Worker checks in
   */
  async checkIn(
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
      const attendance = await attendanceService.checkIn(jobId, worker.id);
      sendSuccess(res, HTTP_STATUS.OK, "Checked in successfully", attendance);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/attendance/:jobId/check-out - Worker checks out
   */
  async checkOut(
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
      const attendance = await attendanceService.checkOut(jobId, worker.id);
      sendSuccess(res, HTTP_STATUS.OK, "Checked out successfully", attendance);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/attendance/my - Get worker's attendance history
   */
  async getMyAttendance(
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

      const attendance = await attendanceService.getWorkerAttendance(worker.id);
      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Attendance retrieved successfully",
        attendance,
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/attendance/job/:jobId - Get job's attendance records
   */
  async getJobAttendance(
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
      const attendance = await attendanceService.getJobAttendance(
        jobId,
        employer.id,
      );
      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Attendance retrieved successfully",
        attendance,
      );
    } catch (error) {
      next(error);
    }
  },
};
