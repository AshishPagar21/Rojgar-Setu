import { Router } from "express";

import { attendanceController } from "./attendance.controller";

const router = Router();

router.get("/", attendanceController.getStatus);

export const attendanceRoutes = router;
