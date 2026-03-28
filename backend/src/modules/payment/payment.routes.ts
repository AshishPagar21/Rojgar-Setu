import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { paymentController } from "./payment.controller";
import {
  createJobPaymentsSchema,
  getJobPaymentsSchema,
  markPaymentSuccessSchema,
} from "./payment.validation";

const router = Router();

// Employer routes
router.post(
  "/job/:jobId/create",
  authenticate,
  authorizeRoles("EMPLOYER"),
  validate(createJobPaymentsSchema),
  paymentController.createPaymentsForJob,
);

router.patch(
  "/:paymentId/mark-success",
  authenticate,
  authorizeRoles("EMPLOYER"),
  validate(markPaymentSuccessSchema),
  paymentController.markPaymentSuccess,
);

router.get(
  "/my-job/:jobId",
  authenticate,
  authorizeRoles("EMPLOYER"),
  validate(getJobPaymentsSchema),
  paymentController.getJobPayments,
);

// Worker routes
router.get(
  "/my",
  authenticate,
  authorizeRoles("WORKER"),
  paymentController.getMyPayments,
);

export const paymentRoutes = router;
