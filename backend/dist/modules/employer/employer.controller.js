"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employerController = void 0;
const employer_service_1 = require("./employer.service");
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const getStatus = async (_req, res, next) => {
    try {
        const result = await employer_service_1.employerService.getEmployerModuleStatus();
        (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Employer module ready", result);
    }
    catch (error) {
        next(error);
    }
};
exports.employerController = {
    getStatus,
};
//# sourceMappingURL=employer.controller.js.map