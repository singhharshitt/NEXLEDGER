import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { pool } from '../../src/config/database';
import { testApp } from '../setup';
import { cleanDatabase, seedTestUser } from '../helpers/db.helper';
import { generateToken } from '../helpers/auth.helper';

async function seedProduct(stock: number, createdBy: string) {
  const { rows } = await pool.query(
    `INSERT INTO products (name, sku, category, unit_price, current_stock, minimum_stock, unit, created_by)
     VALUES ('Concurrent Test Product', $1, 'Test', 10.00, $2, 0, 'pcs', $3)
     RETURNING id`,
    [`SKU-CONCURRENT-${Date.now()}`, stock, createdBy]
  );
  return rows[0].id as string;
}

describe('Stock API — Concurrency', () => {
  let warehouseUser: { id: string; email: string; role: string };
  let warehouseToken: string;

  beforeEach(async () => {
    await cleanDatabase();
    warehouseUser = await seedTestUser('WAREHOUSE');
    warehouseToken = generateToken('WAREHOUSE', warehouseUser.id);
  });

  it(
    'two concurrent OUT adjustments of 8 from 10-unit stock: only one succeeds (Req 17.8)',
    async () => {
      const productId = await seedProduct(10, warehouseUser.id);

      // Fire both requests simultaneously
      const [res1, res2] = await Promise.all([
        request(testApp)
          .post(`/api/products/${productId}/stock`)
          .set('Authorization', `Bearer ${warehouseToken}`)
          .send({ type: 'OUT', quantity: 8, notes: 'Concurrent request 1' }),
        request(testApp)
          .post(`/api/products/${productId}/stock`)
          .set('Authorization', `Bearer ${warehouseToken}`)
          .send({ type: 'OUT', quantity: 8, notes: 'Concurrent request 2' }),
      ]);

      const statuses = [res1.status, res2.status].sort();

      // Exactly one should succeed (200/201) and one should fail (409)
      expect(statuses).toContain(409);
      const successCount = [res1.status, res2.status].filter(s => s === 200 || s === 201).length;
      expect(successCount).toBe(1);

      // Final stock must be 2 (10 - 8)
      const { rows } = await pool.query('SELECT current_stock FROM products WHERE id = $1', [productId]);
      expect(rows[0].current_stock).toBe(2);
    },
    60_000 // allow 60s for concurrency test
  );

  describe('POST /api/products/:id/stock', () => {
    it('IN movement increases stock correctly', async () => {
      const productId = await seedProduct(5, warehouseUser.id);

      const res = await request(testApp)
        .post(`/api/products/${productId}/stock`)
        .set('Authorization', `Bearer ${warehouseToken}`)
        .send({ type: 'IN', quantity: 20, notes: 'Restocking' });

      expect(res.status).toBe(201);

      const { rows } = await pool.query('SELECT current_stock FROM products WHERE id = $1', [productId]);
      expect(rows[0].current_stock).toBe(25);
    });

    it('OUT movement with quantity=0 returns 422 (Req 14.6)', async () => {
      const productId = await seedProduct(10, warehouseUser.id);

      const res = await request(testApp)
        .post(`/api/products/${productId}/stock`)
        .set('Authorization', `Bearer ${warehouseToken}`)
        .send({ type: 'OUT', quantity: 0 });

      expect(res.status).toBe(422);
    });

    it('OUT movement exceeding stock returns 409 with available quantity', async () => {
      const productId = await seedProduct(5, warehouseUser.id);

      const res = await request(testApp)
        .post(`/api/products/${productId}/stock`)
        .set('Authorization', `Bearer ${warehouseToken}`)
        .send({ type: 'OUT', quantity: 10, notes: 'Too many' });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('5');
    });
  });
});
