import { pool } from "../config/database";
import * as productRepo from "./product.repository";
import * as challanRepo from "./challan.repository";

export async function getDashboardStats() {
  const [customers, products, lowStock, outOfStock, draftChallans, confirmedChallans] =
    await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS count FROM customers`),
      pool.query(`SELECT COUNT(*)::int AS count FROM products`),
      productRepo.countLowStock(),
      productRepo.countOutOfStock(),
      challanRepo.countChallansByStatus("DRAFT"),
      challanRepo.countChallansByStatus("CONFIRMED"),
    ]);

  return {
    totalCustomers: customers.rows[0].count,
    totalProducts: products.rows[0].count,
    lowStockItems: lowStock + outOfStock,
    outOfStockCount: outOfStock,
    draftChallans: draftChallans,
    confirmedChallans: confirmedChallans,
  };
}

export async function getRecentActivity(limit = 10) {
  const activities: {
    id: string;
    type: string;
    description: string;
    user: string;
    timestamp: string;
  }[] = [];

  const [customers, challans, movements, followups] = await Promise.all([
    pool.query(
      `SELECT c.id, c.customer_name, c.created_at, u.name AS user_name
       FROM customers c LEFT JOIN users u ON FALSE
       ORDER BY c.created_at DESC LIMIT $1`,
      [limit]
    ),
    pool.query(
      `SELECT c.id, c.challan_number, c.status, c.created_at, c.confirmed_at, u.name AS user_name
       FROM challans c JOIN users u ON u.id = c.created_by
       ORDER BY c.created_at DESC LIMIT $1`,
      [limit]
    ),
    pool.query(
      `SELECT sm.id, sm.movement_type, sm.quantity_changed, sm.created_at, p.product_name, u.name AS user_name
       FROM stock_movements sm
       JOIN products p ON p.id = sm.product_id
       JOIN users u ON u.id = sm.created_by
       ORDER BY sm.created_at DESC LIMIT $1`,
      [limit]
    ),
    pool.query(
      `SELECT cf.id, cf.created_at, cu.customer_name, u.name AS user_name
       FROM customer_followups cf
       JOIN customers cu ON cu.id = cf.customer_id
       JOIN users u ON u.id = cf.created_by
       ORDER BY cf.created_at DESC LIMIT $1`,
      [limit]
    ),
  ]);

  for (const row of customers.rows) {
    activities.push({
      id: `cust-${row.id}`,
      type: "customer_created",
      description: `New customer added: ${row.customer_name}`,
      user: "System",
      timestamp: row.created_at.toISOString(),
    });
  }

  for (const row of challans.rows) {
    activities.push({
      id: `ch-${row.id}-${row.status}`,
      type: row.status === "CONFIRMED" ? "challan_confirmed" : "challan_created",
      description:
        row.status === "CONFIRMED"
          ? `Challan ${row.challan_number} confirmed`
          : `Challan ${row.challan_number} created`,
      user: row.user_name,
      timestamp: (row.confirmed_at ?? row.created_at).toISOString(),
    });
  }

  for (const row of movements.rows) {
    activities.push({
      id: `sm-${row.id}`,
      type: "stock_adjusted",
      description: `Stock ${row.movement_type.toLowerCase()}: ${row.quantity_changed} units of ${row.product_name}`,
      user: row.user_name,
      timestamp: row.created_at.toISOString(),
    });
  }

  for (const row of followups.rows) {
    activities.push({
      id: `fu-${row.id}`,
      type: "followup_added",
      description: `Follow-up added for ${row.customer_name}`,
      user: row.user_name,
      timestamp: row.created_at.toISOString(),
    });
  }

  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export async function getStockChartData(days = 7) {
  const { rows } = await pool.query(
    `SELECT
       DATE(created_at) AS date,
       SUM(CASE WHEN movement_type = 'IN' THEN quantity_changed ELSE 0 END)::int AS inward,
       SUM(CASE WHEN movement_type = 'OUT' THEN quantity_changed ELSE 0 END)::int AS outward
     FROM stock_movements
     WHERE created_at >= NOW() - ($1 || ' days')::interval
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
    [days]
  );

  return rows.map((r) => ({
    date: new Date(r.date).toISOString().split("T")[0],
    inward: r.inward,
    outward: r.outward,
  }));
}

export async function getLowStockProducts(limit = 10) {
  const { rows } = await pool.query(
    `SELECT * FROM products
     WHERE current_stock = 0 OR (current_stock > 0 AND current_stock <= minimum_stock)
     ORDER BY current_stock ASC
     LIMIT $1`,
    [limit]
  );
  return rows;
}
