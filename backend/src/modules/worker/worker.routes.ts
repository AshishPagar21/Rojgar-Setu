import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";
import { workerController } from "./worker.controller";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorizeRoles("WORKER"),
  workerController.getDashboard,
);

export const workerRoutes = router;
