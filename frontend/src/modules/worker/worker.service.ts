import type { WorkerDashboardStats } from "./worker.types";

export const workerService = {
  getDashboardStats: async (): Promise<WorkerDashboardStats> => {
    return {
      totalJobsCompleted: 0,
      totalEarnings: 0,
    };
  },
};
