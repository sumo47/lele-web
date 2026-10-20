/**
 * src/lib/uploadApi.ts — Secure Cloudinary Upload Client for LELE Web
 */

import { getStoredToken, ApiError } from './api';
import type { UploadImageResult } from './types';
import { validateImageFile } from './uploadValidation';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface UploadImageOptions {
  file: File;
  purpose?: 'profile' | 'product' | 'other';
  resourceId?: string;
  onProgress?: (progressPercent: number) => void;
}

/**
 * Uploads an image file to the authoritative LELE backend via POST /api/v1/upload.
 * The backend validates magic-bytes with Sharp, uploads to Cloudinary,
 * stores metadata in PostgreSQL, and synchronizes profile/product pointers.
 */
export async function uploadImage({
  file,
  purpose = 'profile',
  resourceId,
  onProgress,
}: UploadImageOptions): Promise<UploadImageResult> {
  // 1. Client-side validation guard
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new ApiError(
      validation.error || 'Invalid image file',
      validation.code || 'INVALID_FILE',
      400
    );
  }

  // 2. Authentication check
  const token = getStoredToken();
  if (!token) {
    throw new ApiError(
      'You must be logged in to upload photos.',
      'UNAUTHENTICATED',
      401
    );
  }

  // 3. Build multipart form payload
  const formData = new FormData();
  formData.append('file', file, file.name);
  formData.append('purpose', purpose);
  if (resourceId) {
    formData.append('resourceId', resourceId);
  }

  const endpointUrl = `${API_BASE.replace(/\/$/, '')}/upload`;

  // 4. Execute request with XMLHttpRequest for upload progress tracking
  return new Promise<UploadImageResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpointUrl, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    // DO NOT set Content-Type header so browser injects multipart/form-data boundary

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.min(
            100,
            Math.round((event.loaded / event.total) * 100)
          );
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      interface UploadApiResponse {
        success?: boolean;
        data?: UploadImageResult;
        message?: string;
        code?: string;
        error?: {
          message?: string;
          code?: string;
        };
      }
      let responseBody: UploadApiResponse | null = null;
      try {
        responseBody = JSON.parse(xhr.responseText) as UploadApiResponse;
      } catch {
        // response was not JSON
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        const payload = responseBody?.data || (responseBody as unknown as UploadImageResult);
        resolve(payload);
      } else {
        const errorMessage =
          responseBody?.message ||
          responseBody?.error?.message ||
          `Upload failed with status ${xhr.status}`;
        const errorCode =
          responseBody?.code || responseBody?.error?.code || 'UPLOAD_FAILED';
        reject(new ApiError(errorMessage, errorCode, xhr.status));
      }
    };

    xhr.onerror = () => {
      reject(
        new ApiError(
          'Network error: Unable to reach the server. Please check your connection.',
          'NETWORK_ERROR',
          503
        )
      );
    };

    xhr.ontimeout = () => {
      reject(
        new ApiError(
          'Upload timed out. Please try again with a faster connection.',
          'TIMEOUT',
          408
        )
      );
    };

    xhr.timeout = 60000; // 60s timeout for Cloudinary upload
    xhr.send(formData);
  });
}

/**
 * Convenience helper to upload the authenticated customer's profile photo.
 */
export async function apiUploadProfilePhoto(
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadImageResult> {
  return uploadImage({
    file,
    purpose: 'profile',
    onProgress,
  });
}
