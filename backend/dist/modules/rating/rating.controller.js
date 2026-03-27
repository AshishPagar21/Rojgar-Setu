"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingController = void 0;
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const rating_service_1 = require("./rating.service");
const getStatus = async (_req, res, next) => {
    try {
        const result = await rating_service_1.ratingService.getRatingModuleStatus();
        (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Rating module ready", result);
    }
    catch (error) {
        next(error);
    }
};
exports.ratingController = {
    getStatus,
};
//# sourceMappingURL=rating.controller.js.map