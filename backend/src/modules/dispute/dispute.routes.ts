import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { disputeController } from "./dispute.controller";
import {
  createDisputeSchema,
  resolveDisputeSchema,
} from "./dispute.validation";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createDisputeSchema),
  disputeController.createDispute,
);
router.get("/my", authenticate, disputeController.getMyDisputes);
router.get(
  "/all",
  authenticate,
  authorizeRoles("ADMIN"),
  disputeController.getAllDisputes,
);
router.patch(
  "/:disputeId/resolve",
  authenticate,
  authorizeRoles("ADMIN"),
  validate(resolveDisputeSchema),
  disputeController.resolveDispute,
);

export const disputeRoutes = router;
