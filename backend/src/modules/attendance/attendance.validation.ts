import { z } from "zod";

export const checkInSchema = z.object({
  params: z.object({
    jobId: z.string().transform((v) => parseInt(v, 10)),
  }),
  body: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  query: z.object({}),
});

export const checkOutSchema = z.object({
  params: z.object({
    jobId: z.string().transform((v) => parseInt(v, 10)),
  }),
  body: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  query: z.object({}),
});

export const getJobAttendanceSchema = z.object({
  params: z.object({
    jobId: z.string().transform((v) => parseInt(v, 10)),
  }),
});

export const approveAttendanceSchema = z.object({
  params: z.object({
    attendanceId: z.string().transform((v) => parseInt(v, 10)),
  }),
  body: z.object({}),
  query: z.object({}),
});

export const reportIssueSchema = z.object({
  params: z.object({
    attendanceId: z.string().transform((v) => parseInt(v, 10)),
  }),
  body: z.object({
    reason: z.string().trim().min(1),
  }),
  query: z.object({}),
});
