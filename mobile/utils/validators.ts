import { z } from "zod";

export const mobileSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10 digit mobile number");

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter a valid 6 digit OTP");

export const ageSchema = z.coerce
  .number()
  .int()
  .min(18, "Age must be 18+")
  .max(100, "Age must be 100 or less");

export const nameSchema = z.string().trim().min(2, "Please enter your name");

export const areaSchema = z.string().trim().min(2, "Please enter your area");

export const isValidMobile = (value: string): boolean =>
  mobileSchema.safeParse(value).success;

export const formatMobile = (value: string): string =>
  value.replace(/\D/g, "").slice(0, 10);
