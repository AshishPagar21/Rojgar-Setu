"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingRoutes = void 0;
const express_1 = require("express");
const rating_controller_1 = require("./rating.controller");
const router = (0, express_1.Router)();
router.get("/", rating_controller_1.ratingController.getStatus);
exports.ratingRoutes = router;
//# sourceMappingURL=rating.routes.js.map