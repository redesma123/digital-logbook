import { Readable } from 'stream';

export interface StorageService {
  save(file: Buffer, mimeType: string, originalFilename: string): Promise<{ path: string; size: number; filenameStored: string }>;
  stream(path: string): Promise<Readable>;
  delete(path: string): Promise<void>;
  getUsageBytes(): Promise<number>;
}
