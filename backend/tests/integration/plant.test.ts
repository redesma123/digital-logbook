import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

describe('Plants CRUD Integration', () => {
  let adminToken = '';
  let operatorToken = '';
  let createdPlantId: number;

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

  it('GET /api/v1/plants without auth should return 401', async () => {
    const res = await request(app).get('/api/v1/plants');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/plants as OPERATOR should return 200 with plants list and units count', async () => {
    const res = await request(app)
      .get('/api/v1/plants')
      .set('Authorization', `Bearer ${operatorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].id).toBeDefined();
    expect(res.body.data[0].name).toBeDefined();
    expect(res.body.data[0]._count).toBeDefined();
    expect(typeof res.body.data[0]._count.units).toBe('number');
  });

  it('POST /api/v1/plants as OPERATOR should return 403', async () => {
    const res = await request(app)
      .post('/api/v1/plants')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({ name: 'PLTMH Forbidden', location: 'Nowhere' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/plants as ADMIN with invalid body should return 400', async () => {
    const res = await request(app)
      .post('/api/v1/plants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/plants as ADMIN should create new plant (201)', async () => {
    const res = await request(app)
      .post('/api/v1/plants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'PLTMH Lodagung',
        location: 'Blitar',
        capacity_kw: 1200,
        design_flow_m3s: 5.0,
        design_head_m: 15.0,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.name).toBe('PLTMH Lodagung');
    expect(res.body.data.location).toBe('Blitar');

    createdPlantId = res.body.data.id;
  });

  it('GET /api/v1/plants/:id should return plant details with units included', async () => {
    const res = await request(app)
      .get(`/api/v1/plants/${createdPlantId}`)
      .set('Authorization', `Bearer ${operatorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdPlantId);
    expect(res.body.data.name).toBe('PLTMH Lodagung');
    expect(Array.isArray(res.body.data.units)).toBe(true);
  });

  it('GET /api/v1/plants/99999 should return 404', async () => {
    const res = await request(app)
      .get('/api/v1/plants/99999')
      .set('Authorization', `Bearer ${operatorToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/v1/plants/:id as OPERATOR should return 403', async () => {
    const res = await request(app)
      .patch(`/api/v1/plants/${createdPlantId}`)
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({ name: 'Hacked Name' });

    expect(res.status).toBe(403);
  });

  it('PATCH /api/v1/plants/:id as ADMIN should update plant', async () => {
    const res = await request(app)
      .patch(`/api/v1/plants/${createdPlantId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'PLTMH Lodagung Updated',
        capacity_kw: 1300,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('PLTMH Lodagung Updated');
    expect(res.body.data.capacity_kw).toBe(1300);
  });

  it('PATCH /api/v1/plants/99999 should return 404', async () => {
    const res = await request(app)
      .patch('/api/v1/plants/99999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Nonexistent' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
