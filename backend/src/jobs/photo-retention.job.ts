import cron, { ScheduledTask } from 'node-cron';
import { prisma } from '../lib/prisma.js';
import { storageService } from '../storage/local-disk.storage.js';
import { StorageService } from '../storage/storage.interface.js';

export interface RetentionJobResult {
  checked: number;
  deleted: number;
  excluded: number;
  failed: number;
  dryRun: boolean;
}

export interface RunPhotoRetentionJobOptions {
  dryRun?: boolean;
  retentionDays?: number;
  storage?: StorageService;
}

/**
 * Execute photo retention cleanup job:
 * 1. Scans active attachments older than retentionDays (default: 90 days).
 * 2. Excludes attachments linked to incidents with status OPEN or PROCESS.
 * 3. Deletes eligible physical files and marks records as DELETED_BY_RETENTION.
 * 4. Supports dryRun mode without modifying disk or database.
 */
export async function runPhotoRetentionJob(
  options: RunPhotoRetentionJobOptions = {}
): Promise<RetentionJobResult> {
  const { dryRun = false, retentionDays = 90, storage = storageService } = options;

  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  // Query active, non-soft-deleted attachments created before cutoff date
  const attachments = await prisma.attachments.findMany({
    where: {
      status: 'ACTIVE',
      deleted_at: null,
      uploaded_at: {
        lt: cutoffDate,
      },
    },
    include: {
      incident: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  const checked = attachments.length;
  let deleted = 0;
  let excluded = 0;
  let failed = 0;

  for (const att of attachments) {
    // Exclude photos linked to incidents with status OPEN or PROCESS
    const isExcludedIncident =
      att.related_to === 'INCIDENT' &&
      att.incident !== null &&
      (att.incident.status === 'OPEN' || att.incident.status === 'PROCESS');

    if (isExcludedIncident) {
      excluded++;
      continue;
    }

    if (dryRun) {
      deleted++;
      continue;
    }

    try {
      await storage.delete(att.file_path);
      await prisma.attachments.update({
        where: { id: att.id },
        data: {
          status: 'DELETED_BY_RETENTION',
          deleted_at: new Date(),
        },
      });
      deleted++;
    } catch (error) {
      failed++;
      console.error(`[PhotoRetentionJob] Failed to delete attachment ID ${att.id}:`, error);
    }
  }

  const result: RetentionJobResult = {
    checked,
    deleted,
    excluded,
    failed,
    dryRun,
  };

  console.log('[PhotoRetentionJob] Result:', result);
  return result;
}

/**
 * Schedule daily photo retention cron job.
 * Default schedule is midnight daily ('0 0 * * *').
 */
export function initRetentionCron(cronExpression = '0 0 * * *'): ScheduledTask {
  return cron.schedule(cronExpression, async () => {
    try {
      console.log(`[PhotoRetentionJob] Starting scheduled job at ${new Date().toISOString()}`);
      const result = await runPhotoRetentionJob();
      console.log('[PhotoRetentionJob] Scheduled job finished:', result);
    } catch (error) {
      console.error('[PhotoRetentionJob] Scheduled job encountered error:', error);
    }
  });
}
