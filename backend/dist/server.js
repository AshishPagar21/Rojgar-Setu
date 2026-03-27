"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const prisma_1 = require("./config/prisma");
const startServer = async () => {
    try {
        await prisma_1.prisma.$connect();
        app_1.app.listen(env_1.env.PORT, () => {
            // eslint-disable-next-line no-console
            console.log(`Server is running on port ${env_1.env.PORT}`);
        });
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to start server", error);
        process.exit(1);
    }
};
void startServer();
const shutdown = async () => {
    await prisma_1.prisma.$disconnect();
    process.exit(0);
};
process.on("SIGINT", () => {
    void shutdown();
});
process.on("SIGTERM", () => {
    void shutdown();
});
//# sourceMappingURL=server.js.map