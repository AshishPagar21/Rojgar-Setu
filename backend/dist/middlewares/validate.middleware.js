"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const constants_1 = require("../utils/constants");
const response_1 = require("../utils/response");
const validate = (schema) => {
    return (req, _res, next) => {
        const parsed = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });
        if (!parsed.success) {
            return next(new response_1.ApiError(constants_1.HTTP_STATUS.BAD_REQUEST, "Validation failed", parsed.error.flatten()));
        }
        const parsedData = parsed.data;
        // Express 5 exposes query/params as getter-backed properties.
        // Mutating them directly can throw at runtime, so we only assign body.
        req.body = parsedData.body;
        return next();
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.middleware.js.map