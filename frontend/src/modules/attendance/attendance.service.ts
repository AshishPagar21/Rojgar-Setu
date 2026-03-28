import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("rojgar_setu_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
};
