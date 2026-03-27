"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employerRoutes = void 0;
const express_1 = require("express");
const employer_controller_1 = require("./employer.controller");
const router = (0, express_1.Router)();
router.get("/", employer_controller_1.employerController.getStatus);
exports.employerRoutes = router;
//# sourceMappingURL=employer.routes.js.map