import { Router } from "express";

import { workerController } from "./worker.controller";

const router = Router();

router.get("/", workerController.getStatus);

export const workerRoutes = router;
