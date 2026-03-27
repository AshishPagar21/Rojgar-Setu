"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_STATUS = exports.OTP_EXPIRY_MS = exports.MOBILE_NUMBER_REGEX = void 0;
exports.MOBILE_NUMBER_REGEX = /^[6-9]\d{9}$/;
exports.OTP_EXPIRY_MS = 5 * 60 * 1000;
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
};
//# sourceMappingURL=constants.js.map