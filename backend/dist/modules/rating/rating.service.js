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
        if (ratingValue < 1 || ratingValue > 5) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Rating value must be between 1 and 5");
        }
        const job = await prisma_1.prisma.job.findUnique({
            where: { id: jobId },
            include: {
                jobApplications: true,
                payments: true,
            },
        });
        if (!job) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Job not found");
        }
        const fromUserRecord = await prisma_1.prisma.user.findUnique({
            where: { id: fromUserId },
        });
        const toUserRecord = await prisma_1.prisma.user.findUnique({
            where: { id: toUserId },
        });
        if (!fromUserRecord || !toUserRecord) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "User not found");
        }
        const fromWorker = await prisma_1.prisma.worker.findUnique({
            where: { userId: fromUserId },
        });
        const toWorker = await prisma_1.prisma.worker.findUnique({
            where: { userId: toUserId },
        });
        const toEmployer = await prisma_1.prisma.employer.findUnique({
            where: { userId: toUserId },
        });
        if (fromUserRecord.role === "EMPLOYER" && toUserRecord.role === "WORKER") {
            const workerApplication = job.jobApplications.find((app) => app.workerId === toWorker?.id && app.status !== "REJECTED");
            const completedPayment = job.payments.find((payment) => payment.workerId === toWorker?.id && payment.status === "COMPLETED");
            if (!workerApplication || !completedPayment) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "Worker must be selected and payment must be completed before rating");
            }
        }
        else if (fromUserRecord.role === "WORKER" &&
            toUserRecord.role === "EMPLOYER") {
            const workerApplication = job.jobApplications.find((app) => app.workerId === fromWorker?.id && app.status !== "REJECTED");
            const workerAttendance = await prisma_1.prisma.attendance.findFirst({
                where: {
                    jobId,
                    workerId: fromWorker?.id,
                    checkInTime: { not: null },
                },
            });
            const jobCompleted = workerApplication?.status === "COMPLETED";
            if (!workerApplication || (!workerAttendance && !jobCompleted)) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "You can rate the employer after check-in or once the job is completed");
            }
            if (job.employerId !== toEmployer?.id) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "Invalid rating relationship");
            }
        }
        else {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "Invalid rating relationship");
        }
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
        const rating = await prisma_1.prisma.rating.create({
            data: {
                jobId,
                fromUserId,
                toUserId,
                ratingValue,
                reviewText,
            },
        });
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
                        category: true,
                        jobDate: true,
                        city: true,
                        landmark: true,
                        wage: true,
                        status: true,
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