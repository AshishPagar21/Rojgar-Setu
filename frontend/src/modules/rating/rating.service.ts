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
