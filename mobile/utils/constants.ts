export const STORAGE_KEYS = {
  token: "authToken",
  refreshToken: "refreshToken",
  user: "authUser",
  profile: "authProfile",
} as const;

export const OTP_EXPIRY_SECONDS = 600;
export const OTP_RESEND_DELAY_SECONDS = 30;
