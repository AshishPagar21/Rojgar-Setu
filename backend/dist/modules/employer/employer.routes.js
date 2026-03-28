"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employerRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const employer_controller_1 = require("./employer.controller");
const router = (0, express_1.Router)();
router.get("/dashboard", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("EMPLOYER"), employer_controller_1.employerController.getDashboard);
exports.employerRoutes = router;
//# sourceMappingURL=employer.routes.js.map