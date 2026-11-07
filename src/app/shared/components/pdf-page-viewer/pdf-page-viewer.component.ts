import {
  Component,
  ChangeDetectionStrategy,
  signal,
  input,
  output,
  inject,
  ElementRef,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  viewChild,
  effect
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AppIconComponent } from '../app-icon/app-icon.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { IPdfPageRenderEvent, IPdfThumbnail } from './pdf-page-viewer.models';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

@Component({
  selector: 'app-pdf-page-viewer',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  templateUrl: './pdf-page-viewer.component.html',
  styleUrl: './pdf-page-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdfPageViewerComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  readonly langService = inject(LangService);

  // Inputs
  readonly pdfSrc = input<File | Blob | ArrayBuffer | string | null>(null);
  readonly initialPage = input<number>(1);
  readonly scale = input<number>(2.0); // 2.0x High-DPI for crystal-clear math equations
  readonly showThumbnails = input<boolean>(true);

  // Outputs
  readonly pageRendered = output<IPdfPageRenderEvent>();
  readonly pageChanged = output<number>();
  readonly pdfLoaded = output<{ totalPages: number }>();
  readonly errorOccurred = output<string>();

  // Canvas ViewChild
  readonly mainCanvas = viewChild<ElementRef<HTMLCanvasElement>>('mainCanvas');

  // Signals
  readonly currentPage = signal<number>(1);
  readonly totalPages = signal<number>(0);
  readonly zoomFactor = signal<number>(1.0);
  readonly isLoading = signal<boolean>(false);
  readonly isRendering = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly thumbnails = signal<IPdfThumbnail[]>([]);

  private pdfDoc: any = null;
  private currentRenderTask: any = null;
  private isDestroyed = false;
  private lastLoadedSrc: File | Blob | ArrayBuffer | string | null = null;
  private currentThumbnailGenId = 0;

  constructor() {
    // Reactively reload when pdfSrc input changes
    effect(() => {
      const src = this.pdfSrc();
      if (!isPlatformBrowser(this.platformId) || !src) return;
      this.loadDocument(src);
    });
  }

  ngOnInit(): void {
    // Document loading is handled reactively by the effect()
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.currentRenderTask) {
      try {
        this.currentRenderTask.cancel?.();
      } catch {
        // ignore cancel on destroy
      }
    }
    if (this.pdfDoc) {
      try {
        this.pdfDoc.destroy?.();
      } catch {
        // ignore
      }
    }
  }

  private async getPdfJsLib(): Promise<any> {
    if (window.pdfjsLib) {
      return window.pdfjsLib;
    }

    try {
      // Dynamic import to prevent SSR server evaluation
      const pdfjs = await import('pdfjs-dist');
      const lib = pdfjs.default || pdfjs;
      if (lib.GlobalWorkerOptions) {
        lib.GlobalWorkerOptions.workerSrc = '/assets/libs/pdfjs/pdf.worker.min.js';
      }
      return lib;
    } catch {
      // Fallback to global script loader if bundler worker isn't found
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/assets/libs/pdfjs/pdf.min.js';
        script.onload = () => {
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/libs/pdfjs/pdf.worker.min.js';
            resolve(window.pdfjsLib);
          } else {
            reject(new Error('pdfjsLib is unavailable after script load'));
          }
        };
        script.onerror = () => reject(new Error('Failed to load local pdf.min.js'));
        document.head.appendChild(script);
      });
    }
  }

  async loadDocument(src: File | Blob | ArrayBuffer | string): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.lastLoadedSrc === src && this.pdfDoc) return;

    this.lastLoadedSrc = src;
    const genId = ++this.currentThumbnailGenId;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.thumbnails.set([]);

    try {
      const pdfjsLib = await this.getPdfJsLib();

      let pdfData: Uint8Array | ArrayBuffer;
      if (src instanceof File || src instanceof Blob) {
        pdfData = await src.arrayBuffer();
      } else if (typeof src === 'string') {
        const res = await fetch(src);
        pdfData = await res.arrayBuffer();
      } else {
        pdfData = src;
      }

      const loadingTask = pdfjsLib.getDocument({ data: pdfData });
      this.pdfDoc = await loadingTask.promise;

      const numPages = this.pdfDoc.numPages;
      this.totalPages.set(numPages);

      const targetPage = Math.min(Math.max(1, this.initialPage()), numPages);
      this.currentPage.set(targetPage);

      this.pdfLoaded.emit({ totalPages: numPages });
      this.isLoading.set(false);

      // Render the selected page
      await this.renderCurrentPage();

      // Generate thumbnails in background
      if (this.showThumbnails()) {
        this.generateThumbnails(genId);
      }
    } catch (err: any) {
      console.error('Failed to load PDF document:', err);
      const msg = 'تعذر فتح ملف الـ PDF. يرجى التأكد من صلاحية الملف والمحاولة مرة أخرى.';
      this.errorMessage.set(msg);
      this.errorOccurred.emit(msg);
      this.isLoading.set(false);
    }
  }

  async renderCurrentPage(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !this.pdfDoc || this.isDestroyed) return;

    const canvasRef = this.mainCanvas();
    if (!canvasRef) {
      setTimeout(() => {
        if (!this.isDestroyed) this.renderCurrentPage();
      }, 50);
      return;
    }

    if (this.currentRenderTask) {
      try {
        this.currentRenderTask.cancel();
      } catch {
        // ignore cancel exception
      }
      this.currentRenderTask = null;
    }

    this.isRendering.set(true);
    const pageNum = this.currentPage();

    try {
      const page = await this.pdfDoc.getPage(pageNum);
      const totalScale = this.scale() * this.zoomFactor();
      const viewport = page.getViewport({ scale: totalScale });

      const canvas = canvasRef.nativeElement;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot acquire canvas 2D context');

      // Clear previous frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      this.currentRenderTask = page.render({
        canvasContext: ctx,
        viewport
      });

      await this.currentRenderTask.promise;
      this.currentRenderTask = null;

      // Create WebP blob & dataUrl from crisp 2x High-DPI canvas
      const dataUrl = canvas.toDataURL('image/webp', 0.92);
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b || new Blob()), 'image/webp', 0.92);
      });

      this.isRendering.set(false);

      this.pageRendered.emit({
        pageNumber: pageNum,
        totalPages: this.totalPages(),
        canvas,
        blob,
        dataUrl,
        width: canvas.width,
        height: canvas.height
      });
    } catch (err: any) {
      if (err?.name === 'RenderingCancelledException') {
        return; // Normal when switching pages quickly
      }
      console.error('Page rendering error:', err);
      this.isRendering.set(false);
    }
  }

  private async generateThumbnails(genId: number): Promise<void> {
    if (!this.pdfDoc || this.isDestroyed) return;

    const total = this.totalPages();
    const thumbs: IPdfThumbnail[] = [];

    // Thumbnail scale 0.25 for minimal memory footprint
    const thumbScale = 0.25;

    for (let p = 1; p <= total; p++) {
      if (this.isDestroyed || genId !== this.currentThumbnailGenId) break;
      try {
        const page = await this.pdfDoc.getPage(p);
        if (this.isDestroyed || genId !== this.currentThumbnailGenId) break;
        const viewport = page.getViewport({ scale: thumbScale });
        const offCanvas = document.createElement('canvas');
        offCanvas.width = viewport.width;
        offCanvas.height = viewport.height;
        const ctx = offCanvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          if (this.isDestroyed || genId !== this.currentThumbnailGenId) break;
          thumbs.push({
            pageNumber: p,
            dataUrl: offCanvas.toDataURL('image/jpeg', 0.7)
          });
          // Update signals progressively every 3 pages or at the end
          if (p % 3 === 0 || p === total) {
            this.thumbnails.set([...thumbs]);
          }
        }
      } catch {
        // Skip failed thumbnail
      }
    }
  }

  goToPage(num: number): void {
    const target = Math.max(1, Math.min(this.totalPages(), num));
    if (target !== this.currentPage()) {
      this.currentPage.set(target);
      this.pageChanged.emit(target);
      this.renderCurrentPage();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  zoomIn(): void {
    if (this.zoomFactor() < 2.5) {
      this.zoomFactor.update((z) => Math.min(2.5, Math.round((z + 0.25) * 100) / 100));
      this.renderCurrentPage();
    }
  }

  zoomOut(): void {
    if (this.zoomFactor() > 0.5) {
      this.zoomFactor.update((z) => Math.max(0.5, Math.round((z - 0.25) * 100) / 100));
      this.renderCurrentPage();
    }
  }

  resetZoom(): void {
    if (this.zoomFactor() !== 1.0) {
      this.zoomFactor.set(1.0);
      this.renderCurrentPage();
    }
  }
}
