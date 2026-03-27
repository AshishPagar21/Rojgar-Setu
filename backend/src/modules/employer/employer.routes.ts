import { Router } from "express";

import { employerController } from "./employer.controller";

const router = Router();

router.get("/", employerController.getStatus);

export const employerRoutes = router;
