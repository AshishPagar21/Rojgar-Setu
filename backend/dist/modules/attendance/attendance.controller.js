"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceController = void 0;
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const attendance_service_1 = require("./attendance.service");
const getStatus = async (_req, res, next) => {
    try {
        const result = await attendance_service_1.attendanceService.getAttendanceModuleStatus();
        (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Attendance module ready", result);
    }
    catch (error) {
        next(error);
    }
};
exports.attendanceController = {
    getStatus,
};
//# sourceMappingURL=attendance.controller.js.map