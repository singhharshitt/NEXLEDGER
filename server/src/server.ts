import app from "./app";
import { env } from "./config/env";
import { checkDatabase, closeDatabase } from "./config/database";

async function start(): Promise<void> {
  console.log("✅ Environment validated");

  await checkDatabase();
  console.log("✅ PostgreSQL connected");

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await closeDatabase();
      console.log("Server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch((err) => {
  console.error("❌ Failed to start server:", err.message);
  process.exit(1);
});
