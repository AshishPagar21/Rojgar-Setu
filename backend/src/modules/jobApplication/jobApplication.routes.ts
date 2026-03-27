import { Router } from "express";

import { jobApplicationController } from "./jobApplication.controller";

const router = Router();

router.get("/", jobApplicationController.getStatus);

export const jobApplicationRoutes = router;
