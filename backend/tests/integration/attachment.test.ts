import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { app } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';
import { env } from '../../src/lib/env.js';

describe('Attachment Endpoints Integration', () => {
  let operatorToken = '';
  let supervisorToken = '';
  let adminToken = '';

  let validLogbookId: number;
  let validIncidentId: number;
  let validMaintenanceId: number;
  let softDeletedLogbookId: number;

  const validJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x01]);
  const validWebpBuffer = Buffer.from([
    0x52, 0x49, 0x46, 0x46,
    0x24, 0x00, 0x00, 0x00,
    0x57, 0x45, 0x42, 0x50,
    0x56, 0x50, 0x38, 0x20,
  ]);
  const fakeImageBuffer = Buffer.from('this is just a text file disguised as jpg');

  beforeAll(async () => {
    // Delete existing attachments
    await prisma.attachments.deleteMany({});

    // Auth logins
    const opLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'operator1', password: 'operator123' });
    operatorToken = opLogin.body.data.accessToken;

    const supLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'supervisor1', password: 'supervisor123' });
    supervisorToken = supLogin.body.data.accessToken;

    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    adminToken = adminLogin.body.data.accessToken;

    const operatorUser = await prisma.users.findUnique({ where: { username: 'operator1' } });
    const opId = operatorUser!.id;

    // Create a logbook entry
    const logbook = await prisma.logbook_entries.create({
      data: {
        unit_id: 1,
        operator_id: opId,
        date: new Date('2026-09-20'),
        shift: 'PAGI',
        unit_status: 'RUNNING',
      },
    });
    validLogbookId = logbook.id;

    // Create a soft-deleted logbook entry
    const softLogbook = await prisma.logbook_entries.create({
      data: {
        unit_id: 1,
        operator_id: opId,
        date: new Date('2026-09-21'),
        shift: 'SIANG',
        unit_status: 'RUNNING',
        deleted_at: new Date(),
      },
    });
    softDeletedLogbookId = softLogbook.id;

    // Create an incident
    const incident = await prisma.incidents.create({
      data: {
        unit_id: 1,
        reported_by_id: opId,
        occurred_at: new Date('2026-09-22T08:00:00Z'),
        equipment: 'Generator',
        incident_type: 'Overheat',
        description: 'Temperatur generator melebihi 70C',
      },
    });
    validIncidentId = incident.id;

    // Create a maintenance record
    const maintenance = await prisma.maintenance_records.create({
      data: {
        unit_id: 1,
        created_by_id: opId,
        equipment: 'Turbin',
        work_type: 'Preventive',
        description: 'Pembersihan runner turbin',
      },
    });
    validMaintenanceId = maintenance.id;
  });

  afterAll(async () => {
    // Clean up created attachments and files
    const attachments = await prisma.attachments.findMany({});
    for (const a of attachments) {
      if (fs.existsSync(a.file_path)) {
        try { fs.unlinkSync(a.file_path); } catch {}
      }
    }
    await prisma.attachments.deleteMany({});
    await prisma.logbook_entries.deleteMany({
      where: { id: { in: [validLogbookId, softDeletedLogbookId] } },
    });
    await prisma.incidents.deleteMany({
      where: { id: validIncidentId },
    });
    await prisma.maintenance_records.deleteMany({
      where: { id: validMaintenanceId },
    });
  });

  describe('Authentication & Authorization', () => {
    it('POST /api/v1/attachments without token should return 401', async () => {
      const res = await request(app)
        .post('/api/v1/attachments')
        .attach('file', validJpegBuffer, 'test.jpg')
        .field('related_to', 'LOGBOOK')
        .field('related_id', validLogbookId);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/attachments as ADMIN should return 403', async () => {
      const res = await request(app)
        .post('/api/v1/attachments')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', validJpegBuffer, 'test.jpg')
        .field('related_to', 'LOGBOOK')
        .field('related_id', validLogbookId);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/attachments/:id without token should return 401', async () => {
      const res = await request(app).get('/api/v1/attachments/1');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/attachments/:id/file without token should return 401', async () => {
      const res = await request(app).get('/api/v1/attachments/1/file');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('DELETE /api/v1/attachments/:id as OPERATOR should return 403', async () => {
      const res = await request(app)
        .delete('/api/v1/attachments/1')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Validation & Magic Bytes Checks', () => {
    it('POST /api/v1/attachments without file should return 400', async () => {
      const res = await request(app)
        .post('/api/v1/attachments')
        .set('Authorization', `Bearer ${operatorToken}`)
        .field('related_to', 'LOGBOOK')
        .field('related_id', validLogbookId);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/attachments with fake extension (text file named photo.jpg) should return 400', async () => {
      const res = await request(app)
        .post('/api/v1/attachments')
        .set('Authorization', `Bearer ${operatorToken}`)
        .attach('file', fakeImageBuffer, 'photo.jpg')
        .field('related_to', 'LOGBOOK')
        .field('related_id', validLogbookId);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/format file tidak didukung|hanya jpeg/i);
    });

    it('POST /api/v1/attachments with file exceeding 5MB should return 400', async () => {
      const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1024);
      largeBuffer[0] = 0xff;
      largeBuffer[1] = 0xd8;
      largeBuffer[2] = 0xff;

      const res = await request(app)
        .post('/api/v1/attachments')
        .set('Authorization', `Bearer ${operatorToken}`)
        .attach('file', largeBuffer, 'large.jpg')
        .field('related_to', 'LOGBOOK')
        .field('related_id', validLogbookId);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/melebihi batas|5 MB/i);
    });

    it('POST /api/v1/attachments with invalid related_to should return 400', async () => {
      const res = await request(app)
        .post('/api/v1/attachments')
        .set('Authorization', `Bearer ${operatorToken}`)
        .attach('file', validJpegBuffer, 'photo.jpg')
        .field('related_to', 'UNKNOWN')
        .field('related_id', validLogbookId);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/attachments to non-existent parent should return 404', async () => {
      const res = await request(app)
        .post('/api/v1/attachments')
        .set('Authorization', `Bearer ${operatorToken}`)
        .attach('file', validJpegBuffer, 'photo.jpg')
        .field('related_to', 'LOGBOOK')
        .field('related_id', 999999);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/attachments to soft-deleted parent should return 404', async () => {
      const res = await request(app)
        .post('/api/v1/attachments')
        .set('Authorization', `Bearer ${operatorToken}`)
        .attach('file', validJpegBuffer, 'photo.jpg')
        .field('related_to', 'LOGBOOK')
        .field('related_id', softDeletedLogbookId);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Upload, Retrieve, Stream, and Retention Lifecycle', () => {
    let uploadedAttachmentId: number;
    let incidentAttachmentId: number;
    let maintenanceAttachmentId: number;

    it('POST /api/v1/attachments with valid JPEG should return 201 and attachment metadata', async () => {
      const res = await request(app)
        .post('/api/v1/attachments')
        .set('Authorization', `Bearer ${operatorToken}`)
        .attach('file', validJpegBuffer, 'generator.jpg')
        .field('related_to', 'LOGBOOK')
        .field('related_id', validLogbookId);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.original_filename).toBe('generator.jpg');
      expect(res.body.data.mime_type).toBe('image/jpeg');
      expect(res.body.data.file_size_bytes).toBe(validJpegBuffer.length);
      expect(res.body.data.logbook_id).toBe(validLogbookId);
      expect(res.body.data.status).toBe('ACTIVE');

      uploadedAttachmentId = res.body.data.id;
    });

    it('POST /api/v1/attachments with valid PNG to INCIDENT should return 201', async () => {
      const res = await request(app)
        .post('/api/v1/attachments')
        .set('Authorization', `Bearer ${operatorToken}`)
        .attach('file', validPngBuffer, 'alarm.png')
        .field('related_to', 'INCIDENT')
        .field('related_id', validIncidentId);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.mime_type).toBe('image/png');
      expect(res.body.data.incident_id).toBe(validIncidentId);

      incidentAttachmentId = res.body.data.id;
    });

    it('POST /api/v1/attachments with valid WebP to MAINTENANCE should return 201', async () => {
      const res = await request(app)
        .post('/api/v1/attachments')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .attach('file', validWebpBuffer, 'turbin.webp')
        .field('related_to', 'MAINTENANCE')
        .field('related_id', validMaintenanceId);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.mime_type).toBe('image/webp');
      expect(res.body.data.maintenance_id).toBe(validMaintenanceId);

      maintenanceAttachmentId = res.body.data.id;
    });

    it('GET /api/v1/attachments/:id should return metadata', async () => {
      const res = await request(app)
        .get(`/api/v1/attachments/${uploadedAttachmentId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(uploadedAttachmentId);
      expect(res.body.data.original_filename).toBe('generator.jpg');
    });

    it('GET /api/v1/attachments/:id for non-existent id should return 404', async () => {
      const res = await request(app)
        .get('/api/v1/attachments/999999')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/attachments/:id/file should stream file with correct Content-Type', async () => {
      const res = await request(app)
        .get(`/api/v1/attachments/${uploadedAttachmentId}/file`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toContain('image/jpeg');
      expect(Buffer.compare(res.body, validJpegBuffer)).toBe(0);
    });

    it('GET /api/v1/attachments/:id/file with DELETED_BY_RETENTION status should return 410 Gone', async () => {
      // Simulate retention policy cleanup: mark status as DELETED_BY_RETENTION
      await prisma.attachments.update({
        where: { id: incidentAttachmentId },
        data: { status: 'DELETED_BY_RETENTION' },
      });

      const res = await request(app)
        .get(`/api/v1/attachments/${incidentAttachmentId}/file`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(410);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Foto telah dihapus sesuai kebijakan retensi 3 bulan');
    });

    it('DELETE /api/v1/attachments/:id as SUPERVISOR should delete file and soft-delete record', async () => {
      const target = await prisma.attachments.findUnique({
        where: { id: uploadedAttachmentId },
      });
      expect(fs.existsSync(target!.file_path)).toBe(true);

      const res = await request(app)
        .delete(`/api/v1/attachments/${uploadedAttachmentId}`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify physical file was deleted
      expect(fs.existsSync(target!.file_path)).toBe(false);

      // Verify soft delete in DB
      const updated = await prisma.attachments.findUnique({
        where: { id: uploadedAttachmentId },
      });
      expect(updated!.deleted_at).not.toBeNull();

      // Subsequent GET should return 404
      const getRes = await request(app)
        .get(`/api/v1/attachments/${uploadedAttachmentId}`)
        .set('Authorization', `Bearer ${operatorToken}`);
      expect(getRes.status).toBe(404);

      // Subsequent GET /file should return 404
      const getFileRes = await request(app)
        .get(`/api/v1/attachments/${uploadedAttachmentId}/file`)
        .set('Authorization', `Bearer ${operatorToken}`);
      expect(getFileRes.status).toBe(404);
    });
  });
});
