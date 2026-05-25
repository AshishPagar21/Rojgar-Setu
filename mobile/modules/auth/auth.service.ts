import type { AuthProfile, User } from "../../types";
import { resendOtp, sendOtp, verifyOtp } from "./api";
import type { SendOtpPayload, VerifyOtpPayload } from "./auth.types";

export const authService = {
  sendOtp: (payload: SendOtpPayload) => sendOtp(payload),
  resendOtp: (payload: SendOtpPayload) => resendOtp(payload),
  verifyOtp: async (payload: VerifyOtpPayload) => {
    const response = await verifyOtp(payload);
    const data = response.data;

    return {
      token: data.token,
      user: data.user as User,
      profile: {
        employer: data.employer,
        worker: data.worker,
      } as AuthProfile,
      message: response.message,
    };
  },
};
