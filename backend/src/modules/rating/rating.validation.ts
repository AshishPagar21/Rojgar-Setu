import { z } from "zod";

export const createRatingSchema = z.object({
  body: z.object({
    jobId: z.number().int().positive("Job ID must be a positive number"),
    toUserId: z.number().int().positive("User ID must be a positive number"),
    ratingValue: z
      .number()
      .int()
      .min(1)
      .max(5, "Rating must be between 1 and 5"),
    reviewText: z.string().optional(),
  }),
});

export const getJobRatingsSchema = z.object({
  params: z.object({
    jobId: z.string().transform((v) => parseInt(v, 10)),
  }),
});
