import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";
import { workerService } from "./worker.service";

const getStatus = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await workerService.getWorkerModuleStatus();
    sendSuccess(res, HTTP_STATUS.OK, "Worker module ready", result);
  } catch (error) {
    next(error);
  }
};

export const workerController = {
  getStatus,
};
