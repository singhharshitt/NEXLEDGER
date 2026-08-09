import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { testApp } from '../setup';
import { cleanDatabase, seedTestUser } from '../helpers/db.helper';
import { generateToken } from '../helpers/auth.helper';

describe('Products API', () => {
  let adminUser: { id: string; email: string; role: string };
  let adminToken: string;

  beforeEach(async () => {
    await cleanDatabase();
    adminUser = await seedTestUser('ADMIN');
    adminToken = generateToken('ADMIN', adminUser.id);
  });

  describe('POST /api/products', () => {
    it('ADMIN can create a product', async () => {
      const res = await request(testApp)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Widget A', sku: 'WDG-001', category: 'Electronics', unitPrice: 99.99, minStock: 10 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toBe('WDG-001');
    });

    it('returns 409 on duplicate SKU (Req 7.1)', async () => {
      await request(testApp)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Widget A', sku: 'DUP-SKU', category: 'Electronics', unitPrice: 10, minStock: 0 });

      const res = await request(testApp)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Widget B', sku: 'DUP-SKU', category: 'Electronics', unitPrice: 20, minStock: 0 });

      expect(res.status).toBe(409);
    });

    it('SALES cannot create a product — 403', async () => {
      const sales = await seedTestUser('SALES', { email: 'sales2@test.example.com' });
      const salesToken = generateToken('SALES', sales.id);

      const res = await request(testApp)
        .post('/api/products')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ name: 'Nope', sku: 'NOP-001', category: 'X', unitPrice: 1, minStock: 0 });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/products', () => {
    it('returns paginated list with stockStatus (Req 7.2, 7.3)', async () => {
      // Seed a product
      await request(testApp)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Stock Test', sku: 'ST-001', category: 'Test', unitPrice: 5, minStock: 10 });

      const res = await request(testApp)
        .get('/api/products')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toBeDefined();
      // New product with current_stock=0 should be "out"
      const product = res.body.data.items.find((p: { sku: string }) => p.sku === 'ST-001');
      expect(product).toBeDefined();
      expect(product.stockStatus ?? product.status).toBe('out');
    });
  });

  describe('GET /api/products/categories', () => {
    it('returns sorted, deduplicated categories (Req 7.6)', async () => {
      await request(testApp)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'P1', sku: 'CAT-001', category: 'Zebra', unitPrice: 1, minStock: 0 });

      await request(testApp)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'P2', sku: 'CAT-002', category: 'Apple', unitPrice: 1, minStock: 0 });

      const res = await request(testApp)
        .get('/api/products/categories')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const cats: string[] = res.body.data;
      expect(cats).toContain('Apple');
      expect(cats).toContain('Zebra');
      expect(cats.indexOf('Apple')).toBeLessThan(cats.indexOf('Zebra'));
    });
  });

  describe('GET /api/products/:id', () => {
    it('returns 404 for non-existent product (Req 7.7)', async () => {
      const res = await request(testApp)
        .get('/api/products/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
