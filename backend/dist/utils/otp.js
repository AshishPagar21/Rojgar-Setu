"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeOtp = exports.verifyOtpWithMode = exports.verifyOtp = exports.generateOtp = void 0;
const env_1 = require("../config/env");
const constants_1 = require("./constants");
const otpStore = new Map();
const createRandomOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
const generateOtp = (mobileNumber) => {
    const otp = env_1.env.NODE_ENV === "production" ? createRandomOtp() : "123456";
    console.log(otp);
    const expiresAt = Date.now() + constants_1.OTP_EXPIRY_MS;
    otpStore.set(mobileNumber, { otp, expiresAt });
    return {
        otp,
        expiresInSeconds: Math.floor(constants_1.OTP_EXPIRY_MS / 1000),
    };
};
exports.generateOtp = generateOtp;
const verifyOtp = (mobileNumber, otp) => {
    return (0, exports.verifyOtpWithMode)(mobileNumber, otp, true);
};
exports.verifyOtp = verifyOtp;
const verifyOtpWithMode = (mobileNumber, otp, consumeOnSuccess) => {
    const record = otpStore.get(mobileNumber);
    if (!record) {
        return false;
    }
    if (Date.now() > record.expiresAt) {
        otpStore.delete(mobileNumber);
        return false;
    }
    const isValid = record.otp === otp;
    if (isValid && consumeOnSuccess) {
        otpStore.delete(mobileNumber);
    }
    return isValid;
};
exports.verifyOtpWithMode = verifyOtpWithMode;
const consumeOtp = (mobileNumber) => {
    otpStore.delete(mobileNumber);
};
exports.consumeOtp = consumeOtp;
//# sourceMappingURL=otp.js.map