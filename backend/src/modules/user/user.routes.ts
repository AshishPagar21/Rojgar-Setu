import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";
import { userService } from "./user.service";

const router = Router();

router.get("/", (_req, res) => {
  sendSuccess(res, HTTP_STATUS.OK, "User module ready", []);
});

router.get("/profile", authenticate, async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ success: false, message: "Unauthorized" });
      return;
    }

    const profileData = await userService.getUserProfile(userId);
    sendSuccess(res, HTTP_STATUS.OK, "Profile retrieved successfully", profileData);
  } catch (error) {
    next(error);
  }
});

export const userRoutes = router;
