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

export interface AdminDashboardData {
  totalJobs: number;
  activeWorkers: number;
  activeEmployers: number;
  completedJobs: number;
  pendingDisputes: number;
  paymentsPending: number;
  charts: {
    jobsPerDay: Array<{ date: string; count: number }>;
    registrations: Array<{ date: string; count: number }>;
    completionRate: number;
  };
}
