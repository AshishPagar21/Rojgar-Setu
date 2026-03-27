"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const prisma_1 = require("../../config/prisma");
const constants_1 = require("../../utils/constants");
const jwt_1 = require("../../utils/jwt");
const otp_1 = require("../../utils/otp");
const response_1 = require("../../utils/response");
const sendOtp = async (payload) => {
    const { mobileNumber } = payload;
    const otpData = (0, otp_1.generateOtp)(mobileNumber);
    return {
        mobileNumber,
        expiresInSeconds: otpData.expiresInSeconds,
        otp: process.env.NODE_ENV === "production" ? undefined : otpData.otp,
    };
};
const verifyOtpAndLogin = async (payload) => {
    const { mobileNumber, otp, role, name, age, gender } = payload;
    const isOtpValid = (0, otp_1.verifyOtpWithMode)(mobileNumber, otp, false);
    if (!isOtpValid) {
        throw new response_1.ApiError(constants_1.HTTP_STATUS.UNAUTHORIZED, "Invalid or expired OTP");
    }
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { mobileNumber },
        include: {
            employer: true,
            worker: true,
        },
    });
    if (existingUser) {
        const token = (0, jwt_1.generateToken)({
            userId: existingUser.id,
            role: existingUser.role,
            mobileNumber: existingUser.mobileNumber,
        });
        (0, otp_1.consumeOtp)(mobileNumber);
        return {
            token,
            user: existingUser,
            employer: existingUser.employer,
            worker: existingUser.worker,
        };
    }
    if (!role) {
        throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Role is required for new user registration");
    }
    if (role === "EMPLOYER" && !name) {
        throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Name is required for employer registration");
    }
    if (role === "WORKER" && (!name || typeof age !== "number" || !gender)) {
        throw new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Name, age, and gender are required for worker registration");
    }
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                mobileNumber,
                role,
            },
        });
        let employer = null;
        let worker = null;
        if (role === "EMPLOYER") {
            employer = await tx.employer.create({
                data: {
                    userId: user.id,
                    name: name,
                },
            });
        }
        if (role === "WORKER") {
            worker = await tx.worker.create({
                data: {
                    userId: user.id,
                    name: name,
                    age: age,
                    gender: gender,
                },
            });
        }
        return {
            user,
            employer,
            worker,
        };
    });
    const token = (0, jwt_1.generateToken)({
        userId: result.user.id,
        role: result.user.role,
        mobileNumber: result.user.mobileNumber,
    });
    (0, otp_1.consumeOtp)(mobileNumber);
    return {
        token,
        user: result.user,
        employer: result.employer,
        worker: result.worker,
    };
};
exports.authService = {
    sendOtp,
    verifyOtpAndLogin,
};
//# sourceMappingURL=auth.service.js.map