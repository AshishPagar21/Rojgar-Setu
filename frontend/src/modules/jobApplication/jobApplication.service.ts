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

export const jobApplicationService = {
  async applyToJob(jobId: number) {
    const response = await apiClient.post(`/job-applications/${jobId}/apply`);
    return response.data.data;
  },

  async getMyApplications() {
    const response = await apiClient.get("/job-applications/my");
    return response.data.data;
  },

  async getMyAssignedJobs() {
    const response = await apiClient.get("/job-applications/my-assigned");
    return response.data.data;
  },

  async getJobApplicants(jobId: number) {
    const response = await apiClient.get(`/job-applications/job/${jobId}`);
    return response.data.data;
  },

  async selectWorkers(jobId: number, workerIds: number[]) {
    const response = await apiClient.patch(
      `/job-applications/job/${jobId}/select`,
      {
        workerIds,
      },
    );
    return response.data.data;
  },
};
