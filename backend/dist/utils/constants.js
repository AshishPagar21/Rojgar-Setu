"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_STATUS = exports.OTP_MAX_ATTEMPTS = exports.OTP_RESEND_DELAY_MS = exports.OTP_EXPIRY_MS = exports.MOBILE_NUMBER_REGEX = void 0;
const env_1 = require("../config/env");
exports.MOBILE_NUMBER_REGEX = /^[6-9]\d{9}$/;
exports.OTP_EXPIRY_MS = env_1.env.OTP_EXPIRY_MS;
exports.OTP_RESEND_DELAY_MS = env_1.env.OTP_RESEND_DELAY_MS;
exports.OTP_MAX_ATTEMPTS = env_1.env.OTP_MAX_ATTEMPTS;
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    SERVICE_UNAVAILABLE: 503,
    INTERNAL_SERVER_ERROR: 500,
};
//# sourceMappingURL=constants.js.map