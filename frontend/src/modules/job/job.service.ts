import { apiClient } from "../../services/apiClient";

export interface CreateJobPayload {
  title: string;
  description: string;
  category: string;
  wage: number;
  jobDate: string;
  requiredWorkers: number;
  locationLine1: string;
  city: string;
  landmark: string;
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

  async getOpenJobs(filters?: {
    category?: string;
    date?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }) {
    const response = await apiClient.get("/jobs/open", { params: filters });
    return response.data.data;
  },

  async getNearbyJobs(filters: {
    latitude: number;
    longitude: number;
    radius?: number;
  }) {
    const response = await apiClient.get("/jobs/nearby", { params: filters });
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
