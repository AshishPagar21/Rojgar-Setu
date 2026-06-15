import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { notificationController } from "./notification.controller";

const router = Router();

router.get("/my", authenticate, notificationController.getMyNotifications);
router.get(
  "/unread-count",
  authenticate,
  notificationController.getUnreadCount,
);
router.patch(
  "/:notificationId/read",
  authenticate,
  notificationController.markAsRead,
);
router.patch("/read-all", authenticate, notificationController.markAllAsRead);

export const notificationRoutes = router;
