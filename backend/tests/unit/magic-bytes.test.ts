import { describe, it, expect } from 'vitest';
import { detectMimeType } from '../../src/utils/magic-bytes.js';

describe('Magic Bytes Detection', () => {
  it('should detect valid JPEG image', () => {
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
    expect(detectMimeType(jpegBuffer)).toBe('image/jpeg');
  });

  it('should detect minimal 3-byte JPEG image', () => {
    const minJpegBuffer = Buffer.from([0xff, 0xd8, 0xff]);
    expect(detectMimeType(minJpegBuffer)).toBe('image/jpeg');
  });

  it('should detect valid PNG image', () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
    expect(detectMimeType(pngBuffer)).toBe('image/png');
  });

  it('should detect valid WebP image', () => {
    // RIFF (4 bytes) + 4 bytes size + WEBP (4 bytes) + arbitrary payload
    const webpBuffer = Buffer.from([
      0x52, 0x49, 0x46, 0x46, // 'RIFF'
      0x24, 0x00, 0x00, 0x00, // size
      0x57, 0x45, 0x42, 0x50, // 'WEBP'
      0x56, 0x50, 0x38, 0x20, // 'VP8 '
    ]);
    expect(detectMimeType(webpBuffer)).toBe('image/webp');
  });

  it('should return null for plain text buffer', () => {
    const textBuffer = Buffer.from('Hello world this is not an image');
    expect(detectMimeType(textBuffer)).toBeNull();
  });

  it('should return null for fake image (text pretending to be jpg)', () => {
    const fakeBuffer = Buffer.from('<?php echo "evil"; ?>');
    expect(detectMimeType(fakeBuffer)).toBeNull();
  });

  it('should return null for PDF document', () => {
    const pdfBuffer = Buffer.from('%PDF-1.5 fake pdf data');
    expect(detectMimeType(pdfBuffer)).toBeNull();
  });

  it('should return null for empty buffer', () => {
    const emptyBuffer = Buffer.alloc(0);
    expect(detectMimeType(emptyBuffer)).toBeNull();
  });

  it('should return null for buffer shorter than minimum header', () => {
    const shortBuffer = Buffer.from([0xff, 0xd8]);
    expect(detectMimeType(shortBuffer)).toBeNull();
  });

  it('should return null for invalid WebP header (RIFF without WEBP)', () => {
    const riffAvi = Buffer.from([
      0x52, 0x49, 0x46, 0x46,
      0x00, 0x00, 0x00, 0x00,
      0x41, 0x56, 0x49, 0x20, // 'AVI '
    ]);
    expect(detectMimeType(riffAvi)).toBeNull();
  });

  it('should return null for null or non-buffer inputs', () => {
    expect(detectMimeType(null as any)).toBeNull();
    expect(detectMimeType(undefined as any)).toBeNull();
    expect(detectMimeType('not a buffer' as any)).toBeNull();
  });
});
