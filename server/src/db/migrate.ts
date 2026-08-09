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
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'schema_migrations'
          AND column_name = 'name'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'schema_migrations'
          AND column_name = 'filename'
      ) THEN
        ALTER TABLE schema_migrations RENAME COLUMN name TO filename;
      END IF;
    END $$;
  `);
  await pool.query(`
    ALTER TABLE schema_migrations
      ADD COLUMN IF NOT EXISTS applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  `);

  for (const file of files) {
    const { rows } = await pool.query(
      "SELECT 1 FROM schema_migrations WHERE filename = $1",
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
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
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
