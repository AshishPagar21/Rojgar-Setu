import { createServer } from "http";

import os from "os";

import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { initializeSocketServer } from "./socket/socket.server";

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();

    const httpServer = createServer(app);
    initializeSocketServer(httpServer);

    httpServer.listen(env.PORT, "0.0.0.0", () => {
      const interfaces = os.networkInterfaces();
      const ips: string[] = [];
      for (const interfaceName of Object.keys(interfaces)) {
        const addresses = interfaces[interfaceName];
        if (addresses) {
          for (const addr of addresses) {
            if (addr.family === "IPv4" && !addr.internal) {
              ips.push(addr.address);
            }
          }
        }
      }

      // eslint-disable-next-line no-console
      console.log(`Server is running on port ${env.PORT}`);
      // eslint-disable-next-line no-console
      console.log(`- Local:            http://localhost:${env.PORT}`);
      ips.forEach((ip) => {
        // eslint-disable-next-line no-console
        console.log(`- On Your Network:  http://${ip}:${env.PORT}`);
      });
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
