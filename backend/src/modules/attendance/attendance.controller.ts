import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";
import { attendanceService } from "./attendance.service";

const getStatus = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await attendanceService.getAttendanceModuleStatus();
    sendSuccess(res, HTTP_STATUS.OK, "Attendance module ready", result);
  } catch (error) {
    next(error);
  }
};

export const attendanceController = {
  getStatus,
};
