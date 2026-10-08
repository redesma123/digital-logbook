import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

describe('Incident Management Integration', () => {
  let adminToken = '';
  let operatorToken = '';
  let supervisorToken = '';
  let createdIncidentId: number;

  beforeAll(async () => {
    await prisma.incident_status_histories.deleteMany({});
    await prisma.incidents.deleteMany({});

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
    await prisma.incident_status_histories.deleteMany({});
    await prisma.incidents.deleteMany({});
  });

  describe('Authentication & Authorization', () => {
    it('GET /api/v1/incidents without auth should return 401', async () => {
      const res = await request(app).get('/api/v1/incidents');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/incidents without auth should return 401', async () => {
      const res = await request(app)
        .post('/api/v1/incidents')
        .send({
          unit_id: 1,
          occurred_at: new Date().toISOString(),
          equipment: 'Turbin',
          incident_type: 'Vibrasi Tinggi',
          description: 'Vibrasi melebihi batas toleransi',
        });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/incidents as ADMIN should return 403', async () => {
      const res = await request(app)
        .post('/api/v1/incidents')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          unit_id: 1,
          occurred_at: new Date().toISOString(),
          equipment: 'Turbin',
          incident_type: 'Vibrasi Tinggi',
          description: 'Vibrasi melebihi batas toleransi',
        });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('DELETE /api/v1/incidents/:id as OPERATOR should return 403', async () => {
      const res = await request(app)
        .delete('/api/v1/incidents/1')
        .set('Authorization', `Bearer ${operatorToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Validation', () => {
    it('POST /api/v1/incidents with missing required fields should return 400', async () => {
      const res = await request(app)
        .post('/api/v1/incidents')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          unit_id: 1,
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/incidents with nonexistent unit_id should return 404', async () => {
      const res = await request(app)
        .post('/api/v1/incidents')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          unit_id: 99999,
          occurred_at: new Date().toISOString(),
          equipment: 'Generator',
          incident_type: 'Overheat',
          description: 'Suhu generator naik drastis',
        });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unit tidak ditemukan');
    });

    it('PATCH /api/v1/incidents/:id/status with invalid status should return 400', async () => {
      const res = await request(app)
        .patch('/api/v1/incidents/1/status')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ status: 'INVALID_STATUS' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('CRUD Operations', () => {
    it('POST /api/v1/incidents as OPERATOR should create incident with OPEN status and reporter id', async () => {
      const occurredAt = new Date().toISOString();
      const res = await request(app)
        .post('/api/v1/incidents')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          unit_id: 1,
          occurred_at: occurredAt,
          equipment: 'Generator Bearing',
          incident_type: 'Overheating',
          description: 'Temperatur bearing mencapai 95C',
          operator_action: 'Mengurangi beban generator',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Laporan gangguan berhasil dibuat');
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.status).toBe('OPEN');
      expect(res.body.data.equipment).toBe('Generator Bearing');
      expect(res.body.data.operator_action).toBe('Mengurangi beban generator');
      expect(res.body.data.unit).toBeDefined();
      expect(res.body.data.unit.unit_code).toBe('U1');
      expect(res.body.data.reporter).toBeDefined();
      expect(res.body.data.reporter.username).toBe('operator1');

      createdIncidentId = res.body.data.id;
    });

    it('GET /api/v1/incidents/:id should return incident details with relations', async () => {
      const res = await request(app)
        .get(`/api/v1/incidents/${createdIncidentId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdIncidentId);
      expect(res.body.data.unit).toBeDefined();
      expect(res.body.data.reporter).toBeDefined();
      expect(Array.isArray(res.body.data.status_histories)).toBe(true);
      expect(Array.isArray(res.body.data.attachments)).toBe(true);
    });

    it('GET /api/v1/incidents should list incidents with pagination and filters', async () => {
      const res = await request(app)
        .get('/api/v1/incidents?unit_id=1&status=OPEN&page=1&limit=10')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toBeDefined();
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination.page).toBe(1);
    });

    it('PATCH /api/v1/incidents/:id as OPERATOR should update details', async () => {
      const res = await request(app)
        .patch(`/api/v1/incidents/${createdIncidentId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          description: 'Temperatur bearing mencapai 98C dan getaran meningkat',
          operator_action: 'Mengurangi beban dan menyalakan pendingin tambahan',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe('Temperatur bearing mencapai 98C dan getaran meningkat');
      expect(res.body.data.operator_action).toBe('Mengurangi beban dan menyalakan pendingin tambahan');
    });
  });

  describe('Status Transitions & History', () => {
    it('PATCH /api/v1/incidents/:id/status as OPERATOR to CLOSED should return 403', async () => {
      const res = await request(app)
        .patch(`/api/v1/incidents/${createdIncidentId}/status`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ status: 'CLOSED' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Operator hanya dapat mengubah status ke PROCESS');
    });

    it('PATCH /api/v1/incidents/:id/status as OPERATOR to PROCESS should succeed and log history', async () => {
      const res = await request(app)
        .patch(`/api/v1/incidents/${createdIncidentId}/status`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          status: 'PROCESS',
          notes: 'Sedang diperiksa oleh teknisi shift',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PROCESS');

      // Verify status history
      const detail = await request(app)
        .get(`/api/v1/incidents/${createdIncidentId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(detail.body.data.status_histories.length).toBe(1);
      const history = detail.body.data.status_histories[0];
      expect(history.from_status).toBe('OPEN');
      expect(history.to_status).toBe('PROCESS');
      expect(history.notes).toBe('Sedang diperiksa oleh teknisi shift');
      expect(history.changer.username).toBe('operator1');
    });

    it('PATCH /api/v1/incidents/:id/status as SUPERVISOR to CLOSED should succeed, set resolved_at, and log history', async () => {
      const res = await request(app)
        .patch(`/api/v1/incidents/${createdIncidentId}/status`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({
          status: 'CLOSED',
          notes: 'Penggantian oli bearing selesai, temperatur kembali normal',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CLOSED');
      expect(res.body.data.resolved_at).not.toBeNull();

      // Verify status histories count is now 2
      const detail = await request(app)
        .get(`/api/v1/incidents/${createdIncidentId}`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(detail.body.data.status_histories.length).toBe(2);
      const latestHistory = detail.body.data.status_histories[1];
      expect(latestHistory.from_status).toBe('PROCESS');
      expect(latestHistory.to_status).toBe('CLOSED');
      expect(latestHistory.changer.username).toBe('supervisor1');
    });

    it('PATCH /api/v1/incidents/:id/status as OPERATOR from CLOSED back to PROCESS should return 403', async () => {
      const res = await request(app)
        .patch(`/api/v1/incidents/${createdIncidentId}/status`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ status: 'PROCESS' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('PATCH /api/v1/incidents/:id/status as SUPERVISOR backward transition CLOSED -> PROCESS without notes should return 400', async () => {
      const res = await request(app)
        .patch(`/api/v1/incidents/${createdIncidentId}/status`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ status: 'PROCESS' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Catatan');
    });

    it('PATCH /api/v1/incidents/:id/status as SUPERVISOR backward transition CLOSED -> PROCESS with notes should succeed, clear resolved_at, and log history', async () => {
      const res = await request(app)
        .patch(`/api/v1/incidents/${createdIncidentId}/status`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({
          status: 'PROCESS',
          notes: 'Ditemukan getaran berulang setelah uji coba, dibuka kembali untuk investigasi lanjutan',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PROCESS');
      expect(res.body.data.resolved_at).toBeNull();

      const detail = await request(app)
        .get(`/api/v1/incidents/${createdIncidentId}`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(detail.body.data.status_histories.length).toBe(3);
      const latestHistory = detail.body.data.status_histories[2];
      expect(latestHistory.from_status).toBe('CLOSED');
      expect(latestHistory.to_status).toBe('PROCESS');
    });
  });

  describe('Soft Delete', () => {
    it('DELETE /api/v1/incidents/:id as SUPERVISOR should soft delete incident', async () => {
      const res = await request(app)
        .delete(`/api/v1/incidents/${createdIncidentId}`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Data gangguan berhasil dihapus');
    });

    it('GET /api/v1/incidents/:id on soft-deleted incident should return 404', async () => {
      const res = await request(app)
        .get(`/api/v1/incidents/${createdIncidentId}`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/incidents should not include soft-deleted incident', async () => {
      const res = await request(app)
        .get('/api/v1/incidents')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      const ids = res.body.data.items.map((i: any) => i.id);
      expect(ids).not.toContain(createdIncidentId);
    });
  });
});
