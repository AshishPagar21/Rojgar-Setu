"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const payment_controller_1 = require("./payment.controller");
const payment_validation_1 = require("./payment.validation");
const router = (0, express_1.Router)();
// Employer routes
router.post("/job/:jobId/create", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("EMPLOYER"), (0, validate_middleware_1.validate)(payment_validation_1.createJobPaymentsSchema), payment_controller_1.paymentController.createPaymentsForJob);
router.patch("/:paymentId/mark-success", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("EMPLOYER"), (0, validate_middleware_1.validate)(payment_validation_1.markPaymentSuccessSchema), payment_controller_1.paymentController.markPaymentSuccess);
router.get("/my-job/:jobId", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("EMPLOYER"), (0, validate_middleware_1.validate)(payment_validation_1.getJobPaymentsSchema), payment_controller_1.paymentController.getJobPayments);
// Worker routes
router.get("/my", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("WORKER"), payment_controller_1.paymentController.getMyPayments);
exports.paymentRoutes = router;
//# sourceMappingURL=payment.routes.js.map