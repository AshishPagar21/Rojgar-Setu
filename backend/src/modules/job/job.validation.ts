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
    locationLine1: z.string().min(2, "Location detail is required"),
    city: z.string().min(2, "City is required"),
    landmark: z.string().min(2, "Landmark is required"),
    latitude: z
      .number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90"),
    longitude: z
      .number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),
  }),
});

export const getOpenJobsSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    date: z.string().optional(),
    latitude: z
      .string()
      .transform((v) => parseFloat(v))
      .refine((v) => !isNaN(v), "Invalid latitude")
      .optional(),
    longitude: z
      .string()
      .transform((v) => parseFloat(v))
      .refine((v) => !isNaN(v), "Invalid longitude")
      .optional(),
    radius: z
      .string()
      .transform((v) => parseFloat(v))
      .refine((v) => !isNaN(v) && v > 0, "Radius must be a positive number")
      .optional(),
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
    jobId: z.coerce.number().int().positive("Invalid job id"),
  }),
});
