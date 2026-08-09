import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { testApp } from '../setup';
import { cleanDatabase, seedTestUser } from '../helpers/db.helper';
import { generateToken } from '../helpers/auth.helper';

describe('Users API', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('GET /api/users', () => {
    it('ADMIN can list users', async () => {
      const admin = await seedTestUser('ADMIN');
      const token = generateToken('ADMIN', admin.id);

      const res = await request(testApp)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('SALES cannot access /api/users — returns 403 (Req 17.4)', async () => {
      const user = await seedTestUser('SALES');
      const token = generateToken('SALES', user.id);

      const res = await request(testApp)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('WAREHOUSE cannot access /api/users — returns 403', async () => {
      const user = await seedTestUser('WAREHOUSE');
      const token = generateToken('WAREHOUSE', user.id);

      const res = await request(testApp)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('ACCOUNTS cannot access /api/users — returns 403', async () => {
      const user = await seedTestUser('ACCOUNTS');
      const token = generateToken('ACCOUNTS', user.id);

      const res = await request(testApp)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/users', () => {
    it('ADMIN can create a user', async () => {
      const admin = await seedTestUser('ADMIN');
      const token = generateToken('ADMIN', admin.id);

      const res = await request(testApp)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Sales User',
          email: 'new.sales@test.example.com',
          password: 'SecurePass@123',
          role: 'SALES',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('SALES');
      expect(res.body.data).not.toHaveProperty('password_hash');
    });

    it('returns 409 on duplicate email (Req 5.2)', async () => {
      const admin = await seedTestUser('ADMIN');
      const token = generateToken('ADMIN', admin.id);

      // Create first user
      await request(testApp)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'First', email: 'dup@test.example.com', password: 'Pass@1234', role: 'SALES' });

      // Try duplicate
      const res = await request(testApp)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Second', email: 'dup@test.example.com', password: 'Pass@1234', role: 'SALES' });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/users/:id', () => {
    it('ADMIN can get a user by ID', async () => {
      const admin = await seedTestUser('ADMIN');
      const token = generateToken('ADMIN', admin.id);

      const res = await request(testApp)
        .get(`/api/users/${admin.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(admin.id);
    });

    it('returns 404 for non-existent user', async () => {
      const admin = await seedTestUser('ADMIN');
      const token = generateToken('ADMIN', admin.id);

      const res = await request(testApp)
        .get('/api/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/users/:id — last admin protection', () => {
    it('cannot deactivate the only active admin (Req 5.4)', async () => {
      const admin = await seedTestUser('ADMIN');
      const token = generateToken('ADMIN', admin.id);

      const res = await request(testApp)
        .put(`/api/users/${admin.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ isActive: false });

      expect(res.status).toBe(409);
    });

    it('cannot change last admin role to non-admin (Req 5.3)', async () => {
      const admin = await seedTestUser('ADMIN');
      const token = generateToken('ADMIN', admin.id);

      const res = await request(testApp)
        .put(`/api/users/${admin.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'SALES' });

      expect(res.status).toBe(409);
    });
  });
});
