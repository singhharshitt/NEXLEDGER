import type { PoolClient } from "pg";
import { pool } from "../config/database";
import { parsePagination } from "../utils/pagination";
import { conflict, notFound } from "../utils/errors";
import * as productRepo from "./product.repository";

const SORT_FIELDS = ["created_at", "challan_number", "status", "total_quantity"];

async function generateChallanNumber(client: PoolClient): Promise<string> {
  const year = new Date().getFullYear();
  const { rows } = await client.query(
    `INSERT INTO challan_sequences (year, last_sequence)
     VALUES ($1, 1)
     ON CONFLICT (year) DO UPDATE SET last_sequence = challan_sequences.last_sequence + 1
     RETURNING last_sequence`,
    [year]
  );
  const num = String(rows[0].last_sequence).padStart(6, "0");
  return `CH-${year}-${num}`;
}

export async function listChallans(query: Record<string, unknown>) {
  const { page, limit, offset } = parsePagination(query as { page?: string; limit?: string; pageSize?: string });
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (query.search) {
    conditions.push(
      `(c.challan_number ILIKE $${idx} OR cu.contact_name ILIKE $${idx} OR cu.business_name ILIKE $${idx})`
    );
    params.push(`%${query.search}%`);
    idx++;
  }
  if (query.status && query.status !== "all") {
    conditions.push(`c.status = $${idx++}`);
    params.push(String(query.status).toUpperCase());
  }
  if (query.customerId) {
    conditions.push(`c.customer_id = $${idx++}`);
    params.push(query.customerId);
  }
  if (query.dateFrom) {
    conditions.push(`c.created_at >= $${idx++}`);
    params.push(query.dateFrom);
  }
  if (query.dateTo) {
    conditions.push(`c.created_at <= $${idx++}`);
    params.push(query.dateTo);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sortBy = SORT_FIELDS.includes(String(query.sortBy)) ? `c.${String(query.sortBy)}` : "c.created_at";
  const sortOrder = query.sortOrder === "asc" ? "ASC" : "DESC";

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM challans c
     JOIN customers cu ON cu.id = c.customer_id ${where}`,
    params
  );

  const { rows } = await pool.query(
    `SELECT c.*, cu.contact_name AS customer_name, cu.business_name AS customer_business,
            u.full_name AS created_by_name
     FROM challans c
     JOIN customers cu ON cu.id = c.customer_id
     JOIN users u ON u.id = c.created_by
     ${where}
     ORDER BY ${sortBy} ${sortOrder}
     LIMIT $${idx++} OFFSET $${idx}`,
    [...params, limit, offset]
  );

  return { rows, total: countResult.rows[0].total, page, limit };
}

export async function findChallanById(id: string, client?: PoolClient) {
  const db = client ?? pool;
  const { rows } = await db.query(
    `SELECT c.*, cu.contact_name AS customer_name, cu.business_name AS customer_business,
            u.full_name AS created_by_name
     FROM challans c
     JOIN customers cu ON cu.id = c.customer_id
     JOIN users u ON u.id = c.created_by
     WHERE c.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function getChallanItems(challanId: string, client?: PoolClient) {
  const db = client ?? pool;
  const { rows } = await db.query(
    `SELECT ci.*, p.current_stock AS available_stock
     FROM challan_items ci
     LEFT JOIN products p ON p.id = ci.product_id
     WHERE ci.challan_id = $1`,
    [challanId]
  );
  return rows;
}

export async function getChallanItemsBulk(challanIds: string[], client?: PoolClient) {
  if (challanIds.length === 0) return [];
  const db = client ?? pool;
  const { rows } = await db.query(
    `SELECT ci.*, p.current_stock AS available_stock
     FROM challan_items ci
     LEFT JOIN products p ON p.id = ci.product_id
     WHERE ci.challan_id = ANY($1)`,
    [challanIds]
  );
  return rows;
}

export async function createChallan(
  data: {
    customerId: string;
    items: { productId: string; quantity: number }[];
    notes?: string;
    status?: string;
  },
  createdBy: string
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const customerResult = await client.query(`SELECT id FROM customers WHERE id = $1`, [data.customerId]);
    if (customerResult.rows.length === 0) throw notFound("Customer");

    const productIds = data.items.map((i) => i.productId);
    if (new Set(productIds).size !== productIds.length) {
      throw conflict("Duplicate products in challan items");
    }

    const itemRows: {
      product: Record<string, unknown>;
      quantity: number;
      totalPrice: number;
    }[] = [];

    for (const item of data.items) {
      const product = await productRepo.findProductById(item.productId, client);
      if (!product) throw notFound(`Product ${item.productId}`);
      const totalPrice = Number(product.unit_price) * item.quantity;
      itemRows.push({ product, quantity: item.quantity, totalPrice });
    }

    const totalQuantity = data.items.reduce((s, i) => s + i.quantity, 0);
    const totalAmount = itemRows.reduce((s, i) => s + i.totalPrice, 0);
    const challanNumber = await generateChallanNumber(client);
    const status = "DRAFT";

    const challanResult = await client.query(
      `INSERT INTO challans (challan_number, customer_id, total_quantity, total_amount, status, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [challanNumber, data.customerId, totalQuantity, totalAmount, status, data.notes ?? null, createdBy]
    );
    const challan = challanResult.rows[0];

    for (const row of itemRows) {
      await client.query(
        `INSERT INTO challan_items (
          challan_id, product_id, product_name_snapshot, sku_snapshot,
          unit_price_snapshot, quantity, total_price
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          challan.id,
          row.product.id,
          row.product.name,
          row.product.sku,
          row.product.unit_price,
          row.quantity,
          row.totalPrice,
        ]
      );
    }

    await client.query("COMMIT");
    return findChallanWithItems(challan.id);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function findChallanWithItems(id: string) {
  const challan = await findChallanById(id);
  if (!challan) return null;
  const items = await getChallanItems(id);
  return { challan, items };
}

export async function updateChallan(
  id: string,
  data: {
    customerId?: string;
    items?: { productId: string; quantity: number }[];
    notes?: string;
  }
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const challan = await client.query(`SELECT * FROM challans WHERE id = $1 FOR UPDATE`, [id]);
    if (challan.rows.length === 0) throw notFound("Challan");
    if (challan.rows[0].status !== "DRAFT") {
      throw conflict("Only draft challans can be edited");
    }

    if (data.customerId) {
      const cust = await client.query(`SELECT id FROM customers WHERE id = $1`, [data.customerId]);
      if (cust.rows.length === 0) throw notFound("Customer");
    }

    if (data.items) {
      const productIds = data.items.map((i) => i.productId);
      if (new Set(productIds).size !== productIds.length) {
        throw conflict("Duplicate products in challan items");
      }

      await client.query(`DELETE FROM challan_items WHERE challan_id = $1`, [id]);

      let totalQuantity = 0;
      let totalAmount = 0;

      for (const item of data.items) {
        const product = await productRepo.findProductById(item.productId, client);
        if (!product) throw notFound(`Product ${item.productId}`);
        const totalPrice = Number(product.unit_price) * item.quantity;
        totalQuantity += item.quantity;
        totalAmount += totalPrice;

        await client.query(
          `INSERT INTO challan_items (
            challan_id, product_id, product_name_snapshot, sku_snapshot,
            unit_price_snapshot, quantity, total_price
          ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            id,
            product.id,
            product.name,
            product.sku,
            product.unit_price,
            item.quantity,
            totalPrice,
          ]
        );
      }

      await client.query(
        `UPDATE challans SET total_quantity = $1, total_amount = $2, updated_at = NOW() WHERE id = $3`,
        [totalQuantity, totalAmount, id]
      );
    }

    if (data.customerId || data.notes !== undefined) {
      await client.query(
        `UPDATE challans SET
          customer_id = COALESCE($1, customer_id),
          notes = COALESCE($2, notes),
          updated_at = NOW()
        WHERE id = $3`,
        [data.customerId ?? null, data.notes ?? null, id]
      );
    }

    await client.query("COMMIT");
    return findChallanWithItems(id);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function confirmChallan(id: string, userId: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const challanResult = await client.query(`SELECT * FROM challans WHERE id = $1 FOR UPDATE`, [id]);
    if (challanResult.rows.length === 0) throw notFound("Challan");

    const challan = challanResult.rows[0];
    if (challan.status === "CONFIRMED") {
      throw conflict("Challan is already confirmed");
    }
    if (challan.status === "CANCELLED") {
      throw conflict("Cancelled challans cannot be confirmed");
    }
    if (challan.status !== "DRAFT") {
      throw conflict("Invalid challan state for confirmation");
    }

    const itemsResult = await client.query(`SELECT * FROM challan_items WHERE challan_id = $1`, [id]);
    const items = itemsResult.rows;

    const productIds = [...new Set(items.map((i: { product_id: string }) => i.product_id))].sort();
    for (const productId of productIds) {
      const product = await productRepo.lockProductForUpdate(productId, client);
      if (!product) throw notFound(`Product ${productId}`);

      const itemQty = items
        .filter((i: { product_id: string }) => i.product_id === productId)
        .reduce((s: number, i: { quantity: number }) => s + i.quantity, 0);

      if (product.current_stock < itemQty) {
        throw conflict(
          `Insufficient stock for ${product.name}. Available: ${product.current_stock}, Required: ${itemQty}`
        );
      }
    }

    for (const item of items) {
      const product = await productRepo.lockProductForUpdate(item.product_id, client);
      const newStock = product.current_stock - item.quantity;
      await client.query(`UPDATE products SET current_stock = $1, updated_at = NOW() WHERE id = $2`, [
        newStock,
        item.product_id,
      ]);

      await client.query(
        `INSERT INTO stock_movements (product_id, quantity, type, notes, reference_id, created_by)
         VALUES ($1, $2, 'OUT', $3, $4, $5)`,
        [
          item.product_id,
          item.quantity,
          `Challan confirmation: ${challan.challan_number}`,
          challan.id,
          userId,
        ]
      );
    }

    await client.query(
      `UPDATE challans SET status = 'CONFIRMED', confirmed_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [id]
    );

    await client.query("COMMIT");
    return findChallanWithItems(id);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function cancelChallan(id: string, userId: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const challanResult = await client.query(`SELECT * FROM challans WHERE id = $1 FOR UPDATE`, [id]);
    if (challanResult.rows.length === 0) throw notFound("Challan");

    const challan = challanResult.rows[0];

    if (challan.status === "CANCELLED") {
      throw conflict("Challan is already cancelled");
    }

    if (challan.status === "DRAFT") {
      await client.query(
        `UPDATE challans SET status = 'CANCELLED', cancelled_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [id]
      );
      await client.query("COMMIT");
      return findChallanWithItems(id);
    }

    if (challan.status === "CONFIRMED") {
      const itemsResult = await client.query(`SELECT * FROM challan_items WHERE challan_id = $1`, [id]);

      for (const item of itemsResult.rows) {
        const product = await productRepo.lockProductForUpdate(item.product_id, client);
        if (!product) throw notFound(`Product ${item.product_id}`);

        const newStock = product.current_stock + item.quantity;
        await client.query(`UPDATE products SET current_stock = $1, updated_at = NOW() WHERE id = $2`, [
          newStock,
          item.product_id,
        ]);

        await client.query(
          `INSERT INTO stock_movements (product_id, quantity, type, notes, reference_id, created_by)
           VALUES ($1, $2, 'IN', $3, $4, $5)`,
          [
            item.product_id,
            item.quantity,
            `Challan cancellation restore: ${challan.challan_number}`,
            challan.id,
            userId,
          ]
        );
      }

      await client.query(
        `UPDATE challans SET status = 'CANCELLED', cancelled_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [id]
      );
    }

    await client.query("COMMIT");
    return findChallanWithItems(id);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function countChallansByStatus(status: string): Promise<number> {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS count FROM challans WHERE status = $1`, [
    status.toUpperCase(),
  ]);
  return rows[0].count;
}

export async function getRecentChallans(limit = 5) {
  const { rows } = await pool.query(
    `SELECT c.*, cu.contact_name AS customer_name, cu.business_name AS customer_business,
            u.full_name AS created_by_name
     FROM challans c
     JOIN customers cu ON cu.id = c.customer_id
     JOIN users u ON u.id = c.created_by
     ORDER BY c.created_at DESC LIMIT $1`,
    [limit]
  );
  return rows;
}

export async function listChallansWithItems(query: Record<string, unknown>) {
  const result = await listChallans(query);
  
  const challanIds = result.rows.map((row) => row.id);
  const allItems = await getChallanItemsBulk(challanIds);
  
  const itemsByChallanId = allItems.reduce((acc, item) => {
    if (!acc[item.challan_id]) acc[item.challan_id] = [];
    acc[item.challan_id].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const items = result.rows.map((row) => ({
    challan: row,
    items: itemsByChallanId[row.id] || [],
  }));

  return {
    items,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    },
  };
}

export async function getRecentChallansWithItems(limit = 5) {
  const rows = await getRecentChallans(limit);
  const challanIds = rows.map((row) => row.id);
  const allItems = await getChallanItemsBulk(challanIds);
  
  const itemsByChallanId = allItems.reduce((acc, item) => {
    if (!acc[item.challan_id]) acc[item.challan_id] = [];
    acc[item.challan_id].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return rows.map((row) => ({
    challan: row,
    items: itemsByChallanId[row.id] || [],
  }));
}
