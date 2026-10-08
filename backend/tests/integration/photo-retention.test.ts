import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import { app } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';
import { storageService } from '../../src/storage/local-disk.storage.js';
import {
  runPhotoRetentionJob,
  initRetentionCron,
} from '../../src/jobs/photo-retention.job.js';

describe('Photo Retention Background Job Integration', () => {
  let operatorToken = '';
  let operatorUserId: number;

  let testLogbookId: number;
  let closedIncidentId: number;
  let openIncidentId: number;
  let processIncidentId: number;

  const createdFilePaths: string[] = [];
  const createdAttachmentIds: number[] = [];

  // Helper to create test attachments with specific age
  async function createTestAttachment(options: {
    related_to: 'LOGBOOK' | 'INCIDENT';
    related_id: number;
    daysAgo: number;
    filename?: string;
  }) {
    const content = Buffer.from('photo-retention-test-data-' + Math.random());
    const filename = options.filename ?? `retention_test_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const saved = await storageService.save(content, 'image/jpeg', filename);
    const uploadedAt = new Date(Date.now() - options.daysAgo * 24 * 60 * 60 * 1000);

    const attachment = await prisma.attachments.create({
      data: {
        related_to: options.related_to,
        logbook_id: options.related_to === 'LOGBOOK' ? options.related_id : null,
        incident_id: options.related_to === 'INCIDENT' ? options.related_id : null,
        filename_stored: saved.filenameStored,
        original_filename: filename,
        file_path: saved.path,
        mime_type: 'image/jpeg',
        file_size_bytes: saved.size,
        uploaded_by_id: operatorUserId,
        uploaded_at: uploadedAt,
        status: 'ACTIVE',
      },
    });

    createdFilePaths.push(saved.path);
    createdAttachmentIds.push(attachment.id);

    return { attachment, filePath: saved.path };
  }

  beforeAll(async () => {
    // 1. Authenticate as operator to get token
    const opLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'operator1', password: 'operator123' });
    operatorToken = opLogin.body.data.accessToken;

    const opUser = await prisma.users.findUnique({ where: { username: 'operator1' } });
    operatorUserId = opUser!.id;

    // 2. Create parent logbook entry
    const logbook = await prisma.logbook_entries.create({
      data: {
        unit_id: 1,
        operator_id: operatorUserId,
        date: new Date('2026-06-01'),
        shift: 'PAGI',
        unit_status: 'RUNNING',
      },
    });
    testLogbookId = logbook.id;

    // 3. Create parent incidents with CLOSED, OPEN, and PROCESS statuses
    const closedIncident = await prisma.incidents.create({
      data: {
        unit_id: 1,
        reported_by_id: operatorUserId,
        occurred_at: new Date('2026-05-01T10:00:00Z'),
        equipment: 'Turbin',
        incident_type: 'Bearing Overheat',
        description: 'Overheat resolved on site',
        status: 'CLOSED',
      },
    });
    closedIncidentId = closedIncident.id;

    const openIncident = await prisma.incidents.create({
      data: {
        unit_id: 1,
        reported_by_id: operatorUserId,
        occurred_at: new Date('2026-05-02T10:00:00Z'),
        equipment: 'Generator',
        incident_type: 'Vibration High',
        description: 'Still investigating vibration',
        status: 'OPEN',
      },
    });
    openIncidentId = openIncident.id;

    const processIncident = await prisma.incidents.create({
      data: {
        unit_id: 1,
        reported_by_id: operatorUserId,
        occurred_at: new Date('2026-05-03T10:00:00Z'),
        equipment: 'Governor',
        incident_type: 'Oil Leakage',
        description: 'Part replacement in progress',
        status: 'PROCESS',
      },
    });
    processIncidentId = processIncident.id;
  });

  afterAll(async () => {
    // Clean up all physical files
    for (const p of createdFilePaths) {
      if (fs.existsSync(p)) {
        try {
          fs.unlinkSync(p);
        } catch {}
      }
    }

    // Clean up created attachments
    if (createdAttachmentIds.length > 0) {
      await prisma.attachments.deleteMany({
        where: { id: { in: createdAttachmentIds } },
      });
    }

    // Clean up parent records
    await prisma.incidents.deleteMany({
      where: { id: { in: [closedIncidentId, openIncidentId, processIncidentId].filter(Boolean) } },
    });
    if (testLogbookId) {
      await prisma.logbook_entries.deleteMany({
        where: { id: testLogbookId },
      });
    }
  });

  it('files under 90 days are not deleted', async () => {
    // Create attachment that is only 30 days old
    const { attachment, filePath } = await createTestAttachment({
      related_to: 'LOGBOOK',
      related_id: testLogbookId,
      daysAgo: 30,
    });

    const result = await runPhotoRetentionJob({ retentionDays: 90 });

    // File should still exist on disk
    expect(fs.existsSync(filePath)).toBe(true);

    // Database record should remain ACTIVE and deleted_at null
    const dbRecord = await prisma.attachments.findUnique({
      where: { id: attachment.id },
    });
    expect(dbRecord?.status).toBe('ACTIVE');
    expect(dbRecord?.deleted_at).toBeNull();
  });

  it('files over 90 days linked to CLOSED incident or LOGBOOK are deleted & marked DELETED_BY_RETENTION', async () => {
    // 1. Logbook photo 95 days old
    const logbookPhoto = await createTestAttachment({
      related_to: 'LOGBOOK',
      related_id: testLogbookId,
      daysAgo: 95,
    });

    // 2. Closed incident photo 100 days old
    const closedIncidentPhoto = await createTestAttachment({
      related_to: 'INCIDENT',
      related_id: closedIncidentId,
      daysAgo: 100,
    });

    // Verify physical files exist before job
    expect(fs.existsSync(logbookPhoto.filePath)).toBe(true);
    expect(fs.existsSync(closedIncidentPhoto.filePath)).toBe(true);

    const result = await runPhotoRetentionJob({ retentionDays: 90 });

    expect(result.checked).toBeGreaterThanOrEqual(2);
    expect(result.deleted).toBeGreaterThanOrEqual(2);

    // Verify physical files were deleted
    expect(fs.existsSync(logbookPhoto.filePath)).toBe(false);
    expect(fs.existsSync(closedIncidentPhoto.filePath)).toBe(false);

    // Verify DB records updated to DELETED_BY_RETENTION and deleted_at set
    const updatedLogbookAtt = await prisma.attachments.findUnique({
      where: { id: logbookPhoto.attachment.id },
    });
    expect(updatedLogbookAtt?.status).toBe('DELETED_BY_RETENTION');
    expect(updatedLogbookAtt?.deleted_at).not.toBeNull();

    const updatedIncidentAtt = await prisma.attachments.findUnique({
      where: { id: closedIncidentPhoto.attachment.id },
    });
    expect(updatedIncidentAtt?.status).toBe('DELETED_BY_RETENTION');
    expect(updatedIncidentAtt?.deleted_at).not.toBeNull();
  });

  it('files over 90 days linked to OPEN or PROCESS incident are EXCLUDED', async () => {
    // 1. Photo linked to OPEN incident (95 days old)
    const openPhoto = await createTestAttachment({
      related_to: 'INCIDENT',
      related_id: openIncidentId,
      daysAgo: 95,
    });

    // 2. Photo linked to PROCESS incident (110 days old)
    const processPhoto = await createTestAttachment({
      related_to: 'INCIDENT',
      related_id: processIncidentId,
      daysAgo: 110,
    });

    const result = await runPhotoRetentionJob({ retentionDays: 90 });

    expect(result.excluded).toBeGreaterThanOrEqual(2);

    // Verify physical files still exist
    expect(fs.existsSync(openPhoto.filePath)).toBe(true);
    expect(fs.existsSync(processPhoto.filePath)).toBe(true);

    // Verify DB records are still ACTIVE
    const openAtt = await prisma.attachments.findUnique({
      where: { id: openPhoto.attachment.id },
    });
    expect(openAtt?.status).toBe('ACTIVE');
    expect(openAtt?.deleted_at).toBeNull();

    const processAtt = await prisma.attachments.findUnique({
      where: { id: processPhoto.attachment.id },
    });
    expect(processAtt?.status).toBe('ACTIVE');
    expect(processAtt?.deleted_at).toBeNull();
  });

  it('dry-run mode does not modify disk or DB', async () => {
    // Photo linked to LOGBOOK, 95 days old
    const dryRunPhoto = await createTestAttachment({
      related_to: 'LOGBOOK',
      related_id: testLogbookId,
      daysAgo: 95,
    });

    expect(fs.existsSync(dryRunPhoto.filePath)).toBe(true);

    const result = await runPhotoRetentionJob({ dryRun: true, retentionDays: 90 });

    expect(result.dryRun).toBe(true);
    expect(result.checked).toBeGreaterThanOrEqual(1);
    expect(result.deleted).toBeGreaterThanOrEqual(1);

    // File MUST still exist on disk
    expect(fs.existsSync(dryRunPhoto.filePath)).toBe(true);

    // Database record MUST still be ACTIVE
    const dbRecord = await prisma.attachments.findUnique({
      where: { id: dryRunPhoto.attachment.id },
    });
    expect(dbRecord?.status).toBe('ACTIVE');
    expect(dbRecord?.deleted_at).toBeNull();
  });

  it('GET /attachments/:id/file for retention-deleted file returns 410 Gone', async () => {
    // Create an eligible photo and run job to delete it
    const photo = await createTestAttachment({
      related_to: 'LOGBOOK',
      related_id: testLogbookId,
      daysAgo: 95,
    });

    await runPhotoRetentionJob({ retentionDays: 90 });

    // Verify it is DELETED_BY_RETENTION
    const dbRecord = await prisma.attachments.findUnique({
      where: { id: photo.attachment.id },
    });
    expect(dbRecord?.status).toBe('DELETED_BY_RETENTION');

    // Attempt to download the file via HTTP endpoint
    const res = await request(app)
      .get(`/api/v1/attachments/${photo.attachment.id}/file`)
      .set('Authorization', `Bearer ${operatorToken}`);

    expect(res.status).toBe(410);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/kebijakan retensi/i);
  });

  it('initRetentionCron registers a scheduled cron task and can be stopped', () => {
    const task = initRetentionCron('0 0 * * *');
    expect(task).toBeDefined();
    expect(typeof task.stop).toBe('function');
    task.stop();
  });

  it('increments failed counter if storageService throws an error', async () => {
    const errorPhoto = await createTestAttachment({
      related_to: 'LOGBOOK',
      related_id: testLogbookId,
      daysAgo: 95,
    });

    // Mock storage that throws on delete
    const failingStorage = {
      save: storageService.save.bind(storageService),
      stream: storageService.stream.bind(storageService),
      getUsageBytes: storageService.getUsageBytes.bind(storageService),
      delete: async () => {
        throw new Error('Disk write error / Permission denied');
      },
    };

    const result = await runPhotoRetentionJob({
      retentionDays: 90,
      storage: failingStorage,
    });

    expect(result.failed).toBeGreaterThanOrEqual(1);
  });
});
