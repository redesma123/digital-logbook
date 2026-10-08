export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];

/**
 * Detect valid image MIME types from buffer using magic bytes:
 * - JPEG: bytes 0xFF, 0xD8, 0xFF
 * - PNG: bytes 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
 * - WebP: starts with RIFF (0x52 0x49 0x46 0x46) and bytes 8..11 are WEBP (0x57 0x45 0x42 0x50)
 *
 * @param buffer - Buffer to check
 * @returns detected MIME type ('image/jpeg' | 'image/png' | 'image/webp') or null if invalid
 */
export function detectMimeType(buffer: Buffer): AllowedMimeType | null {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    return null;
  }

  // Check JPEG (at least 3 bytes): 0xFF, 0xD8, 0xFF
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return 'image/jpeg';
  }

  // Check PNG (at least 8 bytes): 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // Check WebP (at least 12 bytes):
  // Bytes 0-3: 'RIFF' (0x52, 0x49, 0x46, 0x46)
  // Bytes 8-11: 'WEBP' (0x57, 0x45, 0x42, 0x50)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }

  return null;
}
