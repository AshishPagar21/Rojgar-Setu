"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const router = (0, express_1.Router)();
router.get("/", payment_controller_1.paymentController.getStatus);
exports.paymentRoutes = router;
//# sourceMappingURL=payment.routes.js.map