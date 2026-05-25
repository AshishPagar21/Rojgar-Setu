import axios from "axios";

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Network error. Please check your connection.";
    }

    const status = error.response.status;
    const message = (error.response.data as { message?: string } | undefined)
      ?.message;

    switch (status) {
      case 400:
        return message || "Invalid input. Please check your data.";
      case 401:
        return message || "Invalid or expired OTP.";
      case 403:
        return message || "Access denied.";
      case 404:
        return message || "User not found.";
      case 409:
        return message || "Mobile number already registered.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return message || "An error occurred. Please try again.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
};

export const getDashboardPathByRole = (role: string): string => {
  if (role === "EMPLOYER") return "Dashboard";
  if (role === "WORKER") return "Dashboard";
  return "Dashboard";
};
