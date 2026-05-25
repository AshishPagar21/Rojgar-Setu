import { apiClient } from "../../services/apiClient";

export const employerService = {
  async getDashboard() {
    const response = await apiClient.get("/employers/dashboard");
    return response.data.data;
  },
};
