import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

describe('Users CRUD Integration', () => {
  let adminToken = '';
  let operatorToken = '';
  let createdUserId: number;

  beforeAll(async () => {
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    adminToken = adminLogin.body.data.accessToken;

    const opLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'operator1', password: 'operator123' });
    operatorToken = opLogin.body.data.accessToken;
  });

  it('GET /api/v1/users without auth should return 401', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/users as OPERATOR should return 403', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${operatorToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/users as ADMIN should return paginated users without password_hash', async () => {
    const res = await request(app)
      .get('/api/v1/users?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.users).toBeDefined();
    expect(Array.isArray(res.body.data.users)).toBe(true);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.page).toBe(1);

    for (const u of res.body.data.users) {
      expect(u.password_hash).toBeUndefined();
      expect(u.password).toBeUndefined();
      expect(u.id).toBeDefined();
      expect(u.username).toBeDefined();
    }
  });

  it('GET /api/v1/users with role filter should return only matching users', async () => {
    const res = await request(app)
      .get('/api/v1/users?role=OPERATOR')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.users.length).toBeGreaterThan(0);
    for (const u of res.body.data.users) {
      expect(u.role).toBe('OPERATOR');
    }
  });

  it('POST /api/v1/users as ADMIN should create new user (201)', async () => {
    const testUsername = `testuser_${Date.now()}`;
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: testUsername,
        password: 'password123',
        fullName: 'Test Operator User',
        role: 'OPERATOR',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.username).toBe(testUsername);
    expect(res.body.data.full_name).toBe('Test Operator User');
    expect(res.body.data.role).toBe('OPERATOR');
    expect(res.body.data.is_active).toBe(true);
    expect(res.body.data.password_hash).toBeUndefined();

    createdUserId = res.body.data.id;
  });

  it('POST /api/v1/users with duplicate username should return 409', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: 'admin',
        password: 'password123',
        fullName: 'Duplicate Admin',
        role: 'ADMIN',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('sudah digunakan');
  });

  it('POST /api/v1/users with invalid body should return 400', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: 'ab', // min 3
        password: '123', // min 6
        fullName: '',
        role: 'INVALID_ROLE',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/users/:id should return user details without password_hash', async () => {
    const res = await request(app)
      .get(`/api/v1/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdUserId);
    expect(res.body.data.password_hash).toBeUndefined();
  });

  it('GET /api/v1/users/99999 should return 404', async () => {
    const res = await request(app)
      .get('/api/v1/users/99999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/v1/users/:id should update user', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Updated Name',
        role: 'SUPERVISOR',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.full_name).toBe('Updated Name');
    expect(res.body.data.role).toBe('SUPERVISOR');
    expect(res.body.data.password_hash).toBeUndefined();
  });

  it('PATCH /api/v1/users/99999 should return 404', async () => {
    const res = await request(app)
      .patch('/api/v1/users/99999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: 'Updated' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/v1/users/:id should soft delete user (is_active = false)', async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.is_active).toBe(false);
    expect(res.body.data.password_hash).toBeUndefined();
  });

  it('DELETE /api/v1/users/99999 should return 404', async () => {
    const res = await request(app)
      .delete('/api/v1/users/99999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
