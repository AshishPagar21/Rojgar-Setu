"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const constants_1 = require("../utils/constants");
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const authenticate = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new response_1.ApiError(constants_1.HTTP_STATUS.UNAUTHORIZED, "Authorization token is missing");
    }
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
        throw new response_1.ApiError(constants_1.HTTP_STATUS.UNAUTHORIZED, "Invalid authorization header");
    }
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = {
            userId: payload.userId,
            role: payload.role,
            mobileNumber: payload.mobileNumber,
        };
        next();
    }
    catch (_error) {
        next(new response_1.ApiError(constants_1.HTTP_STATUS.UNAUTHORIZED, "Invalid or expired token"));
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.middleware.js.map