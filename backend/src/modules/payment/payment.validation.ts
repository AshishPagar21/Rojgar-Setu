import { z } from "zod";

// Define the allowed payment methods as a Zod enum
const PaymentMethodEnum = z.enum(["CASH", "ONLINE_UPI"]);

export const markPaymentSuccessSchema = z.object({
  params: z.object({
    paymentId: z.string().transform((v) => parseInt(v, 10)),
  }),
  body: z.object({
    method: PaymentMethodEnum,
  }),
});

export const getJobPaymentsSchema = z.object({
  params: z.object({
    jobId: z.string().transform((v) => parseInt(v, 10)),
  }),
});
