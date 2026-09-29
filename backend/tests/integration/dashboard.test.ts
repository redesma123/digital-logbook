import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

describe('Dashboard Integration', () => {
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

    // Create a dedicated unit for dashboard tests
    const testUnit = await prisma.units.create({
      data: {
        plant_id: 1,
        unit_code: 'U_DASH',
        name: 'Dashboard Test Unit',
        current_status: 'RUNNING',
      },
    });
    testUnitId = testUnit.id;

    // Seed test logbook entries for this unit
    // Today entry
    const todayStr = new Date().toISOString().split('T')[0];
    await prisma.logbook_entries.create({
      data: {
        unit_id: testUnitId,
        operator_id: 2, // operator1
        date: new Date(todayStr + 'T00:00:00Z'),
        shift: 'PAGI',
        unit_status: 'RUNNING',
        hour_meter_start: 100,
        hour_meter_end: 108,
        running_hours: 8,
        notes: 'Hari ini normal',
        params_electrical: {
          create: {
            voltage_v: 400,
            frequency_hz: 50,
            active_power_kw: 500,
            energy_production_kwh: 4000,
          },
        },
        params_hydraulic: {
          create: {
            flow_rate_m3s: 2.5,
            water_level_m: 2.0,
          },
        },
      },
    });

    // Past entry
    await prisma.logbook_entries.create({
      data: {
        unit_id: testUnitId,
        operator_id: 2,
        date: new Date('2026-09-15T00:00:00Z'),
        shift: 'SIANG',
        unit_status: 'RUNNING',
        hour_meter_start: 92,
        hour_meter_end: 100,
        running_hours: 8,
        params_electrical: {
          create: {
            voltage_v: 395,
            frequency_hz: 49.9,
            active_power_kw: 480,
            energy_production_kwh: 3840,
          },
        },
        params_hydraulic: {
          create: {
            flow_rate_m3s: 2.3,
            water_level_m: 1.9,
          },
        },
      },
    });

    // Active incident (OPEN)
    await prisma.incidents.create({
      data: {
        unit_id: testUnitId,
        reported_by_id: 2,
        occurred_at: new Date(),
        equipment: 'Turbin',
        incident_type: 'Vibrasi',
        description: 'Vibrasi agak tinggi',
        status: 'OPEN',
      },
    });

    // Active maintenance (PLAN)
    await prisma.maintenance_records.create({
      data: {
        unit_id: testUnitId,
        created_by_id: 2,
        equipment: 'Generator',
        work_type: 'Preventive',
        description: 'Pembersihan bulanan',
        status: 'PLAN',
      },
    });
  });

  afterAll(async () => {
    if (testUnitId) {
      await prisma.incident_status_histories.deleteMany({
        where: { incident: { unit_id: testUnitId } },
      });
      await prisma.maintenance_status_histories.deleteMany({
        where: { maintenance: { unit_id: testUnitId } },
      });
      await prisma.incidents.deleteMany({ where: { unit_id: testUnitId } });
      await prisma.maintenance_records.deleteMany({ where: { unit_id: testUnitId } });
      await prisma.params_electrical.deleteMany({
        where: { logbook: { unit_id: testUnitId } },
      });
      await prisma.params_mechanical.deleteMany({
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
    it('GET /api/v1/dashboard/summary without auth should return 401', async () => {
      const res = await request(app).get(`/api/v1/dashboard/summary?unit_id=${testUnitId}`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/dashboard/summary as OPERATOR should return 403', async () => {
      const res = await request(app)
        .get(`/api/v1/dashboard/summary?unit_id=${testUnitId}`)
        .set('Authorization', `Bearer ${operatorToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/dashboard/chart without auth should return 401', async () => {
      const res = await request(app).get(`/api/v1/dashboard/chart?unit_id=${testUnitId}&parameter=active_power_kw`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/dashboard/chart as OPERATOR should return 403', async () => {
      const res = await request(app)
        .get(`/api/v1/dashboard/chart?unit_id=${testUnitId}&parameter=active_power_kw`)
        .set('Authorization', `Bearer ${operatorToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Validation', () => {
    it('GET /api/v1/dashboard/summary without unit_id should return 400', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${supervisorToken}`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/dashboard/summary with non-existent unit_id should return 404', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary?unit_id=99999')
        .set('Authorization', `Bearer ${supervisorToken}`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/dashboard/chart without parameter should return 400', async () => {
      const res = await request(app)
        .get(`/api/v1/dashboard/chart?unit_id=${testUnitId}`)
        .set('Authorization', `Bearer ${supervisorToken}`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/dashboard/chart with invalid parameter should return 400', async () => {
      const res = await request(app)
        .get(`/api/v1/dashboard/chart?unit_id=${testUnitId}&parameter=invalid_param`)
        .set('Authorization', `Bearer ${supervisorToken}`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/dashboard/chart with invalid date format should return 400', async () => {
      const res = await request(app)
        .get(`/api/v1/dashboard/chart?unit_id=${testUnitId}&parameter=active_power_kw&from=invalid-date`)
        .set('Authorization', `Bearer ${supervisorToken}`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/dashboard/summary', () => {
    it('should return summary for unit as SUPERVISOR', async () => {
      const res = await request(app)
        .get(`/api/v1/dashboard/summary?unit_id=${testUnitId}`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.unit).toBeDefined();
      expect(res.body.data.unit.id).toBe(testUnitId);
      expect(res.body.data.unit.current_status).toBe('RUNNING');
      expect(res.body.data.latest_entry).toBeDefined();
      expect(res.body.data.latest_entry.shift).toBe('PAGI');
      expect(res.body.data.today_energy_kwh).toBe(4000);
      expect(res.body.data.active_incidents_count).toBe(1);
      expect(res.body.data.active_maintenance_count).toBe(1);
    });

    it('should return summary as ADMIN', async () => {
      const res = await request(app)
        .get(`/api/v1/dashboard/summary?unit_id=${testUnitId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/dashboard/chart', () => {
    it('should return electrical parameter points', async () => {
      const res = await request(app)
        .get(`/api/v1/dashboard/chart?unit_id=${testUnitId}&parameter=active_power_kw&from=2026-09-01&to=2026-09-30`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0]).toHaveProperty('date');
      expect(res.body.data[0]).toHaveProperty('shift');
      expect(res.body.data[0]).toHaveProperty('value');
    });

    it('should return hydraulic parameter points', async () => {
      const res = await request(app)
        .get(`/api/v1/dashboard/chart?unit_id=${testUnitId}&parameter=flow_rate_m3s`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should return 404 for non-existent unit_id in chart', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/chart?unit_id=99999&parameter=active_power_kw')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
