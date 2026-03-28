"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employerService = void 0;
const prisma_1 = require("../../config/prisma");
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
exports.employerService = {
    /**
     * Get employer dashboard data
     */
    async getEmployerDashboard(employerId) {
        const employer = await prisma_1.prisma.employer.findUnique({
            where: { id: employerId },
        });
        if (!employer) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Employer not found");
        }
        // Get all jobs grouped by status
        const jobs = await prisma_1.prisma.job.findMany({
            where: { employerId },
        });
        const openJobsCount = jobs.filter((j) => j.status === "OPEN").length;
        const assignedJobsCount = jobs.filter((j) => j.status === "ASSIGNED").length;
        const completedJobsCount = jobs.filter((j) => j.status === "COMPLETED").length;
        // Get recent jobs
        const recentJobs = await prisma_1.prisma.job.findMany({
            where: { employerId },
            include: {
                jobApplications: {
                    where: { status: "SELECTED" },
                    select: { workerId: true },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
        });
        return {
            employer,
            totalJobsPosted: employer.totalJobsPosted,
            totalJobsCompleted: employer.totalJobsCompleted,
            openJobsCount,
            assignedJobsCount,
            completedJobsCount,
            recentJobs,
        };
    },
};
//# sourceMappingURL=employer.service.js.map