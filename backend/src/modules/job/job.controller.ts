import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";
import { jobService } from "./job.service";

const getStatus = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await jobService.getJobModuleStatus();
    sendSuccess(res, HTTP_STATUS.OK, "Job module ready", result);
  } catch (error) {
    next(error);
  }
};

export const jobController = {
  getStatus,
};
