import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";
import { paymentService } from "./payment.service";
import { ApiError } from "../../utils/response";

export const paymentController = {
  // PATCH /payments/:paymentId/mark-paid
  async markPaymentSuccess(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ success: false, message: "Unauthorized" });
        return;
      }

      const employer = await prisma.employer.findUnique({
        where: { userId },
      });

      if (!employer) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ success: false, message: "Employer profile not found" });
        return;
      }

      const { method } = req.body; // Expects "CASH" or "ONLINE_UPI"
      if (!method || !["CASH", "ONLINE_UPI"].includes(method)) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({
            success: false,
            message: "Valid payment method is required",
          });
        return;
      }

      const paymentId = parseInt(req.params.paymentId as string, 10);
      const payment = await paymentService.markAsPaid(
        paymentId,
        employer.id,
        method,
      );

      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Payment marked as paid by employer",
        payment,
      );
    } catch (error) {
      next(error);
    }
  },

  // PATCH /payments/:paymentId/confirm
  async confirmPaymentReceived(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ success: false, message: "Unauthorized" });
        return;
      }

      const worker = await prisma.worker.findUnique({
        where: { userId },
      });

      if (!worker) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ success: false, message: "Worker profile not found" });
        return;
      }

      const paymentId = parseInt(req.params.paymentId as string, 10);
      const payment = await paymentService.confirmReceived(
        paymentId,
        worker.id,
      );

      sendSuccess(res, HTTP_STATUS.OK, "Payment confirmed by worker", payment);
    } catch (error) {
      next(error);
    }
  },

  // GET /payments/job/:jobId
  async getJobPayments(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role; // Ensure your auth middleware populates the user role here

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ success: false, message: "Unauthorized" });
        return;
      }

      const jobId = parseInt(req.params.jobId as string, 10);
      let payments;

      // Check user role to dynamically handle data parsing constraints
      if (role === "WORKER") {
        const worker = await prisma.worker.findUnique({
          where: { userId },
        });

        if (!worker) {
          res
            .status(HTTP_STATUS.NOT_FOUND)
            .json({ success: false, message: "Worker profile not found" });
          return;
        }

        // Fetching payments array filtered by both jobId and workerId
        // Ensure your paymentService backend supports this call or update it to match your DB schema
        payments = await prisma.payment.findMany({
          where: { jobId, workerId: worker.id },
        });
      } else {
        // Default back to standard Employer logic
        const employer = await prisma.employer.findUnique({
          where: { userId },
        });

        if (!employer) {
          res
            .status(HTTP_STATUS.NOT_FOUND)
            .json({ success: false, message: "Employer profile not found" });
          return;
        }

        payments = await paymentService.getJobPayments(jobId, employer.id);
      }

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

  // GET /payments/my
  async getMyPayments(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ success: false, message: "Unauthorized" });
        return;
      }

      const worker = await prisma.worker.findUnique({
        where: { userId },
      });

      if (!worker) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ success: false, message: "Worker profile not found" });
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
};
