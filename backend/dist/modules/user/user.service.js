"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const prisma_1 = require("../../config/prisma");
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const getUserProfile = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        include: {
            employer: true,
            worker: true,
        },
    });
    if (!user) {
        throw new response_1.ApiError(constants_1.HTTP_STATUS.NOT_FOUND, "User not found");
    }
    return {
        user,
        employer: user.employer,
        worker: user.worker,
    };
};
const listUsers = async () => {
    return [];
};
exports.userService = {
    listUsers,
    getUserProfile,
};
//# sourceMappingURL=user.service.js.map