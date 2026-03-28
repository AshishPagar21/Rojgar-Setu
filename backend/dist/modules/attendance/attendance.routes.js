"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const attendance_controller_1 = require("./attendance.controller");
const attendance_validation_1 = require("./attendance.validation");
const router = (0, express_1.Router)();
// Worker routes
router.post("/:jobId/check-in", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("WORKER"), (0, validate_middleware_1.validate)(attendance_validation_1.checkInSchema), attendance_controller_1.attendanceController.checkIn);
router.post("/:jobId/check-out", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("WORKER"), (0, validate_middleware_1.validate)(attendance_validation_1.checkOutSchema), attendance_controller_1.attendanceController.checkOut);
router.get("/my", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("WORKER"), attendance_controller_1.attendanceController.getMyAttendance);
// Employer routes
router.get("/job/:jobId", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("EMPLOYER"), (0, validate_middleware_1.validate)(attendance_validation_1.getJobAttendanceSchema), attendance_controller_1.attendanceController.getJobAttendance);
exports.attendanceRoutes = router;
//# sourceMappingURL=attendance.routes.js.map