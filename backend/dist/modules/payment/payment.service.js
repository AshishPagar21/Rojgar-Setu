"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const prisma_1 = require("../../config/prisma");
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
exports.paymentService = {
    async getPaymentModuleStatus() {
        return {
            module: "payment",
            status: "ok",
            timestamp: new Date().toISOString(),
        };
    },
    /**
     * Create payment records for selected workers of a completed job
     */
    async createPaymentsForJob(jobId, employerId) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            // Verify job belongs to employer and is completed
            const job = await tx.job.findUnique({
                where: { id: jobId },
            });
            if (!job) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Job not found");
            }
            if (job.employerId !== employerId) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "You can only create payments for your own jobs");
            }
            if (job.status !== "COMPLETED") {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Job must be COMPLETED to create payments");
            }
            // Get all selected workers for this job
            const selectedApplications = await tx.jobApplication.findMany({
                where: { jobId, status: "SELECTED" },
                select: { workerId: true },
            });
            if (selectedApplications.length === 0) {
                throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "No selected workers found for this job");
            }
            // Create payment records for each worker if not already exists
            const payments = await Promise.all(selectedApplications.map(async (app) => {
                const existingPayment = await tx.payment.findFirst({
                    where: { jobId, workerId: app.workerId },
                    orderBy: { createdAt: "desc" },
                });
                if (existingPayment) {
                    return tx.payment.update({
                        where: { id: existingPayment.id },
                        data: { amount: job.wage },
                    });
                }
                return tx.payment.create({
                    data: {
                        jobId,
                        employerId,
                        workerId: app.workerId,
                        amount: job.wage,
                        paymentStatus: "PENDING",
                    },
                });
            }));
            return payments;
        });
    },
    /**
     * Mark payment as successful
     */
    async markPaymentSuccess(paymentId, employerId) {
        const payment = await prisma_1.prisma.payment.findUnique({
            where: { id: paymentId },
        });
        if (!payment) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Payment not found");
        }
        if (payment.employerId !== employerId) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "You can only update your own payments");
        }
        const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        return prisma_1.prisma.payment.update({
            where: { id: paymentId },
            data: {
                paymentStatus: "SUCCESS",
                transactionId,
                paidAt: new Date(),
            },
        });
    },
    /**
     * Get payments for a specific job (employer view)
     */
    async getJobPayments(jobId, employerId) {
        // Verify job belongs to employer
        const job = await prisma_1.prisma.job.findUnique({
            where: { id: jobId },
        });
        if (!job) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Job not found");
        }
        if (job.employerId !== employerId) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "You can only view payments for your own jobs");
        }
        return prisma_1.prisma.payment.findMany({
            where: { jobId },
            include: {
                worker: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    },
    /**
     * Get worker's payment history
     */
    async getWorkerPayments(workerId) {
        return prisma_1.prisma.payment.findMany({
            where: { workerId },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        jobDate: true,
                    },
                },
                employer: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    },
};
//# sourceMappingURL=payment.service.js.map