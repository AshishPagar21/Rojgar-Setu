export interface CreateRatingPayload {
  jobId: number;
  toUserId: number;
  ratingValue: number;
  reviewText?: string;
}
