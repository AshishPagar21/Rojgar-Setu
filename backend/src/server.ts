import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();

    app.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on port ${env.PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

void startServer();

const shutdown = async (): Promise<void> => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
