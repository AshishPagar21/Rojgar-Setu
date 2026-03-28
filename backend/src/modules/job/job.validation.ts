import { z } from "zod";

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    category: z.string().min(1, "Category is required"),
    wage: z.number().positive("Wage must be a positive number"),
    jobDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }),
    requiredWorkers: z
      .number()
      .int()
      .positive("Required workers must be at least 1"),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
});

export const getOpenJobsSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    date: z.string().optional(),
  }),
});

export const cancelJobSchema = z.object({
  params: z.object({
    jobId: z.string().transform((v) => parseInt(v, 10)),
  }),
});

export const completeJobSchema = z.object({
  params: z.object({
    jobId: z.string().transform((v) => parseInt(v, 10)),
  }),
});

export const getJobByIdSchema = z.object({
  params: z.object({
    jobId: z.string().transform((v) => parseInt(v, 10)),
  }),
});
