import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { attendanceController } from "./attendance.controller";
import {
  checkInSchema,
  checkOutSchema,
  getJobAttendanceSchema,
} from "./attendance.validation";

const router = Router();

// Worker routes
router.post(
  "/:jobId/check-in",
  authenticate,
  authorizeRoles("WORKER"),
  validate(checkInSchema),
  attendanceController.checkIn,
);

router.post(
  "/:jobId/check-out",
  authenticate,
  authorizeRoles("WORKER"),
  validate(checkOutSchema),
  attendanceController.checkOut,
);

router.get(
  "/my",
  authenticate,
  authorizeRoles("WORKER"),
  attendanceController.getMyAttendance,
);

// Employer routes
router.get(
  "/job/:jobId",
  authenticate,
  authorizeRoles("EMPLOYER"),
  validate(getJobAttendanceSchema),
  attendanceController.getJobAttendance,
);

export const attendanceRoutes = router;
