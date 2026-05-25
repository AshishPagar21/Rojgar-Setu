import { apiClient } from "../../services/apiClient";

export interface CreateRatingPayload {
  jobId: number;
  toUserId: number;
  ratingValue: number;
  reviewText?: string;
}

export const ratingService = {
  async createRating(payload: CreateRatingPayload) {
    const response = await apiClient.post("/ratings", payload);
    return response.data.data;
  },

  async getReceivedRatings() {
    const response = await apiClient.get("/ratings/my-received");
    return response.data.data;
  },

  async getJobRatings(jobId: number) {
    const response = await apiClient.get(`/ratings/job/${jobId}`);
    return response.data.data;
  },
};
