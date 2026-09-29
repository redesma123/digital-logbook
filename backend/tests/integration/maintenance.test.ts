import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

describe('Maintenance Records Integration', () => {
  let adminToken = '';
  let operatorToken = '';
  let supervisorToken = '';
  let createdMaintenanceId: number;

  beforeAll(async () => {
    await prisma.maintenance_status_histories.deleteMany({});
    await prisma.maintenance_records.deleteMany({});

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
    await prisma.maintenance_status_histories.deleteMany({});
    await prisma.maintenance_records.deleteMany({});
  });

  describe('Authentication & Authorization', () => {
    it('GET /api/v1/maintenance without auth should return 401', async () => {
      const res = await request(app).get('/api/v1/maintenance');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/maintenance without auth should return 401', async () => {
      const res = await request(app)
        .post('/api/v1/maintenance')
        .send({
          unit_id: 1,
          equipment: 'Turbin Runner',
          work_type: 'Pembersihan Lumut',
          description: 'Pembersihan berkala pada sirip turbin',
        });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/maintenance as ADMIN should return 403', async () => {
      const res = await request(app)
        .post('/api/v1/maintenance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          unit_id: 1,
          equipment: 'Turbin Runner',
          work_type: 'Pembersihan Lumut',
          description: 'Pembersihan berkala pada sirip turbin',
        });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('PATCH /api/v1/maintenance/:id/status as OPERATOR should return 403', async () => {
      const res = await request(app)
        .patch('/api/v1/maintenance/1/status')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ status: 'PROCESS' });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('DELETE /api/v1/maintenance/:id as OPERATOR should return 403', async () => {
      const res = await request(app)
        .delete('/api/v1/maintenance/1')
        .set('Authorization', `Bearer ${operatorToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Validation', () => {
    it('POST /api/v1/maintenance with missing required fields should return 400', async () => {
      const res = await request(app)
        .post('/api/v1/maintenance')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          unit_id: 1,
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/maintenance with nonexistent unit_id should return 404', async () => {
      const res = await request(app)
        .post('/api/v1/maintenance')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          unit_id: 99999,
          equipment: 'Katup Utama',
          work_type: 'Inspeksi Seal',
          description: 'Pengecekan kebocoran seal inlet valve',
        });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unit tidak ditemukan');
    });

    it('PATCH /api/v1/maintenance/:id/status with invalid status should return 400', async () => {
      const res = await request(app)
        .patch('/api/v1/maintenance/1/status')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ status: 'INVALID_STATUS' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('CRUD Operations', () => {
    it('POST /api/v1/maintenance as OPERATOR should create maintenance record with PLAN status', async () => {
      const plannedDate = new Date(Date.now() + 86400000).toISOString();
      const res = await request(app)
        .post('/api/v1/maintenance')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          unit_id: 1,
          equipment: 'Sistem Pelumasan',
          work_type: 'Penggantian Filter Oli',
          description: 'Penggantian filter oli bulanan',
          technician: 'Tim Mekanik A',
          planned_date: plannedDate,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Data pemeliharaan berhasil dibuat');
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.status).toBe('PLAN');
      expect(res.body.data.equipment).toBe('Sistem Pelumasan');
      expect(res.body.data.technician).toBe('Tim Mekanik A');
      expect(res.body.data.unit).toBeDefined();
      expect(res.body.data.unit.unit_code).toBe('U1');
      expect(res.body.data.creator).toBeDefined();
      expect(res.body.data.creator.username).toBe('operator1');

      createdMaintenanceId = res.body.data.id;
    });

    it('GET /api/v1/maintenance/:id should return maintenance details with relations', async () => {
      const res = await request(app)
        .get(`/api/v1/maintenance/${createdMaintenanceId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdMaintenanceId);
      expect(res.body.data.unit).toBeDefined();
      expect(res.body.data.creator).toBeDefined();
      expect(Array.isArray(res.body.data.status_histories)).toBe(true);
      expect(Array.isArray(res.body.data.attachments)).toBe(true);
    });

    it('GET /api/v1/maintenance should list maintenance records with pagination and filters', async () => {
      const res = await request(app)
        .get('/api/v1/maintenance?unit_id=1&status=PLAN&page=1&limit=10')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toBeDefined();
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination.page).toBe(1);
    });

    it('PATCH /api/v1/maintenance/:id as OPERATOR should update details', async () => {
      const res = await request(app)
        .patch(`/api/v1/maintenance/${createdMaintenanceId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          description: 'Penggantian filter oli dan pembersihan tangki penampung',
          technician: 'Tim Mekanik A & B',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe('Penggantian filter oli dan pembersihan tangki penampung');
      expect(res.body.data.technician).toBe('Tim Mekanik A & B');
    });
  });

  describe('Status Transitions & History', () => {
    it('PATCH /api/v1/maintenance/:id/status as SUPERVISOR to PROCESS should succeed and log history', async () => {
      const res = await request(app)
        .patch(`/api/v1/maintenance/${createdMaintenanceId}/status`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({
          status: 'PROCESS',
          notes: 'Pekerjaan mulai dilaksanakan di lapangan',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PROCESS');

      // Verify status history
      const detail = await request(app)
        .get(`/api/v1/maintenance/${createdMaintenanceId}`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(detail.body.data.status_histories.length).toBe(1);
      const history = detail.body.data.status_histories[0];
      expect(history.from_status).toBe('PLAN');
      expect(history.to_status).toBe('PROCESS');
      expect(history.notes).toBe('Pekerjaan mulai dilaksanakan di lapangan');
      expect(history.changer.username).toBe('supervisor1');
    });

    it('PATCH /api/v1/maintenance/:id/status as SUPERVISOR to COMPLETE should succeed and log history', async () => {
      const res = await request(app)
        .patch(`/api/v1/maintenance/${createdMaintenanceId}/status`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({
          status: 'COMPLETE',
          notes: 'Penggantian filter dan pembersihan tangki selesai, hasil uji baik',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('COMPLETE');

      // Verify status histories count is now 2
      const detail = await request(app)
        .get(`/api/v1/maintenance/${createdMaintenanceId}`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(detail.body.data.status_histories.length).toBe(2);
      const latestHistory = detail.body.data.status_histories[1];
      expect(latestHistory.from_status).toBe('PROCESS');
      expect(latestHistory.to_status).toBe('COMPLETE');
      expect(latestHistory.changer.username).toBe('supervisor1');
    });
  });

  describe('Soft Delete', () => {
    it('DELETE /api/v1/maintenance/:id as SUPERVISOR should soft delete maintenance record', async () => {
      const res = await request(app)
        .delete(`/api/v1/maintenance/${createdMaintenanceId}`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Data pemeliharaan berhasil dihapus');
    });

    it('GET /api/v1/maintenance/:id on soft-deleted record should return 404', async () => {
      const res = await request(app)
        .get(`/api/v1/maintenance/${createdMaintenanceId}`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/maintenance should not include soft-deleted record', async () => {
      const res = await request(app)
        .get('/api/v1/maintenance')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      const ids = res.body.data.items.map((i: any) => i.id);
      expect(ids).not.toContain(createdMaintenanceId);
    });
  });
});
