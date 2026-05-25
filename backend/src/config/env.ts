import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(5000),
  API_PREFIX: z.string().default("/api"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default("7d"),
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_PHONE_NUMBER: z.string().min(1),
  OTP_EXPIRY_MS: z.coerce.number().default(600000),
  OTP_RESEND_DELAY_MS: z.coerce.number().default(30000),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(3),
});

export const env = envSchema.parse(process.env);
