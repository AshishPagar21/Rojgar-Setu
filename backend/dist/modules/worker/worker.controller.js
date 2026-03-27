"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerController = void 0;
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const worker_service_1 = require("./worker.service");
const getStatus = async (_req, res, next) => {
    try {
        const result = await worker_service_1.workerService.getWorkerModuleStatus();
        (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Worker module ready", result);
    }
    catch (error) {
        next(error);
    }
};
exports.workerController = {
    getStatus,
};
//# sourceMappingURL=worker.controller.js.map