import { apiClient } from "../../services/apiClient";

export interface CreateRatingPayload {
  jobId: number;
  toUserId: number;
  ratingValue: number;
  reviewText?: string;
}

export interface ReceivedRating {
  id: number;
  jobId: number;
  ratingValue: number;
  reviewText?: string | null;
  createdAt: string;
  job: {
    id: number;
    title: string;
    category: string;
    jobDate: string;
    city?: string | null;
    landmark?: string | null;
    wage: number;
    status: string;
  };
  fromUser: {
    role: string;
    employer?: {
      name: string;
    } | null;
  };
}

export interface EmployerReceivedRating {
  id: number;
  jobId: number;
  ratingValue: number;
  reviewText?: string | null;
  createdAt: string;
  job: {
    id: number;
    title: string;
    category: string;
    jobDate: string;
    city?: string | null;
    landmark?: string | null;
    wage: number;
    status: string;
  };
  fromUser: {
    role: string;
    worker?: {
      name: string;
    } | null;
  };
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
  async getEligibleWorkersForRating(jobId: number) {
    const response = await apiClient.get(
      `/ratings/jobs/${jobId}/eligible-workers`,
    );

    return response.data.data;
  },
};
