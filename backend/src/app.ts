import cors from "cors";
import express from "express";

import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import { apiRoutes } from "./routes";
import { HTTP_STATUS } from "./utils/constants";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Rozgaar Setu backend is running",
  });
});

app.use(env.API_PREFIX, apiRoutes);

app.use(errorHandler);

export { app };
