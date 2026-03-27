"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobApplicationController = void 0;
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const jobApplication_service_1 = require("./jobApplication.service");
const getStatus = async (_req, res, next) => {
    try {
        const result = await jobApplication_service_1.jobApplicationService.getJobApplicationModuleStatus();
        (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Job application module ready", result);
    }
    catch (error) {
        next(error);
    }
};
exports.jobApplicationController = {
    getStatus,
};
//# sourceMappingURL=jobApplication.controller.js.map