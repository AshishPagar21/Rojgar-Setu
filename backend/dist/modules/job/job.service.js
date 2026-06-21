"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobService = void 0;
const prisma_1 = require("../../config/prisma");
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const geolocation_1 = require("../../utils/geolocation");
const socket_server_1 = require("../../socket/socket.server");
const notification_service_1 = require("../notification/notification.service");
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
        // Real-time: Broadcast new job and notify nearby workers (within 10km)
        const socketServer = (0, socket_server_1.getSocketServer)();
        if (socketServer) {
            socketServer.emit(socket_server_1.SOCKET_EVENTS.jobNew, {
                ...job,
                distance: null,
            });
            for (const [userId, location] of socket_server_1.activeWorkerLocations.entries()) {
                const distance = (0, geolocation_1.calculateDistance)(location.latitude, location.longitude, job.latitude, job.longitude);
                if (distance <= 10) {
                    void notification_service_1.notificationService.createNotification({
                        userId,
                        title: "New Job Nearby",
                        message: `A new job "${job.title}" has been posted within 10km of your location.`,
                        type: "NEW_JOB_NEARBY",
                    });
                }
            }
        }
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
                                userId: true,
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
            include: {
                employer: {
                    select: { userId: true },
                },
            },
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
        const selectedApplications = await prisma_1.prisma.jobApplication.findMany({
            where: { jobId, status: "SELECTED" },
            include: {
                worker: {
                    select: { userId: true },
                },
            },
        });
        const updatedJob = await prisma_1.prisma.job.update({
            where: { id: jobId },
            data: { status: "CANCELLED" },
        });
        // Notify selected workers of cancellation
        for (const app of selectedApplications) {
            void notification_service_1.notificationService.createNotification({
                userId: app.worker.userId,
                title: "Job Cancelled",
                message: `The job "${job.title}" has been cancelled by the employer.`,
                type: "JOB_CANCELLED",
            });
            (0, socket_server_1.emitToUser)(app.worker.userId, socket_server_1.SOCKET_EVENTS.jobUpdated, {
                jobId,
                status: "CANCELLED",
            });
        }
        // Also emit to employer
        (0, socket_server_1.emitToUser)(job.employer.userId, socket_server_1.SOCKET_EVENTS.jobUpdated, {
            jobId,
            status: "CANCELLED",
        });
        return updatedJob;
    },
    /**
     * Mark job as completed (employer only)
     */
    async completeJob(jobId, employerId) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const job = await tx.job.findUnique({
                where: { id: jobId },
                include: {
                    employer: {
                        select: { userId: true },
                    },
                },
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
                include: {
                    worker: {
                        select: { id: true, userId: true },
                    },
                },
            });
            // Get all payments for this job
            const payments = await tx.payment.findMany({
                where: { jobId },
            });
            // Verify that all selected applications have a payment record with status COMPLETED
            const allPaid = selectedApplications.every((app) => {
                const p = payments.find((pay) => pay.workerId === app.workerId);
                return p && p.status === "COMPLETED";
            });
            if (!allPaid) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Cannot complete job until all payments for selected workers are completed");
            }
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
                    where: { id: app.worker.id },
                    data: { totalJobsCompleted: { increment: 1 } },
                });
            }
            return { updatedJob, selectedApplications, employerUserId: job.employer.userId, jobTitle: job.title };
        });
        // Notify selected workers of completion
        for (const app of result.selectedApplications) {
            void notification_service_1.notificationService.createNotification({
                userId: app.worker.userId,
                title: "Job Completed",
                message: `The job "${result.jobTitle}" has been marked as completed.`,
                type: "JOB_COMPLETED",
            });
            (0, socket_server_1.emitToUser)(app.worker.userId, socket_server_1.SOCKET_EVENTS.jobUpdated, {
                jobId,
                status: "COMPLETED",
            });
        }
        // Also emit to employer
        (0, socket_server_1.emitToUser)(result.employerUserId, socket_server_1.SOCKET_EVENTS.jobUpdated, {
            jobId,
            status: "COMPLETED",
        });
        return result.updatedJob;
    },
    /**
     * Update an existing job (employer only)
     */
    async updateJob(jobId, employerId, payload) {
        const job = await prisma_1.prisma.job.findUnique({
            where: { id: jobId },
            include: {
                jobApplications: true,
                employer: { select: { userId: true } },
            },
        });
        if (!job) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Job not found");
        }
        if (job.employerId !== employerId) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "You can only edit your own jobs");
        }
        if (job.status === "COMPLETED" || job.status === "CANCELLED") {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Cannot edit a completed or cancelled job");
        }
        if (!payload.latitude || !payload.longitude) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Location coordinates (latitude and longitude) are required");
        }
        const selectedWorkersCount = job.jobApplications.filter((a) => a.status === "SELECTED" || a.status === "COMPLETED").length;
        if (payload.requiredWorkers < selectedWorkersCount) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, `Required workers cannot be less than the number of selected workers (${selectedWorkersCount})`);
        }
        const updatedJob = await prisma_1.prisma.job.update({
            where: { id: jobId },
            data: {
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
            },
        });
        // Notify selected workers about job updates
        const selectedApplications = await prisma_1.prisma.jobApplication.findMany({
            where: { jobId, status: "SELECTED" },
            include: { worker: { select: { userId: true } } },
        });
        for (const app of selectedApplications) {
            void notification_service_1.notificationService.createNotification({
                userId: app.worker.userId,
                title: "Job Details Updated",
                message: `The job "${job.title}" has been updated by the employer.`,
                type: "JOB_UPDATED",
            });
            (0, socket_server_1.emitToUser)(app.worker.userId, socket_server_1.SOCKET_EVENTS.jobUpdated, {
                jobId,
                status: job.status,
            });
        }
        // Also emit update to employer
        (0, socket_server_1.emitToUser)(job.employer.userId, socket_server_1.SOCKET_EVENTS.jobUpdated, {
            jobId,
            status: job.status,
        });
        return updatedJob;
    },
};
//# sourceMappingURL=job.service.js.map