import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";

import { env } from "../config/env";
import { HTTP_STATUS } from "../utils/constants";
import { ApiError } from "../utils/response";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: error.details,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const isUniqueViolation = error.code === "P2002";

    return res
      .status(
        isUniqueViolation ? HTTP_STATUS.CONFLICT : HTTP_STATUS.BAD_REQUEST,
      )
      .json({
        success: false,
        message: isUniqueViolation
          ? "Resource already exists"
          : "Database request error",
        error: error.meta,
      });
  }

  const message =
    error instanceof Error ? error.message : "Internal server error";

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message,
    error: env.NODE_ENV === "development" ? error : undefined,
  });
};
