"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingService = void 0;
const prisma_1 = require("../../config/prisma");
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
exports.ratingService = {
    /**
     * Create a rating
     */
    async createRating(fromUserId, payload) {
        const { jobId, toUserId, ratingValue, reviewText } = payload;
        // Validate rating value
        if (ratingValue < 1 || ratingValue > 5) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Rating value must be between 1 and 5");
        }
        // Verify job exists and is completed
        const job = await prisma_1.prisma.job.findUnique({
            where: { id: jobId },
            include: {
                jobApplications: true,
            },
        });
        if (!job) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Job not found");
        }
        if (job.status !== "COMPLETED") {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Job must be COMPLETED to add rating");
        }
        // Verify rater and ratee have relationship in the job
        const fromUserRecord = await prisma_1.prisma.user.findUnique({
            where: { id: fromUserId },
        });
        const toUserRecord = await prisma_1.prisma.user.findUnique({
            where: { id: toUserId },
        });
        if (!fromUserRecord || !toUserRecord) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "User not found");
        }
        // Employer rating worker: check if worker is selected for job
        // Worker rating employer: check if worker is selected for job
        if (fromUserRecord.role === "EMPLOYER" && toUserRecord.role === "WORKER") {
            const workerApplication = job.jobApplications.find((app) => app.status === "SELECTED");
            if (!workerApplication) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "Worker was not selected for this job");
            }
        }
        else if (fromUserRecord.role === "WORKER" &&
            toUserRecord.role === "EMPLOYER") {
            if (job.employerId !== toUserId) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "Invalid rating relationship");
            }
        }
        else {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "Invalid rating relationship");
        }
        // Check for duplicate rating
        const existingRating = await prisma_1.prisma.rating.findFirst({
            where: {
                jobId,
                fromUserId,
                toUserId,
            },
        });
        if (existingRating) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "You have already rated this user for this job");
        }
        // Create rating
        const rating = await prisma_1.prisma.rating.create({
            data: {
                jobId,
                fromUserId,
                toUserId,
                ratingValue,
                reviewText,
            },
        });
        // Update average rating and totalRatings for the rated user
        const targetUser = await prisma_1.prisma.user.findUnique({
            where: { id: toUserId },
        });
        if (targetUser?.role === "EMPLOYER") {
            const employer = await prisma_1.prisma.employer.findUnique({
                where: { userId: toUserId },
            });
            if (employer) {
                const allRatings = await prisma_1.prisma.rating.findMany({
                    where: { toUserId },
                    select: { ratingValue: true },
                });
                const newCount = allRatings.length;
                const sum = allRatings.reduce((acc, r) => acc + r.ratingValue, 0);
                const newAverage = newCount > 0 ? sum / newCount : 0;
                await prisma_1.prisma.employer.update({
                    where: { id: employer.id },
                    data: {
                        rating: newAverage,
                        totalRatings: newCount,
                    },
                });
            }
        }
        else if (targetUser?.role === "WORKER") {
            const worker = await prisma_1.prisma.worker.findUnique({
                where: { userId: toUserId },
            });
            if (worker) {
                const allRatings = await prisma_1.prisma.rating.findMany({
                    where: { toUserId },
                    select: { ratingValue: true },
                });
                const newCount = allRatings.length;
                const sum = allRatings.reduce((acc, r) => acc + r.ratingValue, 0);
                const newAverage = newCount > 0 ? sum / newCount : 0;
                await prisma_1.prisma.worker.update({
                    where: { id: worker.id },
                    data: {
                        rating: newAverage,
                        totalRatings: newCount,
                    },
                });
            }
        }
        return rating;
    },
    /**
     * Get ratings received by a user
     */
    async getReceivedRatings(userId) {
        return prisma_1.prisma.rating.findMany({
            where: { toUserId: userId },
            include: {
                fromUser: {
                    select: {
                        id: true,
                        role: true,
                        employer: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        worker: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                        jobDate: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    },
    /**
     * Get all ratings for a job
     */
    async getJobRatings(jobId) {
        return prisma_1.prisma.rating.findMany({
            where: { jobId },
            include: {
                fromUser: {
                    select: {
                        id: true,
                        role: true,
                        employer: {
                            select: {
                                name: true,
                            },
                        },
                        worker: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                toUser: {
                    select: {
                        id: true,
                        role: true,
                        employer: {
                            select: {
                                name: true,
                            },
                        },
                        worker: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    },
};
//# sourceMappingURL=rating.service.js.map