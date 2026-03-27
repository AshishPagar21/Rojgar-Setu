import type { Gender, UserRole } from "@prisma/client";

export interface SendOtpRequestBody {
  mobileNumber: string;
}

export interface VerifyOtpRequestBody {
  mobileNumber: string;
  otp: string;
  role?: Exclude<UserRole, "ADMIN">;
  name?: string;
  age?: number;
  gender?: Gender;
}
