import { z } from "zod";

export const createRatingSchema = z.object({
  body: z.object({
    jobId: z.coerce.number().int().positive(),
    toUserId: z.coerce.number().int().positive(),
    ratingValue: z.coerce.number().int().min(1).max(5),
    reviewText: z.string().trim().max(1000).optional(),
  }),
});

export const getEligibleWorkersSchema = z.object({
  params: z.object({
    jobId: z.coerce.number().int().positive(),
  }),
});

export const getJobRatingsSchema = z.object({
  params: z.object({
    jobId: z.coerce.number().int().positive(),
  }),
});