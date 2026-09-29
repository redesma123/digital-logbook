import { AttachmentRelatedTo } from '@prisma/client';
import { Readable } from 'stream';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/response.js';
import { StorageService } from '../storage/storage.interface.js';
import { localDiskStorage } from '../storage/local-disk.storage.js';
import { detectMimeType } from '../utils/magic-bytes.js';

export class AttachmentService {
  constructor(private storageService: StorageService = localDiskStorage) {}

  /**
   * Upload an attachment file, validate parent record and magic bytes, and persist in storage and DB.
   */
  async upload(
    fileBuffer: Buffer,
    originalFilename: string,
    relatedTo: AttachmentRelatedTo,
    relatedId: number,
    userId: number
  ) {
    if (isNaN(relatedId) || relatedId <= 0) {
      throw new AppError(400, 'Bad Request', 'related_id tidak valid');
    }

    // 1. Validate parent record exists and is not soft-deleted
    if (relatedTo === 'LOGBOOK') {
      const parent = await prisma.logbook_entries.findFirst({
        where: { id: relatedId, deleted_at: null },
      });
      if (!parent) {
        throw new AppError(404, 'Not Found', 'Entri logbook tidak ditemukan');
      }
    } else if (relatedTo === 'INCIDENT') {
      const parent = await prisma.incidents.findFirst({
        where: { id: relatedId, deleted_at: null },
      });
      if (!parent) {
        throw new AppError(404, 'Not Found', 'Data gangguan tidak ditemukan');
      }
    } else if (relatedTo === 'MAINTENANCE') {
      const parent = await prisma.maintenance_records.findFirst({
        where: { id: relatedId, deleted_at: null },
      });
      if (!parent) {
        throw new AppError(404, 'Not Found', 'Data pemeliharaan tidak ditemukan');
      }
    } else {
      throw new AppError(400, 'Bad Request', 'Tipe relasi tidak valid');
    }

    // 2. Validate magic bytes
    const detectedMime = detectMimeType(fileBuffer);
    if (!detectedMime) {
      throw new AppError(
        400,
        'Bad Request',
        'Format file tidak didukung. Hanya JPEG, PNG, dan WebP yang diizinkan'
      );
    }

    // 3. Save via storageService
    let saved: { path: string; size: number; filenameStored: string } | undefined;
    try {
      saved = await this.storageService.save(fileBuffer, detectedMime, originalFilename);

      // 4. Insert into database
      const attachment = await prisma.attachments.create({
        data: {
          related_to: relatedTo,
          logbook_id: relatedTo === 'LOGBOOK' ? relatedId : null,
          incident_id: relatedTo === 'INCIDENT' ? relatedId : null,
          maintenance_id: relatedTo === 'MAINTENANCE' ? relatedId : null,
          filename_stored: saved.filenameStored,
          original_filename: originalFilename,
          file_path: saved.path,
          mime_type: detectedMime,
          file_size_bytes: saved.size,
          uploaded_by_id: userId,
        },
        include: {
          uploader: {
            select: { id: true, username: true, full_name: true, role: true },
          },
        },
      });

      return attachment;
    } catch (err) {
      if (saved) {
        await this.storageService.delete(saved.path).catch(() => {});
      }
      throw err;
    }
  }

  /**
   * Retrieve attachment metadata by ID.
   */
  async getById(id: number) {
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }

    const attachment = await prisma.attachments.findFirst({
      where: { id, deleted_at: null },
      include: {
        uploader: {
          select: { id: true, username: true, full_name: true, role: true },
        },
      },
    });

    if (!attachment) {
      throw new AppError(404, 'Not Found', 'Lampiran tidak ditemukan');
    }

    return attachment;
  }

  /**
   * Stream file content for authenticated download.
   * Throws 410 Gone if file deleted by retention policy.
   */
  async streamFile(id: number): Promise<{ stream: Readable; mimeType: string; filename: string }> {
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }

    const attachment = await prisma.attachments.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new AppError(404, 'Not Found', 'Lampiran tidak ditemukan');
    }

    if (attachment.status === 'DELETED_BY_RETENTION') {
      throw new AppError(410, 'Gone', 'Foto telah dihapus sesuai kebijakan retensi 3 bulan');
    }

    if (attachment.deleted_at !== null) {
      throw new AppError(404, 'Not Found', 'Lampiran tidak ditemukan');
    }

    const stream = await this.storageService.stream(attachment.file_path);
    return {
      stream,
      mimeType: attachment.mime_type,
      filename: attachment.original_filename,
    };
  }

  /**
   * Delete an attachment (SUPERVISOR only).
   * Removes physical file from storage and marks soft-delete in database.
   */
  async remove(id: number, userRole?: string) {
    if (userRole && userRole !== 'SUPERVISOR') {
      throw new AppError(403, 'Forbidden', 'Hanya SUPERVISOR yang dapat menghapus lampiran');
    }

    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }

    const attachment = await prisma.attachments.findFirst({
      where: { id, deleted_at: null },
    });

    if (!attachment) {
      throw new AppError(404, 'Not Found', 'Lampiran tidak ditemukan');
    }

    await this.storageService.delete(attachment.file_path);

    return prisma.attachments.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
  }
}

export const attachmentService = new AttachmentService();
