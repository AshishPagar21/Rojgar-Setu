"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobApplicationController = void 0;
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const jobApplication_service_1 = require("./jobApplication.service");
const prisma_1 = require("../../config/prisma");
exports.jobApplicationController = {
    /**
     * POST /api/job-applications/:jobId/apply - Worker applies to a job
     */
    async applyToJob(req, res, next) {
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
            const application = await jobApplication_service_1.jobApplicationService.applyToJob(jobId, worker.id);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.CREATED, "Application submitted successfully", application);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/job-applications/my - Get worker's applications
     */
    async getMyApplications(req, res, next) {
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
            const applications = await jobApplication_service_1.jobApplicationService.getWorkerApplications(worker.id);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Applications retrieved successfully", applications);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/job-applications/my-assigned - Get worker's assigned jobs
     */
    async getMyAssignedJobs(req, res, next) {
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
            const jobs = await jobApplication_service_1.jobApplicationService.getWorkerAssignedJobs(worker.id);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Assigned jobs retrieved successfully", jobs);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/job-applications/job/:jobId - Get applicants for a job
     */
    async getJobApplicants(req, res, next) {
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
            const applicants = await jobApplication_service_1.jobApplicationService.getJobApplicants(jobId, employer.id);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Applicants retrieved successfully", applicants);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PATCH /api/job-applications/job/:jobId/select - Select workers for a job
     */
    async selectWorkers(req, res, next) {
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
            const { workerIds } = req.body;
            const applications = await jobApplication_service_1.jobApplicationService.selectWorkersForJob(jobId, employer.id, workerIds);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Workers selected successfully", applications);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=jobApplication.controller.js.map