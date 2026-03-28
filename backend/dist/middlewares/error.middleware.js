"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
const constants_1 = require("../utils/constants");
const response_1 = require("../utils/response");
const errorHandler = (error, _req, res, _next) => {
    if (error instanceof response_1.ApiError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            error: error.details,
        });
    }
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        const isUniqueViolation = error.code === "P2002";
        return res
            .status(isUniqueViolation ? constants_1.HTTP_STATUS.CONFLICT : constants_1.HTTP_STATUS.BAD_REQUEST)
            .json({
            success: false,
            message: isUniqueViolation
                ? "Resource already exists"
                : "Database request error",
            error: error.meta,
        });
    }
    if (error instanceof client_1.Prisma.PrismaClientInitializationError) {
        return res.status(constants_1.HTTP_STATUS.SERVICE_UNAVAILABLE).json({
            success: false,
            message: "Database is temporarily unavailable",
            error: env_1.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message,
        error: env_1.env.NODE_ENV === "development" ? error : undefined,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map