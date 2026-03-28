import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { ratingController } from "./rating.controller";
import { createRatingSchema, getJobRatingsSchema } from "./rating.validation";

const router = Router();

// Protected routes - both employer and worker can create and view ratings
router.post(
  "/",
  authenticate,
  authorizeRoles("EMPLOYER", "WORKER"),
  validate(createRatingSchema),
  ratingController.createRating,
);

router.get(
  "/my-received",
  authenticate,
  authorizeRoles("EMPLOYER", "WORKER"),
  ratingController.getReceivedRatings,
);

router.get(
  "/job/:jobId",
  validate(getJobRatingsSchema),
  ratingController.getJobRatings,
);

export const ratingRoutes = router;
