export type UserRole = "ADMIN" | "EMPLOYER" | "WORKER";
export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface User {
  id: number;
  mobileNumber: string;
  role: UserRole;
  isMobileVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Employer {
  id: number;
  userId: number;
  name: string;
  rating: number;
  totalRatings: number;
  totalJobsPosted: number;
  totalJobsCompleted: number;
}

export interface Worker {
  id: number;
  userId: number;
  name: string;
  age: number;
  gender: Gender;
  rating: number;
  totalRatings: number;
  totalJobsCompleted: number;
}

export interface AuthProfile {
  employer: Employer | null;
  worker: Worker | null;
}

export interface AuthUser {
  token: string;
  user: User;
  profile: AuthProfile;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface SendOtpPayload {
  mobileNumber: string;
}

export interface SendOtpResponseData {
  mobileNumber: string;
  expiresInSeconds: number;
  otp?: string;
}

export interface VerifyOtpPayload {
  mobileNumber: string;
  otp: string;
  role?: Exclude<UserRole, "ADMIN">;
  name?: string;
  age?: number;
  gender?: Gender;
  area?: string;
  workType?: string;
}

export interface VerifyOtpResponseData {
  token: string;
  user: User;
  employer: AuthProfile["employer"];
  worker: AuthProfile["worker"];
}

// Job types
export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary?: {
    min: number;
    max: number;
  };
  jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "TEMPORARY";
  status: "OPEN" | "CLOSED" | "FILLED";
  employerId: string;
  createdAt: string;
  updatedAt: string;
}

// Application types
export interface JobApplication {
  id: string;
  jobId: string;
  workerId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  createdAt: string;
  updatedAt: string;
}

// Dashboard types
export interface WorkerDashboard {
  totalApplications: number;
  selectedJobsCount: number;
  paymentReceivedCount: number;
  recentAssignedJobs: Job[];
}

export interface EmployerDashboard {
  totalJobsPosted: number;
  openJobsCount: number;
  assignedJobsCount: number;
  completedJobsCount: number;
}

// API Error type
export interface APIError {
  message: string;
  code?: string;
  status?: number;
}
