"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobPlaceholderSchema = void 0;
const zod_1 = require("zod");
exports.jobPlaceholderSchema = zod_1.z.object({
    body: zod_1.z.object({}),
    params: zod_1.z.object({}),
    query: zod_1.z.object({}),
});
//# sourceMappingURL=job.validation.js.map