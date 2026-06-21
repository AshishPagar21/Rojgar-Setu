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
        // 1. Safety check: Cannot rate oneself
        if (fromUserId === toUserId) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "You cannot rate yourself");
        }
        // 2. Validate rating value range
        if (ratingValue < 1 || ratingValue > 5) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Rating value must be between 1 and 5");
        }
        return await prisma_1.prisma.$transaction(async (tx) => {
            // Fetch rater and ratee users
            const fromUserRecord = await tx.user.findUnique({
                where: { id: fromUserId },
            });
            const toUserRecord = await tx.user.findUnique({
                where: { id: toUserId },
            });
            if (!fromUserRecord || !toUserRecord) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "User not found");
            }
            // Fetch the job
            const job = await tx.job.findUnique({
                where: { id: jobId },
            });
            if (!job) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Job not found");
            }
            // Verify the job is COMPLETED
            if (job.status !== "COMPLETED") {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "You can only rate after the job is completed");
            }
            // Check user roles and apply constraints
            if (fromUserRecord.role === "EMPLOYER" && toUserRecord.role === "WORKER") {
                // Ensure this job belongs to the rating employer
                const employer = await tx.employer.findUnique({
                    where: { userId: fromUserId },
                });
                if (!employer || job.employerId !== employer.id) {
                    throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "You can only rate workers for your own completed jobs");
                }
                // Fetch worker profile
                const worker = await tx.worker.findUnique({
                    where: { userId: toUserId },
                });
                if (!worker) {
                    throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Worker not found");
                }
                // Block employer from rating a worker who was rejected or never worked on the job
                const application = await tx.jobApplication.findUnique({
                    where: {
                        jobId_workerId: {
                            jobId,
                            workerId: worker.id,
                        },
                    },
                });
                if (!application || application.status === "REJECTED" || application.status === "APPLIED") {
                    throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "Cannot rate a worker who was rejected or never selected for this job");
                }
                // Verify the payment between this employer and worker is COMPLETED
                const payment = await tx.payment.findUnique({
                    where: {
                        jobId_workerId: {
                            jobId,
                            workerId: worker.id,
                        },
                    },
                });
                if (!payment || payment.status !== "COMPLETED") {
                    throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "Payment must be fully completed before rating");
                }
            }
            else if (fromUserRecord.role === "WORKER" && toUserRecord.role === "EMPLOYER") {
                // Fetch worker profile
                const worker = await tx.worker.findUnique({
                    where: { userId: fromUserId },
                });
                if (!worker) {
                    throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Worker not found");
                }
                // Fetch employer profile
                const employer = await tx.employer.findUnique({
                    where: { userId: toUserId },
                });
                if (!employer) {
                    throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Employer not found");
                }
                // Block worker from rating an employer if the job ID doesn't match the employer's posted job record
                if (job.employerId !== employer.id) {
                    throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "This job does not belong to the rated employer");
                }
                // Verify the worker was selected / completed for the job
                const application = await tx.jobApplication.findUnique({
                    where: {
                        jobId_workerId: {
                            jobId,
                            workerId: worker.id,
                        },
                    },
                });
                if (!application || application.status === "REJECTED" || application.status === "APPLIED") {
                    throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "You were not selected for this job");
                }
                // Verify the payment is COMPLETED
                const payment = await tx.payment.findUnique({
                    where: {
                        jobId_workerId: {
                            jobId,
                            workerId: worker.id,
                        },
                    },
                });
                if (!payment || payment.status !== "COMPLETED") {
                    throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "Payment must be fully completed before rating");
                }
            }
            else {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "Invalid rating relationship. Ratings must be between Employer and Worker.");
            }
            // Check if rating already exists to enforce exact once rule
            const existingRating = await tx.rating.findUnique({
                where: {
                    jobId_fromUserId_toUserId: {
                        jobId,
                        fromUserId,
                        toUserId,
                    },
                },
            });
            if (existingRating) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "You have already rated this user for this job");
            }
            // Create the rating record
            const rating = await tx.rating.create({
                data: {
                    jobId,
                    fromUserId,
                    toUserId,
                    ratingValue,
                    reviewText,
                },
            });
            // Recalculate average rating and totalRatings atomically on the database side
            const aggregates = await tx.rating.aggregate({
                where: { toUserId },
                _count: { ratingValue: true },
                _avg: { ratingValue: true },
            });
            const newCount = aggregates._count.ratingValue || 0;
            const newAverage = aggregates._avg.ratingValue || 0;
            // Update the targeted user's overall rating profile
            if (toUserRecord.role === "EMPLOYER") {
                await tx.employer.update({
                    where: { userId: toUserId },
                    data: {
                        rating: newAverage,
                        totalRatings: newCount,
                    },
                });
            }
            else if (toUserRecord.role === "WORKER") {
                await tx.worker.update({
                    where: { userId: toUserId },
                    data: {
                        rating: newAverage,
                        totalRatings: newCount,
                    },
                });
            }
            return rating;
        });
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