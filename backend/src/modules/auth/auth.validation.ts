import { Gender } from "@prisma/client";
import { z } from "zod";

import { MOBILE_NUMBER_REGEX } from "../../utils/constants";

export const sendOtpSchema = z.object({
  body: z.object({
    mobileNumber: z
      .string()
      .trim()
      .regex(MOBILE_NUMBER_REGEX, "Enter a valid 10-digit mobile number"),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const verifyOtpSchema = z
  .object({
    body: z
      .object({
        mobileNumber: z
          .string()
          .trim()
          .regex(MOBILE_NUMBER_REGEX, "Enter a valid 10-digit mobile number"),
        otp: z.string().trim().length(6, "OTP must be 6 digits"),
        role: z.enum(["EMPLOYER", "WORKER"]).optional(),
        name: z.string().trim().min(2, "Name is required").optional(),
        age: z.coerce.number().int().min(18).max(100).optional(),
        gender: z.nativeEnum(Gender).optional(),
      })
      .superRefine((data, ctx) => {
        if (data.role === "EMPLOYER" && !data.name) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Name is required for employer registration",
            path: ["name"],
          });
        }

        if (data.role === "WORKER") {
          if (!data.name) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Name is required for worker registration",
              path: ["name"],
            });
          }

          if (typeof data.age !== "number") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Age is required for worker registration",
              path: ["age"],
            });
          }

          if (!data.gender) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Gender is required for worker registration",
              path: ["gender"],
            });
          }
        }
      }),
    params: z.object({}),
    query: z.object({}),
  })
  .strict();
