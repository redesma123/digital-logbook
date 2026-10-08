import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

describe('Units CRUD Integration', () => {
  let adminToken = '';
  let operatorToken = '';
  let createdUnitId: number;

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

  it('GET /api/v1/units without auth should return 401', async () => {
    const res = await request(app).get('/api/v1/units');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/units as OPERATOR should return 200 with list of units and plant info', async () => {
    const res = await request(app)
      .get('/api/v1/units')
      .set('Authorization', `Bearer ${operatorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].id).toBeDefined();
    expect(res.body.data[0].unit_code).toBeDefined();
    expect(res.body.data[0].plant).toBeDefined();
    expect(res.body.data[0].plant.name).toBeDefined();
  });

  it('GET /api/v1/units with plant_id filter should return only units of that plant', async () => {
    const res = await request(app)
      .get('/api/v1/units?plant_id=1')
      .set('Authorization', `Bearer ${operatorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    for (const u of res.body.data) {
      expect(u.plant_id).toBe(1);
    }
  });

  it('POST /api/v1/units as OPERATOR should return 403', async () => {
    const res = await request(app)
      .post('/api/v1/units')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({ plant_id: 1, unit_code: 'U3', name: 'Unit 3' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/units with nonexistent plant_id should return 404', async () => {
    const res = await request(app)
      .post('/api/v1/units')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ plant_id: 99999, unit_code: 'U99', name: 'Unit 99' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Plant tidak ditemukan');
  });

  it('POST /api/v1/units with invalid body should return 400', async () => {
    const res = await request(app)
      .post('/api/v1/units')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ plant_id: -1, unit_code: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/units as ADMIN should create unit (201)', async () => {
    const res = await request(app)
      .post('/api/v1/units')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        plant_id: 1,
        unit_code: `U_TEST_${Date.now()}`,
        name: 'Unit Test Integration',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.plant_id).toBe(1);
    expect(res.body.data.plant).toBeDefined();

    createdUnitId = res.body.data.id;
  });

  it('GET /api/v1/units/:id should return unit details with plant info', async () => {
    const res = await request(app)
      .get(`/api/v1/units/${createdUnitId}`)
      .set('Authorization', `Bearer ${operatorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdUnitId);
    expect(res.body.data.name).toBe('Unit Test Integration');
    expect(res.body.data.plant).toBeDefined();
  });

  it('GET /api/v1/units/99999 should return 404', async () => {
    const res = await request(app)
      .get('/api/v1/units/99999')
      .set('Authorization', `Bearer ${operatorToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/v1/units/:id as OPERATOR should return 403', async () => {
    const res = await request(app)
      .patch(`/api/v1/units/${createdUnitId}`)
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({ name: 'Hacked Unit' });

    expect(res.status).toBe(403);
  });

  it('PATCH /api/v1/units/:id as ADMIN should update unit', async () => {
    const res = await request(app)
      .patch(`/api/v1/units/${createdUnitId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Unit Test Integration Updated',
        current_status: 'RUNNING',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Unit Test Integration Updated');
    expect(res.body.data.current_status).toBe('RUNNING');
  });

  it('PATCH /api/v1/units/99999 should return 404', async () => {
    const res = await request(app)
      .patch('/api/v1/units/99999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Nonexistent' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
