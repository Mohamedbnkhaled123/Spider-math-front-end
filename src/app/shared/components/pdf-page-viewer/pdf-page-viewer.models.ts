/**
 * Spider Math Educational Platform (v2.2)
 * PDF Page Viewer Component Models
 */

export interface IPdfPageRenderEvent {
  pageNumber: number;
  totalPages: number;
  canvas: HTMLCanvasElement;
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}

export interface IPdfThumbnail {
  pageNumber: number;
  dataUrl: string;
}
