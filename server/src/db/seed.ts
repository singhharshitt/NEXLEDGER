import bcrypt from "bcrypt";
import { pool, closeDatabase } from "../config/database";
import { env } from "../config/env";

const DEMO_PASSWORD = "NexLedger@2026!";

async function seed(): Promise<void> {
  if (env.NODE_ENV === "production") {
    console.error("❌ Refusing to seed in production");
    process.exit(1);
  }

  const { rows: existing } = await pool.query(`SELECT COUNT(*)::int AS count FROM users`);
  if (existing[0].count > 0) {
    console.log("⏭  Database already seeded, skipping");
    await closeDatabase();
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, env.BCRYPT_ROUNDS);

  const users = [
    { name: "Admin User", email: "admin@example.com", role: "ADMIN" },
    { name: "Sales User", email: "sales@example.com", role: "SALES" },
    { name: "Warehouse User", email: "warehouse@example.com", role: "WAREHOUSE" },
    { name: "Accounts User", email: "accounts@example.com", role: "ACCOUNTS" },
  ];

  const userIds: Record<string, string> = {};
  for (const u of users) {
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, role`,
      [u.name, u.email, passwordHash, u.role]
    );
    userIds[u.role] = rows[0].id;
  }

  const customers = [
    ["Rajesh Traders", "9876543210", "rajesh@traders.com", "Rajesh Traders Pvt Ltd", "RETAIL", "ACTIVE", "Mumbai"],
    ["Sharma Wholesale", "9876543211", "sharma@ws.com", "Sharma Wholesale Co", "WHOLESALE", "ACTIVE", "Delhi"],
    ["Patel Distributors", "9876543212", "patel@dist.com", "Patel Distribution", "DISTRIBUTOR", "ACTIVE", "Ahmedabad"],
    ["Kumar Electronics", "9876543213", "kumar@elec.com", "Kumar Electronics", "RETAIL", "LEAD", "Bangalore"],
    ["Singh & Sons", "9876543214", "singh@sons.com", "Singh & Sons Trading", "WHOLESALE", "ACTIVE", "Pune"],
    ["Gupta Retail", "9876543215", "gupta@retail.com", "Gupta Retail Store", "RETAIL", "INACTIVE", "Jaipur"],
    ["Mehta Corp", "9876543216", "mehta@corp.com", "Mehta Corporation", "DISTRIBUTOR", "ACTIVE", "Surat"],
    ["Reddy Stores", "9876543217", "reddy@stores.com", "Reddy General Stores", "RETAIL", "ACTIVE", "Hyderabad"],
    ["Joshi Trading", "9876543218", "joshi@trade.com", "Joshi Trading House", "WHOLESALE", "LEAD", "Indore"],
    ["Verma Supplies", "9876543219", "verma@sup.com", "Verma Supplies Ltd", "DISTRIBUTOR", "ACTIVE", "Lucknow"],
  ];

  const customerIds: string[] = [];
  for (const [name, mobile, email, business, type, status, city] of customers) {
    const { rows } = await pool.query(
      `INSERT INTO customers (contact_name, mobile, email, business_name, type, status, address, city, state)
       VALUES ($1,$2,$3,$4,$5,$6,'Main Street',$7,'Maharashtra') RETURNING id`,
      [name, mobile, email, business, type, status, city]
    );
    customerIds.push(rows[0].id);
  }

  await pool.query(
    `INSERT INTO customer_followups (customer_id, follow_up_date, notes, created_by)
     VALUES ($1, CURRENT_DATE + 3, 'Initial follow-up scheduled', $2)`,
    [customerIds[0], userIds.SALES]
  );

  const products = [
    ["Wireless Keyboard", "KB-001", "Electronics", 800, 50, 10, "A-01"],
    ["USB Mouse", "MS-002", "Electronics", 350, 120, 20, "A-02"],
    ["HDMI Cable 2m", "CB-003", "Cables", 250, 200, 30, "B-01"],
    ["Laptop Stand", "LS-004", "Accessories", 1200, 25, 5, "A-03"],
    ["Monitor 24inch", "MN-005", "Electronics", 8500, 15, 3, "C-01"],
    ["Printer Paper A4", "PP-006", "Stationery", 280, 500, 100, "D-01"],
    ["Ink Cartridge Black", "IC-007", "Consumables", 950, 8, 10, "D-02"],
    ["Network Switch 8port", "NS-008", "Networking", 2200, 12, 5, "B-02"],
    ["Ethernet Cable Cat6", "EC-009", "Cables", 180, 0, 20, "B-03"],
    ["Webcam HD", "WC-010", "Electronics", 1500, 3, 5, "A-04"],
    ["Desk Lamp LED", "DL-011", "Furniture", 650, 30, 8, "E-01"],
    ["Office Chair", "OC-012", "Furniture", 4500, 6, 2, "E-02"],
    ["Whiteboard 4x3", "WB-013", "Office", 1800, 4, 2, "E-03"],
    ["Stapler Heavy", "ST-014", "Stationery", 320, 45, 10, "D-03"],
    ["File Cabinet", "FC-015", "Furniture", 3200, 2, 3, "E-04"],
  ];

  const productIds: string[] = [];
  for (const [name, sku, category, price, stock, minStock] of products) {
    const { rows } = await pool.query(
      `INSERT INTO products (name, sku, category, unit_price, current_stock, minimum_stock, unit)
       VALUES ($1,$2,$3,$4,$5,$6,'pcs') RETURNING id`,
      [name, sku, category, price, stock, minStock]
    );
    productIds.push(rows[0].id);

    if (Number(stock) > 0) {
      await pool.query(
        `INSERT INTO stock_movements (product_id, quantity, type, notes, created_by)
         VALUES ($1, $2, 'IN', 'Initial stock', $3)`,
        [rows[0].id, stock, userIds.WAREHOUSE]
      );
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const draftNumber = "CH-2026-000001";
    const { rows: draftRows } = await client.query(
      `INSERT INTO challans (challan_number, customer_id, total_quantity, total_amount, status, created_by, notes)
       VALUES ($1, $2, 5, 4000, 'DRAFT', $3, 'Draft challan for review') RETURNING id`,
      [draftNumber, customerIds[0], userIds.SALES]
    );
    await client.query(
      `INSERT INTO challan_items (challan_id, product_id, product_name_snapshot, sku_snapshot, unit_price_snapshot, quantity, total_price)
       VALUES ($1, $2, 'Wireless Keyboard', 'KB-001', 800, 5, 4000)`,
      [draftRows[0].id, productIds[0]]
    );
    await client.query(
      `INSERT INTO challan_sequences (year, last_sequence) VALUES (2026, 1) ON CONFLICT (year) DO UPDATE SET last_sequence = GREATEST(challan_sequences.last_sequence, 1)`
    );

    const confirmNumber = "CH-2026-000002";
    const { rows: confirmRows } = await client.query(
      `INSERT INTO challans (challan_number, customer_id, total_quantity, total_amount, status, created_by, confirmed_at)
       VALUES ($1, $2, 3, 1050, 'CONFIRMED', $3, NOW()) RETURNING id`,
      [confirmNumber, customerIds[1], userIds.SALES]
    );
    await client.query(
      `INSERT INTO challan_items (challan_id, product_id, product_name_snapshot, sku_snapshot, unit_price_snapshot, quantity, total_price)
       VALUES ($1, $2, 'USB Mouse', 'MS-002', 350, 3, 1050)`,
      [confirmRows[0].id, productIds[1]]
    );
    await client.query(`UPDATE products SET current_stock = current_stock - 3 WHERE id = $1`, [productIds[1]]);
    await client.query(
      `INSERT INTO stock_movements (product_id, quantity, type, notes, reference_id, created_by)
       VALUES ($1, 3, 'OUT', 'Challan confirmation: CH-2026-000002', NULL, $2)`,
      [productIds[1], userIds.SALES]
    );
    await client.query(
      `INSERT INTO challan_sequences (year, last_sequence) VALUES (2026, 2) ON CONFLICT (year) DO UPDATE SET last_sequence = GREATEST(challan_sequences.last_sequence, 2)`
    );

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }

  console.log("✅ Seed complete");
  console.log(`   Demo password (DEMO ONLY): ${DEMO_PASSWORD}`);
  await closeDatabase();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
