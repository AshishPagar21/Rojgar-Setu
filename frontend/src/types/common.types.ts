export type UserRole = "ADMIN" | "EMPLOYER" | "WORKER";
export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface User {
  id: number;
  mobileNumber: string;
  role: UserRole;
  isMobileVerified: boolean;
  isActive: boolean;
  status?: string;
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
  reliabilityScore: number;
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

export type DisputeStatus = "OPEN" | "COUNTERED" | "ESCALATED" | "RESOLVED" | "REJECTED";

export interface Dispute {
  id: number;
  jobId: number;
  attendanceId: number;
  workerId: number | null;
  employerId: number | null;
  raisedById: number;
  raisedByType: "EMPLOYER" | "WORKER";
  reason: string;
  initialDescription: string;
  counterDescription: string | null;
  status: DisputeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: number;
  jobId: number;
  workerId: number;
  checkInTime: string | null;
  checkOutTime: string | null;
  totalHours: number | null;
  notes: string | null;
  status: string;
  disputes?: Dispute[];
}
