import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  signal,
  computed,
  input,
  output,
  model,
  inject,
  PLATFORM_ID,
  effect,
  untracked,
  viewChild
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon.component';
import { MathVirtualKeyboardComponent } from '../../../../shared/components/math-virtual-keyboard/math-virtual-keyboard.component';
import { toVisualMath, stripLatexDelimiters } from '../../../../shared/components/math-virtual-keyboard/math-virtual-keyboard.models';
import { PdfPageViewerComponent } from '../../../../shared/components/pdf-page-viewer/pdf-page-viewer.component';
import { IPdfPageRenderEvent } from '../../../../shared/components/pdf-page-viewer/pdf-page-viewer.models';
import { ManualImageSlicerModalComponent } from '../../../../shared/components/manual-image-slicer-modal/manual-image-slicer-modal.component';
import { ISliceResult } from '../../../../shared/components/manual-image-slicer-modal/manual-image-slicer-modal.models';
import { cropBoundingBoxToBlob, uploadBlobToCloudinary, applyBoundingBoxPadding } from '../../../../shared/utils/box2d-cropper.util';
import { LangService } from '../../../../core/seo-theme-i18n/lang.service';
import { ModalNavigationService } from '../../../../core/services/modal-navigation.service';
import { AssessmentQuestionItem } from '../assessment-studio.models';
import {
  AiExtractionMode,
  PageScopeMode,
  IStagedQuestion,
  ICachedFileSession,
  IAiExtractionBackendResponse,
  IConfirmationDialogState
} from './ai-question-extraction-modal.models';

@Component({
  selector: 'app-ai-question-extraction-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppIconComponent,
    MathVirtualKeyboardComponent,
    PdfPageViewerComponent,
    ManualImageSlicerModalComponent
  ],
  templateUrl: './ai-question-extraction-modal.component.html',
  styleUrl: './ai-question-extraction-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiQuestionExtractionModalComponent {
  readonly toVisualMath = toVisualMath;
  readonly stripLatexDelimiters = stripLatexDelimiters;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly langService = inject(LangService);
  readonly modalNav = inject(ModalNavigationService);

  // Inputs & Two-Way Model (Bound dynamically from active assessment)
  readonly isOpen = model<boolean>(false);
  readonly assessmentId = input<string>('');
  readonly curriculum = input<string>('');
  readonly gradeLevel = input<string>('');
  readonly existingSession = input<ICachedFileSession | null>(null);

  private readonly stagedByAssessment = new Map<string, IStagedQuestion[]>();
  private lastAssessmentId: string | null = null;

  // Outputs
  readonly questionsExtracted = output<AssessmentQuestionItem[]>();
  readonly fileSessionCached = output<ICachedFileSession>();
  readonly manualSlicingRequested = output<ICachedFileSession>();
  readonly cancelled = output<void>();

  // Wizard Step State
  readonly currentStep = signal<'UPLOAD_AND_SELECT' | 'PREVIEW_AND_PAGE' | 'STAGING_REVIEW'>('UPLOAD_AND_SELECT');
  readonly extractionMode = signal<AiExtractionMode>('SMART_HYBRID');

  // File & Canvas State
  readonly uploadedFile = signal<File | null>(null);
  readonly uploadedImages = signal<Array<{ fileName: string; canvas: HTMLCanvasElement; dataUrl: string }>>([]);
  readonly fileType = signal<'pdf' | 'image' | null>(null);
  readonly fileName = signal<string>('');
  readonly isDragging = signal<boolean>(false);

  // Page View State
  readonly currentPageNumber = signal<number>(1);
  readonly totalPages = signal<number>(1);
  readonly currentDataUrl = signal<string | null>(null);
  currentCanvas: HTMLCanvasElement | null = null;

  // PDF Viewer ViewChild
  readonly pdfViewer = viewChild<PdfPageViewerComponent>(PdfPageViewerComponent);

  // Page Scope & Range State
  readonly maxExtractablePages = 3;
  readonly pageScopeMode = signal<PageScopeMode>('CURRENT_PAGE');
  readonly rangeStartPage = signal<number>(1);
  readonly rangeEndPage = signal<number>(1);

  readonly selectedPageCount = computed(() => {
    if (this.pageScopeMode() === 'CURRENT_PAGE') return 1;
    const start = this.rangeStartPage();
    const end = this.rangeEndPage();
    return Math.max(1, end - start + 1);
  });

  readonly minRangeEndPage = computed(() => {
    const total = Math.max(1, this.totalPages());
    return Math.max(1, Math.min(total, this.rangeStartPage()));
  });

  readonly maxRangeEndPage = computed(() => {
    const total = Math.max(1, this.totalPages());
    const start = this.minRangeEndPage();
    return Math.min(total, start + this.maxExtractablePages - 1);
  });

  readonly isRangeValid = computed(() => {
    if (this.pageScopeMode() === 'CURRENT_PAGE') return true;
    const total = Math.max(1, this.totalPages());
    const start = this.rangeStartPage();
    const end = this.rangeEndPage();
    return (
      start >= 1 &&
      start <= total &&
      end >= start &&
      end <= total &&
      end - start + 1 <= this.maxExtractablePages
    );
  });

  readonly rangeValidationError = computed(() => {
    if (this.pageScopeMode() === 'CURRENT_PAGE') return null;
    const total = Math.max(1, this.totalPages());
    const start = this.rangeStartPage();
    const end = this.rangeEndPage();
    const isAr = this.langService.isArabic();
    if (start < 1 || start > total || end < start || end > total) {
      return isAr ? `(النطاق من 1 إلى ${total})` : `(Range must be 1 - ${total})`;
    }
    if (end - start + 1 > this.maxExtractablePages) {
      return isAr ? `(أقصى حد ${this.maxExtractablePages} صفحات)` : `(Max ${this.maxExtractablePages} pages)`;
    }
    return null;
  });

  private readonly fallbackDraftId = 'draft_asm_' + Math.random().toString(36).substring(2, 9);

  getEffectiveAssessmentId(): string {
    return (this.assessmentId() || '').trim() || this.fallbackDraftId;
  }

  private getStorageKey(assessmentId: string, fileName: string): string {
    const aid = (assessmentId || '').trim() || this.fallbackDraftId;
    const cleanFile = (fileName || '').replace(/[^a-zA-Z0-9_-]/g, '_');
    return `spider_math_pdf_page_${aid}_${cleanFile}`;
  }

  persistPageToSessionStorage(assessmentId: string, fileName: string, page: number): void {
    if (!isPlatformBrowser(this.platformId) || !fileName) return;
    try {
      const key = this.getStorageKey(assessmentId, fileName);
      sessionStorage.setItem(key, JSON.stringify({
        assessmentId: (assessmentId || '').trim() || this.fallbackDraftId,
        fileName,
        lastPage: page,
        updatedAt: Date.now()
      }));
    } catch {
      // ignore storage write errors
    }
  }

  getStoredPageFromSessionStorage(assessmentId: string, fileName: string): number | null {
    if (!isPlatformBrowser(this.platformId) || !fileName) return null;
    try {
      const key = this.getStorageKey(assessmentId, fileName);
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.lastPage === 'number' && parsed.lastPage >= 1) {
        return parsed.lastPage;
      }
    } catch {
      // ignore
    }
    return null;
  }

  setPageScopeMode(mode: PageScopeMode): void {
    this.pageScopeMode.set(mode);
    if (mode === 'PAGE_RANGE') {
      const cur = this.currentPageNumber();
      const total = Math.max(1, this.totalPages());
      this.rangeStartPage.set(cur);
      this.rangeEndPage.set(Math.min(total, cur + 1));
    }
  }

  onStartPageInput(rawVal: any): void {
    const str = String(rawVal ?? '').trim();
    if (!str) return;
    const val = parseInt(str, 10);
    if (isNaN(val)) return;
    this.rangeStartPage.set(val);
  }

  onStartPageChanged(rawVal: any, inputEl?: HTMLInputElement): void {
    const total = Math.max(1, this.totalPages());
    let val = parseInt(rawVal, 10);
    if (isNaN(val)) val = 1;
    val = Math.max(1, Math.min(total, val));
    this.rangeStartPage.set(val);
    if (this.rangeEndPage() < val) {
      this.rangeEndPage.set(val);
    }
    if (inputEl) {
      inputEl.value = String(val);
    }
  }

  onEndPageInput(rawVal: any): void {
    const str = String(rawVal ?? '').trim();
    if (!str) return;
    const val = parseInt(str, 10);
    if (isNaN(val)) return;
    this.rangeEndPage.set(val);
  }

  onEndPageChanged(rawVal: any, inputEl?: HTMLInputElement): void {
    const total = Math.max(1, this.totalPages());
    let val = parseInt(rawVal, 10);
    if (isNaN(val)) val = this.rangeStartPage();
    val = Math.max(this.rangeStartPage(), Math.min(total, val));
    this.rangeEndPage.set(val);
    if (inputEl) {
      inputEl.value = String(val);
    }
  }

  onPdfPageChanged(page: number): void {
    this.currentPageNumber.set(page);
    this.persistPageToSessionStorage(this.getEffectiveAssessmentId(), this.fileName(), page);
    this.emitFileSession();
  }

  // Extraction & Staging State
  readonly isProcessing = signal<boolean>(false);
  readonly processingMessage = signal<string>('');
  readonly errorMessage = signal<string | null>(null);
  readonly stagedQuestions = signal<IStagedQuestion[]>([]);
  readonly isInserting = signal<boolean>(false);
  readonly confirmationDialog = signal<IConfirmationDialogState | null>(null);

  // Slicer Modal State for Staging
  readonly isSlicerOpen = signal<boolean>(false);
  readonly activeSlicingQuestion = signal<IStagedQuestion | null>(null);
  readonly slicerInitialBox2d = signal<[number, number, number, number] | null>(null);

  // Custom API Key Override State
  readonly isApiKeyCollapsed = signal<boolean>(true);
  readonly customApiKey = signal<string>('');

  onCustomApiKeyChanged(value: string): void {
    const trimmed = (value || '').trim();
    this.customApiKey.set(trimmed);
    if (isPlatformBrowser(this.platformId)) {
      if (trimmed) {
        localStorage.setItem('spider_math_gemini_api_key', trimmed);
      } else {
        localStorage.removeItem('spider_math_gemini_api_key');
      }
    }
  }

  // Virtual Math Keyboard State
  readonly isMathKeyboardOpen = signal<boolean>(false);
  readonly activeMathKeyboardInput = signal<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Computed Values
  readonly selectedCount = computed(() => this.stagedQuestions().filter((q) => q.checked).length);
  readonly allChecked = computed(() => {
    const list = this.stagedQuestions();
    return list.length > 0 && list.every((q) => q.checked);
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedKey = localStorage.getItem('spider_math_gemini_api_key')?.trim() || '';
      if (savedKey) {
        this.customApiKey.set(savedKey);
        this.isApiKeyCollapsed.set(false);
      }
    }

    effect(() => {
      const open = this.isOpen();
      const currentId = this.assessmentId();
      const session = this.existingSession();

      untracked(() => {
        if (open) {
          this.modalNav.registerModal({
            id: 'ai-question-extraction-modal',
            saveDraft: () => this.saveTransientDraft(),
            close: () => this.close()
          });

          if (this.lastAssessmentId !== currentId) {
            this.lastAssessmentId = currentId;
            this.uploadedFile.set(null);
            this.uploadedImages.set([]);
            this.fileType.set(null);
            this.fileName.set('');
            this.currentPageNumber.set(1);
            this.totalPages.set(1);
            this.currentDataUrl.set(null);
            this.currentCanvas = null;
            this.errorMessage.set(null);
            this.pageScopeMode.set('CURRENT_PAGE');
            this.rangeStartPage.set(1);
            this.rangeEndPage.set(1);

            const effId = this.getEffectiveAssessmentId();
            const existingStaged = this.stagedByAssessment.get(effId) || [];
            this.stagedQuestions.set(existingStaged);

            if (session) {
              this.restoreCachedSession(session);
              this.currentStep.set(existingStaged.length > 0 ? 'STAGING_REVIEW' : 'PREVIEW_AND_PAGE');
            } else {
              this.currentStep.set(existingStaged.length > 0 ? 'STAGING_REVIEW' : 'UPLOAD_AND_SELECT');
            }
          } else {
            // Reopening for the same assessment
            if (this.stagedQuestions().length === 0 && this.uploadedFile()) {
              this.currentStep.set('PREVIEW_AND_PAGE');
            }
            if (session?.pageNumber) {
              this.currentPageNumber.set(session.pageNumber);
            } else {
              const storedPage = this.getStoredPageFromSessionStorage(this.getEffectiveAssessmentId(), this.fileName());
              if (storedPage) {
                this.currentPageNumber.set(storedPage);
              }
            }
            if (session && !this.uploadedFile() && !this.currentCanvas) {
              this.restoreCachedSession(session);
            }
          }
        }
      });
    });
  }

  private restoreCachedSession(session: ICachedFileSession): void {
    this.fileName.set(session.fileName);
    this.fileType.set(session.fileType);
    let pageNum = session.pageNumber || 1;
    const storedPage = this.getStoredPageFromSessionStorage(this.getEffectiveAssessmentId(), session.fileName);
    if (storedPage) {
      pageNum = storedPage;
    }
    this.currentPageNumber.set(pageNum);
    this.currentCanvas = session.canvas;
    this.currentDataUrl.set(session.dataUrl);
    if (session.totalPages) {
      this.totalPages.set(session.totalPages);
    }
    if (session.lastSelectedRange) {
      const maxTotal = session.totalPages || Math.max(this.totalPages(), session.lastSelectedRange.endPage, session.pageNumber || 1);
      const clampedStart = Math.max(1, Math.min(maxTotal, session.lastSelectedRange.startPage));
      const clampedEnd = Math.max(
        clampedStart,
        Math.min(maxTotal, clampedStart + this.maxExtractablePages - 1, session.lastSelectedRange.endPage)
      );
      this.rangeStartPage.set(clampedStart);
      this.rangeEndPage.set(clampedEnd);
    }

    if (session.file instanceof File) {
      this.uploadedFile.set(session.file);
    }
  }

  // --- File Drag & Drop / Selection ---

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleSelectedFiles(files);
    }
  }

  onFileInputChanged(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    if (inputEl.files && inputEl.files.length > 0) {
      this.handleSelectedFiles(inputEl.files);
    }
  }

  handleSelectedFiles(files: FileList | File[]): void {
    const list = Array.from(files || []);
    if (list.length === 0) return;

    const imageFiles = list.filter((f) => f.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/i.test(f.name));
    if (imageFiles.length > 1) {
      this.processMultipleImages(imageFiles);
      return;
    }

    if (list.length > 1 && imageFiles.length === 1) {
      this.handleSelectedFile(imageFiles[0]);
      return;
    }

    this.handleSelectedFile(list[0]);
  }

  handleSelectedFile(file: File): void {
    this.errorMessage.set(null);
    this.uploadedImages.set([]);
    const isDifferentFile = this.fileName() !== file.name;
    if (isDifferentFile) {
      this.pageScopeMode.set('CURRENT_PAGE');
      this.rangeStartPage.set(1);
      this.rangeEndPage.set(1);
      this.currentDataUrl.set(null);
      this.currentCanvas = null;
      this.totalPages.set(1);
    }
    const storedPage = this.getStoredPageFromSessionStorage(this.getEffectiveAssessmentId(), file.name);
    if (storedPage && storedPage >= 1) {
      this.currentPageNumber.set(storedPage);
    } else if (isDifferentFile) {
      this.currentPageNumber.set(1);
    }
    this.uploadedFile.set(file);
    this.fileName.set(file.name);

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/i.test(file.name);

    if (isPdf) {
      this.fileType.set('pdf');
      this.currentStep.set('PREVIEW_AND_PAGE');
    } else if (isImg) {
      this.fileType.set('image');
      this.processImageFile(file);
    } else {
      this.errorMessage.set(
        this.langService.isArabic()
          ? 'صيغة غير مدعومة. اختر PDF أو صورة (PNG, JPG, WebP).'
          : 'Unsupported format. Choose PDF or image (PNG, JPG, WebP).'
      );
    }
  }

  private async loadImageFileToCanvas(file: File): Promise<{ fileName: string; canvas: HTMLCanvasElement; dataUrl: string }> {
    const rawDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = rawDataUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.setAttribute('dir', 'ltr');
    canvas.style.direction = 'ltr';
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      (ctx as CanvasRenderingContext2D).direction = 'ltr';
      ctx.drawImage(img, 0, 0);
    }

    return {
      fileName: file.name,
      canvas,
      dataUrl: canvas.toDataURL('image/webp', 0.85)
    };
  }

  private async processMultipleImages(files: File[]): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    this.errorMessage.set(null);
    this.isProcessing.set(true);
    this.processingMessage.set(
      this.langService.isArabic()
        ? `جاري تجهيز ${files.length} صور...`
        : `Processing ${files.length} images...`
    );

    try {
      const capped = files.slice(0, 10);
      const items: Array<{ fileName: string; canvas: HTMLCanvasElement; dataUrl: string }> = [];
      for (const f of capped) {
        items.push(await this.loadImageFileToCanvas(f));
      }

      if (items.length === 0) return;

      this.uploadedFile.set(capped[0]);
      this.uploadedImages.set(items);
      this.fileType.set('image');
      this.fileName.set(
        this.langService.isArabic()
          ? `${items[0].fileName} (+${items.length - 1} صور)`
          : `${items[0].fileName} (+${items.length - 1} images)`
      );
      this.totalPages.set(items.length);
      this.currentPageNumber.set(1);
      this.currentCanvas = items[0].canvas;
      this.currentDataUrl.set(items[0].dataUrl);
      this.pageScopeMode.set('PAGE_RANGE');
      this.rangeStartPage.set(1);
      this.rangeEndPage.set(Math.min(items.length, this.maxExtractablePages));
      this.currentStep.set('PREVIEW_AND_PAGE');
      this.emitFileSession();
    } catch {
      this.errorMessage.set(
        this.langService.isArabic()
          ? 'تعذر قراءة إحدى الصور المحددة.'
          : 'Unable to read one of the selected images.'
      );
    } finally {
      this.isProcessing.set(false);
    }
  }

  goToImagePage(pageNum: number): void {
    const items = this.uploadedImages();
    if (items.length === 0) return;
    const clamped = Math.max(1, Math.min(items.length, pageNum));
    const entry = items[clamped - 1];
    if (!entry) return;
    this.currentPageNumber.set(clamped);
    this.currentCanvas = entry.canvas;
    this.currentDataUrl.set(entry.dataUrl);
    this.emitFileSession();
  }

  private async processImageFile(file: File): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    this.isProcessing.set(true);
    this.processingMessage.set(
      this.langService.isArabic() ? 'جاري تجهيز الصورة...' : 'Processing image...'
    );

    try {
      const rendered = await this.loadImageFileToCanvas(file);
      this.uploadedImages.set([rendered]);
      this.currentCanvas = rendered.canvas;
      this.currentDataUrl.set(rendered.dataUrl);
      this.currentPageNumber.set(1);
      this.totalPages.set(1);
      this.currentStep.set('PREVIEW_AND_PAGE');
      this.emitFileSession();
    } catch {
      this.errorMessage.set(
        this.langService.isArabic()
          ? 'تعذر قراءة ملف الصورة.'
          : 'Unable to read image.'
      );
    } finally {
      this.isProcessing.set(false);
    }
  }

  // --- PDF Viewer Event Handler ---

  onPdfPageRendered(event: IPdfPageRenderEvent): void {
    this.currentCanvas = event.canvas;
    this.currentDataUrl.set(event.dataUrl);
    this.currentPageNumber.set(event.pageNumber);
    this.totalPages.set(event.totalPages);
    const total = Math.max(1, event.totalPages);
    if (this.rangeStartPage() > total || this.rangeEndPage() > total) {
      const clampedStart = Math.max(1, Math.min(total, this.rangeStartPage()));
      const clampedEnd = Math.max(
        clampedStart,
        Math.min(total, clampedStart + this.maxExtractablePages - 1, this.rangeEndPage())
      );
      this.rangeStartPage.set(clampedStart);
      this.rangeEndPage.set(clampedEnd);
    }
    this.persistPageToSessionStorage(this.getEffectiveAssessmentId(), this.fileName(), event.pageNumber);
    this.emitFileSession();
  }

  emitFileSession(): void {
    this.fileSessionCached.emit({
      fileName: this.fileName(),
      fileType: this.fileType() || 'pdf',
      file: this.uploadedFile(),
      pageNumber: this.currentPageNumber(),
      canvas: this.currentCanvas,
      dataUrl: this.currentDataUrl(),
      totalPages: this.totalPages(),
      lastSelectedRange: {
        startPage: this.rangeStartPage(),
        endPage: this.rangeEndPage()
      }
    });
  }

  useFileForManualSlicing(): void {
    if (!this.currentCanvas && !this.currentDataUrl()) {
      this.errorMessage.set(
        this.langService.isArabic()
          ? 'انتظري حتى اكتمال تحميل الصفحة.'
          : 'Wait for page to load.'
      );
      return;
    }
    const session: ICachedFileSession = {
      fileName: this.fileName(),
      fileType: this.fileType() || 'pdf',
      file: this.uploadedFile(),
      pageNumber: this.currentPageNumber(),
      canvas: this.currentCanvas,
      dataUrl: this.currentDataUrl(),
      totalPages: this.totalPages(),
      lastSelectedRange: {
        startPage: this.rangeStartPage(),
        endPage: this.rangeEndPage()
      }
    };
    this.fileSessionCached.emit(session);
    this.manualSlicingRequested.emit(session);
    this.close();
  }

  // --- AI Extraction Trigger ---

  /**
   * Scales oversized canvases down to <=1400px for fast AI inference (~1.3s),
   * while preserving smaller canvases verbatim and keeping the 2.0x original for local crops.
   */
  getOptimizedAiBase64(
    canvas: HTMLCanvasElement | null,
    fallbackDataUrl: string | null,
    maxDim = 1400,
    quality = 0.80
  ): string {
    if (
      !canvas ||
      !isPlatformBrowser(this.platformId) ||
      canvas.width === 0 ||
      canvas.height === 0 ||
      (canvas.width <= maxDim && canvas.height <= maxDim)
    ) {
      return fallbackDataUrl || '';
    }

    try {
      const scale = Math.min(maxDim / canvas.width, maxDim / canvas.height);
      const scaled = document.createElement('canvas');
      scaled.width = Math.max(1, Math.round(canvas.width * scale));
      scaled.height = Math.max(1, Math.round(canvas.height * scale));
      const ctx = scaled.getContext('2d');
      if (!ctx) return fallbackDataUrl || '';
      ctx.drawImage(canvas, 0, 0, scaled.width, scaled.height);
      const compressed = scaled.toDataURL('image/webp', quality);
      return compressed && compressed.length > 30 ? compressed : fallbackDataUrl || '';
    } catch {
      return fallbackDataUrl || '';
    }
  }

  private formatExtractionError(err: any): string {
    const status = err?.status;
    let raw = 'Server error';
    if (typeof err?.error === 'object' && err?.error !== null) {
      raw = err.error?.error?.message || err.error?.message || err?.message || raw;
    } else if (typeof err?.error === 'string' && err.error.trim().length > 0) {
      raw = err.error.trim();
    } else if (err?.message) {
      raw = err.message;
    }

    if (status === 504 || /504|timeout|error occurred with your deployment/i.test(raw)) {
      return this.langService.isArabic()
        ? 'انتهت مهلة الاستجابة من الخادم (504). يرجى المحاولة مرة أخرى أو تقليل عدد الصفحات المحددة.'
        : 'Server gateway timeout (504). Please try again or reduce the number of selected pages.';
    }
    return raw;
  }

  async startAiExtraction(): Promise<void> {
    if (this.extractionMode() === 'MANUAL_CROP') {
      this.useFileForManualSlicing();
      return;
    }

    if (!this.isRangeValid()) {
      const total = Math.max(1, this.totalPages());
      const countExceeds = this.rangeEndPage() - this.rangeStartPage() + 1 > this.maxExtractablePages;
      this.errorMessage.set(
        this.langService.isArabic()
          ? (countExceeds
              ? `نطاق الصفحات يتجاوز ${this.maxExtractablePages} صفحات كحد أقصى.`
              : `نطاق الصفحات غير صالح (يجب أن يكون بين 1 و ${total} وبحد أقصى ${this.maxExtractablePages} صفحات).`)
          : (countExceeds
              ? `Page range exceeds ${this.maxExtractablePages} pages maximum.`
              : `Invalid page range (must be between 1 and ${total}, max ${this.maxExtractablePages} pages).`)
      );
      return;
    }

    const isMultiItemSource = this.fileType() === 'pdf' || (this.fileType() === 'image' && this.uploadedImages().length > 1);
    const targetPages: number[] = [];
    if (this.pageScopeMode() === 'CURRENT_PAGE' || !isMultiItemSource || this.totalPages() <= 1) {
      targetPages.push(this.currentPageNumber());
    } else {
      for (let p = this.rangeStartPage(); p <= this.rangeEndPage(); p++) {
        targetPages.push(p);
      }
    }

    if (targetPages.length > this.maxExtractablePages) {
      this.errorMessage.set(
        this.langService.isArabic()
          ? `أقصى حد ${this.maxExtractablePages} صفحات للاستخراج في المرة الواحدة.`
          : `Maximum ${this.maxExtractablePages} pages can be extracted at once.`
      );
      return;
    }

    this.isProcessing.set(true);
    this.errorMessage.set(null);

    const allExtractedStaged: IStagedQuestion[] = [];
    const succeededPages: number[] = [];
    const failedPages: number[] = [];
    let lastPageError: any = null;

    const isTextOnlyMode = this.extractionMode() === 'TEXT_LATEX_ONLY';
    const customKey = this.customApiKey().trim();
    const headers: Record<string, string> = {};
    if (customKey) {
      headers['x-gemini-api-key'] = customKey;
    }

    try {
      for (let idx = 0; idx < targetPages.length; idx++) {
        const p = targetPages[idx];
        this.processingMessage.set(
          this.langService.isArabic()
            ? `جاري استخراج صفحة ${p} من ${this.totalPages()} (${idx + 1} من ${targetPages.length})...`
            : `Extracting page ${p} of ${this.totalPages()} (${idx + 1} of ${targetPages.length})...`
        );

        let pageDataUrl: string | null = null;
        let pageCanvas: HTMLCanvasElement | null = null;

        if (this.fileType() === 'image' && this.uploadedImages().length > 1) {
          const imgEntry = this.uploadedImages()[p - 1];
          pageDataUrl = imgEntry?.dataUrl || null;
          pageCanvas = imgEntry?.canvas || null;
        } else if (p === this.currentPageNumber() && this.currentDataUrl()) {
          pageDataUrl = this.currentDataUrl();
          pageCanvas = this.currentCanvas;
        } else {
          const viewer = this.pdfViewer();
          if (!viewer) {
            throw new Error('PDF viewer is not available');
          }
          const rendered = await viewer.renderPageToDataUrl(p);
          pageDataUrl = rendered.dataUrl;
          pageCanvas = rendered.canvas;
        }

        const payload: Record<string, any> = {
          imageBase64: this.getOptimizedAiBase64(pageCanvas, pageDataUrl),
          mimeType: 'image/webp',
          mode: this.extractionMode(),
          curriculum: this.curriculum(),
          gradeLevel: this.gradeLevel()
        };
        if (customKey) {
          payload['apiKey'] = customKey;
        }

        let res: IAiExtractionBackendResponse;
        try {
          res = await firstValueFrom(
            this.http.post<IAiExtractionBackendResponse>(
              '/api/v1/assessments/ai-extract-questions',
              payload,
              { headers }
            )
          );
        } catch (pageErr: any) {
          lastPageError = pageErr;
          failedPages.push(p);
          continue;
        }

        succeededPages.push(p);
        const rawQuestions = res?.data?.questions || [];

        for (let i = 0; i < rawQuestions.length; i++) {
          const rawQ = rawQuestions[i];
          let localCropBlob: Blob | null = null;
          let localCropPreviewUrl: string | null = null;
          let effectiveBox = isTextOnlyMode ? undefined : rawQ.box_2d;

          if (effectiveBox && pageCanvas && isPlatformBrowser(this.platformId) && !isTextOnlyMode) {
            try {
              effectiveBox = applyBoundingBoxPadding(effectiveBox, 0.08, 16);
              const cropRes = await cropBoundingBoxToBlob(pageCanvas, effectiveBox);
              localCropBlob = cropRes.blob;
              localCropPreviewUrl = cropRes.dataUrl;
            } catch (cropErr) {
              console.warn('Auto-crop bounding box skipped:', cropErr);
            }
          }

          const validRawOptions = Array.isArray(rawQ.options)
            ? rawQ.options.map((o) => (o || '').trim()).filter((o) => o.length > 0)
            : [];
          const isActuallyMcq = validRawOptions.length >= 2;

          allExtractedStaged.push({
            id: `staged_${Date.now()}_${p}_${i}_${Math.random().toString(36).substring(2, 7)}`,
            checked: true,
            pageNumber: p,
            pageDataUrl: pageDataUrl,
            question_text: rawQ.question_text || '',
            type: isActuallyMcq ? 'MCQ' : 'ESSAY',
            options: isActuallyMcq ? [...rawQ.options] : ['', '', '', ''],
            correct_option_index: rawQ.correct_option_index ?? 0,
            points: rawQ.points > 0 ? rawQ.points : 1,
            has_geometry_diagram: !isTextOnlyMode && (Boolean(rawQ.has_geometry_diagram) || Boolean(effectiveBox)),
            box_2d: isTextOnlyMode ? undefined : effectiveBox,
            localCropBlob: isTextOnlyMode ? null : localCropBlob,
            localCropPreviewUrl: isTextOnlyMode ? null : localCropPreviewUrl,
            question_image_url: null
          });
        }
      }

      if (allExtractedStaged.length === 0) {
        if (lastPageError) {
          const formatted = this.formatExtractionError(lastPageError);
          this.errorMessage.set(
            this.langService.isArabic() && !formatted.includes('مهلة')
              ? `فشل استخراج الأسئلة: ${formatted}`
              : formatted
          );
        } else {
          this.errorMessage.set(
            this.langService.isArabic()
              ? 'لم يتم العثور على أي أسئلة في الصفحات المحددة.'
              : 'No questions found in selected pages.'
          );
        }
        return;
      }

      // Update staged questions: replace entries for succeededPages, preserve others
      const succeededPagesSet = new Set(succeededPages);
      this.stagedQuestions.update((prev) => {
        const otherPages = prev.filter((q) => !q.pageNumber || !succeededPagesSet.has(q.pageNumber));
        return [...otherPages, ...allExtractedStaged];
      });

      // Advance current page to the last succeeded page
      const lastPage = succeededPages[succeededPages.length - 1] || targetPages[targetPages.length - 1];
      this.currentPageNumber.set(lastPage);
      if (this.fileType() === 'pdf') {
        this.persistPageToSessionStorage(this.getEffectiveAssessmentId(), this.fileName(), lastPage);
      } else if (this.uploadedImages().length > 1) {
        const entry = this.uploadedImages()[lastPage - 1];
        if (entry) {
          this.currentCanvas = entry.canvas;
          this.currentDataUrl.set(entry.dataUrl);
        }
      }
      this.emitFileSession();

      if (failedPages.length > 0) {
        this.errorMessage.set(
          this.langService.isArabic()
            ? `تم استخراج ${allExtractedStaged.length} أسئلة، لكن تعذر استخراج الصفحات (${failedPages.join(', ')}). يمكنك إعادة المحاولة لتلك الصفحات.`
            : `Extracted ${allExtractedStaged.length} questions, but pages (${failedPages.join(', ')}) failed. You can retry those pages.`
        );
      }

      this.currentStep.set('STAGING_REVIEW');
    } catch (err: any) {
      const serverMsg = this.formatExtractionError(err);
      this.errorMessage.set(
        this.langService.isArabic() && !serverMsg.includes('مهلة')
          ? `فشل استخراج الأسئلة: ${serverMsg}`
          : serverMsg
      );
    } finally {
      this.isProcessing.set(false);
    }
  }

  // --- Staging Review Actions ---

  toggleAll(checked: boolean): void {
    this.stagedQuestions.update((list) => list.map((q) => ({ ...q, checked })));
  }

  toggleQuestion(id: string): void {
    this.stagedQuestions.update((list) =>
      list.map((q) => (q.id === id ? { ...q, checked: !q.checked } : q))
    );
  }

  promptDeleteQuestion(id: string): void {
    this.confirmationDialog.set({
      title: this.langService.isArabic() ? 'تأكيد حذف السؤال' : 'Confirm Question Deletion',
      message: this.langService.isArabic()
        ? 'استبعاد هذا السؤال من المراجعة؟'
        : 'Remove this question from staging?',
      confirmText: this.langService.isArabic() ? 'حذف' : 'Delete',
      cancelText: this.langService.isArabic() ? 'إلغاء' : 'Cancel',
      onConfirm: () => {
        this.deleteStagedQuestion(id);
        this.confirmationDialog.set(null);
      }
    });
  }

  deleteStagedQuestion(id: string): void {
    this.stagedQuestions.update((list) => list.filter((q) => q.id !== id));
  }

  promptRemoveCroppedImage(q: IStagedQuestion): void {
    this.confirmationDialog.set({
      title: this.langService.isArabic() ? 'إزالة الرسم الهندسي' : 'Remove Diagram',
      message: this.langService.isArabic()
        ? 'إزالة هذا الرسم؟'
        : 'Remove cropped image?',
      confirmText: this.langService.isArabic() ? 'إزالة' : 'Remove',
      cancelText: this.langService.isArabic() ? 'إلغاء' : 'Cancel',
      onConfirm: () => {
        this.removeCroppedImage(q);
        this.confirmationDialog.set(null);
      }
    });
  }

  closeConfirmation(): void {
    this.confirmationDialog.set(null);
  }

  removeCroppedImage(q: IStagedQuestion): void {
    this.stagedQuestions.update((list) =>
      list.map((item) =>
        item.id === q.id
          ? {
              ...item,
              localCropBlob: null,
              localCropPreviewUrl: null,
              question_image_url: null,
              has_geometry_diagram: false,
              box_2d: undefined
            }
          : item
      )
    );
  }

  setQuestionType(q: IStagedQuestion, type: 'MCQ' | 'ESSAY' | 'INPUT_TEXT'): void {
    q.type = type;
    if (type === 'MCQ' && (!q.options || q.options.length === 0)) {
      q.options = ['', '', '', ''];
    }
    if (type === 'INPUT_TEXT') {
      if (!q.acceptedAnswers || q.acceptedAnswers.length === 0) {
        q.acceptedAnswers = q.accepted_answers && q.accepted_answers.length > 0
          ? [...q.accepted_answers]
          : [''];
      }
      q.accepted_answers = q.acceptedAnswers;
    }
    this.stagedQuestions.update((list) => [...list]);
    const aid = this.assessmentId();
    if (aid) {
      this.stagedByAssessment.set(aid, this.stagedQuestions());
    }
    this.cdr.markForCheck();
  }

  addAcceptedAnswer(q: IStagedQuestion): void {
    if (!q.acceptedAnswers) q.acceptedAnswers = [];
    q.acceptedAnswers.push('');
    q.accepted_answers = q.acceptedAnswers;
    this.stagedQuestions.update((list) => [...list]);
    const aid = this.assessmentId();
    if (aid) {
      this.stagedByAssessment.set(aid, this.stagedQuestions());
    }
    this.cdr.markForCheck();
  }

  removeAcceptedAnswer(q: IStagedQuestion, index: number): void {
    if (!q.acceptedAnswers) return;
    if (q.acceptedAnswers.length <= 1) {
      q.acceptedAnswers[0] = '';
    } else {
      q.acceptedAnswers.splice(index, 1);
    }
    q.accepted_answers = q.acceptedAnswers;
    this.stagedQuestions.update((list) => [...list]);
    const aid = this.assessmentId();
    if (aid) {
      this.stagedByAssessment.set(aid, this.stagedQuestions());
    }
    this.cdr.markForCheck();
  }

  onAcceptedAnswerInput(q: IStagedQuestion, index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target) return;
    const visual = stripLatexDelimiters(target.value);
    if (visual !== target.value) {
      const pos = target.selectionStart ?? visual.length;
      target.value = visual;
      target.setSelectionRange(pos, pos);
    }
    if (!q.acceptedAnswers) q.acceptedAnswers = [];
    q.acceptedAnswers[index] = visual;
    q.accepted_answers = q.acceptedAnswers;
    const aid = this.assessmentId();
    if (aid) {
      this.stagedByAssessment.set(aid, this.stagedQuestions());
    }
  }

  openManualSlicerForQuestion(q: IStagedQuestion): void {
    this.activeSlicingQuestion.set(q);
    this.slicerInitialBox2d.set(q.box_2d || null);
    this.isSlicerOpen.set(true);
  }

  onSliceSaved(result: ISliceResult): void {
    const activeQ = this.activeSlicingQuestion();
    if (!activeQ) return;

    this.stagedQuestions.update((list) =>
      list.map((item) =>
        item.id === activeQ.id
          ? {
              ...item,
              has_geometry_diagram: true,
              box_2d: result.box_2d || item.box_2d,
              localCropBlob: result.blob,
              localCropPreviewUrl: result.dataUrl,
              question_image_url: null
            }
          : item
      )
    );

    this.isSlicerOpen.set(false);
    this.activeSlicingQuestion.set(null);
    this.cdr.markForCheck();
  }

  onSlicerCancelled(): void {
    this.isSlicerOpen.set(false);
    this.activeSlicingQuestion.set(null);
  }

  // --- Virtual Math Keyboard ---

  toggleMathKeyboard(): void {
    if (this.isMathKeyboardOpen()) {
      this.isMathKeyboardOpen.set(false);
    } else {
      if (!this.activeMathKeyboardInput() && typeof document !== 'undefined') {
        const firstField = document.querySelector<HTMLTextAreaElement | HTMLInputElement>(
          '.question-input-wrapper textarea, .question-input-wrapper input'
        );
        if (firstField) {
          this.activeMathKeyboardInput.set(firstField);
        }
      }
      this.isMathKeyboardOpen.set(true);
    }
  }

  onFieldFocus(target: HTMLInputElement | HTMLTextAreaElement): void {
    this.activeMathKeyboardInput.set(target);
  }

  openMathKeyboard(target: HTMLInputElement | HTMLTextAreaElement): void {
    this.activeMathKeyboardInput.set(target);
    this.isMathKeyboardOpen.set(true);
  }

  onQuestionTextInput(q: IStagedQuestion, event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    if (!target) return;
    const visual = stripLatexDelimiters(target.value);
    if (visual !== target.value) {
      const pos = target.selectionStart ?? visual.length;
      target.value = visual;
      target.setSelectionRange(pos, pos);
    }
    q.question_text = visual;
  }

  onOptionInput(q: IStagedQuestion, index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target) return;
    const visual = stripLatexDelimiters(target.value);
    if (visual !== target.value) {
      const pos = target.selectionStart ?? visual.length;
      target.value = visual;
      target.setSelectionRange(pos, pos);
    }
    q.options[index] = visual;
  }

  onMathKeyboardValueChange(val: string): void {
    const target = this.activeMathKeyboardInput();
    if (target) {
      const visual = stripLatexDelimiters(val);
      if (target.value !== visual) {
        const pos = target.selectionStart ?? visual.length;
        target.value = visual;
        target.setSelectionRange(pos, pos);
      }
      target.dispatchEvent(new Event('input', { bubbles: true }));
    }
    this.cdr.markForCheck();
  }

  // --- MCQ Options Management ---

  setCorrectOption(q: IStagedQuestion, index: number): void {
    q.correct_option_index = index;
    this.stagedQuestions.update((list) => [...list]);
  }

  updatePoints(q: IStagedQuestion, rawVal: any): void {
    const num = parseInt(rawVal, 10);
    q.points = isNaN(num) ? 1 : Math.max(1, Math.min(50, num));
    this.stagedQuestions.update((list) => [...list]);
  }

  // --- Bulk Insertion into Assessment ---

  async insertSelectedQuestions(): Promise<void> {
    const checked = this.stagedQuestions().filter((q) => q.checked);
    if (checked.length === 0) {
      this.errorMessage.set(
        this.langService.isArabic()
          ? 'حددي سؤالاً واحداً على الأقل.'
          : 'Select at least one question.'
      );
      return;
    }

    this.isInserting.set(true);
    this.errorMessage.set(null);

    try {
      const finalQuestions: AssessmentQuestionItem[] = [];

      for (const q of checked) {
        let finalImageUrl: string | null = q.question_image_url || null;

        // Cloudinary Optimization Constraint:
        // Upload ONLY checked questions' blobs right now upon confirmation!
        if (q.localCropBlob && !finalImageUrl) {
          finalImageUrl = await uploadBlobToCloudinary(q.localCropBlob, 'question', this.http);
          q.question_image_url = finalImageUrl;
        }

        const isMcq = q.type === 'MCQ';
        const isInputText = q.type === 'INPUT_TEXT';
        const validOptions = isMcq
          ? (q.options || []).map((o) => o.trim()).filter((o) => o.length > 0)
          : [];
        let finalCorrectIndex = 0;

        if (isMcq && validOptions.length > 0) {
          const rawSelectedOptionText =
            q.options && typeof q.correct_option_index === 'number'
              ? (q.options[q.correct_option_index] || '').trim()
              : '';
          const mappedIdx = validOptions.indexOf(rawSelectedOptionText);
          finalCorrectIndex =
            mappedIdx !== -1
              ? mappedIdx
              : Math.min(validOptions.length - 1, Math.max(0, q.correct_option_index));
        }

        const validAccepted = isInputText
          ? (q.acceptedAnswers || q.accepted_answers || []).map((a) => (a || '').trim()).filter(Boolean)
          : undefined;

        finalQuestions.push({
          id: `q_ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          order: 0, // Sequentially assigned by AssessmentStudio parent
          type: q.type,
          textAr: q.question_text.trim() || (finalImageUrl ? 'سؤال مصور من الملف' : ''),
          questionImageUrl: finalImageUrl,
          options: validOptions,
          correctOptionIndex: finalCorrectIndex,
          acceptedAnswers: isInputText ? (validAccepted && validAccepted.length > 0 ? validAccepted : [q.question_text.trim() || 'إجابة']) : undefined,
          points: q.points > 0 ? q.points : 1,
          explanationAr: ''
        });
      }

      this.questionsExtracted.emit(finalQuestions);
      this.emitFileSession();

      const unselected = this.stagedQuestions().filter((q) => !q.checked);
      this.stagedQuestions.set(unselected);
      const aid = this.getEffectiveAssessmentId();
      if (aid) {
        this.stagedByAssessment.set(aid, unselected);
      }

      this.currentStep.set('PREVIEW_AND_PAGE');
      this.close();
    } catch (uploadErr: any) {
      this.errorMessage.set(
        this.langService.isArabic()
          ? `فشل رفع الصور لـ Cloudinary: ${uploadErr?.message || uploadErr}`
          : `Failed to upload images: ${uploadErr?.message || uploadErr}`
      );
    } finally {
      this.isInserting.set(false);
    }
  }

  // --- Step Navigation & Modal Close ---

  goToStep(step: 'UPLOAD_AND_SELECT' | 'PREVIEW_AND_PAGE' | 'STAGING_REVIEW'): void {
    this.errorMessage.set(null);
    this.currentStep.set(step);
  }

  saveTransientDraft(): void {
    const aid = this.getEffectiveAssessmentId();
    if (aid) {
      this.stagedByAssessment.set(aid, this.stagedQuestions());
    }
    if (this.currentCanvas || this.uploadedFile()) {
      this.emitFileSession();
    }
  }

  close(): void {
    if (this.uploadedFile() && this.fileName()) {
      this.persistPageToSessionStorage(this.getEffectiveAssessmentId(), this.fileName(), this.currentPageNumber());
      this.emitFileSession();
    }
    this.modalNav.dismissModal('ai-question-extraction-modal');
    this.isOpen.set(false);
    this.cancelled.emit();
  }
}
