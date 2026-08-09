import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { testApp } from '../setup';
import { cleanDatabase, seedTestUser } from '../helpers/db.helper';
import { generateToken } from '../helpers/auth.helper';

describe('Customers API', () => {
  let salesUser: { id: string; email: string; role: string };
  let salesToken: string;
  let adminToken: string;
  let adminUser: { id: string; email: string; role: string };

  beforeEach(async () => {
    await cleanDatabase();
    salesUser = await seedTestUser('SALES');
    salesToken = generateToken('SALES', salesUser.id);
    adminUser = await seedTestUser('ADMIN', { email: 'admin@test.example.com' });
    adminToken = generateToken('ADMIN', adminUser.id);
  });

  describe('POST /api/customers', () => {
    it('SALES can create a customer (Req 6.1)', async () => {
      const res = await request(testApp)
        .post('/api/customers')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          name: 'Rajesh Kumar',
          businessName: 'Kumar Enterprises',
          type: 'WHOLESALE',
          status: 'ACTIVE',
          mobile: '9876543210',
          email: 'rajesh@kumar.com',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('WAREHOUSE cannot create a customer — 403', async () => {
      const wh = await seedTestUser('WAREHOUSE', { email: 'wh@test.example.com' });
      const whToken = generateToken('WAREHOUSE', wh.id);

      const res = await request(testApp)
        .post('/api/customers')
        .set('Authorization', `Bearer ${whToken}`)
        .send({ name: 'X', businessName: 'Y', type: 'RETAIL', status: 'LEAD', mobile: '1234567890' });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/customers', () => {
    it('returns paginated customer list (Req 6.2)', async () => {
      const res = await request(testApp)
        .get('/api/customers')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toBeDefined();
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination).toHaveProperty('page');
      expect(res.body.data.pagination).toHaveProperty('total');
    });
  });

  describe('DELETE /api/customers/:id', () => {
    it('ADMIN soft-deletes customer (sets status=INACTIVE) (Req 6.4)', async () => {
      // Create a customer
      const createRes = await request(testApp)
        .post('/api/customers')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ name: 'Del Test', businessName: 'Del Co', type: 'RETAIL', status: 'ACTIVE', mobile: '9999999999' });

      const customerId = createRes.body.data.id;

      const deleteRes = await request(testApp)
        .delete(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);

      // Verify status is INACTIVE, not actually deleted
      const getRes = await request(testApp)
        .get(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.status).toBe('INACTIVE');
    });
  });

  describe('GET /api/customers/:id — 404 for unknown ID', () => {
    it('returns 404 for non-existent customer (Req 6.7)', async () => {
      const res = await request(testApp)
        .get('/api/customers/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/customers/:id/followups', () => {
    it('creates a follow-up with createdBy from JWT (Req 6.6)', async () => {
      const createRes = await request(testApp)
        .post('/api/customers')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ name: 'FU Test', businessName: 'FU Co', type: 'RETAIL', status: 'ACTIVE', mobile: '8888888888' });

      const customerId = createRes.body.data.id;

      const fuRes = await request(testApp)
        .post(`/api/customers/${customerId}/followups`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ date: '2025-12-01', notes: 'Discuss Q4 orders' });

      expect(fuRes.status).toBe(201);
      expect(fuRes.body.success).toBe(true);
    });
  });
});
