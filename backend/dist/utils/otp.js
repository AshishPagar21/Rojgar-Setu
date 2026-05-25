"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeOtp = exports.getResendWaitTime = exports.canResendOtp = exports.verifyOtpWithMode = exports.verifyOtp = exports.generateOtp = void 0;
const twilio_1 = require("twilio");
const env_1 = require("../config/env");
const constants_1 = require("./constants");
// Initialize Twilio client
const twilioClient = new twilio_1.Twilio(env_1.env.TWILIO_ACCOUNT_SID, env_1.env.TWILIO_AUTH_TOKEN);
const otpStore = new Map();
const createRandomOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
/**
 * Send OTP via Twilio SMS
 */
const sendOtpSms = async (mobileNumber, otp) => {
    try {
        // In development, just log the OTP
        if (env_1.env.NODE_ENV === "development") {
            console.log(`\n📱 OTP for ${mobileNumber}: ${otp}`);
            return;
        }
        // In production, send via Twilio
        await twilioClient.messages.create({
            body: `Your Rojgar Setu OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`,
            from: env_1.env.TWILIO_PHONE_NUMBER,
            to: `+91${mobileNumber.slice(-10)}`, // Add country code for Indian numbers
        });
        console.log(`✅ OTP sent to ${mobileNumber}`);
    }
    catch (error) {
        console.error("❌ Failed to send OTP via SMS:", error);
        // In development, we continue even if SMS fails
        // In production, you might want to throw an error
        if (env_1.env.NODE_ENV === "production") {
            throw error;
        }
    }
};
/**
 * Generate and send OTP
 */
const generateOtp = async (mobileNumber) => {
    const otp = createRandomOtp();
    const expiresAt = Date.now() + constants_1.OTP_EXPIRY_MS;
    const now = Date.now();
    // Store OTP in memory
    otpStore.set(mobileNumber, {
        otp,
        expiresAt,
        attempts: 0,
        lastSentAt: now,
    });
    // Send OTP via SMS
    await sendOtpSms(mobileNumber, otp);
    return {
        otp: env_1.env.NODE_ENV === "production" ? undefined : otp, // Only return OTP in dev
        expiresInSeconds: Math.floor(constants_1.OTP_EXPIRY_MS / 1000),
    };
};
exports.generateOtp = generateOtp;
/**
 * Verify OTP with attempt tracking
 */
const verifyOtp = (mobileNumber, otp) => {
    return (0, exports.verifyOtpWithMode)(mobileNumber, otp, true);
};
exports.verifyOtp = verifyOtp;
/**
 * Verify OTP without consuming it (for resend validation)
 */
const verifyOtpWithMode = (mobileNumber, otp, consumeOnSuccess) => {
    const record = otpStore.get(mobileNumber);
    if (!record) {
        return false;
    }
    // Check expiry
    if (Date.now() > record.expiresAt) {
        otpStore.delete(mobileNumber);
        return false;
    }
    // Check attempts
    if (record.attempts >= constants_1.OTP_MAX_ATTEMPTS) {
        otpStore.delete(mobileNumber);
        return false;
    }
    const isValid = record.otp === otp;
    // Increment attempts on wrong OTP
    if (!isValid) {
        record.attempts += 1;
        return false;
    }
    // Consume OTP on success
    if (isValid && consumeOnSuccess) {
        otpStore.delete(mobileNumber);
    }
    return isValid;
};
exports.verifyOtpWithMode = verifyOtpWithMode;
/**
 * Check if OTP can be resent (rate limiting)
 */
const canResendOtp = (mobileNumber) => {
    const record = otpStore.get(mobileNumber);
    if (!record) {
        return true; // First time, can always send
    }
    const timeSinceLastSent = Date.now() - record.lastSentAt;
    return timeSinceLastSent >= constants_1.OTP_RESEND_DELAY_MS;
};
exports.canResendOtp = canResendOtp;
/**
 * Get time remaining before resend is allowed (in milliseconds)
 */
const getResendWaitTime = (mobileNumber) => {
    const record = otpStore.get(mobileNumber);
    if (!record) {
        return 0;
    }
    const timeSinceLastSent = Date.now() - record.lastSentAt;
    const waitTime = constants_1.OTP_RESEND_DELAY_MS - timeSinceLastSent;
    return Math.max(0, waitTime);
};
exports.getResendWaitTime = getResendWaitTime;
/**
 * Consume OTP
 */
const consumeOtp = (mobileNumber) => {
    otpStore.delete(mobileNumber);
};
exports.consumeOtp = consumeOtp;
//# sourceMappingURL=otp.js.map