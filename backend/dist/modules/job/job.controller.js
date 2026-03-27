"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobController = void 0;
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const job_service_1 = require("./job.service");
const getStatus = async (_req, res, next) => {
    try {
        const result = await job_service_1.jobService.getJobModuleStatus();
        (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Job module ready", result);
    }
    catch (error) {
        next(error);
    }
};
exports.jobController = {
    getStatus,
};
//# sourceMappingURL=job.controller.js.map