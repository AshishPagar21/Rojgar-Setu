import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { jobController } from "./job.controller";
import {
  cancelJobSchema,
  completeJobSchema,
  createJobSchema,
  getJobByIdSchema,
  getOpenJobsSchema,
} from "./job.validation";

const router = Router();

// Public endpoints
router.get("/open", validate(getOpenJobsSchema), jobController.getOpenJobs);

router.get("/:jobId", validate(getJobByIdSchema), jobController.getJobById);

// Protected endpoints - Employer only
router.post(
  "/",
  authenticate,
  authorizeRoles("EMPLOYER"),
  validate(createJobSchema),
  jobController.createJob,
);

router.get(
  "/my",
  authenticate,
  authorizeRoles("EMPLOYER"),
  jobController.getMyJobs,
);

router.patch(
  "/:jobId/cancel",
  authenticate,
  authorizeRoles("EMPLOYER"),
  validate(cancelJobSchema),
  jobController.cancelJob,
);

router.patch(
  "/:jobId/complete",
  authenticate,
  authorizeRoles("EMPLOYER"),
  validate(completeJobSchema),
  jobController.completeJob,
);

export const jobRoutes = router;
