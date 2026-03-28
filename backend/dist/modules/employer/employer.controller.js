"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employerController = void 0;
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const employer_service_1 = require("./employer.service");
const prisma_1 = require("../../config/prisma");
exports.employerController = {
    /**
     * GET /api/employer/dashboard - Get employer dashboard
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
            const dashboard = await employer_service_1.employerService.getEmployerDashboard(employer.id);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Dashboard retrieved successfully", dashboard);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=employer.controller.js.map