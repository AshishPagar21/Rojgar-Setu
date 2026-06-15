import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";
import { disputeService } from "./dispute.service";

export const disputeController = {
  async createDispute(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ success: false, message: "Unauthorized" });
        return;
      }

      const dispute = await disputeService.createDispute(userId, req.body);
      sendSuccess(
        res,
        HTTP_STATUS.CREATED,
        "Dispute created successfully",
        dispute,
      );
    } catch (error) {
      next(error);
    }
  },

  async getMyDisputes(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ success: false, message: "Unauthorized" });
        return;
      }

      const disputes = await disputeService.getMyDisputes(userId);
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

  async getAllDisputes(_req: Request, res: Response, next: NextFunction) {
    try {
      const disputes = await disputeService.getAllDisputes();
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

  async resolveDispute(req: Request, res: Response, next: NextFunction) {
    try {
      const disputeId = parseInt(String(req.params.disputeId), 10);
      const { status } = req.body as { status: "RESOLVED" | "REJECTED" };
      const dispute = await disputeService.resolveDispute(disputeId, status);
      sendSuccess(res, HTTP_STATUS.OK, "Dispute updated successfully", dispute);
    } catch (error) {
      next(error);
    }
  },
};
