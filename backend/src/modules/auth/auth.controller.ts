import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";
import type { SendOtpRequestBody, VerifyOtpRequestBody } from "./auth.types";
import { authService } from "./auth.service";

const sendOtp = async (
  req: Request<unknown, unknown, SendOtpRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.sendOtp(req.body);

    sendSuccess(res, HTTP_STATUS.OK, "OTP sent successfully", result);
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (
  req: Request<unknown, unknown, VerifyOtpRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.verifyOtpAndLogin(req.body);

    sendSuccess(
      res,
      HTTP_STATUS.OK,
      "OTP verified successfully. User authenticated",
      result,
    );
  } catch (error) {
    next(error);
  }
};

export const authController = {
  sendOtp,
  verifyOtp,
};
