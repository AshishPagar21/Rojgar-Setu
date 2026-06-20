import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { paymentController } from "./payment.controller";
import {
  getJobPaymentsSchema,
  markPaymentSuccessSchema,
} from "./payment.validation";

const router = Router();

// --- EMPLOYER ROUTES ---

// GET /payments/job/:jobId
router.get(
  "/job/:jobId",
  authenticate,
  authorizeRoles("EMPLOYER", "WORKER"),
  validate(getJobPaymentsSchema),
  paymentController.getJobPayments,
);

// PATCH /payments/:paymentId/mark-paid
router.patch(
  "/:paymentId/mark-paid",
  authenticate,
  authorizeRoles("EMPLOYER"),
  validate(markPaymentSuccessSchema),
  paymentController.markPaymentSuccess,
);


// --- WORKER ROUTES ---

// GET /payments/my
router.get(
  "/my",
  authenticate,
  authorizeRoles("WORKER"),
  paymentController.getMyPayments,
);

// PATCH /payments/:paymentId/confirm
router.patch(
  "/:paymentId/confirm",
  authenticate,
  authorizeRoles("WORKER"),
  paymentController.confirmPaymentReceived,
);

export const paymentRoutes = router;