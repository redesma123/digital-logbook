import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

describe('Logbook CRUD Integration', () => {
  let adminToken = '';
  let operatorToken = '';
  let supervisorToken = '';
  let createdLogbookId: number;
  let oldLogbookId: number;

  beforeAll(async () => {
    // Clean up any existing logbook entries to make tests idempotent
    await prisma.params_electrical.deleteMany({});
    await prisma.params_mechanical.deleteMany({});
    await prisma.params_hydraulic.deleteMany({});
    await prisma.logbook_entries.deleteMany({});

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
  });

  afterAll(async () => {
    await prisma.params_electrical.deleteMany({});
    await prisma.params_mechanical.deleteMany({});
    await prisma.params_hydraulic.deleteMany({});
    await prisma.logbook_entries.deleteMany({});
  });

  describe('Authentication & Authorization', () => {
    it('GET /api/v1/logbook without auth should return 401', async () => {
      const res = await request(app).get('/api/v1/logbook');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/logbook without auth should return 401', async () => {
      const res = await request(app)
        .post('/api/v1/logbook')
        .send({ unit_id: 1, date: '2026-09-30', shift: 'PAGI', unit_status: 'RUNNING' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/logbook/latest-counter without auth should return 401', async () => {
      const res = await request(app).get('/api/v1/logbook/latest-counter?unit_id=1');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/logbook as ADMIN should return 403 (only OPERATOR & SUPERVISOR allowed)', async () => {
      const res = await request(app)
        .post('/api/v1/logbook')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ unit_id: 1, date: '2026-09-30', shift: 'PAGI', unit_status: 'RUNNING' });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Validation', () => {
    it('POST /api/v1/logbook with invalid date format should return 400', async () => {
      const res = await request(app)
        .post('/api/v1/logbook')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          unit_id: 1,
          date: '30-09-2026',
          shift: 'PAGI',
          unit_status: 'RUNNING',
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/logbook with invalid shift should return 400', async () => {
      const res = await request(app)
        .post('/api/v1/logbook')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          unit_id: 1,
          date: '2026-09-30',
          shift: 'SORE',
          unit_status: 'RUNNING',
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/logbook with electrical params out of range should return 400', async () => {
      const res = await request(app)
        .post('/api/v1/logbook')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          unit_id: 1,
          date: '2026-09-30',
          shift: 'PAGI',
          unit_status: 'RUNNING',
          electrical: {
            voltage_v: 600, // max is 500
          },
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/logbook with mechanical params out of range should return 400', async () => {
      const res = await request(app)
        .post('/api/v1/logbook')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          unit_id: 1,
          date: '2026-09-30',
          shift: 'PAGI',
          unit_status: 'RUNNING',
          mechanical: {
            rpm: 2500, // max is 2000
          },
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/logbook with nonexistent unit_id should return 404', async () => {
      const res = await request(app)
        .post('/api/v1/logbook')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          unit_id: 99999,
          date: '2026-09-30',
          shift: 'PAGI',
          unit_status: 'RUNNING',
        });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unit tidak ditemukan');
    });

    it('POST /api/v1/logbook with hour_meter_end < hour_meter_start should return 422', async () => {
      const res = await request(app)
        .post('/api/v1/logbook')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          unit_id: 1,
          date: '2026-09-30',
          shift: 'PAGI',
          unit_status: 'RUNNING',
          hour_meter_start: 100,
          hour_meter_end: 90,
        });
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('hour_meter_end');
    });
  });

  describe('Creation & Transactional Behavior', () => {
    it('POST /api/v1/logbook with full params creates entry + 3 parameter records and calculates running_hours', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await request(app)
        .post('/api/v1/logbook')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          unit_id: 1,
          date: today,
          shift: 'PAGI',
          unit_status: 'RUNNING',
          hour_meter_start: 100,
          hour_meter_end: 106.5,
          // running_hours omitted -> should calculate 6.5
          notes: 'Shift pagi berjalan normal',
          electrical: {
            voltage_v: 380,
            current_a: 150,
            frequency_hz: 50,
            active_power_kw: 95,
            reactive_power_kvar: 20,
            power_factor: 0.98,
            energy_production_kwh: 570,
            generator_status: 'NORMAL',
          },
          mechanical: {
            rpm: 1500,
            bearing_temp_c: 55,
            generator_temp_c: 65,
            turbine_temp_c: 50,
            vibration_mms: 2.5,
          },
          hydraulic: {
            flow_rate_m3s: 2.1,
            water_level_m: 3.5,
            head_m: 18.5,
            pressure_bar: 1.8,
            intake_condition: 'BERSIH',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Entri logbook berhasil disimpan');
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.running_hours).toBe(6.5);
      expect(res.body.data.unit).toBeDefined();
      expect(res.body.data.unit.unit_code).toBe('U1');
      expect(res.body.data.operator).toBeDefined();
      expect(res.body.data.operator.username).toBe('operator1');

      // Verify parameter records created
      expect(res.body.data.params_electrical).toBeDefined();
      expect(res.body.data.params_electrical.voltage_v).toBe(380);
      expect(res.body.data.params_mechanical).toBeDefined();
      expect(res.body.data.params_mechanical.rpm).toBe(1500);
      expect(res.body.data.params_hydraulic).toBeDefined();
      expect(res.body.data.params_hydraulic.flow_rate_m3s).toBe(2.1);

      createdLogbookId = res.body.data.id;
    });

    it('POST /api/v1/logbook duplicate (unit_id, date, shift) should return 409', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await request(app)
        .post('/api/v1/logbook')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          unit_id: 1,
          date: today,
          shift: 'PAGI',
          unit_status: 'RUNNING',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Entri logbook untuk unit, tanggal, dan shift ini sudah ada');
    });
  });

  describe('Latest Counter', () => {
    it('GET /api/v1/logbook/latest-counter without unit_id should return 400', async () => {
      const res = await request(app)
        .get('/api/v1/logbook/latest-counter')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/logbook/latest-counter for unit 1 should return latest stand meter data', async () => {
      const res = await request(app)
        .get('/api/v1/logbook/latest-counter?unit_id=1')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.unit_id).toBe(1);
      expect(res.body.data.hour_meter_end).toBe(106.5);
      expect(res.body.data.last_shift).toBe('PAGI');
      expect(res.body.data.last_operator).toBe('Budi Operator');
      expect(res.body.data.unit_status).toBe('RUNNING');
    });

    it('GET /api/v1/logbook/latest-counter for unit with no entries should return null data with unit_id', async () => {
      const res = await request(app)
        .get('/api/v1/logbook/latest-counter?unit_id=2')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.unit_id).toBe(2);
      expect(res.body.data.hour_meter_end).toBeNull();
      expect(res.body.data.last_date).toBeNull();
      expect(res.body.data.last_shift).toBeNull();
      expect(res.body.data.last_operator).toBeNull();
    });

    it('GET /api/v1/logbook/latest-counter for nonexistent unit should return 404', async () => {
      const res = await request(app)
        .get('/api/v1/logbook/latest-counter?unit_id=99999')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('List & Filtering', () => {
    it('GET /api/v1/logbook as OPERATOR should return paginated list', async () => {
      const res = await request(app)
        .get('/api/v1/logbook?page=1&limit=10')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toBeDefined();
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/v1/logbook with unit_id filter should return matching entries', async () => {
      const res = await request(app)
        .get('/api/v1/logbook?unit_id=1')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      for (const item of res.body.data.items) {
        expect(item.unit_id).toBe(1);
      }
    });

    it('GET /api/v1/logbook with shift filter should return matching entries', async () => {
      const res = await request(app)
        .get('/api/v1/logbook?shift=PAGI')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      for (const item of res.body.data.items) {
        expect(item.shift).toBe('PAGI');
      }
    });
  });

  describe('Get By ID', () => {
    it('GET /api/v1/logbook/:id should return detail with relations', async () => {
      const res = await request(app)
        .get(`/api/v1/logbook/${createdLogbookId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdLogbookId);
      expect(res.body.data.unit).toBeDefined();
      expect(res.body.data.operator).toBeDefined();
      expect(res.body.data.params_electrical).toBeDefined();
      expect(res.body.data.params_mechanical).toBeDefined();
      expect(res.body.data.params_hydraulic).toBeDefined();
    });

    it('GET /api/v1/logbook/99999 should return 404', async () => {
      const res = await request(app)
        .get('/api/v1/logbook/99999')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Update & 24h Business Rule', () => {
    it('PATCH /api/v1/logbook/:id as OPERATOR within 24h should update entry and upsert params', async () => {
      const res = await request(app)
        .patch(`/api/v1/logbook/${createdLogbookId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          notes: 'Catatan diperbarui oleh operator',
          electrical: {
            voltage_v: 390,
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notes).toBe('Catatan diperbarui oleh operator');
      expect(res.body.data.params_electrical.voltage_v).toBe(390);
    });

    it('Create an old logbook entry (> 24h ago) directly in DB to test 24h rule', async () => {
      // Create entry dated in 2024 (well beyond 24h ago)
      const oldEntry = await prisma.logbook_entries.create({
        data: {
          unit_id: 1,
          operator_id: 2, // operator1
          date: new Date('2024-01-10T00:00:00Z'),
          shift: 'PAGI',
          unit_status: 'RUNNING',
          hour_meter_start: 50,
          hour_meter_end: 56,
          running_hours: 6,
          notes: 'Old entry',
        },
      });
      oldLogbookId = oldEntry.id;
    });

    it('PATCH /api/v1/logbook/:id as OPERATOR after 24h should return 403', async () => {
      const res = await request(app)
        .patch(`/api/v1/logbook/${oldLogbookId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          notes: 'Operator trying to edit old entry',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('24 jam');
    });

    it('PATCH /api/v1/logbook/:id as SUPERVISOR after 24h should succeed', async () => {
      const res = await request(app)
        .patch(`/api/v1/logbook/${oldLogbookId}`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({
          notes: 'Supervisor editing old entry successfully',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notes).toBe('Supervisor editing old entry successfully');
    });

    it('PATCH /api/v1/logbook/99999 should return 404', async () => {
      const res = await request(app)
        .patch('/api/v1/logbook/99999')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ notes: 'Nonexistent' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Delete (Soft Delete)', () => {
    it('DELETE /api/v1/logbook/:id as OPERATOR should return 403', async () => {
      const res = await request(app)
        .delete(`/api/v1/logbook/${oldLogbookId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('DELETE /api/v1/logbook/:id as SUPERVISOR should return 200 (soft delete)', async () => {
      const res = await request(app)
        .delete(`/api/v1/logbook/${oldLogbookId}`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Entri logbook berhasil dihapus');
    });

    it('GET /api/v1/logbook/:id after soft-delete should return 404', async () => {
      const res = await request(app)
        .get(`/api/v1/logbook/${oldLogbookId}`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/logbook list should exclude soft-deleted entry', async () => {
      const res = await request(app)
        .get('/api/v1/logbook')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      const ids = res.body.data.items.map((i: any) => i.id);
      expect(ids).not.toContain(oldLogbookId);
    });
  });
});
