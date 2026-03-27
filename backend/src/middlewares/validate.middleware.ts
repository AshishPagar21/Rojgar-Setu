import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodTypeAny } from "zod";

import { HTTP_STATUS } from "../utils/constants";
import { ApiError } from "../utils/response";

export const validate = (schema: ZodTypeAny): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!parsed.success) {
      return next(
        new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Validation failed",
          parsed.error.flatten(),
        ),
      );
    }

    const parsedData = parsed.data as {
      body: Request["body"];
    };

    // Express 5 exposes query/params as getter-backed properties.
    // Mutating them directly can throw at runtime, so we only assign body.
    req.body = parsedData.body;

    return next();
  };
};
