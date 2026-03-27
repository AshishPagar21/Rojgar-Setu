"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const auth_controller_1 = require("./auth.controller");
const auth_validation_1 = require("./auth.validation");
const router = (0, express_1.Router)();
router.post("/send-otp", (0, validate_middleware_1.validate)(auth_validation_1.sendOtpSchema), auth_controller_1.authController.sendOtp);
router.post("/verify-otp", (0, validate_middleware_1.validate)(auth_validation_1.verifyOtpSchema), auth_controller_1.authController.verifyOtp);
exports.authRoutes = router;
//# sourceMappingURL=auth.routes.js.map