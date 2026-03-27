import type { EmployerDashboardStats } from "./employer.types";

export const employerService = {
  getDashboardStats: async (): Promise<EmployerDashboardStats> => {
    return {
      totalJobsPosted: 0,
      totalWorkersHired: 0,
    };
  },
};
