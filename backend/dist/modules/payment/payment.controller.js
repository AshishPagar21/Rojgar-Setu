"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = void 0;
const prisma_1 = require("../../config/prisma");
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const payment_service_1 = require("./payment.service");
exports.paymentController = {
    // PATCH /payments/:paymentId/mark-paid
    async markPaymentSuccess(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res
                    .status(constants_1.HTTP_STATUS.UNAUTHORIZED)
                    .json({ success: false, message: "Unauthorized" });
                return;
            }
            const employer = await prisma_1.prisma.employer.findUnique({
                where: { userId },
            });
            if (!employer) {
                res
                    .status(constants_1.HTTP_STATUS.NOT_FOUND)
                    .json({ success: false, message: "Employer profile not found" });
                return;
            }
            const { method } = req.body; // Expects "CASH" or "ONLINE_UPI"
            if (!method || !["CASH", "ONLINE_UPI"].includes(method)) {
                res
                    .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                    .json({
                    success: false,
                    message: "Valid payment method is required",
                });
                return;
            }
            const paymentId = parseInt(req.params.paymentId, 10);
            const payment = await payment_service_1.paymentService.markAsPaid(paymentId, employer.id, method);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Payment marked as paid by employer", payment);
        }
        catch (error) {
            next(error);
        }
    },
    // PATCH /payments/:paymentId/confirm
    async confirmPaymentReceived(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res
                    .status(constants_1.HTTP_STATUS.UNAUTHORIZED)
                    .json({ success: false, message: "Unauthorized" });
                return;
            }
            const worker = await prisma_1.prisma.worker.findUnique({
                where: { userId },
            });
            if (!worker) {
                res
                    .status(constants_1.HTTP_STATUS.NOT_FOUND)
                    .json({ success: false, message: "Worker profile not found" });
                return;
            }
            const paymentId = parseInt(req.params.paymentId, 10);
            const payment = await payment_service_1.paymentService.confirmReceived(paymentId, worker.id);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Payment confirmed by worker", payment);
        }
        catch (error) {
            next(error);
        }
    },
    // GET /payments/job/:jobId
    async getJobPayments(req, res, next) {
        try {
            const userId = req.user?.userId;
            const role = req.user?.role; // Ensure your auth middleware populates the user role here
            if (!userId) {
                res
                    .status(constants_1.HTTP_STATUS.UNAUTHORIZED)
                    .json({ success: false, message: "Unauthorized" });
                return;
            }
            const jobId = parseInt(req.params.jobId, 10);
            let payments;
            // Check user role to dynamically handle data parsing constraints
            if (role === "WORKER") {
                const worker = await prisma_1.prisma.worker.findUnique({
                    where: { userId },
                });
                if (!worker) {
                    res
                        .status(constants_1.HTTP_STATUS.NOT_FOUND)
                        .json({ success: false, message: "Worker profile not found" });
                    return;
                }
                // Fetching payments array filtered by both jobId and workerId
                // Ensure your paymentService backend supports this call or update it to match your DB schema
                payments = await prisma_1.prisma.payment.findMany({
                    where: { jobId, workerId: worker.id },
                });
            }
            else {
                // Default back to standard Employer logic
                const employer = await prisma_1.prisma.employer.findUnique({
                    where: { userId },
                });
                if (!employer) {
                    res
                        .status(constants_1.HTTP_STATUS.NOT_FOUND)
                        .json({ success: false, message: "Employer profile not found" });
                    return;
                }
                payments = await payment_service_1.paymentService.getJobPayments(jobId, employer.id);
            }
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Payments retrieved successfully", payments);
        }
        catch (error) {
            next(error);
        }
    },
    // GET /payments/my
    async getMyPayments(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res
                    .status(constants_1.HTTP_STATUS.UNAUTHORIZED)
                    .json({ success: false, message: "Unauthorized" });
                return;
            }
            const worker = await prisma_1.prisma.worker.findUnique({
                where: { userId },
            });
            if (!worker) {
                res
                    .status(constants_1.HTTP_STATUS.NOT_FOUND)
                    .json({ success: false, message: "Worker profile not found" });
                return;
            }
            const payments = await payment_service_1.paymentService.getWorkerPayments(worker.id);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Payments retrieved successfully", payments);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=payment.controller.js.map