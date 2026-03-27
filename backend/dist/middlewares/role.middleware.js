"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
const constants_1 = require("../utils/constants");
const response_1 = require("../utils/response");
const authorizeRoles = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
        }
        if (!roles.includes(req.user.role)) {
            throw new response_1.ApiError(constants_1.HTTP_STATUS.FORBIDDEN, "Forbidden: insufficient role");
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
//# sourceMappingURL=role.middleware.js.map