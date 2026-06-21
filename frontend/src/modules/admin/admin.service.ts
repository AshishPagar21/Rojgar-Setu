import { apiClient } from "../../services/apiClient";

// ─── Nested profile types ────────────────────────────────────────────────────

export interface AdminWorkerProfile {
  id: number;
  userId: number;
  name: string;
  user: {
    id: number;
    mobileNumber: string;
    role: string;
    isActive: boolean;
    status: string;
  };
}

export interface AdminEmployerProfile {
  id: number;
  userId: number;
  name: string;
  user: {
    id: number;
    mobileNumber: string;
    role: string;
    isActive: boolean;
    status: string;
  };
}

export interface AdminAttendanceRecord {
  id: number;
  jobId: number;
  workerId: number;
  checkInTime: string | null;
  checkOutTime: string | null;
  totalHours: number | null;
  status: string;
  /** Worker profile with nested user (for name + mobile) */
  worker: AdminWorkerProfile;
  /** Job with nested employer profile (for employer name + mobile) */
  job: {
    id: number;
    title: string;
    wage: number;
    category: string;
    employer: AdminEmployerProfile;
  };
}

/**
 * Full dispute item returned by GET /admin/disputes.
 * Includes two-layer deep attendance relations as specified.
 */
export interface DisputeItem {
  id: number;
  jobId: number;
  attendanceId: number | null;
  workerId: number | null;
  employerId: number | null;
  raisedById: number;
  raisedByType: "EMPLOYER" | "WORKER";
  reason: string;
  initialDescription: string;
  counterDescription: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  /** Top-level job record (title, wage) */
  job: {
    id: number;
    title: string;
    wage: number;
    category: string;
  };
  /** Who filed the dispute */
  raisedBy: {
    id: number;
    mobileNumber: string;
    role: string;
  };
  /** Attendance with full worker + employer chains */
  attendance: AdminAttendanceRecord | null;
  worker: AdminWorkerProfile | null;
  employer: AdminEmployerProfile | null;
}

// ─── User management types ────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  mobileNumber: string;
  role: "ADMIN" | "EMPLOYER" | "WORKER";
  isActive: boolean;
  status: "ACTIVE" | "SUSPENDED" | "TEMP_BLOCKED";
  createdAt: string;
  employer: {
    id: number;
    name: string;
  } | null;
  worker: {
    id: number;
    name: string;
  } | null;
}

export const adminService = {
  async getDashboard() {
    const response = await apiClient.get("/admin/dashboard");
    return response.data.data;
  },

  async listUsers(): Promise<AdminUser[]> {
    const response = await apiClient.get("/admin/users");
    return response.data.data;
  },

  async listJobs() {
    const response = await apiClient.get("/admin/jobs");
    return response.data.data;
  },

  async listDisputes(): Promise<DisputeItem[]> {
    const response = await apiClient.get("/admin/disputes");
    return response.data.data;
  },

  async suspendUser(userId: number): Promise<AdminUser> {
    const response = await apiClient.patch(`/admin/users/${userId}/suspend`);
    return response.data.data;
  },

  async reactivateUser(userId: number): Promise<AdminUser> {
    const response = await apiClient.patch(`/admin/users/${userId}/reactivate`);
    return response.data.data;
  },

  async resolveDispute(
    disputeId: number,
    status: "RESOLVED" | "REJECTED",
  ): Promise<DisputeItem> {
    const response = await apiClient.patch(
      `/admin/disputes/${disputeId}/resolve`,
      { status },
    );
    return response.data.data;
  },
};
