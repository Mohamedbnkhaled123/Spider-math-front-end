/**
 * Spider Math Educational Platform (v2.2)
 * Manual Image Slicer Modal Models
 */

export type CropAspectRatio = 'FREE' | '16:9' | '4:3' | '1:1';

export interface ISliceResult {
  imageUrl: string; // Cloudinary secure_url or local dataUrl
  blob: Blob;
  dataUrl: string;
  sizeKb: number;
  width: number;
  height: number;
}
