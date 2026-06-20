import { apiClient } from "../../services/apiClient";

export const disputeService = {
  async createDispute(payload: {
    jobId: number;
    attendanceId?: number;
    reason: string;
    description: string;
  }) {
    const response = await apiClient.post("/disputes", payload);
    return response.data.data;
  },

  async getMyDisputes() {
    const response = await apiClient.get("/disputes/my");
    return response.data.data;
  },
};
