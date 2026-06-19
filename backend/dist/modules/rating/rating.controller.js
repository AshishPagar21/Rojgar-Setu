"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingController = void 0;
const prisma_1 = require("../../config/prisma");
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const rating_service_1 = require("./rating.service");
exports.ratingController = {
    /**
     * GET /api/ratings/jobs/:jobId/eligible-workers
     */
    async getEligibleWorkers(req, res, next) {
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
            const workers = await rating_service_1.ratingService.getEligibleWorkers(jobId, employer.id, userId);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Eligible workers retrieved successfully", workers);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/ratings
     */
    async createRating(req, res, next) {
        try {
            const userId = req.user?.userId;
            const role = req.user?.role;
            if (!userId) {
                res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: "Unauthorized",
                });
                return;
            }
            const { jobId, toUserId, ratingValue, reviewText } = req.body;
            if (role === "EMPLOYER") {
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
                const rating = await rating_service_1.ratingService.createRating(jobId, userId, employer.id, toUserId, ratingValue, reviewText);
                (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.CREATED, "Rating submitted successfully", rating);
                return;
            }
            if (role === "WORKER") {
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
                const rating = await rating_service_1.ratingService.createWorkerRating(jobId, userId, worker.id, toUserId, ratingValue, reviewText);
                (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.CREATED, "Rating submitted successfully", rating);
                return;
            }
            res.status(constants_1.HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: "Forbidden",
            });
            return;
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/ratings/my-received
     */
    async getReceivedRatings(req, res, next) {
        try {
            const userId = req.user?.userId;
            const role = req.user?.role;
            if (!userId) {
                res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: "Unauthorized",
                });
                return;
            }
            const ratings = role === "EMPLOYER"
                ? await rating_service_1.ratingService.getEmployerReceivedRatings(userId)
                : await rating_service_1.ratingService.getReceivedRatings(userId);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Received ratings retrieved successfully", ratings);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/ratings/job/:jobId
     */
    async getJobRatings(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: "Unauthorized",
                });
                return;
            }
            const jobId = parseInt(req.params.jobId, 10);
            const ratings = await rating_service_1.ratingService.getJobRatings(jobId, userId);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Job ratings retrieved successfully", ratings);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=rating.controller.js.map