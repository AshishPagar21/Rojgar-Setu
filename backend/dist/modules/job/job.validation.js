"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobByIdSchema = exports.completeJobSchema = exports.cancelJobSchema = exports.getOpenJobsSchema = exports.createJobSchema = void 0;
const zod_1 = require("zod");
exports.createJobSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, "Title must be at least 3 characters"),
        description: zod_1.z
            .string()
            .min(10, "Description must be at least 10 characters"),
        category: zod_1.z.string().min(1, "Category is required"),
        wage: zod_1.z.number().positive("Wage must be a positive number"),
        jobDate: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid date format",
        }),
        requiredWorkers: zod_1.z
            .number()
            .int()
            .positive("Required workers must be at least 1"),
        latitude: zod_1.z.number().min(-90).max(90),
        longitude: zod_1.z.number().min(-180).max(180),
    }),
});
exports.getOpenJobsSchema = zod_1.z.object({
    query: zod_1.z.object({
        category: zod_1.z.string().optional(),
        date: zod_1.z.string().optional(),
    }),
});
exports.cancelJobSchema = zod_1.z.object({
    params: zod_1.z.object({
        jobId: zod_1.z.string().transform((v) => parseInt(v, 10)),
    }),
});
exports.completeJobSchema = zod_1.z.object({
    params: zod_1.z.object({
        jobId: zod_1.z.string().transform((v) => parseInt(v, 10)),
    }),
});
exports.getJobByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        jobId: zod_1.z.string().transform((v) => parseInt(v, 10)),
    }),
});
//# sourceMappingURL=job.validation.js.map