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
