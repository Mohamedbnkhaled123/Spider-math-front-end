import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CloudinarySignatureResponse } from '../components/image-compressor-uploader/image-compressor-uploader.models';

export interface IBox2dCropResult {
  blob: Blob;
  dataUrl: string;
  sizeKb: number;
  width: number;
  height: number;
}

/**
 * Expands a normalized bounding box [ymin, xmin, ymax, xmax] (0..1000)
 * by a safety breathing margin (default 6%, min 8 units) clamped to [0, 1000].
 * This guarantees geometry diagrams never cut off perimeter vertices (e.g. A, B, C, D) or labels.
 */
export function applyBoundingBoxPadding(
  box_2d: [number, number, number, number],
  paddingRatio: number = 0.08,
  minPadding: number = 12
): [number, number, number, number] {
  const [ymin, xmin, ymax, xmax] = box_2d;
  const normYmin = Math.min(ymin, ymax);
  const normYmax = Math.max(ymin, ymax);
  const normXmin = Math.min(xmin, xmax);
  const normXmax = Math.max(xmin, xmax);

  const boxW = normXmax - normXmin;
  const boxH = normYmax - normYmin;
  const padX = Math.max(minPadding, Math.round(boxW * paddingRatio));
  const padY = Math.max(minPadding, Math.round(boxH * paddingRatio));

  return [
    Math.max(0, normYmin - padY),
    Math.max(0, normXmin - padX),
    Math.min(1000, normYmax + padY),
    Math.min(1000, normXmax + padX)
  ];
}

/**
 * Crops a bounding box [ymin, xmin, ymax, xmax] (normalized 0..1000)
 * directly from an in-memory HTMLCanvasElement or HTMLImageElement
 * without uploading to Cloudinary.
 *
 * Adheres to RULES.md Rule 5.2 (WebP <= 150KB budget).
 */
export async function cropBoundingBoxToBlob(
  source: HTMLCanvasElement | HTMLImageElement,
  box_2d: [number, number, number, number],
  paddingRatio: number = 0
): Promise<IBox2dCropResult> {
  const sourceWidth = source instanceof HTMLCanvasElement ? source.width : source.naturalWidth;
  const sourceHeight = source instanceof HTMLCanvasElement ? source.height : source.naturalHeight;

  if (!sourceWidth || !sourceHeight) {
    throw new Error('Invalid source dimensions for box_2d cropping');
  }

  const effectiveBox = paddingRatio > 0 ? applyBoundingBoxPadding(box_2d, paddingRatio) : box_2d;
  const [ymin, xmin, ymax, xmax] = effectiveBox;

  // Normalize coordinates in case AI returns inverted bounding coordinates
  const normYmin = Math.min(ymin, ymax);
  const normYmax = Math.max(ymin, ymax);
  const normXmin = Math.min(xmin, xmax);
  const normXmax = Math.max(xmin, xmax);

  if (normXmax <= normXmin || normYmax <= normYmin) {
    throw new Error('Bounding box has zero or negative area');
  }

  const rawX = Math.round((normXmin / 1000) * sourceWidth);
  const rawY = Math.round((normYmin / 1000) * sourceHeight);
  const rawW = Math.round(((normXmax - normXmin) / 1000) * sourceWidth);
  const rawH = Math.round(((normYmax - normYmin) / 1000) * sourceHeight);

  if (rawW <= 0 || rawH <= 0) {
    throw new Error('Bounding box has negligible pixel dimensions (< 1px)');
  }

  // Safe clamping to avoid out of bounds
  const x = Math.max(0, Math.min(sourceWidth - 1, rawX));
  const y = Math.max(0, Math.min(sourceHeight - 1, rawY));
  const w = Math.max(1, Math.min(sourceWidth - x, rawW));
  const h = Math.max(1, Math.min(sourceHeight - y, rawH));

  const offscreen = document.createElement('canvas');
  offscreen.width = w;
  offscreen.height = h;
  const ctx = offscreen.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to acquire 2D canvas context');
  }

  ctx.drawImage(source, x, y, w, h, 0, 0, w, h);

  // Iterative WebP compression to strictly honor <= 150KB budget
  let quality = 0.85;
  let blob: Blob | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    blob = await new Promise<Blob | null>((resolve) => {
      offscreen.toBlob((b) => resolve(b), 'image/webp', quality);
    });

    if (blob && blob.size <= 150 * 1024) {
      break;
    }
    quality -= 0.15;
  }

  if (!blob) {
    // Fallback to JPEG if browser does not support toBlob WebP
    blob = await new Promise<Blob | null>((resolve) => {
      offscreen.toBlob((b) => resolve(b), 'image/jpeg', 0.8);
    });
  }

  if (!blob) {
    throw new Error('Failed to generate image blob from cropped canvas');
  }

  const dataUrl = offscreen.toDataURL('image/webp', quality);
  const sizeKb = Math.round(blob.size / 1024);

  return {
    blob,
    dataUrl,
    sizeKb,
    width: w,
    height: h
  };
}

/**
 * Optimizes a Cloudinary delivery URL by injecting automatic format (`f_auto`),
 * quality (`q_auto`), and width limit (`w_<maxWidth>,c_limit`) transformations.
 * Ensures any future uploaded image is delivered at optimal size & format for the client.
 */
export function optimizeCloudinaryUrl(url: string, maxWidth: number = 1000): string {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) return url;
  if (url.includes('/image/upload/f_auto') || url.includes('/image/upload/q_auto')) return url;
  return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${maxWidth},c_limit/`);
}

/**
 * Uploads an in-memory WebP blob directly to Cloudinary using a short-lived backend signature.
 * Zero binary routing through Express serverless function.
 */
export async function uploadBlobToCloudinary(
  blob: Blob,
  target: 'question' | 'homework',
  http: HttpClient
): Promise<string> {
  const sigResponse = await firstValueFrom(
    http.get<CloudinarySignatureResponse>(
      `/api/v1/assessments/upload-signature?target=${target}`
    )
  );

  const sigData = sigResponse.data;
  const formData = new FormData();
  formData.append('file', blob, `crop_${Date.now()}.webp`);
  formData.append('api_key', sigData.apiKey);
  formData.append('timestamp', sigData.timestamp.toString());
  formData.append('signature', sigData.signature);
  formData.append('folder', sigData.folder);

  const maxW = target === 'question' ? 960 : 1200;

  try {
    const res = await fetch(sigData.uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Cloudinary upload failed (HTTP ${res.status}): ${errorText}`);
    }

    const result: { secure_url: string } = await res.json();
    return optimizeCloudinaryUrl(result.secure_url, maxW);
  } catch (fetchErr) {
    try {
      // Fallback to HttpClient (useful in unit test harnesses and restrictive WebViews)
      const httpResult = await firstValueFrom(
        http.post<{ secure_url: string }>(sigData.uploadUrl, formData)
      );
      return optimizeCloudinaryUrl(httpResult.secure_url, maxW);
    } catch {
      throw fetchErr;
    }
  }
}
