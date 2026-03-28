"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobController = void 0;
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const job_service_1 = require("./job.service");
const prisma_1 = require("../../config/prisma");
exports.jobController = {
    /**
     * POST /api/jobs - Create a new job
     */
    async createJob(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: "Unauthorized",
                });
                return;
            }
            // Get employer ID from userId
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
            const job = await job_service_1.jobService.createJob(employer.id, req.body);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.CREATED, "Job created successfully", job);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/jobs/my - Get all jobs posted by logged-in employer
     */
    async getMyJobs(req, res, next) {
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
            const jobs = await job_service_1.jobService.getEmployerJobs(employer.id);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Jobs retrieved successfully", jobs);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/jobs/open - Get all open jobs
     */
    async getOpenJobs(req, res, next) {
        try {
            const filters = {
                category: req.query.category,
                date: req.query.date,
            };
            const jobs = await job_service_1.jobService.getOpenJobs(filters);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Jobs retrieved successfully", jobs);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/jobs/:jobId - Get single job details
     */
    async getJobById(req, res, next) {
        try {
            const jobId = parseInt(req.params.jobId, 10);
            const job = await job_service_1.jobService.getJobById(jobId);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Job retrieved successfully", job);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PATCH /api/jobs/:jobId/cancel - Cancel a job
     */
    async cancelJob(req, res, next) {
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
            const job = await job_service_1.jobService.cancelJob(jobId, employer.id);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Job cancelled successfully", job);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PATCH /api/jobs/:jobId/complete - Mark job as completed
     */
    async completeJob(req, res, next) {
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
            const job = await job_service_1.jobService.completeJob(jobId, employer.id);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Job completed successfully", job);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=job.controller.js.map