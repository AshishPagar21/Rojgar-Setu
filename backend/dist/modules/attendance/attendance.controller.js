"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceController = void 0;
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const attendance_service_1 = require("./attendance.service");
const prisma_1 = require("../../config/prisma");
exports.attendanceController = {
    /**
     * POST /api/attendance/:jobId/check-in - Worker checks in
     */
    async checkIn(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: "Unauthorized",
                });
                return;
            }
            const worker = await prisma_1.prisma.worker.findUnique({
                where: { userId },
            });
            if (!worker) {
                res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: "Worker profile not found",
                });
                return;
            }
            const jobId = parseInt(req.params.jobId, 10);
            const attendance = await attendance_service_1.attendanceService.checkIn(jobId, worker.id);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Checked in successfully", attendance);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/attendance/:jobId/check-out - Worker checks out
     */
    async checkOut(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: "Unauthorized",
                });
                return;
            }
            const worker = await prisma_1.prisma.worker.findUnique({
                where: { userId },
            });
            if (!worker) {
                res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: "Worker profile not found",
                });
                return;
            }
            const jobId = parseInt(req.params.jobId, 10);
            const attendance = await attendance_service_1.attendanceService.checkOut(jobId, worker.id);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Checked out successfully", attendance);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/attendance/my - Get worker's attendance history
     */
    async getMyAttendance(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: "Unauthorized",
                });
                return;
            }
            const worker = await prisma_1.prisma.worker.findUnique({
                where: { userId },
            });
            if (!worker) {
                res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: "Worker profile not found",
                });
                return;
            }
            const attendance = await attendance_service_1.attendanceService.getWorkerAttendance(worker.id);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Attendance retrieved successfully", attendance);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/attendance/job/:jobId - Get job's attendance records
     */
    async getJobAttendance(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: "Unauthorized",
                });
                return;
            }
            const employer = await prisma_1.prisma.employer.findUnique({
                where: { userId },
            });
            if (!employer) {
                res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: "Employer profile not found",
                });
                return;
            }
            const jobId = parseInt(req.params.jobId, 10);
            const attendance = await attendance_service_1.attendanceService.getJobAttendance(jobId, employer.id);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Attendance retrieved successfully", attendance);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=attendance.controller.js.map