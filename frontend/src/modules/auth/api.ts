import { apiClient } from "../../services/apiClient";

import type {
  SendOtpApiResponse,
  SendOtpPayload,
  VerifyOtpApiResponse,
  VerifyOtpPayload,
} from "./auth.types";

export const sendOtp = async (
  payload: SendOtpPayload,
): Promise<SendOtpApiResponse> => {
  const response = await apiClient.post<SendOtpApiResponse>(
    "/auth/send-otp",
    payload,
  );
  return response.data;
};

export const verifyOtp = async (
  payload: VerifyOtpPayload,
): Promise<VerifyOtpApiResponse> => {
  const response = await apiClient.post<VerifyOtpApiResponse>(
    "/auth/verify-otp",
    payload,
  );
  return response.data;
};
