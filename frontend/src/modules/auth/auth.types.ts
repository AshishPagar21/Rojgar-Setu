import type {
  ApiEnvelope,
  AuthProfile,
  Gender,
  User,
  UserRole,
} from "../../types/common.types";

export interface SendOtpPayload {
  mobileNumber: string;
}

export interface SendOtpResponseData {
  mobileNumber: string;
  expiresInSeconds: number;
  otp?: string;
}

export interface VerifyOtpPayload {
  mobileNumber: string;
  otp: string;
  role?: Exclude<UserRole, "ADMIN">;
  name?: string;
  age?: number;
  gender?: Gender;
}

export interface VerifyOtpResponseData {
  token: string;
  user: User;
  employer: AuthProfile["employer"];
  worker: AuthProfile["worker"];
}

export type SendOtpApiResponse = ApiEnvelope<SendOtpResponseData>;
export type VerifyOtpApiResponse = ApiEnvelope<VerifyOtpResponseData>;
