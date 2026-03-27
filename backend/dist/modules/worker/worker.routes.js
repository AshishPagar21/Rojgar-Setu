"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerRoutes = void 0;
const express_1 = require("express");
const worker_controller_1 = require("./worker.controller");
const router = (0, express_1.Router)();
router.get("/", worker_controller_1.workerController.getStatus);
exports.workerRoutes = router;
//# sourceMappingURL=worker.routes.js.map