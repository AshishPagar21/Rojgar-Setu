import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";

import { HTTP_STATUS } from "../utils/constants";
import { ApiError } from "../utils/response";

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "Forbidden: insufficient role");
    }

    next();
  };
};
