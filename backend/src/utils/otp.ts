import { Twilio } from "twilio";
import { env } from "../config/env";
import {
  OTP_EXPIRY_MS,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_DELAY_MS,
} from "./constants";

// Initialize Twilio client
const twilioClient = new Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

interface OtpRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

const otpStore = new Map<string, OtpRecord>();

const createRandomOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via Twilio SMS
 */
const sendOtpSms = async (mobileNumber: string, otp: string): Promise<void> => {
  try {
    // In development, just log the OTP
    if (env.NODE_ENV === "development") {
      console.log(`\n📱 OTP for ${mobileNumber}: ${otp}`);
      return;
    }

    // In production, send via Twilio
    await twilioClient.messages.create({
      body: `Your Rojgar Setu OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`,
      from: env.TWILIO_PHONE_NUMBER,
      to: `+91${mobileNumber.slice(-10)}`, // Add country code for Indian numbers
    });

    console.log(`✅ OTP sent to ${mobileNumber}`);
  } catch (error) {
    console.error("❌ Failed to send OTP via SMS:", error);
    // In development, we continue even if SMS fails
    // In production, you might want to throw an error
    if (env.NODE_ENV === "production") {
      throw error;
    }
  }
};

/**
 * Generate and send OTP
 */
export const generateOtp = async (
  mobileNumber: string,
): Promise<{ otp?: string; expiresInSeconds: number }> => {
  const otp = createRandomOtp();
  const expiresAt = Date.now() + OTP_EXPIRY_MS;
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
    otp: env.NODE_ENV === "production" ? undefined : otp, // Only return OTP in dev
    expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
  };
};

/**
 * Verify OTP with attempt tracking
 */
export const verifyOtp = (mobileNumber: string, otp: string): boolean => {
  return verifyOtpWithMode(mobileNumber, otp, true);
};

/**
 * Verify OTP without consuming it (for resend validation)
 */
export const verifyOtpWithMode = (
  mobileNumber: string,
  otp: string,
  consumeOnSuccess: boolean,
): boolean => {
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
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
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

/**
 * Check if OTP can be resent (rate limiting)
 */
export const canResendOtp = (mobileNumber: string): boolean => {
  const record = otpStore.get(mobileNumber);

  if (!record) {
    return true; // First time, can always send
  }

  const timeSinceLastSent = Date.now() - record.lastSentAt;
  return timeSinceLastSent >= OTP_RESEND_DELAY_MS;
};

/**
 * Get time remaining before resend is allowed (in milliseconds)
 */
export const getResendWaitTime = (mobileNumber: string): number => {
  const record = otpStore.get(mobileNumber);

  if (!record) {
    return 0;
  }

  const timeSinceLastSent = Date.now() - record.lastSentAt;
  const waitTime = OTP_RESEND_DELAY_MS - timeSinceLastSent;

  return Math.max(0, waitTime);
};

/**
 * Consume OTP
 */
export const consumeOtp = (mobileNumber: string): void => {
  otpStore.delete(mobileNumber);
};
