"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpSchema = exports.sendOtpSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const constants_1 = require("../../utils/constants");
exports.sendOtpSchema = zod_1.z.object({
    body: zod_1.z.object({
        mobileNumber: zod_1.z
            .string()
            .trim()
            .regex(constants_1.MOBILE_NUMBER_REGEX, "Enter a valid 10-digit mobile number"),
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({}),
});
exports.verifyOtpSchema = zod_1.z
    .object({
    body: zod_1.z
        .object({
        mobileNumber: zod_1.z
            .string()
            .trim()
            .regex(constants_1.MOBILE_NUMBER_REGEX, "Enter a valid 10-digit mobile number"),
        otp: zod_1.z.string().trim().length(6, "OTP must be 6 digits"),
        role: zod_1.z.enum(["EMPLOYER", "WORKER"]).optional(),
        name: zod_1.z.string().trim().min(2, "Name is required").optional(),
        age: zod_1.z.coerce.number().int().min(18).max(100).optional(),
        gender: zod_1.z.nativeEnum(client_1.Gender).optional(),
    })
        .superRefine((data, ctx) => {
        if (data.role === "EMPLOYER" && !data.name) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Name is required for employer registration",
                path: ["name"],
            });
        }
        if (data.role === "WORKER") {
            if (!data.name) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: "Name is required for worker registration",
                    path: ["name"],
                });
            }
            if (typeof data.age !== "number") {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: "Age is required for worker registration",
                    path: ["age"],
                });
            }
            if (!data.gender) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: "Gender is required for worker registration",
                    path: ["gender"],
                });
            }
        }
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({}),
})
    .strict();
//# sourceMappingURL=auth.validation.js.map