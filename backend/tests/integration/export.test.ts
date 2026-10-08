import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

describe('Export Integration', () => {
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

    // Create dedicated unit for export tests
    const testUnit = await prisma.units.create({
      data: {
        plant_id: 1,
        unit_code: 'U_EXPORT',
        name: 'Export Test Unit',
        current_status: 'RUNNING',
      },
    });
    testUnitId = testUnit.id;

    // Seed logbook entry
    await prisma.logbook_entries.create({
      data: {
        unit_id: testUnitId,
        operator_id: 2,
        date: new Date('2026-09-28T00:00:00Z'),
        shift: 'PAGI',
        unit_status: 'RUNNING',
        hour_meter_start: 1000,
        hour_meter_end: 1008,
        running_hours: 8,
        notes: 'Test export logbook',
        params_electrical: {
          create: {
            voltage_v: 400,
            current_a: 650,
            frequency_hz: 50,
            active_power_kw: 450,
            energy_production_kwh: 3600,
          },
        },
      },
    });

    // Seed incident
    await prisma.incidents.create({
      data: {
        unit_id: testUnitId,
        reported_by_id: 2,
        occurred_at: new Date('2026-09-28T10:00:00Z'),
        equipment: 'Generator',
        incident_type: 'Overheat',
        description: 'Temperatur tinggi',
        status: 'OPEN',
      },
    });

    // Seed maintenance
    await prisma.maintenance_records.create({
      data: {
        unit_id: testUnitId,
        created_by_id: 2,
        equipment: 'Turbin',
        work_type: 'Preventive',
        description: 'Inspeksi berkala',
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
      await prisma.logbook_entries.deleteMany({ where: { unit_id: testUnitId } });
      await prisma.units.delete({ where: { id: testUnitId } }).catch(() => {});
    }
  });

  describe('Authentication & Authorization', () => {
    it('GET /api/v1/export/logbook without auth should return 401', async () => {
      const res = await request(app).get('/api/v1/export/logbook');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/export/logbook as OPERATOR should return 403', async () => {
      const res = await request(app)
        .get('/api/v1/export/logbook')
        .set('Authorization', `Bearer ${operatorToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/export/incidents without auth should return 401', async () => {
      const res = await request(app).get('/api/v1/export/incidents');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/export/incidents as OPERATOR should return 403', async () => {
      const res = await request(app)
        .get('/api/v1/export/incidents')
        .set('Authorization', `Bearer ${operatorToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/export/maintenance without auth should return 401', async () => {
      const res = await request(app).get('/api/v1/export/maintenance');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/export/maintenance as OPERATOR should return 403', async () => {
      const res = await request(app)
        .get('/api/v1/export/maintenance')
        .set('Authorization', `Bearer ${operatorToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/export/logbook', () => {
    it('should export logbook as XLSX with correct headers', async () => {
      const res = await request(app)
        .get(`/api/v1/export/logbook?unit_id=${testUnitId}&format=xlsx`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(res.headers['content-disposition']).toContain('attachment; filename="logbook-export.xlsx"');
      expect(res.body).toBeDefined();
    });

    it('should export logbook as CSV with correct headers and content', async () => {
      const res = await request(app)
        .get(`/api/v1/export/logbook?unit_id=${testUnitId}&format=csv`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment; filename="logbook-export.csv"');
      expect(res.text).toContain('ID');
      expect(res.text).toContain('Unit');
      expect(res.text).toContain('Shift');
      expect(res.text).toContain('PAGI');
    });

    it('should default to XLSX format if format query param is omitted', async () => {
      const res = await request(app)
        .get(`/api/v1/export/logbook?unit_id=${testUnitId}`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(res.headers['content-disposition']).toContain('attachment; filename="logbook-export.xlsx"');
    });
  });

  describe('GET /api/v1/export/incidents', () => {
    it('should export incidents as XLSX', async () => {
      const res = await request(app)
        .get(`/api/v1/export/incidents?unit_id=${testUnitId}&format=xlsx`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(res.headers['content-disposition']).toContain('attachment; filename="incidents-export.xlsx"');
    });

    it('should export incidents as CSV', async () => {
      const res = await request(app)
        .get(`/api/v1/export/incidents?unit_id=${testUnitId}&format=csv`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment; filename="incidents-export.csv"');
      expect(res.text).toContain('ID');
      expect(res.text).toContain('Peralatan');
      expect(res.text).toContain('Generator');
    });
  });

  describe('GET /api/v1/export/maintenance', () => {
    it('should export maintenance as XLSX', async () => {
      const res = await request(app)
        .get(`/api/v1/export/maintenance?unit_id=${testUnitId}&format=xlsx`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(res.headers['content-disposition']).toContain('attachment; filename="maintenance-export.xlsx"');
    });

    it('should export maintenance as CSV', async () => {
      const res = await request(app)
        .get(`/api/v1/export/maintenance?unit_id=${testUnitId}&format=csv`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment; filename="maintenance-export.csv"');
      expect(res.text).toContain('ID');
      expect(res.text).toContain('Jenis Pekerjaan');
      expect(res.text).toContain('Turbin');
    });
  });
});
