import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

describe('Analytics Integration', () => {
  let adminToken = '';
  let operatorToken = '';
  let supervisorToken = '';
  let testUnitId: number;

  beforeAll(async () => {
    // Authenticate users
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    adminToken = adminLogin.body.data.accessToken;

    const opLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'operator1', password: 'operator123' });
    operatorToken = opLogin.body.data.accessToken;

    const supLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'supervisor1', password: 'supervisor123' });
    supervisorToken = supLogin.body.data.accessToken;

    // Ensure plant 1 has capacity_kw = 1500, design_flow_m3s = 3.5
    await prisma.plants.update({
      where: { id: 1 },
      data: {
        capacity_kw: 1500,
        design_flow_m3s: 3.5,
      },
    });

    // Create a dedicated unit for analytics tests
    const testUnit = await prisma.units.create({
      data: {
        plant_id: 1,
        unit_code: 'U_ANALYTICS',
        name: 'Analytics Test Unit',
        current_status: 'RUNNING',
      },
    });
    testUnitId = testUnit.id;

    // Create current period entries: 2026-09-01 and 2026-09-02 (2 days = 48 hours)
    // Entry 1: 8 running hours, 3600 kWh, 3.5 m3/s flow
    await prisma.logbook_entries.create({
      data: {
        unit_id: testUnitId,
        operator_id: 2,
        date: new Date('2026-09-01T00:00:00Z'),
        shift: 'PAGI',
        unit_status: 'RUNNING',
        running_hours: 8,
        params_electrical: {
          create: {
            energy_production_kwh: 3600,
          },
        },
        params_hydraulic: {
          create: {
            flow_rate_m3s: 3.5,
          },
        },
      },
    });

    // Entry 2: 8 running hours, 3600 kWh, 3.5 m3/s flow
    await prisma.logbook_entries.create({
      data: {
        unit_id: testUnitId,
        operator_id: 2,
        date: new Date('2026-09-02T00:00:00Z'),
        shift: 'PAGI',
        unit_status: 'RUNNING',
        running_hours: 8,
        params_electrical: {
          create: {
            energy_production_kwh: 3600,
          },
        },
        params_hydraulic: {
          create: {
            flow_rate_m3s: 3.5,
          },
        },
      },
    });

    // Previous period of 2 days: from - 2 days = 2026-08-30 to 2026-08-31
    // Previous Entry 1: 6 running hours, 2000 kWh
    await prisma.logbook_entries.create({
      data: {
        unit_id: testUnitId,
        operator_id: 2,
        date: new Date('2026-08-31T00:00:00Z'),
        shift: 'PAGI',
        unit_status: 'RUNNING',
        running_hours: 6,
        params_electrical: {
          create: {
            energy_production_kwh: 2000,
          },
        },
      },
    });
  });

  afterAll(async () => {
    if (testUnitId) {
      await prisma.params_electrical.deleteMany({
        where: { logbook: { unit_id: testUnitId } },
      });
      await prisma.params_hydraulic.deleteMany({
        where: { logbook: { unit_id: testUnitId } },
      });
      await prisma.logbook_entries.deleteMany({ where: { unit_id: testUnitId } });
      await prisma.units.delete({ where: { id: testUnitId } }).catch(() => {});
    }
  });

  describe('Authentication & Authorization', () => {
    it('GET /api/v1/analytics/performance without auth should return 401', async () => {
      const res = await request(app)
        .get(`/api/v1/analytics/performance?unit_id=${testUnitId}&from=2026-09-01&to=2026-09-02`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/analytics/performance as OPERATOR should return 403', async () => {
      const res = await request(app)
        .get(`/api/v1/analytics/performance?unit_id=${testUnitId}&from=2026-09-01&to=2026-09-02`)
        .set('Authorization', `Bearer ${operatorToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Validation', () => {
    it('GET /api/v1/analytics/performance missing parameters should return 400', async () => {
      const res = await request(app)
        .get(`/api/v1/analytics/performance?unit_id=${testUnitId}`)
        .set('Authorization', `Bearer ${supervisorToken}`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/analytics/performance invalid date format should return 400', async () => {
      const res = await request(app)
        .get(`/api/v1/analytics/performance?unit_id=${testUnitId}&from=01-09-2026&to=02-09-2026`)
        .set('Authorization', `Bearer ${supervisorToken}`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/analytics/performance nonexistent unit_id should return 404', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/performance?unit_id=99999&from=2026-09-01&to=2026-09-02')
        .set('Authorization', `Bearer ${supervisorToken}`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Performance Analytics Calculation', () => {
    it('should compute correct KPIs for the period and compare with previous period', async () => {
      const res = await request(app)
        .get(`/api/v1/analytics/performance?unit_id=${testUnitId}&from=2026-09-01&to=2026-09-02`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Data analitik performa berhasil dihitung');

      const data = res.body.data;
      expect(data.period).toEqual({ from: '2026-09-01', to: '2026-09-02' });

      // Period hours = 2 days * 24 = 48 hours
      // Total running hours = 8 + 8 = 16 hours
      // Availability = (16 / 48) * 100 = 33.33%
      expect(data.availability_pct).toBeCloseTo(33.33, 1);

      // Total energy = 3600 + 3600 = 7200 kWh
      expect(data.total_energy_kwh).toBe(7200);

      // Capacity factor = (7200 / (1500 * 48)) * 100 = (7200 / 72000) * 100 = 10.0%
      expect(data.capacity_factor_pct).toBeCloseTo(10.0, 1);

      // Avg flow rate = (3.5 + 3.5) / 2 = 3.5
      // Avg flow utilization = (3.5 / 3.5) * 100 = 100%
      expect(data.avg_flow_utilization_pct).toBe(100);

      // Trend vs previous period:
      // Prev period (2026-08-30 to 2026-08-31, 48 hours):
      // Prev running hours = 6 -> prev availability = (6 / 48) * 100 = 12.5%
      // Availability delta = 33.33 - 12.5 = 20.83%
      // Prev energy = 2000 -> prev CF = (2000 / 72000) * 100 = 2.78%
      // Capacity factor delta = 10.0 - 2.78 = 7.22%
      expect(data.trend_vs_previous_period).toBeDefined();
      expect(data.trend_vs_previous_period.availability_delta).toBeCloseTo(20.83, 1);
      expect(data.trend_vs_previous_period.capacity_factor_delta).toBeCloseTo(7.22, 1);
    });

    it('should allow access for ADMIN role', async () => {
      const res = await request(app)
        .get(`/api/v1/analytics/performance?unit_id=${testUnitId}&from=2026-09-01&to=2026-09-02`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
