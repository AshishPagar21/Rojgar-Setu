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
            where: { workerId, paymentStatus: "SUCCESS" },
        });
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
            where: { workerId, status: "SELECTED" },
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
            totalApplications,
            selectedJobsCount,
            paymentReceivedCount,
            recentApplications,
            recentAssignedJobs,
        };
    },
};
//# sourceMappingURL=worker.service.js.map