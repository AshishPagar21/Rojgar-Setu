"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const rating_controller_1 = require("./rating.controller");
const rating_validation_1 = require("./rating.validation");
const router = (0, express_1.Router)();
// Protected routes - both employer and worker can create and view ratings
router.post("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("EMPLOYER", "WORKER"), (0, validate_middleware_1.validate)(rating_validation_1.createRatingSchema), rating_controller_1.ratingController.createRating);
router.get("/my-received", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("EMPLOYER", "WORKER"), rating_controller_1.ratingController.getReceivedRatings);
router.get("/job/:jobId", (0, validate_middleware_1.validate)(rating_validation_1.getJobRatingsSchema), rating_controller_1.ratingController.getJobRatings);
exports.ratingRoutes = router;
//# sourceMappingURL=rating.routes.js.map