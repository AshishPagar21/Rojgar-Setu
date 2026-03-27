import type { NextFunction, Request, Response } from "express";

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
  getStatus,
};
