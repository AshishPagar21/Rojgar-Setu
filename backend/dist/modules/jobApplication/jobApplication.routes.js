"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobApplicationRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const jobApplication_controller_1 = require("./jobApplication.controller");
const jobApplication_validation_1 = require("./jobApplication.validation");
const router = (0, express_1.Router)();
// Worker routes
router.post("/:jobId/apply", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("WORKER"), (0, validate_middleware_1.validate)(jobApplication_validation_1.applyToJobSchema), jobApplication_controller_1.jobApplicationController.applyToJob);
router.get("/my", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("WORKER"), jobApplication_controller_1.jobApplicationController.getMyApplications);
router.get("/my-assigned", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("WORKER"), jobApplication_controller_1.jobApplicationController.getMyAssignedJobs);
// Employer routes
router.get("/job/:jobId", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("EMPLOYER"), (0, validate_middleware_1.validate)(jobApplication_validation_1.getJobApplicantsSchema), jobApplication_controller_1.jobApplicationController.getJobApplicants);
router.patch("/job/:jobId/select", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("EMPLOYER"), (0, validate_middleware_1.validate)(jobApplication_validation_1.selectWorkersSchema), jobApplication_controller_1.jobApplicationController.selectWorkers);
exports.jobApplicationRoutes = router;
//# sourceMappingURL=jobApplication.routes.js.map