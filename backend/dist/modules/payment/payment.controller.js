"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = void 0;
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
    getStatus,
};
//# sourceMappingURL=payment.controller.js.map