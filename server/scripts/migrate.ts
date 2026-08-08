import path from 'path';
import fs from 'fs';
import { pool, closeDatabase } from '../src/config/database';

const MIGRATIONS_DIR = path.resolve(__dirname, '../migrations');

async function runMigrations(): Promise<void> {
  // Ensure schema_migrations table exists with the correct schema
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    // Check if already applied
    const { rows } = await pool.query(
      'SELECT filename FROM schema_migrations WHERE filename = $1',
      [file]
    );
    if (rows.length > 0) {
      console.log(`⏭  Skipping ${file} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [file]
      );
      await client.query('COMMIT');
      console.log(`✅ Applied ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`❌ Failed to apply ${file}:`, err);
      throw err;
    } finally {
      client.release();
    }
  }

  console.log('✅ All migrations complete');
}

runMigrations()
  .then(() => closeDatabase())
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
