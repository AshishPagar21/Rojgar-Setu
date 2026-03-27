import { env } from "../config/env";
import { OTP_EXPIRY_MS } from "./constants";

interface OtpRecord {
  otp: string;
  expiresAt: number;
}

const otpStore = new Map<string, OtpRecord>();

const createRandomOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateOtp = (
  mobileNumber: string,
): { otp: string; expiresInSeconds: number } => {
  const otp = env.NODE_ENV === "production" ? createRandomOtp() : "123456";
  console.log(otp)
  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  otpStore.set(mobileNumber, { otp, expiresAt });

  return {
    otp,
    expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
  };
};

export const verifyOtp = (mobileNumber: string, otp: string): boolean => {
  return verifyOtpWithMode(mobileNumber, otp, true);
};

export const verifyOtpWithMode = (
  mobileNumber: string,
  otp: string,
  consumeOnSuccess: boolean,
): boolean => {
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

export const consumeOtp = (mobileNumber: string): void => {
  otpStore.delete(mobileNumber);
};
