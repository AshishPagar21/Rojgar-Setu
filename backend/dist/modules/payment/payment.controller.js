"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = void 0;
const prisma_1 = require("../../config/prisma");
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const payment_service_1 = require("./payment.service");
const getStatus = async (_req, res, next) => {
    try {
        const result = await payment_service_1.paymentService.getPaymentModuleStatus();
        (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Payment module ready", result);
    }
    catch (error) {
        next(error);
    }
};
exports.paymentController = {
    async createPaymentsForJob(req, res, next) {
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
            const payments = await payment_service_1.paymentService.createPaymentsForJob(jobId, employer.id);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Payments created successfully", payments);
        }
        catch (error) {
            next(error);
        }
    },
    async markPaymentSuccess(req, res, next) {
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
            const paymentId = parseInt(req.params.paymentId, 10);
            const payment = await payment_service_1.paymentService.markPaymentSuccess(paymentId, employer.id);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Payment marked as successful", payment);
        }
        catch (error) {
            next(error);
        }
    },
    async getJobPayments(req, res, next) {
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
            const payments = await payment_service_1.paymentService.getJobPayments(jobId, employer.id);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Payments retrieved successfully", payments);
        }
        catch (error) {
            next(error);
        }
    },
    async getMyPayments(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: "Unauthorized",
                });
                return;
            }
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
            const payments = await payment_service_1.paymentService.getWorkerPayments(worker.id);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Payments retrieved successfully", payments);
        }
        catch (error) {
            next(error);
        }
    },
    getStatus,
};
//# sourceMappingURL=payment.controller.js.map