import { z } from "zod";

export const mobileSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10 digit mobile number");

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter a valid 6 digit OTP");
