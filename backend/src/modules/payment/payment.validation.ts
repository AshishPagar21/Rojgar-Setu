import { z } from "zod";

export const createJobPaymentsSchema = z.object({
  params: z.object({
    jobId: z.string().transform((v) => parseInt(v, 10)),
  }),
});

export const markPaymentSuccessSchema = z.object({
  params: z.object({
    paymentId: z.string().transform((v) => parseInt(v, 10)),
  }),
});

export const getJobPaymentsSchema = z.object({
  params: z.object({
    jobId: z.string().transform((v) => parseInt(v, 10)),
  }),
});
