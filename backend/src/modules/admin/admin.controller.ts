import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";
import { adminService } from "./admin.service";

export const adminController = {
  async getDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const dashboard = await adminService.getDashboard();
      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Admin dashboard retrieved successfully",
        dashboard,
      );
    } catch (error) {
      next(error);
    }
  },

  async listUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await adminService.listUsers();
      sendSuccess(res, HTTP_STATUS.OK, "Users retrieved successfully", users);
    } catch (error) {
      next(error);
    }
  },

  async listJobs(_req: Request, res: Response, next: NextFunction) {
    try {
      const jobs = await adminService.listJobs();
      sendSuccess(res, HTTP_STATUS.OK, "Jobs retrieved successfully", jobs);
    } catch (error) {
      next(error);
    }
  },

  async listDisputes(_req: Request, res: Response, next: NextFunction) {
    try {
      const disputes = await adminService.listDisputes();
      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Disputes retrieved successfully",
        disputes,
      );
    } catch (error) {
      next(error);
    }
  },

  async suspendUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(String(req.params.userId), 10);
      const user = await adminService.suspendUser(userId);
      sendSuccess(res, HTTP_STATUS.OK, "User suspended successfully", user);
    } catch (error) {
      next(error);
    }
  },

  async reactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(String(req.params.userId), 10);
      const user = await adminService.reactivateUser(userId);
      sendSuccess(res, HTTP_STATUS.OK, "User reactivated successfully", user);
    } catch (error) {
      next(error);
    }
  },

  async resolveDispute(req: Request, res: Response, next: NextFunction) {
    try {
      const disputeId = parseInt(String(req.params.disputeId), 10);
      const { status } = req.body as { status: "RESOLVED" | "REJECTED" };
      const dispute = await adminService.resolveDispute(disputeId, status);
      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Dispute resolved successfully",
        dispute,
      );
    } catch (error) {
      next(error);
    }
  },
};
