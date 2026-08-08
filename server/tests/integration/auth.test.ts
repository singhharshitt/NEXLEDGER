import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { testApp } from '../setup';
import { cleanDatabase, seedTestUser } from '../helpers/db.helper';
import { generateToken } from '../helpers/auth.helper';

describe('Auth API', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/auth/login', () => {
    it('returns JWT and user on valid credentials (Req 17.1)', async () => {
      const user = await seedTestUser('ADMIN', { password: 'TestPass@1234' });

      const res = await request(testApp)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'TestPass@1234' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeTruthy();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.role).toBe('ADMIN');
      expect(res.body.data.user).not.toHaveProperty('password_hash');
    });

    it('returns 401 on wrong password (Req 17.2)', async () => {
      await seedTestUser('SALES', { password: 'CorrectPass@1' });

      const res = await request(testApp)
        .post('/api/auth/login')
        .send({ email: 'sales@test.example.com', password: 'WrongPass@1' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('returns 401 for non-existent email without revealing detail', async () => {
      const res = await request(testApp)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.example.com', password: 'AnyPass@1' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('returns 422 on missing required fields', async () => {
      const res = await request(testApp)
        .post('/api/auth/login')
        .send({ email: 'test@test.com' }); // missing password

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns user profile with valid token', async () => {
      const user = await seedTestUser('WAREHOUSE');
      const token = generateToken('WAREHOUSE', user.id);

      const res = await request(testApp)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
    });

    it('returns 401 without token (Req 17.3)', async () => {
      const res = await request(testApp).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns 401 with malformed token', async () => {
      const res = await request(testApp)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer not.a.valid.token');

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid token');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('returns 200 with success message', async () => {
      const user = await seedTestUser('ACCOUNTS');
      const token = generateToken('ACCOUNTS', user.id);

      const res = await request(testApp)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });
});
