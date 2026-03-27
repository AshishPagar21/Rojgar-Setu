"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobApplicationRoutes = void 0;
const express_1 = require("express");
const jobApplication_controller_1 = require("./jobApplication.controller");
const router = (0, express_1.Router)();
router.get("/", jobApplication_controller_1.jobApplicationController.getStatus);
exports.jobApplicationRoutes = router;
//# sourceMappingURL=jobApplication.routes.js.map