import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";
import { notificationService } from "./notification.service";

export const notificationController = {
  async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ success: false, message: "Unauthorized" });
        return;
      }

      const notifications =
        await notificationService.getMyNotifications(userId);
      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "Notifications retrieved successfully",
        notifications,
      );
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ success: false, message: "Unauthorized" });
        return;
      }

      const unreadCount = await notificationService.getUnreadCount(userId);
      sendSuccess(res, HTTP_STATUS.OK, "Unread count retrieved successfully", {
        unreadCount,
      });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ success: false, message: "Unauthorized" });
        return;
      }

      const notificationId = parseInt(String(req.params.notificationId), 10);
      await notificationService.markAsRead(notificationId, userId);
      sendSuccess(res, HTTP_STATUS.OK, "Notification marked as read", null);
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ success: false, message: "Unauthorized" });
        return;
      }

      await notificationService.markAllAsRead(userId);
      sendSuccess(
        res,
        HTTP_STATUS.OK,
        "All notifications marked as read",
        null,
      );
    } catch (error) {
      next(error);
    }
  },
};
