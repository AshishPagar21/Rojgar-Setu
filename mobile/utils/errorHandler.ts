import axios from "axios";

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export const handleAuthError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Network error. Please check your connection.";
    }

    const status = error.response.status;
    const data = error.response.data as any;

    switch (status) {
      case 400:
        return data?.message || "Invalid input. Please check your data.";
      case 401:
        return data?.message || "Invalid or expired OTP.";
      case 403:
        return data?.message || "Access denied.";
      case 404:
        return data?.message || "User not found.";
      case 409:
        return data?.message || "Mobile number already registered.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return data?.message || "An error occurred. Please try again.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
};

export const handleNetworkError = (): string => {
  return "Network error. Please check your internet connection.";
};

export const getErrorMessage = (error: unknown): string =>
  handleAuthError(error);
