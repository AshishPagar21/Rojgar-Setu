import { apiClient } from "../../services/apiClient";

export const adminService = {
  async getDashboard() {
    const response = await apiClient.get("/admin/dashboard");
    return response.data.data;
  },

  async listUsers() {
    const response = await apiClient.get("/admin/users");
    return response.data.data;
  },

  async listJobs() {
    const response = await apiClient.get("/admin/jobs");
    return response.data.data;
  },

  async listDisputes() {
    const response = await apiClient.get("/admin/disputes");
    return response.data.data;
  },

  async suspendUser(userId: number) {
    const response = await apiClient.patch(`/admin/users/${userId}/suspend`);
    return response.data.data;
  },

  async reactivateUser(userId: number) {
    const response = await apiClient.patch(`/admin/users/${userId}/reactivate`);
    return response.data.data;
  },

  async resolveDispute(disputeId: number, status: "RESOLVED" | "REJECTED") {
    const response = await apiClient.patch(
      `/admin/disputes/${disputeId}/resolve`,
      { status },
    );
    return response.data.data;
  },
};
