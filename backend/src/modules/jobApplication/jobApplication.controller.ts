import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";
import { jobApplicationService } from "./jobApplication.service";

const getStatus = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await jobApplicationService.getJobApplicationModuleStatus();
    sendSuccess(res, HTTP_STATUS.OK, "Job application module ready", result);
  } catch (error) {
    next(error);
  }
};

export const jobApplicationController = {
  getStatus,
};
