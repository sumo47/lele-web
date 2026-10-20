/**
 * src/lib/uploadValidation.ts — Image file validation utility for LELE Web
 */

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB limit
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
] as const;

export type AllowedMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  code?: 'MISSING_FILE' | 'PAYLOAD_TOO_LARGE' | 'INVALID_FILE_TYPE';
}

/**
 * Formats byte size into human-readable representation (e.g. 2.4 MB, 450 KB).
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Validates file presence, maximum size (5 MB), and supported image formats.
 */
export function validateImageFile(file: unknown): ImageValidationResult {
  if (!file || !(file instanceof File)) {
    return {
      valid: false,
      error: 'Please choose an image file to upload.',
      code: 'MISSING_FILE',
    };
  }

  // 1. File size check (5 MB limit)
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const fileSizeFormatted = formatBytes(file.size);
    return {
      valid: false,
      error: `The selected photo (${fileSizeFormatted}) exceeds the 5 MB limit. Please select a photo under 5 MB.`,
      code: 'PAYLOAD_TOO_LARGE',
    };
  }

  // 2. MIME type check
  const normalizedMime = file.type.toLowerCase();
  const filename = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.some((ext) =>
    filename.endsWith(ext)
  );

  const hasValidMime = (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(
    normalizedMime
  );

  if (!hasValidMime && !hasValidExtension) {
    return {
      valid: false,
      error:
        'Invalid image format. Only JPEG, PNG, and WebP images are supported.',
      code: 'INVALID_FILE_TYPE',
    };
  }

  return { valid: true };
}

/**
 * Safely creates an object URL for previewing an image.
 */
export function createImagePreview(file: File): string {
  if (typeof window === 'undefined') return '';
  return URL.createObjectURL(file);
}

/**
 * Revokes a previously created object URL to prevent memory leaks.
 */
export function revokeImagePreview(url: string): void {
  if (typeof window === 'undefined') return;
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}
