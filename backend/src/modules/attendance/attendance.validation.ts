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

export const markAttendanceSchema = z.object({
  params: z.object({
    jobId: z.string().transform((v) => parseInt(v, 10)),
    workerId: z.string().transform((v) => parseInt(v, 10)),
  }),
  body: z.object({
    status: z.enum(["PRESENT", "ABSENT", "LEFT_EARLY", "COMPLETED"]),
    notes: z.string().trim().optional(),
  }),
  query: z.object({}),
});
