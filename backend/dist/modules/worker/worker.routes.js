"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const worker_controller_1 = require("./worker.controller");
const router = (0, express_1.Router)();
router.get("/dashboard", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("WORKER"), worker_controller_1.workerController.getDashboard);
exports.workerRoutes = router;
//# sourceMappingURL=worker.routes.js.map