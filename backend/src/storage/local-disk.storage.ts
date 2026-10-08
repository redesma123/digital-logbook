import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../lib/env.js';
import { AppError } from '../lib/response.js';
import { StorageService } from './storage.interface.js';

export class LocalDiskStorage implements StorageService {
  constructor(private uploadDir: string = env.UPLOAD_DIR) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private resolvePath(filePath: string): string {
    if (fs.existsSync(filePath)) {
      return path.resolve(filePath);
    }
    const candidate = path.resolve(this.uploadDir, filePath);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    return path.resolve(filePath);
  }

  async save(
    file: Buffer,
    mimeType: string,
    originalFilename: string
  ): Promise<{ path: string; size: number; filenameStored: string }> {
    if (!fs.existsSync(this.uploadDir)) {
      await fs.promises.mkdir(this.uploadDir, { recursive: true });
    }

    let ext = path.extname(originalFilename);
    if (!ext) {
      if (mimeType === 'image/jpeg') ext = '.jpg';
      else if (mimeType === 'image/png') ext = '.png';
      else if (mimeType === 'image/webp') ext = '.webp';
    }

    const filenameStored = `${uuidv4()}${ext}`;
    const filePath = path.resolve(this.uploadDir, filenameStored);

    await fs.promises.writeFile(filePath, file);

    return {
      path: filePath,
      size: file.length,
      filenameStored,
    };
  }

  async stream(filePath: string): Promise<Readable> {
    const absPath = this.resolvePath(filePath);
    if (!fs.existsSync(absPath)) {
      throw new AppError(404, 'Not Found', 'File fisik tidak ditemukan');
    }
    return fs.createReadStream(absPath);
  }

  async delete(filePath: string): Promise<void> {
    const absPath = this.resolvePath(filePath);
    if (fs.existsSync(absPath)) {
      await fs.promises.unlink(absPath);
    }
  }

  async getUsageBytes(): Promise<number> {
    if (!fs.existsSync(this.uploadDir)) {
      return 0;
    }
    const files = await fs.promises.readdir(this.uploadDir);
    let totalBytes = 0;
    for (const file of files) {
      const fullPath = path.join(this.uploadDir, file);
      try {
        const stat = await fs.promises.stat(fullPath);
        if (stat.isFile()) {
          totalBytes += stat.size;
        }
      } catch {
        // Ignored if file unlinked concurrently
      }
    }
    return totalBytes;
  }
}

export const localDiskStorage = new LocalDiskStorage();
export const storageService = localDiskStorage;
