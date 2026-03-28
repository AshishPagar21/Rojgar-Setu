"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerController = void 0;
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const worker_service_1 = require("./worker.service");
const prisma_1 = require("../../config/prisma");
exports.workerController = {
    /**
     * GET /api/worker/dashboard - Get worker dashboard
     */
    async getDashboard(req, res, next) {
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
            const dashboard = await worker_service_1.workerService.getWorkerDashboard(worker.id);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Dashboard retrieved successfully", dashboard);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=worker.controller.js.map