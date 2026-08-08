import fs from "fs";
import path from "path";
import { pool, closeDatabase } from "../config/database";

async function migrate(): Promise<void> {
  const migrationsDir = path.join(__dirname, "../../migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  for (const file of files) {
    const { rows } = await pool.query(
      "SELECT 1 FROM schema_migrations WHERE name = $1",
      [file]
    );
    if (rows.length > 0) {
      console.log(`⏭  Skipped ${file} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`✅ Applied ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

migrate()
  .then(() => {
    console.log("✅ Migrations complete");
    return closeDatabase();
  })
  .catch((err) => {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  });
