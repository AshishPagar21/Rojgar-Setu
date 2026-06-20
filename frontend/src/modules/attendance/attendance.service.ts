import { apiClient } from "../../services/apiClient";

export const attendanceService = {
  async checkIn(
    jobId: number,
    payload: { latitude: number; longitude: number },
  ) {
    const response = await apiClient.post(
      `/attendance/${jobId}/check-in`,
      payload,
    );
    return response.data.data;
  },

  async checkOut(
    jobId: number,
    payload: { latitude: number; longitude: number },
  ) {
    const response = await apiClient.post(
      `/attendance/${jobId}/check-out`,
      payload,
    );
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

  async approveAttendance(attendanceId: number) {
    const response = await apiClient.patch(
      `/attendance/${attendanceId}/approve`,
      {},
    );
    return response.data.data;
  },

  async reportIssue(attendanceId: number, payload: { reason: string }) {
    const response = await apiClient.patch(
      `/attendance/${attendanceId}/report-issue`,
      payload,
    );
    return response.data.data;
  },
};
