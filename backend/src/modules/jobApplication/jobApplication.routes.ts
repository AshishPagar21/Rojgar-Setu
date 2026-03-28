import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { jobApplicationController } from "./jobApplication.controller";
import {
  applyToJobSchema,
  getJobApplicantsSchema,
  selectWorkersSchema,
} from "./jobApplication.validation";

const router = Router();

// Worker routes
router.post(
  "/:jobId/apply",
  authenticate,
  authorizeRoles("WORKER"),
  validate(applyToJobSchema),
  jobApplicationController.applyToJob,
);

router.get(
  "/my",
  authenticate,
  authorizeRoles("WORKER"),
  jobApplicationController.getMyApplications,
);

router.get(
  "/my-assigned",
  authenticate,
  authorizeRoles("WORKER"),
  jobApplicationController.getMyAssignedJobs,
);

// Employer routes
router.get(
  "/job/:jobId",
  authenticate,
  authorizeRoles("EMPLOYER"),
  validate(getJobApplicantsSchema),
  jobApplicationController.getJobApplicants,
);

router.patch(
  "/job/:jobId/select",
  authenticate,
  authorizeRoles("EMPLOYER"),
  validate(selectWorkersSchema),
  jobApplicationController.selectWorkers,
);

export const jobApplicationRoutes = router;
