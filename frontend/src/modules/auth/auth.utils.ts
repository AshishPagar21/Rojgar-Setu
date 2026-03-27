import type { UserRole } from "../../types/common.types";

export const getDashboardPathByRole = (role: UserRole): string => {
  if (role === "EMPLOYER") return "/dashboard/employer";
  if (role === "WORKER") return "/dashboard/worker";
  return "/dashboard/admin";
};
