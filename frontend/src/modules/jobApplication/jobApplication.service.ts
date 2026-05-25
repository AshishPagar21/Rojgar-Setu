import { apiClient } from "../../services/apiClient";

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
