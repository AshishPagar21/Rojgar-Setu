import { z } from "zod";

export const applyToJobSchema = z.object({
  params: z.object({
    jobId: z.string().transform((v) => parseInt(v, 10)),
  }),
});

export const selectWorkersSchema = z.object({
  params: z.object({
    jobId: z.string().transform((v) => parseInt(v, 10)),
  }),
  body: z.object({
    workerIds: z
      .array(z.number())
      .min(1, "At least one worker must be selected"),
  }),
});

export const getJobApplicantsSchema = z.object({
  params: z.object({
    jobId: z.string().transform((v) => parseInt(v, 10)),
  }),
});
