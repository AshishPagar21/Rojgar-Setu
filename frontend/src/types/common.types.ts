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
