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
      this.currentRenderingTask.cancel?.();
    }
  }

  zoomIn(): void {
    if (this.zoomScale() < 2.5) {
      this.zoomScale.update(s => Math.round((s + 0.25) * 100) / 100);
      this.renderCurrentPage();
    }
  }

  zoomOut(): void {
    if (this.zoomScale() > 0.75) {
      this.zoomScale.update(s => Math.round((s - 0.25) * 100) / 100);
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

  printDocument(): void {
    this.printAttempted.emit({
      isPrintAllowed: this.isPrintAllowed(),
      timestamp: Date.now()
    });

    if (!this.isPrintAllowed()) {
      alert('الطباعة غير مصرح بها لهذا المستند التعليمي.');
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      // Watermark is already rendered on canvas bitmap, trigger standard print
      window.print();
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
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        onPdfJsReady();
      };
      script.onerror = () => {
        this.isLoading.set(false);
        this.errorMessage.set('تعذر تحميل مكتبة معالجة الـ PDF. يرجى التحقق من اتصالك بالإنترنت.');
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
            this.errorMessage.set('تعذر معالجة وعرض صفحات الـ PDF. قد يكون الملف غير صالح.');
          }
        );
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('تعذر جلب ملف الـ PDF من Google Drive. يرجى التأكد من معرّف الملف وصلاحيات الوصول.');
      }
    });
  }

  private renderCurrentPage(): void {
    const canvas = this.pdfCanvas()?.nativeElement;
    if (!canvas || !this.pdfDoc) return;

    this.pdfDoc.getPage(this.currentPage()).then((page: any) => {
      const viewport = page.getViewport({ scale: this.zoomScale() });
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (this.currentRenderingTask) {
        this.currentRenderingTask.cancel?.();
      }

      this.currentRenderingTask = page.render({
        canvasContext: context,
        viewport
      });

      this.currentRenderingTask.promise.then(() => {
        this.stampCanvasWatermark(context, canvas.width, canvas.height);
        this.pageRendered.emit({
          currentPage: this.currentPage(),
          totalPages: this.totalPages()
        });
      });
    });
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
