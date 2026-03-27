"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const auth_service_1 = require("./auth.service");
const sendOtp = async (req, res, next) => {
    try {
        const result = await auth_service_1.authService.sendOtp(req.body);
        (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "OTP sent successfully", result);
    }
    catch (error) {
        next(error);
    }
};
const verifyOtp = async (req, res, next) => {
    try {
        const result = await auth_service_1.authService.verifyOtpAndLogin(req.body);
        (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "OTP verified successfully. User authenticated", result);
    }
    catch (error) {
        next(error);
    }
};
exports.authController = {
    sendOtp,
    verifyOtp,
};
//# sourceMappingURL=auth.controller.js.map