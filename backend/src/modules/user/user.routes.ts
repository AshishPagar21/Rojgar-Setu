import { Router } from "express";

import { HTTP_STATUS } from "../../utils/constants";
import { sendSuccess } from "../../utils/response";

const router = Router();

router.get("/", (_req, res) => {
  sendSuccess(res, HTTP_STATUS.OK, "User module ready", []);
});

export const userRoutes = router;
