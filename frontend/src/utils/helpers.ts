import { AxiosError } from "axios";
import toast from "react-hot-toast";

export const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");

};


export const getErrorMessage = (error: unknown): string => {
   const axiosError = error as AxiosError<{ message: string }>;

    if (axiosError.response?.status === 409) {
      toast.error(
        axiosError.response.data?.message ||
          "You have already rated this worker."
      );
      return "";
    }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};
