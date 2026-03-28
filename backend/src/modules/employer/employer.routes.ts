import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";
import { employerController } from "./employer.controller";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorizeRoles("EMPLOYER"),
  employerController.getDashboard,
);

export const employerRoutes = router;
