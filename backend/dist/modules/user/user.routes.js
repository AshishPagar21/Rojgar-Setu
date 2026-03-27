"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const router = (0, express_1.Router)();
router.get("/", (_req, res) => {
    (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "User module ready", []);
});
exports.userRoutes = router;
//# sourceMappingURL=user.routes.js.map