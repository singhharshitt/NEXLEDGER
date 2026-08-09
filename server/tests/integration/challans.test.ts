import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { pool } from '../../src/config/database';
import { testApp } from '../setup';
import { cleanDatabase, seedTestUser } from '../helpers/db.helper';
import { generateToken } from '../helpers/auth.helper';

async function seedCustomer(createdBy: string) {
  const { rows } = await pool.query(
    `INSERT INTO customers (contact_name, business_name, mobile, type, status, created_by)
     VALUES ('Test Contact', 'Test Business', '9876543210', 'RETAIL', 'ACTIVE', $1)
     RETURNING id`,
    [createdBy]
  );
  return rows[0].id as string;
}

async function seedProduct(name: string, sku: string, stock: number, price: number, createdBy: string) {
  const { rows } = await pool.query(
    `INSERT INTO products (name, sku, category, unit_price, current_stock, minimum_stock, unit, created_by)
     VALUES ($1, $2, 'Test', $3, $4, 0, 'pcs', $5)
     RETURNING id`,
    [name, sku, price, stock, createdBy]
  );
  return rows[0].id as string;
}

describe('Challans API', () => {
  let salesUser: { id: string; email: string; role: string };
  let salesToken: string;
  let customerId: string;
  let productId: string;

  beforeEach(async () => {
    await cleanDatabase();
    salesUser = await seedTestUser('SALES');
    salesToken = generateToken('SALES', salesUser.id);
    customerId = await seedCustomer(salesUser.id);
    productId = await seedProduct('Widget A', 'WDG-001', 100, 50.00, salesUser.id);
  });

  describe('POST /api/challans + POST /api/challans/:id/confirm', () => {
    it('creating and confirming challan deducts stock (Req 17.5)', async () => {
      // Create challan
      const createRes = await request(testApp)
        .post('/api/challans')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ customerId, items: [{ productId, quantity: 10 }], notes: 'Test order' });

      expect(createRes.status).toBe(201);
      const challanId = createRes.body.data.id;

      // Confirm challan
      const confirmRes = await request(testApp)
        .post(`/api/challans/${challanId}/confirm`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(confirmRes.status).toBe(200);
      expect(confirmRes.body.data.status).toBe('CONFIRMED');

      // Verify stock was deducted
      const { rows } = await pool.query('SELECT current_stock FROM products WHERE id = $1', [productId]);
      expect(rows[0].current_stock).toBe(90);
    });

    it('confirming already-confirmed challan returns 409 (Req 17.6)', async () => {
      const createRes = await request(testApp)
        .post('/api/challans')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ customerId, items: [{ productId, quantity: 5 }] });

      const challanId = createRes.body.data.id;

      await request(testApp)
        .post(`/api/challans/${challanId}/confirm`)
        .set('Authorization', `Bearer ${salesToken}`);

      // Try to confirm again
      const res = await request(testApp)
        .post(`/api/challans/${challanId}/confirm`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already confirmed');
    });

    it('confirming with insufficient stock returns 409 and leaves stock unchanged (Req 17.7)', async () => {
      const createRes = await request(testApp)
        .post('/api/challans')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ customerId, items: [{ productId, quantity: 200 }] }); // more than available

      const challanId = createRes.body.data.id;

      const confirmRes = await request(testApp)
        .post(`/api/challans/${challanId}/confirm`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(confirmRes.status).toBe(409);

      // Stock must be unchanged
      const { rows } = await pool.query('SELECT current_stock FROM products WHERE id = $1', [productId]);
      expect(rows[0].current_stock).toBe(100);
    });
  });

  describe('Price snapshot immutability (Req 17.9)', () => {
    it('updating product price does not affect existing challan snapshot', async () => {
      const adminUser = await seedTestUser('ADMIN', { email: 'admin2@test.example.com' });
      const adminToken = generateToken('ADMIN', adminUser.id);

      // Create challan at original price (50.00)
      const createRes = await request(testApp)
        .post('/api/challans')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ customerId, items: [{ productId, quantity: 2 }] });

      expect(createRes.status).toBe(201);
      const challanId = createRes.body.data.id;

      // Update product price to 99.99
      await request(testApp)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ unitPrice: 99.99 });

      // Fetch challan and verify snapshot is unchanged
      const getRes = await request(testApp)
        .get(`/api/challans/${challanId}`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(getRes.status).toBe(200);
      const item = getRes.body.data.items[0];
      expect(Number(item.unitPrice ?? item.unit_price_snapshot)).toBeCloseTo(50.00);
    });
  });
});
