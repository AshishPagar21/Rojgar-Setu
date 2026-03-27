"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRoutes = void 0;
const express_1 = require("express");
const job_controller_1 = require("./job.controller");
const router = (0, express_1.Router)();
router.get("/", job_controller_1.jobController.getStatus);
exports.jobRoutes = router;
//# sourceMappingURL=job.routes.js.map