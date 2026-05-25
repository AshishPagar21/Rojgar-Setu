import { apiClient } from "../../services/apiClient";

export const paymentService = {
  async createPaymentsForJob(jobId: number) {
    const response = await apiClient.post(`/payments/job/${jobId}/create`);
    return response.data.data;
  },

  async markPaymentSuccess(paymentId: number) {
    const response = await apiClient.patch(
      `/payments/${paymentId}/mark-success`,
    );
    return response.data.data;
  },

  async getJobPayments(jobId: number) {
    const response = await apiClient.get(`/payments/my-job/${jobId}`);
    return response.data.data;
  },

  async getMyPayments() {
    const response = await apiClient.get("/payments/my");
    return response.data.data;
  },
};
