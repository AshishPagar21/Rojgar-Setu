"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceService = void 0;
const prisma_1 = require("../../config/prisma");
const socket_server_1 = require("../../socket/socket.server");
const constants_1 = require("../../utils/constants");
const geolocation_1 = require("../../utils/geolocation");
const response_1 = require("../../utils/response");
const notification_service_1 = require("../notification/notification.service");
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const MAX_CHECKIN_DISTANCE_METERS = 200;
const assertJobCoordinates = (jobLatitude, jobLongitude, latitude, longitude) => {
    const withinRadius = (0, geolocation_1.isWithinDistanceMeters)(latitude, longitude, jobLatitude, jobLongitude, MAX_CHECKIN_DISTANCE_METERS);
    if (!withinRadius) {
        throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "You must be within 200 meters of the job location.");
    }
};
const loadAttendanceParticipants = async (jobId, workerId) => {
    const [job, worker] = await Promise.all([
        prisma_1.prisma.job.findUnique({
            where: { id: jobId },
            include: {
                employer: {
                    include: {
                        user: true,
                    },
                },
            },
        }),
        prisma_1.prisma.worker.findUnique({
            where: { id: workerId },
            include: {
                user: true,
            },
        }),
    ]);
    if (!job) {
        throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Job not found");
    }
    if (!worker) {
        throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Worker profile not found");
    }
    return { job, worker };
};
const emitAttendanceUpdate = (userIds, event, attendance) => {
    (0, socket_server_1.emitToUsers)(userIds, event, attendance);
};
const increaseWorkerReliability = async (workerId, delta = 2) => {
    const worker = await prisma_1.prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) {
        return;
    }
    await prisma_1.prisma.worker.update({
        where: { id: workerId },
        data: {
            reliabilityScore: clamp(worker.reliabilityScore + delta, 0, 100),
        },
    });
};
exports.attendanceService = {
    /**
     * Worker checks in to a job
     */
    async checkIn(jobId, workerId, payload) {
        // Verify worker has SELECTED status for this job
        const jobApplication = await prisma_1.prisma.jobApplication.findUnique({
            where: { jobId_workerId: { jobId, workerId } },
        });
        if (!jobApplication || jobApplication.status !== "SELECTED") {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "You are not selected for this job");
        }
        // Verify job is ASSIGNED
        const { job, worker } = await loadAttendanceParticipants(jobId, workerId);
        if (job.status !== "ASSIGNED") {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Job is not in ASSIGNED status");
        }
        // Check if already checked in
        const existingAttendance = await prisma_1.prisma.attendance.findUnique({
            where: { jobId_workerId: { jobId, workerId } },
        });
        if (existingAttendance?.status === "CHECKED_IN") {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "You have already checked in for this job");
        }
        if (existingAttendance) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Attendance has already been submitted for this job");
        }
        assertJobCoordinates(job.latitude, job.longitude, payload.latitude, payload.longitude);
        const attendance = await prisma_1.prisma.attendance.create({
            data: {
                jobId,
                workerId,
                checkInTime: new Date(),
                checkInLatitude: payload.latitude,
                checkInLongitude: payload.longitude,
                status: "CHECKED_IN",
            },
        });
        await notification_service_1.notificationService.createNotification({
            userId: job.employer.userId,
            title: "Worker checked in",
            message: `${worker.name} checked in for ${job.title}.`,
            type: "ATTENDANCE_CHECKED_IN",
        });
        emitAttendanceUpdate([job.employer.userId, worker.userId], socket_server_1.SOCKET_EVENTS.attendanceCheckedIn, attendance);
        return attendance;
    },
    /**
     * Worker checks out from a job
     */
    async checkOut(jobId, workerId, payload) {
        const attendance = await prisma_1.prisma.attendance.findUnique({
            where: { jobId_workerId: { jobId, workerId } },
            include: {
                job: {
                    include: {
                        employer: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                worker: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!attendance) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "No check-in found for this job");
        }
        if (attendance.status !== "CHECKED_IN") {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Attendance is not open for checkout");
        }
        assertJobCoordinates(attendance.job.latitude, attendance.job.longitude, payload.latitude, payload.longitude);
        const checkOutTime = new Date();
        const totalHours = attendance.checkInTime
            ? (checkOutTime.getTime() - attendance.checkInTime.getTime()) /
                (1000 * 60 * 60)
            : 0;
        const updatedAttendance = await prisma_1.prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                checkOutTime: checkOutTime,
                totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimals
                checkOutLatitude: payload.latitude,
                checkOutLongitude: payload.longitude,
                status: "PENDING_REVIEW",
            },
        });
        await notification_service_1.notificationService.createNotification({
            userId: attendance.job.employer.userId,
            title: "Worker checked out",
            message: `${attendance.worker.name} checked out from ${attendance.job.title}.`,
            type: "ATTENDANCE_CHECKED_OUT",
        });
        emitAttendanceUpdate([attendance.job.employer.userId, attendance.worker.userId], socket_server_1.SOCKET_EVENTS.attendanceCheckedOut, updatedAttendance);
        return updatedAttendance;
    },
    async approveAttendance(attendanceId, employerId) {
        const attendance = await prisma_1.prisma.attendance.findUnique({
            where: { id: attendanceId },
            include: {
                job: {
                    include: {
                        employer: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                worker: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!attendance) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Attendance not found");
        }
        if (attendance.job.employerId !== employerId) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "You can only approve attendance for your own jobs");
        }
        if (attendance.status !== "PENDING_REVIEW") {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Only pending attendance can be approved");
        }
        // Wrap the state updates in a secure database transaction
        const updatedAttendance = await prisma_1.prisma.$transaction(async (tx) => {
            // 1. Update the parent status state to APPROVED
            const updated = await tx.attendance.update({
                where: { id: attendanceId },
                data: {
                    status: "APPROVED",
                    reviewedAt: new Date(),
                },
            });
            // 2. Safely check if a payment record already exists to prevent duplicate rows
            const existingPayment = await tx.payment.findFirst({
                where: {
                    jobId: attendance.jobId,
                    workerId: attendance.workerId,
                },
            });
            // 3. Create the missing payment item if it doesn't exist
            //   if (!existingPayment) {
            //     await tx.payment.create({
            //       data: {
            //         jobId: attendance.jobId,
            //         workerId: attendance.workerId,
            //         employerId: attendance.job.employerId,
            //         amount: attendance.job.wage, // Pulls the wage directly from your job relation schema
            //         status: "PENDING", // Default tracking status
            //         employerConfirmed: false,
            //         workerConfirmed: false,
            //       },
            //     });
            //   }
            if (!existingPayment) {
                // 👇 Multiply total hours worked by the job's wage rate (fallback to 0 if totalHours is null)
                const hoursWorked = attendance.totalHours || 0;
                const calculatedWage = Math.round(hoursWorked * attendance.job.wage * 100) / 100;
                await tx.payment.create({
                    data: {
                        jobId: attendance.jobId,
                        workerId: attendance.workerId,
                        employerId: attendance.job.employerId,
                        amount: calculatedWage, // 👈 Saves the dynamic dynamic amount to the DB
                        status: "PENDING",
                        employerConfirmed: false,
                        workerConfirmed: false,
                    },
                });
            }
            return updated;
        });
        // Send down structural worker real-time notifications
        await notification_service_1.notificationService.createNotification({
            userId: attendance.worker.userId,
            title: "Attendance approved",
            message: `Your attendance for ${attendance.job.title} was approved.`,
            type: "ATTENDANCE_APPROVED",
        });
        await increaseWorkerReliability(attendance.workerId, 2);
        emitAttendanceUpdate([attendance.job.employer.userId, attendance.worker.userId], socket_server_1.SOCKET_EVENTS.attendanceApproved, updatedAttendance);
        return updatedAttendance;
    },
    async reportIssue(attendanceId, employerId, reason) {
        const attendance = await prisma_1.prisma.attendance.findUnique({
            where: { id: attendanceId },
            include: {
                job: {
                    include: {
                        employer: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                worker: {
                    select: {
                        userId: true,
                        name: true,
                    },
                },
            },
        });
        if (!attendance) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Attendance not found");
        }
        if (attendance.job.employerId !== employerId) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "You can only report an issue for your own jobs");
        }
        if (attendance.status !== "PENDING_REVIEW") {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Only pending attendance can be reported");
        }
        const updatedAttendance = await prisma_1.prisma.attendance.update({
            where: { id: attendanceId },
            data: {
                status: "ISSUE_REPORTED",
                notes: reason,
                reviewedAt: new Date(),
            },
        });
        await notification_service_1.notificationService.createNotification({
            userId: attendance.worker.userId,
            title: "Attendance issue reported",
            message: `An issue was reported for your attendance on ${attendance.job.title}.`,
            type: "ATTENDANCE_ISSUE_REPORTED",
        });
        emitAttendanceUpdate([attendance.job.employer.userId, attendance.worker.userId], socket_server_1.SOCKET_EVENTS.attendanceIssueReported, updatedAttendance);
        return updatedAttendance;
    },
    /**
     * Get worker's attendance history
     */
    async getWorkerAttendance(workerId) {
        return prisma_1.prisma.attendance.findMany({
            where: { workerId },
            include: {
                disputes: {
                    orderBy: { createdAt: "desc" },
                },
                job: {
                    include: {
                        employer: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    },
    /**
     * Get job's attendance records (employer view)
     */
    async getJobAttendance(jobId, employerId) {
        // Verify job belongs to employer
        const job = await prisma_1.prisma.job.findUnique({
            where: { id: jobId },
        });
        if (!job) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Job not found");
        }
        if (job.employerId !== employerId) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "You can only view attendance for your own jobs");
        }
        return prisma_1.prisma.attendance.findMany({
            where: { jobId },
            include: {
                disputes: {
                    orderBy: { createdAt: "desc" },
                },
                worker: {
                    select: {
                        id: true,
                        name: true,
                        reliabilityScore: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    },
};
//# sourceMappingURL=attendance.service.js.map