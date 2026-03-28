import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("rojgar_setu_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface CreateJobPayload {
  title: string;
  description: string;
  category: string;
  wage: number;
  jobDate: string;
  requiredWorkers: number;
  latitude: number;
  longitude: number;
}

export const jobService = {
  async createJob(payload: CreateJobPayload) {
    const response = await apiClient.post("/jobs", payload);
    return response.data.data;
  },

  async getMyJobs() {
    const response = await apiClient.get("/jobs/my");
    return response.data.data;
  },

  async getOpenJobs(filters?: { category?: string; date?: string }) {
    const response = await apiClient.get("/jobs/open", { params: filters });
    return response.data.data;
  },

  async getJobById(jobId: number) {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response.data.data;
  },

  async cancelJob(jobId: number) {
    const response = await apiClient.patch(`/jobs/${jobId}/cancel`);
    return response.data.data;
  },

  async completeJob(jobId: number) {
    const response = await apiClient.patch(`/jobs/${jobId}/complete`);
    return response.data.data;
  },
};
