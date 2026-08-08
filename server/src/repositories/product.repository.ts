import type { PoolClient } from "pg";
import { pool } from "../config/database";
import { parsePagination } from "../utils/pagination";
import { conflict } from "../utils/errors";

const SORT_FIELDS = ["created_at", "name", "sku", "category", "current_stock"];

export async function listProducts(query: Record<string, unknown>) {
  const { page, limit, offset } = parsePagination(query as { page?: string; limit?: string; pageSize?: string });
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (query.search) {
    conditions.push(`(name ILIKE $${idx} OR sku ILIKE $${idx} OR category ILIKE $${idx})`);
    params.push(`%${query.search}%`);
    idx++;
  }
  if (query.category && query.category !== "all") {
    conditions.push(`category = $${idx++}`);
    params.push(query.category);
  }
  if (query.stockStatus === "low") {
    conditions.push(`current_stock > 0 AND current_stock <= minimum_stock`);
  } else if (query.stockStatus === "out") {
    conditions.push(`current_stock = 0`);
  } else if (query.stockStatus === "healthy") {
    conditions.push(`current_stock > minimum_stock`);
  }
  if (query.lowStock) {
    conditions.push(`current_stock > 0 AND current_stock <= minimum_stock`);
  }
  if (query.outOfStock) {
    conditions.push(`current_stock = 0`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sortBy = SORT_FIELDS.includes(String(query.sortBy)) ? String(query.sortBy) : "created_at";
  const sortOrder = query.sortOrder === "asc" ? "ASC" : "DESC";

  const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM products ${where}`, params);
  const { rows } = await pool.query(
    `SELECT * FROM products ${where} ORDER BY ${sortBy} ${sortOrder} LIMIT $${idx++} OFFSET $${idx}`,
    [...params, limit, offset]
  );

  return { rows, total: countResult.rows[0].total, page, limit };
}

export async function findProductById(id: string, client?: PoolClient) {
  const db = client ?? pool;
  const { rows } = await db.query(`SELECT * FROM products WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function findProductBySku(sku: string) {
  const { rows } = await pool.query(`SELECT * FROM products WHERE sku = $1`, [sku]);
  return rows[0] ?? null;
}

export async function createProduct(data: Record<string, unknown>) {
  const { rows } = await pool.query(
    `INSERT INTO products (
      name, sku, category, description, unit_price,
      minimum_stock, unit, current_stock
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,0)
    RETURNING *`,
    [
      data.name,
      data.sku,
      data.category,
      data.description || null,
      data.unitPrice,
      data.minStock ?? 0,
      data.unit ?? "pcs",
    ]
  );
  return rows[0];
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  const { rows } = await pool.query(
    `UPDATE products SET
      name = COALESCE($1, name),
      sku = COALESCE($2, sku),
      category = COALESCE($3, category),
      description = COALESCE($4, description),
      unit_price = COALESCE($5, unit_price),
      minimum_stock = COALESCE($6, minimum_stock),
      unit = COALESCE($7, unit),
      updated_at = NOW()
    WHERE id = $8
    RETURNING *`,
    [
      data.name ?? null,
      data.sku ?? null,
      data.category ?? null,
      data.description ?? null,
      data.unitPrice ?? null,
      data.minStock ?? null,
      data.unit ?? null,
      id,
    ]
  );
  return rows[0] ?? null;
}

export async function getCategories(): Promise<string[]> {
  const { rows } = await pool.query(`SELECT DISTINCT category FROM products ORDER BY category`);
  return rows.map((r) => r.category);
}

export async function lockProductForUpdate(productId: string, client: PoolClient) {
  const { rows } = await client.query(
    `SELECT * FROM products WHERE id = $1 FOR UPDATE`,
    [productId]
  );
  return rows[0] ?? null;
}

export async function adjustStock(
  productId: string,
  quantity: number,
  movementType: "IN" | "OUT",
  reason: string,
  createdBy: string,
  reference?: string,
  client?: PoolClient
) {
  const run = async (c: PoolClient) => {
    const product = await lockProductForUpdate(productId, c);
    if (!product) throw conflict("Product not found");

    if (movementType === "OUT" && product.current_stock < quantity) {
      throw conflict(`Insufficient stock. Available: ${product.current_stock}`);
    }

    const newStock =
      movementType === "IN" ? product.current_stock + quantity : product.current_stock - quantity;

    await c.query(`UPDATE products SET current_stock = $1, updated_at = NOW() WHERE id = $2`, [
      newStock,
      productId,
    ]);

    const { rows } = await c.query(
      `INSERT INTO stock_movements (product_id, quantity, type, notes, reference_id, created_by)
       VALUES ($1, $2, $3, $4, $5::uuid, $6)
       RETURNING *`,
      [productId, quantity, movementType, reason, reference ?? null, createdBy]
    );

    const userResult = await c.query(`SELECT full_name FROM users WHERE id = $1`, [createdBy]);
    return {
      movement: rows[0],
      productName: product.name,
      createdByName: userResult.rows[0]?.full_name,
      newStock,
    };
  };

  if (client) return run(client);
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const result = await run(c);
    await c.query("COMMIT");
    return result;
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}

export async function listStockMovements(productId: string) {
  const { rows } = await pool.query(
    `SELECT sm.*, p.name AS product_name, sm.type AS movement_type, sm.quantity AS quantity_changed,
            u.full_name AS created_by_name
     FROM stock_movements sm
     JOIN products p ON p.id = sm.product_id
     JOIN users u ON u.id = sm.created_by
     WHERE sm.product_id = $1
     ORDER BY sm.created_at DESC`,
    [productId]
  );
  return rows;
}

export async function listAllMovements(limit = 20) {
  const { rows } = await pool.query(
    `SELECT sm.*, p.name AS product_name, sm.type AS movement_type, sm.quantity AS quantity_changed,
            u.full_name AS created_by_name
     FROM stock_movements sm
     JOIN products p ON p.id = sm.product_id
     JOIN users u ON u.id = sm.created_by
     ORDER BY sm.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}

export async function countLowStock(): Promise<number> {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM products WHERE current_stock > 0 AND current_stock <= minimum_stock`
  );
  return rows[0].count;
}

export async function countOutOfStock(): Promise<number> {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM products WHERE current_stock = 0`
  );
  return rows[0].count;
}
