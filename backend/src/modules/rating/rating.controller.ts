import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";
import { ratingService } from "./rating.service";

const getStatus = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await ratingService.getRatingModuleStatus();
    sendSuccess(res, HTTP_STATUS.OK, "Rating module ready", result);
  } catch (error) {
    next(error);
  }
};

export const ratingController = {
  getStatus,
};
