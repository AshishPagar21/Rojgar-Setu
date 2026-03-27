"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middlewares/error.middleware");
const routes_1 = require("./routes");
const constants_1 = require("./utils/constants");
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/health", (_req, res) => {
    res.status(constants_1.HTTP_STATUS.OK).json({
        success: true,
        message: "Rozgaar Setu backend is running",
    });
});
app.use(env_1.env.API_PREFIX, routes_1.apiRoutes);
app.use(error_middleware_1.errorHandler);
//# sourceMappingURL=app.js.map