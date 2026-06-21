import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";

import { ratingController } from "./rating.controller";
import {
  createRatingSchema,
  getEligibleWorkersSchema,
  getJobRatingsSchema,
} from "./rating.validation";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("EMPLOYER", "WORKER"),
  validate(createRatingSchema),
  ratingController.createRating,
);

router.get(
  "/jobs/:jobId/eligible-workers",
  authenticate,
  authorizeRoles("EMPLOYER"),
  validate(getEligibleWorkersSchema),
  ratingController.getEligibleWorkers,
);

router.get(
  "/my-received",
  authenticate,
  authorizeRoles("EMPLOYER", "WORKER"),
  ratingController.getReceivedRatings,
);

router.get(
  "/job/:jobId",
  authenticate,
  authorizeRoles("WORKER"),
  validate(getJobRatingsSchema),
  ratingController.getJobRatings,
);

export const ratingRoutes = router;