import { apiClient } from "../../services/apiClient";

export const attendanceService = {
  async checkIn(jobId: number) {
    const response = await apiClient.post(`/attendance/${jobId}/check-in`);
    return response.data.data;
  },

  async checkOut(jobId: number) {
    const response = await apiClient.post(`/attendance/${jobId}/check-out`);
    return response.data.data;
  },

  async getMyAttendance() {
    const response = await apiClient.get("/attendance/my");
    return response.data.data;
  },

  async getJobAttendance(jobId: number) {
    const response = await apiClient.get(`/attendance/job/${jobId}`);
    return response.data.data;
  },

  async markAttendance(
    jobId: number,
    workerId: number,
    payload: {
      status: "PRESENT" | "ABSENT" | "LEFT_EARLY" | "COMPLETED";
      notes?: string;
    },
  ) {
    const response = await apiClient.patch(
      `/attendance/job/${jobId}/worker/${workerId}`,
      payload,
    );
    return response.data.data;
  },
};
