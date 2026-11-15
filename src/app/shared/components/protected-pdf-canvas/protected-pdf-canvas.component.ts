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
import { HttpClient } from '@angular/common/http';

import { AppIconComponent } from '../app-icon/app-icon.component';
import { PreventContextCopyDirective } from '../../directives/prevent-context-copy.directive';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { IPdfPrintEvent } from './protected-pdf-canvas.models';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

@Component({
  selector: 'app-protected-pdf-canvas',
  standalone: true,
  imports: [CommonModule, AppIconComponent, PreventContextCopyDirective],
  templateUrl: './protected-pdf-canvas.component.html',
  styleUrl: './protected-pdf-canvas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtectedPdfCanvasComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  readonly langService = inject(LangService);

  // Inputs
  readonly lectureId = input.required<string>();
  readonly fileId = input.required<string>();
  readonly documentTitle = input<string>('مذكرة الشرح والتمارين — سبايدر ماث');
  readonly isPrintAllowed = input<boolean>(false);
  readonly watermarkText = input<string>('Spider Math | HA1001');

  // Outputs
  readonly pageRendered = output<{ currentPage: number; totalPages: number }>();
  readonly printAttempted = output<IPdfPrintEvent>();

  // Canvas ViewChild
  readonly pdfCanvas = viewChild<ElementRef<HTMLCanvasElement>>('pdfCanvas');

  // Signals
  readonly currentPage = signal<number>(1);
  readonly totalPages = signal<number>(1);
  readonly zoomScale = signal<number>(1.25);
  readonly scale = this.zoomScale;
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  private pdfDoc: any = null;
  private currentRenderingTask: any = null;

  constructor() {
    effect(() => {
      const lecId = this.lectureId();
      const fId = this.fileId();
      if (!isPlatformBrowser(this.platformId) || !lecId) return;
      this.loadPdfJsAndDocument();
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadPdfJsAndDocument();
    }
  }

  ngOnDestroy(): void {
    if (this.currentRenderingTask) {
      try {
        this.currentRenderingTask.cancel?.();
      } catch {}
    }
  }

  zoomIn(): void {
    if (this.zoomScale() < 2.5) {
      this.zoomScale.update(s => Math.min(2.5, Math.round((s + 0.25) * 100) / 100));
      this.renderCurrentPage();
    }
  }

  zoomOut(): void {
    if (this.zoomScale() > 0.75) {
      this.zoomScale.update(s => Math.max(0.75, Math.round((s - 0.25) * 100) / 100));
      this.renderCurrentPage();
    }
  }

  resetZoom(): void {
    if (this.zoomScale() !== 1.25) {
      this.zoomScale.set(1.25);
      this.renderCurrentPage();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.renderCurrentPage();
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.renderCurrentPage();
    }
  }

  readonly isPrinting = signal<boolean>(false);
  readonly printProgress = signal<{ current: number; total: number } | null>(null);

  async printDocument(): Promise<void> {
    this.printAttempted.emit({
      isPrintAllowed: this.isPrintAllowed(),
      timestamp: Date.now()
    });

    if (!this.isPrintAllowed()) {
      alert('الطباعة غير مصرح بها.');
      return;
    }

    if (!isPlatformBrowser(this.platformId) || !this.pdfDoc) return;
    if (this.isPrinting()) return;

    try {
      this.isPrinting.set(true);
      const total = this.totalPages();
      this.printProgress.set({ current: 0, total });

      // Create hidden iframe to isolate document printing away from website layout
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) {
        document.body.removeChild(iframe);
        this.isPrinting.set(false);
        this.printProgress.set(null);
        return;
      }

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html dir="rtl">
          <head>
            <meta charset="utf-8">
            <title>${this.documentTitle() || 'مذكرة الشرح والتمارين'}</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 0mm;
              }
              html, body {
                margin: 0;
                padding: 0;
                background: #ffffff;
                width: 100%;
              }
              #print-container, .print-page {
                direction: ltr !important;
              }
              .print-page {
                page-break-after: always;
                page-break-inside: avoid;
                break-after: page;
                break-inside: avoid;
                width: 100vw;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                padding: 0;
                margin: 0;
                overflow: hidden;
              }
              .print-page:last-child {
                page-break-after: auto;
                break-after: auto;
              }
              .print-page img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                display: block;
              }
            </style>
          </head>
          <body>
            <div id="print-container"></div>
          </body>
        </html>
      `);
      iframeDoc.close();

      const container = iframeDoc.getElementById('print-container');
      const scale = 2.0; // Sharp 300DPI equivalent for crisp, crystal-clear printing

      for (let pageNum = 1; pageNum <= total; pageNum++) {
        this.printProgress.set({ current: pageNum, total });
        const page = await this.pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.setAttribute('dir', 'ltr');
        offscreenCanvas.style.direction = 'ltr';
        offscreenCanvas.width = viewport.width;
        offscreenCanvas.height = viewport.height;
        const ctx = offscreenCanvas.getContext('2d');

        if (ctx) {
          (ctx as CanvasRenderingContext2D).direction = 'ltr';
          await page.render({ canvasContext: ctx, viewport }).promise;
          this.stampCanvasWatermark(ctx, offscreenCanvas.width, offscreenCanvas.height);

          const pageDiv = iframeDoc.createElement('div');
          pageDiv.className = 'print-page';
          const img = iframeDoc.createElement('img');
          img.src = offscreenCanvas.toDataURL('image/jpeg', 0.92);
          pageDiv.appendChild(img);
          container?.appendChild(pageDiv);
        }
      }

      this.printProgress.set(null);
      this.isPrinting.set(false);

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 5000);
      }, 500);

    } catch (err) {
      console.error('Print generation failed:', err);
      this.isPrinting.set(false);
      this.printProgress.set(null);
    }
  }

  retryLoad(): void {
    this.loadPdfJsAndDocument();
  }

  private loadPdfJsAndDocument(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const onPdfJsReady = () => {
      this.fetchBinaryPdfStream();
    };

    if (window.pdfjsLib) {
      onPdfJsReady();
    } else {
      // 1. Primary: Load self-hosted local bundle (Fastest & 100% immune to external CDN/CSP blocks)
      const script = document.createElement('script');
      script.src = '/assets/libs/pdfjs/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/libs/pdfjs/pdf.worker.min.js';
        onPdfJsReady();
      };
      script.onerror = () => {
        // 2. Secondary fallback: Cloudflare CDN
        const cdnScript = document.createElement('script');
        cdnScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        cdnScript.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          onPdfJsReady();
        };
        cdnScript.onerror = () => {
          // 3. Tertiary fallback: jsDelivr CDN
          const jsdelivrScript = document.createElement('script');
          jsdelivrScript.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
          jsdelivrScript.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
            onPdfJsReady();
          };
          jsdelivrScript.onerror = () => {
            this.isLoading.set(false);
            this.errorMessage.set('تعذر تحميل PDF. تحقق من الإنترنت.');
          };
          document.head.appendChild(jsdelivrScript);
        };
        document.head.appendChild(cdnScript);
      };
      document.head.appendChild(script);
    }
  }

  private fetchBinaryPdfStream(): void {
    const rawFileId = this.fileId() ? this.fileId().trim() : '';
    const filePart = rawFileId ? `/${rawFileId}` : '';
    const url = `/api/v1/lectures/${this.lectureId()}/pdf${filePart}/stream`;

    this.http.get(url, { responseType: 'arraybuffer' }).subscribe({
      next: buffer => {
        const loadingTask = window.pdfjsLib.getDocument({ data: buffer });
        loadingTask.promise.then(
          (doc: any) => {
            this.pdfDoc = doc;
            this.totalPages.set(doc.numPages);
            this.isLoading.set(false);
            this.errorMessage.set(null);
            this.currentPage.set(1);
            this.renderCurrentPage();
          },
          (err: any) => {
            this.isLoading.set(false);
            this.errorMessage.set('تعذر عرض الـ PDF. الملف غير صالح.');
          }
        );
      },
      error: (err) => {
        this.isLoading.set(false);
        let msg = 'تعذر جلب الـ PDF.';
        if (err?.error instanceof ArrayBuffer) {
          try {
            const text = new TextDecoder('utf-8').decode(err.error);
            const parsed = JSON.parse(text);
            if (parsed?.error?.message) {
              msg = parsed.error.message;
            }
          } catch {}
        } else if (err?.error?.error?.message) {
          msg = err.error.error.message;
        } else if (err?.error?.message) {
          msg = err.error.message;
        }
        this.errorMessage.set(msg);
      }
    });
  }

  private async renderCurrentPage(): Promise<void> {
    const canvas = this.pdfCanvas()?.nativeElement;
    if (!canvas || !this.pdfDoc) return;

    if (this.currentRenderingTask) {
      try {
        this.currentRenderingTask.cancel?.();
      } catch {}
      this.currentRenderingTask = null;
    }

    try {
      const page = await this.pdfDoc.getPage(this.currentPage());
      const viewport = page.getViewport({ scale: this.zoomScale() });
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.setAttribute('dir', 'ltr');
      canvas.style.direction = 'ltr';
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      (context as CanvasRenderingContext2D).direction = 'ltr';

      this.currentRenderingTask = page.render({
        canvasContext: context,
        viewport
      });

      await this.currentRenderingTask.promise;
      this.currentRenderingTask = null;

      this.stampCanvasWatermark(context, canvas.width, canvas.height);
      this.pageRendered.emit({
        currentPage: this.currentPage(),
        totalPages: this.totalPages()
      });
    } catch (err: any) {
      if (err?.name === 'RenderingCancelledException') {
        return; // Normal when switching pages or zoom quickly
      }
      console.error('PDF rendering failed:', err);
    }
  }

  private stampCanvasWatermark(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.font = 'bold 16px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(109, 40, 217, 0.12)';
    ctx.textAlign = 'center';
    ctx.rotate(-Math.PI / 6);

    const stepX = 280;
    const stepY = 180;
    const text = this.watermarkText();

    for (let x = -width; x < width * 2; x += stepX) {
      for (let y = -height; y < height * 2; y += stepY) {
        ctx.fillText(text, x, y);
      }
    }
    ctx.restore();
  }
}
