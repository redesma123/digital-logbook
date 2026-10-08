import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { LocalDiskStorage } from '../../src/storage/local-disk.storage.js';
import { AppError } from '../../src/lib/response.js';

describe('LocalDiskStorage', () => {
  const testUploadDir = path.resolve(process.cwd(), 'temp-test-uploads');
  let storage: LocalDiskStorage;

  beforeEach(() => {
    if (fs.existsSync(testUploadDir)) {
      fs.rmSync(testUploadDir, { recursive: true, force: true });
    }
    storage = new LocalDiskStorage(testUploadDir);
  });

  afterEach(() => {
    if (fs.existsSync(testUploadDir)) {
      fs.rmSync(testUploadDir, { recursive: true, force: true });
    }
  });

  it('should ensure upload directory exists on init', () => {
    expect(fs.existsSync(testUploadDir)).toBe(true);
  });

  it('should save a file and return path, size, and filenameStored with extension', async () => {
    const fileBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    const result = await storage.save(fileBuffer, 'image/jpeg', 'sample.jpg');

    expect(result.size).toBe(4);
    expect(result.filenameStored).toMatch(/^[0-9a-fA-F-]+(\.jpg)?$/);
    expect(fs.existsSync(result.path)).toBe(true);

    const content = await fs.promises.readFile(result.path);
    expect(content).toEqual(fileBuffer);
  });

  it('should stream an existing file', async () => {
    const fileBuffer = Buffer.from('hello streaming test');
    const result = await storage.save(fileBuffer, 'text/plain', 'test.txt');

    const stream = await storage.stream(result.path);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const combined = Buffer.concat(chunks);
    expect(combined.toString()).toBe('hello streaming test');
  });

  it('should throw 404 AppError when streaming non-existent file', async () => {
    await expect(storage.stream('non-existent-file.jpg')).rejects.toThrow(AppError);
  });

  it('should delete existing file', async () => {
    const fileBuffer = Buffer.from('to be deleted');
    const result = await storage.save(fileBuffer, 'text/plain', 'delete.txt');
    expect(fs.existsSync(result.path)).toBe(true);

    await storage.delete(result.path);
    expect(fs.existsSync(result.path)).toBe(false);
  });

  it('should not throw when deleting non-existent file', async () => {
    await expect(storage.delete('non-existent-file.jpg')).resolves.toBeUndefined();
  });

  it('should calculate total usage bytes correctly', async () => {
    expect(await storage.getUsageBytes()).toBe(0);

    await storage.save(Buffer.alloc(100), 'image/png', 'img1.png');
    await storage.save(Buffer.alloc(250), 'image/jpeg', 'img2.jpg');

    expect(await storage.getUsageBytes()).toBe(350);
  });
});
