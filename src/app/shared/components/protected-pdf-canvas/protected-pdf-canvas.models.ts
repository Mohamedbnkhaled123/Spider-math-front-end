export interface IPdfRenderProgress {
  currentPage: number;
  totalPages: number;
  zoomScale: number;
  isLoading: boolean;
  errorMessage?: string | null;
}

export interface IPdfPrintEvent {
  isPrintAllowed: boolean;
  timestamp: number;
}
