import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

describe('Auth Endpoints Integration', () => {
  let accessToken = '';
  let refreshToken = '';

  beforeAll(async () => {
    await prisma.refresh_tokens.deleteMany({});
  });

  afterAll(async () => {
    await prisma.refresh_tokens.deleteMany({});
  });

  it('POST /api/v1/auth/login with valid credentials should return 200 and tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Login berhasil');
    expect(res.body.data).toBeDefined();
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user).toEqual({
      id: expect.any(Number),
      username: 'admin',
      fullName: 'Administrator',
      role: 'ADMIN',
    });

    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('POST /api/v1/auth/login with wrong password should return 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Username atau password salah');
  });

  it('GET /api/v1/auth/me with Bearer token should return 200 with user profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Data profil berhasil diambil');
    expect(res.body.data).toEqual({
      id: expect.any(Number),
      username: 'admin',
      fullName: 'Administrator',
      role: 'ADMIN',
    });
  });

  it('POST /api/v1/auth/refresh with refreshToken should return 200 with new accessToken', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Token berhasil diperbarui');
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('POST /api/v1/auth/logout with Bearer and refreshToken should return 200', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Logout berhasil');
  });

  it('GET /api/v1/auth/me without token should return 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Token tidak ditemukan');
  });
});
