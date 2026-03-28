import type { NextFunction, Request, Response } from "express";

import { prisma } from "../../config/prisma";
import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";
import { paymentService } from "./payment.service";

const getStatus = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await paymentService.getPaymentModuleStatus();
    sendSuccess(res, HTTP_STATUS.OK, "Payment module ready", result);
  } catch (error) {
    next(error);
  }
};

export const paymentController = {
  async createPaymentsForJob(
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
      const payments = await paymentService.createPaymentsForJob(
        jobId,
        employer.id,
      );
      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Payments created successfully",
        payments,
      );
    } catch (error) {
      next(error);
    }
  },

  async markPaymentSuccess(
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

      const paymentId = parseInt(req.params.paymentId as string, 10);
      const payment = await paymentService.markPaymentSuccess(
        paymentId,
        employer.id,
      );
      sendSuccess(res, HTTP_STATUS.OK, "Payment marked as successful", payment);
    } catch (error) {
      next(error);
    }
  },

  async getJobPayments(
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
      const payments = await paymentService.getJobPayments(jobId, employer.id);
      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Payments retrieved successfully",
        payments,
      );
    } catch (error) {
      next(error);
    }
  },

  async getMyPayments(
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

      const payments = await paymentService.getWorkerPayments(worker.id);
      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Payments retrieved successfully",
        payments,
      );
    } catch (error) {
      next(error);
    }
  },

  getStatus,
};
