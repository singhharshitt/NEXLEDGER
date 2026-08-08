import type { PoolClient } from "pg";
import { pool } from "../config/database";
import { parsePagination } from "../utils/pagination";
import { toDbCustomerType, toDbCustomerStatus } from "../utils/mappers";

const SORT_FIELDS = ["created_at", "customer_name", "status", "follow_up_date"];

export async function listCustomers(query: Record<string, unknown>) {
  const { page, limit, offset } = parsePagination(query as { page?: string; limit?: string; pageSize?: string });
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (query.search) {
    conditions.push(
      `(customer_name ILIKE $${idx} OR business_name ILIKE $${idx} OR mobile ILIKE $${idx} OR email ILIKE $${idx})`
    );
    params.push(`%${query.search}%`);
    idx++;
  }
  if (query.status && query.status !== "all") {
    conditions.push(`status = $${idx++}`);
    params.push(toDbCustomerStatus(String(query.status)));
  }
  if (query.type && query.type !== "all") {
    conditions.push(`customer_type = $${idx++}`);
    params.push(toDbCustomerType(String(query.type)));
  }
  if (query.followUpOverdue) {
    conditions.push(`follow_up_date IS NOT NULL AND follow_up_date < CURRENT_DATE`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sortBy = SORT_FIELDS.includes(String(query.sortBy)) ? String(query.sortBy) : "created_at";
  const sortOrder = query.sortOrder === "asc" ? "ASC" : "DESC";

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM customers ${where}`,
    params
  );

  const { rows } = await pool.query(
    `SELECT * FROM customers ${where}
     ORDER BY ${sortBy} ${sortOrder}
     LIMIT $${idx++} OFFSET $${idx}`,
    [...params, limit, offset]
  );

  return { rows, total: countResult.rows[0].total, page, limit };
}

export async function findCustomerById(id: string) {
  const { rows } = await pool.query(`SELECT * FROM customers WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function createCustomer(data: Record<string, unknown>) {
  const { rows } = await pool.query(
    `INSERT INTO customers (
      customer_name, mobile, email, business_name, gst_number,
      customer_type, address, city, state, pincode, status, follow_up_date, notes
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *`,
    [
      data.name,
      data.mobile,
      data.email || null,
      data.businessName,
      data.gst || null,
      toDbCustomerType(String(data.type)),
      data.address ?? "",
      data.city ?? "",
      data.state ?? "",
      data.pincode ?? "",
      toDbCustomerStatus(String(data.status)),
      data.followUpDate || null,
      data.notes || null,
    ]
  );
  return rows[0];
}

export async function updateCustomer(id: string, data: Record<string, unknown>) {
  const existing = await findCustomerById(id);
  if (!existing) return null;

  const { rows } = await pool.query(
    `UPDATE customers SET
      customer_name = COALESCE($1, customer_name),
      mobile = COALESCE($2, mobile),
      email = COALESCE($3, email),
      business_name = COALESCE($4, business_name),
      gst_number = COALESCE($5, gst_number),
      customer_type = COALESCE($6, customer_type),
      address = COALESCE($7, address),
      city = COALESCE($8, city),
      state = COALESCE($9, state),
      pincode = COALESCE($10, pincode),
      status = COALESCE($11, status),
      follow_up_date = COALESCE($12, follow_up_date),
      notes = COALESCE($13, notes),
      updated_at = NOW()
    WHERE id = $14
    RETURNING *`,
    [
      data.name ?? null,
      data.mobile ?? null,
      data.email ?? null,
      data.businessName ?? null,
      data.gst ?? null,
      data.type ? toDbCustomerType(String(data.type)) : null,
      data.address ?? null,
      data.city ?? null,
      data.state ?? null,
      data.pincode ?? null,
      data.status ? toDbCustomerStatus(String(data.status)) : null,
      data.followUpDate ?? null,
      data.notes ?? null,
      id,
    ]
  );
  return rows[0];
}

export async function softDeleteCustomer(id: string) {
  const { rows } = await pool.query(
    `UPDATE customers SET status = 'INACTIVE', updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0] ?? null;
}

export async function listFollowUps(customerId: string) {
  const { rows } = await pool.query(
    `SELECT cf.*, u.name AS created_by_name
     FROM customer_followups cf
     JOIN users u ON u.id = cf.created_by
     WHERE cf.customer_id = $1
     ORDER BY cf.created_at DESC`,
    [customerId]
  );
  return rows;
}

export async function createFollowUp(
  customerId: string,
  data: { date: string; notes: string },
  createdBy: string,
  client?: PoolClient
) {
  const db = client ?? pool;
  const { rows } = await db.query(
    `INSERT INTO customer_followups (customer_id, follow_up_date, note, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [customerId, data.date, data.notes, createdBy]
  );

  await db.query(
    `UPDATE customers SET follow_up_date = $1, updated_at = NOW() WHERE id = $2`,
    [data.date, customerId]
  );

  const userResult = await db.query(`SELECT name FROM users WHERE id = $1`, [createdBy]);
  return { ...rows[0], created_by_name: userResult.rows[0]?.name };
}
