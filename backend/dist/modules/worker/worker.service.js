"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerService = void 0;
const prisma_1 = require("../../config/prisma");
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
exports.workerService = {
    /**
     * Get worker dashboard data
     */
    async getWorkerDashboard(workerId) {
        const worker = await prisma_1.prisma.worker.findUnique({
            where: { id: workerId },
        });
        if (!worker) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Worker not found");
        }
        // Get total applications
        const totalApplications = await prisma_1.prisma.jobApplication.count({
            where: { workerId },
        });
        // Get selected jobs count
        const selectedJobsCount = await prisma_1.prisma.jobApplication.count({
            where: { workerId, status: "SELECTED" },
        });
        // Get payment received count
        const paymentReceivedCount = await prisma_1.prisma.payment.count({
            where: { workerId, status: "COMPLETED" },
        });
        const attendanceRecords = await prisma_1.prisma.attendance.findMany({
            where: { workerId },
            select: { status: true },
        });
        const attendanceCount = attendanceRecords.length;
        const attendedCount = attendanceRecords.filter((record) => ["PRESENT", "COMPLETED"].includes(record.status)).length;
        const attendancePercentage = attendanceCount > 0 ? (attendedCount / attendanceCount) * 100 : 100;
        // Get recent applications
        const recentApplications = await prisma_1.prisma.jobApplication.findMany({
            where: { workerId },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        jobDate: true,
                    },
                },
            },
            orderBy: { appliedAt: "desc" },
            take: 5,
        });
        // Get recent assigned jobs
        const recentAssignedJobs = await prisma_1.prisma.jobApplication.findMany({
            where: { workerId, status: { in: ["SELECTED", "COMPLETED"] } },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        jobDate: true,
                        employer: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
            take: 5,
        });
        return {
            worker,
            totalJobsCompleted: worker.totalJobsCompleted,
            reliabilityScore: worker.reliabilityScore,
            attendancePercentage,
            totalApplications,
            selectedJobsCount,
            paymentReceivedCount,
            recentApplications,
            recentAssignedJobs,
        };
    },
};
//# sourceMappingURL=worker.service.js.map