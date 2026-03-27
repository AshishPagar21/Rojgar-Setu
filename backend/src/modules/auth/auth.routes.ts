import { Router } from "express";

import { validate } from "../../middlewares/validate.middleware";
import { authController } from "./auth.controller";
import { sendOtpSchema, verifyOtpSchema } from "./auth.validation";

const router = Router();

router.post("/send-otp", validate(sendOtpSchema), authController.sendOtp);
router.post("/verify-otp", validate(verifyOtpSchema), authController.verifyOtp);

export const authRoutes = router;
