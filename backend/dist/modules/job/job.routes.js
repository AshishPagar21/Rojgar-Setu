"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const job_controller_1 = require("./job.controller");
const job_validation_1 = require("./job.validation");
const router = (0, express_1.Router)();
// Public endpoints
router.get("/open", (0, validate_middleware_1.validate)(job_validation_1.getOpenJobsSchema), job_controller_1.jobController.getOpenJobs);
router.get("/:jobId", (0, validate_middleware_1.validate)(job_validation_1.getJobByIdSchema), job_controller_1.jobController.getJobById);
// Protected endpoints - Employer only
router.post("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("EMPLOYER"), (0, validate_middleware_1.validate)(job_validation_1.createJobSchema), job_controller_1.jobController.createJob);
router.get("/my", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("EMPLOYER"), job_controller_1.jobController.getMyJobs);
router.patch("/:jobId/cancel", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("EMPLOYER"), (0, validate_middleware_1.validate)(job_validation_1.cancelJobSchema), job_controller_1.jobController.cancelJob);
router.patch("/:jobId/complete", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("EMPLOYER"), (0, validate_middleware_1.validate)(job_validation_1.completeJobSchema), job_controller_1.jobController.completeJob);
exports.jobRoutes = router;
//# sourceMappingURL=job.routes.js.map