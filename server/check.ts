import { pool } from "./src/config/database";
async function main() {
  const { rows } = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'challan_sequences'`);
  console.log(rows);
  process.exit(0);
}
main();
