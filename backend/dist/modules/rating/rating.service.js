"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingService = void 0;
const prisma_1 = require("../../config/prisma");
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
exports.ratingService = {
    async createRating(jobId, employerUserId, employerId, toUserId, ratingValue, reviewText) {
        return prisma_1.prisma.$transaction(async (tx) => {
            const job = await tx.job.findUnique({
                where: { id: jobId },
            });
            if (!job) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Job not found");
            }
            if (job.employerId !== employerId) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "You can only rate workers for your own jobs");
            }
            const worker = await tx.worker.findUnique({
                where: { userId: toUserId },
            });
            if (!worker) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Worker not found");
            }
            const completedApplication = await tx.jobApplication.findFirst({
                where: {
                    jobId,
                    workerId: worker.id,
                    status: "COMPLETED",
                },
            });
            if (!completedApplication) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Worker is not eligible for rating on this job");
            }
            const existingRating = await tx.rating.findFirst({
                where: {
                    jobId,
                    fromUserId: employerUserId,
                    toUserId,
                },
            });
            if (existingRating) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.CONFLICT, "You have already rated this worker for this job");
            }
            const rating = await tx.rating.create({
                data: {
                    jobId,
                    fromUserId: employerUserId,
                    toUserId,
                    ratingValue,
                    reviewText,
                },
            });
            const ratingStats = await tx.rating.aggregate({
                where: { toUserId },
                _avg: {
                    ratingValue: true,
                },
                _count: {
                    ratingValue: true,
                },
            });
            await tx.worker.update({
                where: { userId: toUserId },
                data: {
                    rating: ratingStats._avg.ratingValue ?? 0,
                    totalRatings: ratingStats._count.ratingValue,
                },
            });
            return rating;
        });
    },
    async createWorkerRating(jobId, workerUserId, workerId, toUserId, ratingValue, reviewText) {
        return prisma_1.prisma.$transaction(async (tx) => {
            const job = await tx.job.findUnique({
                where: { id: jobId },
            });
            if (!job) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Job not found");
            }
            const employer = await tx.employer.findUnique({
                where: { userId: toUserId },
            });
            if (!employer) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Employer not found");
            }
            if (job.employerId !== employer.id) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "You can only rate the employer for this job");
            }
            const application = await tx.jobApplication.findUnique({
                where: { jobId_workerId: { jobId, workerId } },
            });
            if (!application || !["SELECTED", "COMPLETED"].includes(application.status)) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "You can only rate the employer after check-in or completion");
            }
            const attendance = await tx.attendance.findFirst({
                where: {
                    jobId,
                    workerId,
                    checkInTime: { not: null },
                },
            });
            const isEligible = Boolean(attendance?.checkInTime) || application.status === "COMPLETED";
            if (!isEligible) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "You can rate the employer after check-in or once the job is completed");
            }
            const existingRating = await tx.rating.findFirst({
                where: {
                    jobId,
                    fromUserId: workerUserId,
                    toUserId,
                },
            });
            if (existingRating) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.CONFLICT, "You have already rated this employer for this job");
            }
            const rating = await tx.rating.create({
                data: {
                    jobId,
                    fromUserId: workerUserId,
                    toUserId,
                    ratingValue,
                    reviewText,
                },
            });
            const ratingStats = await tx.rating.aggregate({
                where: { toUserId },
                _avg: {
                    ratingValue: true,
                },
                _count: {
                    ratingValue: true,
                },
            });
            await tx.employer.update({
                where: { userId: toUserId },
                data: {
                    rating: ratingStats._avg.ratingValue ?? 0,
                    totalRatings: ratingStats._count.ratingValue,
                },
            });
            return rating;
        });
    },
    async getEligibleWorkers(jobId, employerId, employerUserId) {
        const job = await prisma_1.prisma.job.findUnique({
            where: {
                id: jobId,
            },
        });
        if (!job) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Job not found");
        }
        if (job.employerId !== employerId) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "You can only access your own jobs");
        }
        const completedWorkers = await prisma_1.prisma.jobApplication.findMany({
            where: {
                jobId,
                status: "COMPLETED",
            },
            include: {
                worker: true,
            },
        });
        const alreadyRated = await prisma_1.prisma.rating.findMany({
            where: {
                jobId,
                fromUserId: employerUserId,
            },
            select: {
                toUserId: true,
            },
        });
        const ratedUserIds = alreadyRated.map((rating) => rating.toUserId);
        return completedWorkers.filter((worker) => !ratedUserIds.includes(worker.worker.userId));
    },
    async getReceivedRatings(workerUserId) {
        const worker = await prisma_1.prisma.worker.findUnique({
            where: { userId: workerUserId },
        });
        if (!worker) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Worker profile not found");
        }
        return prisma_1.prisma.rating.findMany({
            where: {
                toUserId: workerUserId,
            },
            include: {
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
                fromUser: {
                    select: {
                        role: true,
                        employer: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    },
    async getEmployerReceivedRatings(employerUserId) {
        const employer = await prisma_1.prisma.employer.findUnique({
            where: { userId: employerUserId },
        });
        if (!employer) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Employer profile not found");
        }
        return prisma_1.prisma.rating.findMany({
            where: {
                toUserId: employerUserId,
            },
            include: {
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
                fromUser: {
                    select: {
                        role: true,
                        worker: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    },
    async getJobRatings(jobId, workerUserId) {
        const worker = await prisma_1.prisma.worker.findUnique({
            where: { userId: workerUserId },
        });
        if (!worker) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Worker profile not found");
        }
        return prisma_1.prisma.rating.findMany({
            where: {
                jobId,
                toUserId: workerUserId,
            },
            include: {
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
                fromUser: {
                    select: {
                        role: true,
                        employer: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    },
};
//# sourceMappingURL=rating.service.js.map