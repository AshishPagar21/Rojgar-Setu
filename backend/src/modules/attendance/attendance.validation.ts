import { z } from "zod";

export const checkInSchema = z.object({
  params: z.object({
    jobId: z.string().transform((v) => parseInt(v, 10)),
  }),
});

export const checkOutSchema = z.object({
  params: z.object({
    jobId: z.string().transform((v) => parseInt(v, 10)),
  }),
});

export const getJobAttendanceSchema = z.object({
  params: z.object({
    jobId: z.string().transform((v) => parseInt(v, 10)),
  }),
});
