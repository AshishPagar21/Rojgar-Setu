import type { UserRole } from "../../types";

export const getDashboardPathByRole = (role: UserRole): string => {
  if (role === "EMPLOYER") return "Main";
  if (role === "WORKER") return "Main";
  return "Main";
};
