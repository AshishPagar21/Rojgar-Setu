import { apiClient } from "../../services/apiClient";

export const paymentService = {
  /**
   * Get payments linked to a specific job ID
   */
  async getJobPayments(jobId: number) {
    const response = await apiClient.get(`/payments/job/${jobId}`);
    // 👇 Extract .data twice to completely unwrap the server's payload array
    return response.data.data; 
  },

  /**
   * Get all payments belonging to the logged-in user
   */
  async getMyPayments() {
    const response = await apiClient.get("/payments/my");
    return response.data.data;
  },

  /**
   * Employer marks a specific payment record as settled/paid
   */
  async markPaymentSuccess(paymentId: number, method: "CASH" | "ONLINE_UPI") {
    const response = await apiClient.patch(`/payments/${paymentId}/mark-paid`, {
      method,
    });
    return response.data.data;
  },

  /**
   * Worker confirms they have received the payment allocation
   */
  async confirmPaymentReceived(paymentId: number) {
    const response = await apiClient.patch(`/payments/${paymentId}/confirm`);
    return response.data.data;
  },
};