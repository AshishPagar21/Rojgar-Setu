"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobService = void 0;
const prisma_1 = require("../../config/prisma");
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const geolocation_1 = require("../../utils/geolocation");
const buildDescriptionWithLocation = (payload) => {
    const baseDescription = payload.description.trim();
    const locationLine1 = payload.locationLine1.trim();
    const city = payload.city.trim();
    const landmark = payload.landmark.trim();
    return `${baseDescription}\n\nLocation: ${locationLine1}, ${city}, ${landmark}`;
};
exports.jobService = {
    /**
     * Create a new job
     */
    async createJob(employerId, payload) {
        // Validate coordinates
        console.log("PAYLOAD RECEIVED:", payload);
        if (!payload.latitude || !payload.longitude) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Location coordinates (latitude and longitude) are required");
        }
        const job = await prisma_1.prisma.job.create({
            data: {
                employerId,
                title: payload.title,
                description: buildDescriptionWithLocation(payload),
                category: payload.category,
                wage: payload.wage,
                jobDate: new Date(payload.jobDate),
                expectedStartTime: payload.expectedStartTime,
                expectedEndTime: payload.expectedEndTime,
                expectedWorkingHours: payload.expectedWorkingHours,
                requiredWorkers: payload.requiredWorkers,
                locationLine1: payload.locationLine1,
                city: payload.city,
                landmark: payload.landmark,
                latitude: payload.latitude,
                longitude: payload.longitude,
                status: "OPEN",
            },
        });
        // Increment employer's totalJobsPosted
        await prisma_1.prisma.employer.update({
            where: { id: employerId },
            data: { totalJobsPosted: { increment: 1 } },
        });
        return job;
    },
    /**
     * Get all jobs posted by an employer
     */
    async getEmployerJobs(employerId) {
        return prisma_1.prisma.job.findMany({
            where: { employerId },
            include: {
                jobApplications: true,
            },
            orderBy: { createdAt: "desc" },
        });
    },
    /**
     * Get all open jobs (for workers to browse)
     * If worker coordinates are provided, filters jobs within 10km radius
     */
    async getOpenJobs(filters) {
        const where = { status: "OPEN" };
        if (filters?.category) {
            where.category = filters.category;
        }
        if (filters?.date) {
            const startDate = new Date(filters.date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            where.jobDate = {
                gte: startDate,
                lt: endDate,
            };
        }
        const jobs = await prisma_1.prisma.job.findMany({
            where,
            include: {
                employer: {
                    select: {
                        id: true,
                        userId: true,
                        name: true,
                        rating: true,
                    },
                },
                jobApplications: {
                    select: {
                        workerId: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        // Filter by distance if worker location is provided
        if (filters?.latitude && filters?.longitude) {
            const radius = filters.radius || 10; // Default 10km radius
            // Calculate distance for each job, filter by radius and sort by nearest
            const jobsWithDistance = jobs
                .map((job) => ({
                ...job,
                distance: (0, geolocation_1.calculateDistance)(filters.latitude, filters.longitude, job.latitude, job.longitude),
            }))
                .filter((j) => j.distance <= radius)
                .sort((a, b) => a.distance - b.distance);
            return jobsWithDistance;
        }
        return jobs;
    },
    /**
     * Get nearby open jobs within a radius (returns reduced payload with distance)
     */
    async getNearbyJobs(filters) {
        if (!filters?.latitude || !filters?.longitude) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "latitude and longitude are required");
        }
        const radius = filters.radius || 10;
        // Fetch OPEN jobs (keep includes minimal to avoid heavy payload)
        const jobs = await prisma_1.prisma.job.findMany({
            where: { status: "OPEN" },
            select: {
                id: true,
                title: true,
                city: true,
                landmark: true,
                wage: true,
                latitude: true,
                longitude: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });
        const jobsWithDistance = jobs
            .map((job) => ({
            id: job.id,
            title: job.title,
            city: job.city,
            landmark: job.landmark,
            wage: job.wage,
            latitude: job.latitude,
            longitude: job.longitude,
            distance: (0, geolocation_1.calculateDistance)(filters.latitude, filters.longitude, job.latitude, job.longitude),
        }))
            .filter((j) => j.distance <= radius)
            .sort((a, b) => a.distance - b.distance);
        return jobsWithDistance;
    },
    /**
     * Get single job details
     */
    async getJobById(jobId) {
        const job = await prisma_1.prisma.job.findUnique({
            where: { id: jobId },
            include: {
                employer: {
                    select: {
                        id: true,
                        userId: true,
                        name: true,
                        rating: true,
                    },
                },
                jobApplications: {
                    include: {
                        worker: {
                            select: {
                                id: true,
                                name: true,
                                rating: true,
                            },
                        },
                    },
                },
                attendance: true,
                payments: true,
            },
        });
        if (!job) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Job not found");
        }
        return job;
    },
    /**
     * Cancel a job (employer only)
     */
    async cancelJob(jobId, employerId) {
        const job = await prisma_1.prisma.job.findUnique({
            where: { id: jobId },
        });
        if (!job) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Job not found");
        }
        if (job.employerId !== employerId) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "You can only cancel your own jobs");
        }
        if (job.status === "COMPLETED") {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Cannot cancel a completed job");
        }
        return prisma_1.prisma.job.update({
            where: { id: jobId },
            data: { status: "CANCELLED" },
        });
    },
    /**
     * Mark job as completed (employer only)
     */
    async completeJob(jobId, employerId) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            const job = await tx.job.findUnique({
                where: { id: jobId },
            });
            if (!job) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Job not found");
            }
            if (job.employerId !== employerId) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "You can only complete your own jobs");
            }
            if (job.status !== "ASSIGNED") {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Job must be in ASSIGNED status to complete");
            }
            // Get all selected workers
            const selectedApplications = await tx.jobApplication.findMany({
                where: { jobId, status: "SELECTED" },
                select: { workerId: true },
            });
            // Update job status
            const updatedJob = await tx.job.update({
                where: { id: jobId },
                data: { status: "COMPLETED" },
            });
            await tx.jobApplication.updateMany({
                where: { jobId, status: "SELECTED" },
                data: { status: "COMPLETED", completedAt: new Date() },
            });
            // Update employer totalJobsCompleted
            await tx.employer.update({
                where: { id: employerId },
                data: { totalJobsCompleted: { increment: 1 } },
            });
            // Update each worker's totalJobsCompleted
            for (const app of selectedApplications) {
                await tx.worker.update({
                    where: { id: app.workerId },
                    data: { totalJobsCompleted: { increment: 1 } },
                });
            }
            return updatedJob;
        });
    },
};
//# sourceMappingURL=job.service.js.map