"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const user_service_1 = require("./user.service");
const router = (0, express_1.Router)();
router.get("/", (_req, res) => {
    (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "User module ready", []);
});
router.get("/profile", auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res
                .status(constants_1.HTTP_STATUS.UNAUTHORIZED)
                .json({ success: false, message: "Unauthorized" });
            return;
        }
        const profileData = await user_service_1.userService.getUserProfile(userId);
        (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Profile retrieved successfully", profileData);
    }
    catch (error) {
        next(error);
    }
});
exports.userRoutes = router;
//# sourceMappingURL=user.routes.js.map