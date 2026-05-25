export interface EmployerDashboardRecentJob {
  id: number;
  title: string;
  category?: string | null;
  status: string;
  wage?: number | null;
  createdAt?: string;
}

export interface EmployerDashboardData {
  employer: {
    id?: number;
    name?: string | null;
  };
  totalJobsPosted: number;
  totalJobsCompleted: number;
  openJobsCount: number;
  assignedJobsCount: number;
  completedJobsCount: number;
  recentJobs: EmployerDashboardRecentJob[];
}
