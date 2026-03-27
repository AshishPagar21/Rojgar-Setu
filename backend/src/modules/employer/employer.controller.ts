import type { NextFunction, Request, Response } from "express";

import { employerService } from "./employer.service";
import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";

const getStatus = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await employerService.getEmployerModuleStatus();
    sendSuccess(res, HTTP_STATUS.OK, "Employer module ready", result);
  } catch (error) {
    next(error);
  }
};

export const employerController = {
  getStatus,
};
