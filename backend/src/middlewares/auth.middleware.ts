import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "../utils/constants";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/response";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Authorization token is missing",
    );
  }

  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Invalid authorization header",
    );
  }

  try {
    const payload = verifyToken(token);

    req.user = {
      userId: payload.userId,
      role: payload.role,
      mobileNumber: payload.mobileNumber,
    };

    next();
  } catch (_error) {
    next(new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid or expired token"));
  }
};
