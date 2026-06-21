import type { NextFunction, Request, Response } from "express";

import { prisma } from "../config/prisma";
import { HTTP_STATUS } from "../utils/constants";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/response";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
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

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { status: true },
    });

    if (!user) {
      next(new ApiError(HTTP_STATUS.UNAUTHORIZED, "User account not found"));
      return;
    }

    if (user.status === "SUSPENDED") {
      next(
        new ApiError(
          HTTP_STATUS.FORBIDDEN,
          "Your account has been suspended. Please contact admin.",
        ),
      );
      return;
    }

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
