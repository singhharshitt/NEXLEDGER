import bcrypt from 'bcrypt';
import { pool, closeDatabase } from '../src/config/database';
import { env } from '../src/config/env';

const DEMO_PASSWORD = 'NexLedger@2026!';

async function seed(): Promise<void> {
  if (env.NODE_ENV === 'production') {
    console.error('❌ Refusing to seed in production');
    process.exit(1);
  }

  const { rows: existing } = await pool.query(`SELECT COUNT(*)::int AS count FROM users`);
  if (existing[0].count > 0) {
    console.log('⏭  Database already seeded, skipping');
    await closeDatabase();
    return;
  }

  console.log('🌱 Seeding database...');

  // ── 1. Users ────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, env.BCRYPT_ROUNDS);

  const users = [
    { full_name: 'Admin User',     email: 'admin@example.com',     role: 'ADMIN'     },
    { full_name: 'Sales User',     email: 'sales@example.com',     role: 'SALES'     },
    { full_name: 'Warehouse User', email: 'warehouse@example.com', role: 'WAREHOUSE' },
    { full_name: 'Accounts User',  email: 'accounts@example.com',  role: 'ACCOUNTS'  },
  ];

  const userIds: Record<string, string> = {};
  for (const u of users) {
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id, role`,
      [u.full_name, u.email, passwordHash, u.role]
    );
    userIds[u.role] = rows[0].id;
  }
  console.log('  ✔ Users inserted');

  // ── 2. Customers (≥10, all 3 types, all 3 statuses) ─────────────────────────
  const customers: Array<{
    contact_name: string;
    business_name: string;
    mobile: string;
    email: string;
    type: string;
    status: string;
    city: string;
  }> = [
    { contact_name: 'Rajesh Kumar',   business_name: 'Rajesh Traders Pvt Ltd',   mobile: '9876543210', email: 'rajesh@traders.com',  type: 'RETAIL',      status: 'ACTIVE',   city: 'Mumbai'    },
    { contact_name: 'Amit Sharma',    business_name: 'Sharma Wholesale Co',       mobile: '9876543211', email: 'sharma@ws.com',        type: 'WHOLESALE',   status: 'ACTIVE',   city: 'Delhi'     },
    { contact_name: 'Nikhil Patel',   business_name: 'Patel Distribution',        mobile: '9876543212', email: 'patel@dist.com',       type: 'DISTRIBUTOR', status: 'ACTIVE',   city: 'Ahmedabad' },
    { contact_name: 'Suresh Kumar',   business_name: 'Kumar Electronics',         mobile: '9876543213', email: 'kumar@elec.com',       type: 'RETAIL',      status: 'LEAD',     city: 'Bangalore' },
    { contact_name: 'Harpreet Singh', business_name: 'Singh & Sons Trading',      mobile: '9876543214', email: 'singh@sons.com',       type: 'WHOLESALE',   status: 'ACTIVE',   city: 'Pune'      },
    { contact_name: 'Deepak Gupta',   business_name: 'Gupta Retail Store',        mobile: '9876543215', email: 'gupta@retail.com',     type: 'RETAIL',      status: 'INACTIVE', city: 'Jaipur'    },
    { contact_name: 'Vikram Mehta',   business_name: 'Mehta Corporation',         mobile: '9876543216', email: 'mehta@corp.com',       type: 'DISTRIBUTOR', status: 'ACTIVE',   city: 'Surat'     },
    { contact_name: 'Ravi Reddy',     business_name: 'Reddy General Stores',      mobile: '9876543217', email: 'reddy@stores.com',     type: 'RETAIL',      status: 'ACTIVE',   city: 'Hyderabad' },
    { contact_name: 'Anil Joshi',     business_name: 'Joshi Trading House',       mobile: '9876543218', email: 'joshi@trade.com',      type: 'WHOLESALE',   status: 'LEAD',     city: 'Indore'    },
    { contact_name: 'Priya Verma',    business_name: 'Verma Supplies Ltd',        mobile: '9876543219', email: 'verma@sup.com',        type: 'DISTRIBUTOR', status: 'INACTIVE', city: 'Lucknow'   },
    { contact_name: 'Kiran Nair',     business_name: 'Nair Wholesale Depot',      mobile: '9876543220', email: 'nair@wholesale.com',   type: 'WHOLESALE',   status: 'INACTIVE', city: 'Kochi'     },
    { contact_name: 'Sandeep Rao',    business_name: 'Rao Distributors',          mobile: '9876543221', email: 'rao@dist.com',         type: 'DISTRIBUTOR', status: 'LEAD',     city: 'Chennai'   },
  ];

  const customerIds: string[] = [];
  for (const c of customers) {
    const { rows } = await pool.query(
      `INSERT INTO customers (contact_name, business_name, mobile, email, type, status, city, state, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Maharashtra', $8) RETURNING id`,
      [c.contact_name, c.business_name, c.mobile, c.email, c.type, c.status, c.city, userIds.SALES]
    );
    customerIds.push(rows[0].id);
  }
  console.log('  ✔ Customers inserted');

  // ── 3. Customer follow-up (uses `notes` column) ──────────────────────────────
  await pool.query(
    `INSERT INTO customer_followups (customer_id, follow_up_date, notes, created_by)
     VALUES ($1, CURRENT_DATE + 3, 'Initial follow-up scheduled', $2)`,
    [customerIds[0], userIds.SALES]
  );
  console.log('  ✔ Follow-up inserted');

  // ── 4. Products (≥15, uses `name` column, no warehouse_location) ─────────────
  //   ~5 healthy (current_stock >> minimum_stock)
  //   ~5 low     (0 < current_stock <= minimum_stock)
  //   ~5 zero    (current_stock = 0)
  const products: Array<{
    name: string;
    sku: string;
    category: string;
    unit_price: number;
    current_stock: number;
    minimum_stock: number;
  }> = [
    // Healthy stock (~5)
    { name: 'Wireless Keyboard',    sku: 'KB-001', category: 'Electronics',  unit_price: 800,  current_stock: 50,  minimum_stock: 10 },
    { name: 'USB Mouse',            sku: 'MS-002', category: 'Electronics',  unit_price: 350,  current_stock: 120, minimum_stock: 20 },
    { name: 'HDMI Cable 2m',        sku: 'CB-003', category: 'Cables',       unit_price: 250,  current_stock: 200, minimum_stock: 30 },
    { name: 'Printer Paper A4',     sku: 'PP-006', category: 'Stationery',   unit_price: 280,  current_stock: 500, minimum_stock: 100 },
    { name: 'Desk Lamp LED',        sku: 'DL-011', category: 'Furniture',    unit_price: 650,  current_stock: 30,  minimum_stock: 8  },
    // Low stock (~5): 0 < current_stock <= minimum_stock
    { name: 'Laptop Stand',         sku: 'LS-004', category: 'Accessories',  unit_price: 1200, current_stock: 5,   minimum_stock: 5  },
    { name: 'Monitor 24inch',       sku: 'MN-005', category: 'Electronics',  unit_price: 8500, current_stock: 3,   minimum_stock: 3  },
    { name: 'Ink Cartridge Black',  sku: 'IC-007', category: 'Consumables',  unit_price: 950,  current_stock: 8,   minimum_stock: 10 },
    { name: 'Network Switch 8port', sku: 'NS-008', category: 'Networking',   unit_price: 2200, current_stock: 4,   minimum_stock: 5  },
    { name: 'Webcam HD',            sku: 'WC-010', category: 'Electronics',  unit_price: 1500, current_stock: 2,   minimum_stock: 5  },
    // Zero stock (~5)
    { name: 'Ethernet Cable Cat6',  sku: 'EC-009', category: 'Cables',       unit_price: 180,  current_stock: 0,   minimum_stock: 20 },
    { name: 'Office Chair',         sku: 'OC-012', category: 'Furniture',    unit_price: 4500, current_stock: 0,   minimum_stock: 2  },
    { name: 'Whiteboard 4x3',       sku: 'WB-013', category: 'Office',       unit_price: 1800, current_stock: 0,   minimum_stock: 2  },
    { name: 'Stapler Heavy',        sku: 'ST-014', category: 'Stationery',   unit_price: 320,  current_stock: 0,   minimum_stock: 10 },
    { name: 'File Cabinet',         sku: 'FC-015', category: 'Furniture',    unit_price: 3200, current_stock: 0,   minimum_stock: 3  },
  ];

  const productIds: string[] = [];
  for (const p of products) {
    const { rows } = await pool.query(
      `INSERT INTO products (name, sku, category, unit_price, current_stock, minimum_stock, unit, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, 'pcs', true, $7) RETURNING id`,
      [p.name, p.sku, p.category, p.unit_price, p.current_stock, p.minimum_stock, userIds.WAREHOUSE]
    );
    productIds.push(rows[0].id);
  }
  console.log('  ✔ Products inserted');

  // ── 5. Stock movements for products with stock > 0 ───────────────────────────
  //   type (not movement_type), quantity (not quantity_changed),
  //   notes (not reason), reference_id UUID (NULL here)
  for (let i = 0; i < products.length; i++) {
    if (products[i].current_stock > 0) {
      await pool.query(
        `INSERT INTO stock_movements (product_id, quantity, type, notes, reference_id, created_by)
         VALUES ($1, $2, 'IN', 'Initial stock', NULL, $3)`,
        [productIds[i], products[i].current_stock, userIds.WAREHOUSE]
      );
    }
  }
  console.log('  ✔ Stock movements inserted');

  // ── 6. Challans (1 DRAFT + 1 CONFIRMED) in a transaction ────────────────────
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // --- DRAFT challan ---
    const draftNumber = 'CH-2026-000001';
    const { rows: draftRows } = await client.query(
      `INSERT INTO challans (challan_number, customer_id, total_quantity, total_amount, status, created_by, notes)
       VALUES ($1, $2, 5, 4000, 'DRAFT', $3, 'Draft challan for review') RETURNING id`,
      [draftNumber, customerIds[0], userIds.SALES]
    );
    await client.query(
      `INSERT INTO challan_items (challan_id, product_id, product_name_snapshot, sku_snapshot, unit_price_snapshot, quantity, total_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [draftRows[0].id, productIds[0], products[0].name, products[0].sku, products[0].unit_price, 5, 4000]
    );
    await client.query(
      `INSERT INTO challan_sequences (year, last_sequence)
       VALUES (2026, 1)
       ON CONFLICT (year) DO UPDATE SET last_sequence = GREATEST(challan_sequences.last_sequence, 1)`
    );

    // --- CONFIRMED challan ---
    const confirmNumber = 'CH-2026-000002';
    const { rows: confirmRows } = await client.query(
      `INSERT INTO challans (challan_number, customer_id, total_quantity, total_amount, status, created_by, confirmed_at)
       VALUES ($1, $2, 3, 1050, 'CONFIRMED', $3, NOW()) RETURNING id`,
      [confirmNumber, customerIds[1], userIds.SALES]
    );
    await client.query(
      `INSERT INTO challan_items (challan_id, product_id, product_name_snapshot, sku_snapshot, unit_price_snapshot, quantity, total_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [confirmRows[0].id, productIds[1], products[1].name, products[1].sku, products[1].unit_price, 3, 1050]
    );
    // Deduct stock for confirmed challan
    await client.query(
      `UPDATE products SET current_stock = current_stock - 3 WHERE id = $1`,
      [productIds[1]]
    );
    // OUT stock movement with new column names
    await client.query(
      `INSERT INTO stock_movements (product_id, quantity, type, notes, reference_id, created_by)
       VALUES ($1, $2, 'OUT', $3, NULL, $4)`,
      [productIds[1], 3, `Challan confirmation: ${confirmNumber}`, userIds.SALES]
    );
    await client.query(
      `INSERT INTO challan_sequences (year, last_sequence)
       VALUES (2026, 2)
       ON CONFLICT (year) DO UPDATE SET last_sequence = GREATEST(challan_sequences.last_sequence, 2)`
    );

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
  console.log('  ✔ Challans inserted');

  console.log('');
  console.log('✅ Seed complete');
  console.log(`   Demo password (DEMO ONLY): ${DEMO_PASSWORD}`);

  await closeDatabase();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
