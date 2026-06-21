"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceService = void 0;
const prisma_1 = require("../../config/prisma");
exports.attendanceService = {
    async checkIn(jobId, workerId, coordinates) {
        return prisma_1.prisma.attendance.create({
            data: {
                jobId,
                workerId,
                checkInLatitude: coordinates.latitude,
                checkInLongitude: coordinates.longitude,
                checkInTime: new Date(),
                status: "CHECKED_IN",
            },
        });
    },
    async checkOut(jobId, workerId, coordinates) {
        const existing = await prisma_1.prisma.attendance.findUnique({
            where: { jobId_workerId: { jobId, workerId } },
        });
        if (!existing) {
            throw new Error("Attendance record not found");
        }
        return prisma_1.prisma.attendance.update({
            where: { id: existing.id },
            data: {
                checkOutLatitude: coordinates.latitude,
                checkOutLongitude: coordinates.longitude,
                checkOutTime: new Date(),
                status: "PENDING_REVIEW",
            },
        });
    },
    async getWorkerAttendance(workerId) {
        return prisma_1.prisma.attendance.findMany({
            where: { workerId },
            include: {
                job: true,
            },
        });
    },
    async getJobAttendance(jobId, _employerId) {
        return prisma_1.prisma.attendance.findMany({
            where: { jobId },
            include: {
                worker: true,
            },
        });
    },
    async approveAttendance(attendanceId, _employerId) {
        return prisma_1.prisma.attendance.update({
            where: { id: attendanceId },
            data: {
                status: "APPROVED",
            },
        });
    },
    async reportIssue(attendanceId, _employerId, notes) {
        return prisma_1.prisma.attendance.update({
            where: { id: attendanceId },
            data: {
                status: "ISSUE_REPORTED",
                notes,
            },
        });
    },
};
//# sourceMappingURL=attendance.service.js.map