import type { Employer, User, UserRole, Worker } from "@prisma/client";

export interface JwtPayload {
  userId: number;
  role: UserRole;
  mobileNumber: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  userId: number;
  role: UserRole;
  mobileNumber: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: unknown;
}

export interface AuthResult {
  token: string;
  user: User;
  employer: Employer | null;
  worker: Worker | null;
}
