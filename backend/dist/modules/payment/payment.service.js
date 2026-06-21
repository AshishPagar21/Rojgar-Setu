"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const prisma_1 = require("../../config/prisma");
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
exports.paymentService = {
    // GET /payments/job/:jobId
    async getJobPayments(jobId, employerId) {
        const job = await prisma_1.prisma.job.findUnique({ where: { id: jobId } });
        if (!job || job.employerId !== employerId) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "Unauthorized access to job details");
        }
        return prisma_1.prisma.payment.findMany({
            where: { jobId },
            include: {
                worker: true,
                job: true,
            },
            orderBy: { createdAt: "desc" },
        });
    },
    // GET /payments/my
    async getWorkerPayments(workerId) {
        return prisma_1.prisma.payment.findMany({
            where: { workerId },
            include: {
                job: true,
                employer: true,
            },
            orderBy: { createdAt: "desc" },
        });
    },
    // PATCH /payments/:paymentId/mark-paid
    async markAsPaid(paymentId, employerId, method) {
        const payment = await prisma_1.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { worker: true },
        });
        if (!payment || payment.employerId !== employerId) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Payment record not found");
        }
        const updatedPayment = await prisma_1.prisma.payment.update({
            where: { id: paymentId },
            data: {
                paymentMethod: method,
                markedPaidAt: new Date(),
                employerConfirmed: true,
            },
        });
        await prisma_1.prisma.notification.create({
            data: {
                userId: payment.worker.userId,
                title: "Payment Sent",
                message: "Employer marked payment as paid.",
                type: "EMPLOYER_MARKED_PAID",
            },
        });
        return updatedPayment;
    },
    // PATCH /payments/:paymentId/confirm
    async confirmReceived(paymentId, workerId) {
        const payment = await prisma_1.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { employer: true },
        });
        if (!payment || payment.workerId !== workerId) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "Payment transaction missing");
        }
        const updatedPayment = await prisma_1.prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: "COMPLETED",
                confirmedAt: new Date(),
                workerConfirmed: true,
            },
        });
        await prisma_1.prisma.notification.create({
            data: {
                userId: payment.employer.userId,
                title: "Payment Completed",
                message: "Worker confirmed payment receipt.",
                type: "WORKER_CONFIRMED_PAID",
            },
        });
        return updatedPayment;
    }
};
//# sourceMappingURL=payment.service.js.map