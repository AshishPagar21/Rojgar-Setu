import { z } from "zod";

export const createDisputeSchema = z.object({
  body: z.object({
    jobId: z.number().int().positive(),
    attendanceId: z.number().int().positive().optional(),
    reason: z.string().trim().min(3),
    description: z.string().trim().min(10),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const resolveDisputeSchema = z.object({
  body: z.object({
    status: z.enum(["RESOLVED", "REJECTED"]),
  }),
  params: z.object({
    disputeId: z.string().transform((value) => parseInt(value, 10)),
  }),
  query: z.object({}),
});
