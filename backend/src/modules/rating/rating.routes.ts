import { Router } from "express";

import { ratingController } from "./rating.controller";

const router = Router();

router.get("/", ratingController.getStatus);

export const ratingRoutes = router;
