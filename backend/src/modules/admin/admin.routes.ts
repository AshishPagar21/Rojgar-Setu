import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";
import { adminController } from "./admin.controller";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorizeRoles("ADMIN"),
  adminController.getDashboard,
);
router.get(
  "/users",
  authenticate,
  authorizeRoles("ADMIN"),
  adminController.listUsers,
);
router.get(
  "/jobs",
  authenticate,
  authorizeRoles("ADMIN"),
  adminController.listJobs,
);
router.get(
  "/disputes",
  authenticate,
  authorizeRoles("ADMIN"),
  adminController.listDisputes,
);
router.patch(
  "/users/:userId/suspend",
  authenticate,
  authorizeRoles("ADMIN"),
  adminController.suspendUser,
);
router.patch(
  "/users/:userId/reactivate",
  authenticate,
  authorizeRoles("ADMIN"),
  adminController.reactivateUser,
);
router.patch(
  "/disputes/:disputeId/resolve",
  authenticate,
  authorizeRoles("ADMIN"),
  adminController.resolveDispute,
);

export const adminRoutes = router;
