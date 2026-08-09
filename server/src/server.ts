import app from "./app";
import { env } from "./config/env";
import { pool, checkDatabase, closeDatabase } from "./config/database";

async function start(): Promise<void> {
  console.log("✅ Environment validated");

  await checkDatabase();

  // Startup consistency check (Req 10.8)
  try {
    const { rows: inconsistent } = await pool.query(`
      SELECT c.id, c.challan_number
      FROM challans c
      WHERE c.status = 'CONFIRMED'
      AND NOT EXISTS (
        SELECT 1 FROM stock_movements sm
        WHERE sm.reference_id = c.id AND sm.type = 'OUT'
      )
    `);
    if (inconsistent.length > 0) {
      console.warn(`⚠️  Startup consistency check: ${inconsistent.length} CONFIRMED challan(s) missing OUT stock movements:`);
      for (const r of inconsistent) {
        console.warn(`   - ${r.challan_number} (${r.id})`);
      }
    } else {
      console.log('✅ Startup consistency check passed');
    }
  } catch (err) {
    console.warn('⚠️  Could not run startup consistency check:', (err as Error).message);
  }

  const httpServer = require('http').createServer(app);
  const { initSocket } = require('./socket');
  initSocket(httpServer);

  const server = httpServer.listen(env.PORT, () => {
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
