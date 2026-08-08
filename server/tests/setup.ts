import { pool } from '../src/config/database';
import app from '../src/app';

export { app as testApp };
export { pool as testPool };

// Global teardown — close DB pool after all tests
afterAll(async () => {
  await pool.end();
});
