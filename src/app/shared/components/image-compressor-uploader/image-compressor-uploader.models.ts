/**
 * Spider Math Educational Platform (v2.2)
 * Phase 12: Dual-Folder Direct Client-to-CDN WebP Image Uploader Models
 */

export type UploadTarget = 'question' | 'homework';

export interface CompressedImageItem {
  id: string;
  originalFile: File;
  compressedBlob: Blob;
  previewUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  rotationDeg: number;
  uploadStatus: 'PENDING' | 'COMPRESSING' | 'UPLOADING' | 'SUCCESS' | 'ERROR';
  remoteUrl?: string;
  errorMessage?: string;
}

export interface CloudinarySignatureResponse {
  success: boolean;
  data: {
    signature: string;
    timestamp: number;
    folder: string;
    apiKey: string;
    cloudName: string;
    uploadUrl: string;
  };
}

export interface UploadedHomeworkPayload {
  image_url: string;
  size_kb: number;
  rotation_deg: number;
}
