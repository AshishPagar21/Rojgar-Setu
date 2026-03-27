import { Router } from "express";

import { jobController } from "./job.controller";

const router = Router();

router.get("/", jobController.getStatus);

export const jobRoutes = router;
