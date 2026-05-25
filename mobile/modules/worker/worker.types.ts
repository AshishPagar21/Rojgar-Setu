export interface WorkerDashboardRecentApplication {
  id: number;
  status: string;
  appliedAt?: string;
  job: {
    id: number;
    title: string;
    status: string;
    jobDate?: string | null;
    category?: string | null;
    wage?: number | null;
  };
}

export interface WorkerDashboardRecentAssignedJob {
  id: number;
  status: string;
  updatedAt?: string;
  job: {
    id: number;
    title: string;
    jobDate?: string | null;
    employer: {
      name?: string | null;
    };
  };
}

export interface WorkerDashboardData {
  worker: {
    id?: number;
    name?: string | null;
  };
  totalJobsCompleted: number;
  totalApplications: number;
  selectedJobsCount: number;
  paymentReceivedCount: number;
  recentApplications: WorkerDashboardRecentApplication[];
  recentAssignedJobs: WorkerDashboardRecentAssignedJob[];
}
