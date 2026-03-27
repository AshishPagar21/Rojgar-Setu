"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceRoutes = void 0;
const express_1 = require("express");
const attendance_controller_1 = require("./attendance.controller");
const router = (0, express_1.Router)();
router.get("/", attendance_controller_1.attendanceController.getStatus);
exports.attendanceRoutes = router;
//# sourceMappingURL=attendance.routes.js.map