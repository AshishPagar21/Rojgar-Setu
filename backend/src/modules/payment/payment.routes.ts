import { Router } from "express";

import { paymentController } from "./payment.controller";

const router = Router();

router.get("/", paymentController.getStatus);

export const paymentRoutes = router;
