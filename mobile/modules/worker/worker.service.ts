import { apiClient } from "../../services/apiClient";

export const workerService = {
  async getDashboard() {
    const response = await apiClient.get("/workers/dashboard");
    return response.data.data;
  },
};
