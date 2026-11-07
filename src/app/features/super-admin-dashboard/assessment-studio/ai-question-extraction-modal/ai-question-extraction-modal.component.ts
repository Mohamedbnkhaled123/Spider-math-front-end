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
  effect
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon.component';
import { MathFormulaComponent } from '../../../../shared/components/math-formula/math-formula.component';
import { MathVirtualKeyboardComponent } from '../../../../shared/components/math-virtual-keyboard/math-virtual-keyboard.component';
import { PdfPageViewerComponent } from '../../../../shared/components/pdf-page-viewer/pdf-page-viewer.component';
import { IPdfPageRenderEvent } from '../../../../shared/components/pdf-page-viewer/pdf-page-viewer.models';
import { ManualImageSlicerModalComponent } from '../../../../shared/components/manual-image-slicer-modal/manual-image-slicer-modal.component';
import { ISliceResult } from '../../../../shared/components/manual-image-slicer-modal/manual-image-slicer-modal.models';
import { cropBoundingBoxToBlob, uploadBlobToCloudinary, applyBoundingBoxPadding } from '../../../../shared/utils/box2d-cropper.util';
import { LangService } from '../../../../core/seo-theme-i18n/lang.service';
import { AssessmentQuestionItem } from '../assessment-studio.models';
import {
  AiExtractionMode,
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
    MathFormulaComponent,
    MathVirtualKeyboardComponent,
    PdfPageViewerComponent,
    ManualImageSlicerModalComponent
  ],
  templateUrl: './ai-question-extraction-modal.component.html',
  styleUrl: './ai-question-extraction-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiQuestionExtractionModalComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly langService = inject(LangService);

  // Inputs & Two-Way Model (Bound dynamically from active assessment)
  readonly isOpen = model<boolean>(false);
  readonly curriculum = input<string>('');
  readonly gradeLevel = input<string>('');
  readonly existingSession = input<ICachedFileSession | null>(null);

  // Outputs
  readonly questionsExtracted = output<AssessmentQuestionItem[]>();
  readonly fileSessionCached = output<ICachedFileSession>();
  readonly cancelled = output<void>();

  // Wizard Step State
  readonly currentStep = signal<'UPLOAD_AND_SELECT' | 'PREVIEW_AND_PAGE' | 'STAGING_REVIEW'>('UPLOAD_AND_SELECT');
  readonly extractionMode = signal<AiExtractionMode>('SMART_HYBRID');

  // File & Canvas State
  readonly uploadedFile = signal<File | null>(null);
  readonly fileType = signal<'pdf' | 'image' | null>(null);
  readonly fileName = signal<string>('');
  readonly isDragging = signal<boolean>(false);

  // Page View State
  readonly currentPageNumber = signal<number>(1);
  readonly totalPages = signal<number>(1);
  readonly currentDataUrl = signal<string | null>(null);
  currentCanvas: HTMLCanvasElement | null = null;

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
      const session = this.existingSession();

      if (open && session && !this.uploadedFile() && !this.currentCanvas) {
        this.restoreCachedSession(session);
      }
    });
  }

  private restoreCachedSession(session: ICachedFileSession): void {
    this.fileName.set(session.fileName);
    this.fileType.set(session.fileType);
    this.currentPageNumber.set(session.pageNumber || 1);
    this.currentCanvas = session.canvas;
    this.currentDataUrl.set(session.dataUrl);

    if (session.file instanceof File) {
      this.uploadedFile.set(session.file);
    }

    if (session.canvas || session.dataUrl) {
      this.currentStep.set('PREVIEW_AND_PAGE');
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
      this.handleSelectedFile(files[0]);
    }
  }

  onFileInputChanged(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    if (inputEl.files && inputEl.files.length > 0) {
      this.handleSelectedFile(inputEl.files[0]);
    }
  }

  handleSelectedFile(file: File): void {
    this.errorMessage.set(null);
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
          ? 'صيغة الملف غير مدعومة. يرجى اختيار ملف PDF أو صورة (PNG, JPG, WebP).'
          : 'Unsupported file format. Please choose a PDF or an Image file (PNG, JPG, WebP).'
      );
    }
  }

  private async processImageFile(file: File): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    this.isProcessing.set(true);
    this.processingMessage.set(
      this.langService.isArabic() ? 'جاري تجهيز الصورة ومعالجتها بدقة فائقة...' : 'Processing high-res image...'
    );

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }

      this.currentCanvas = canvas;
      this.currentDataUrl.set(canvas.toDataURL('image/webp', 0.85));
      this.currentPageNumber.set(1);
      this.totalPages.set(1);
      this.currentStep.set('PREVIEW_AND_PAGE');
      this.emitFileSession();
    } catch (err: any) {
      this.errorMessage.set(
        this.langService.isArabic()
          ? 'تعذر قراءة ملف الصورة. يرجى التأكد من سلامة الملف والمحاولة مرة أخرى.'
          : 'Failed to read image file. Please verify file integrity.'
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
    this.emitFileSession();
  }

  private emitFileSession(): void {
    this.fileSessionCached.emit({
      fileName: this.fileName(),
      fileType: this.fileType() || 'pdf',
      file: this.uploadedFile(),
      pageNumber: this.currentPageNumber(),
      canvas: this.currentCanvas,
      dataUrl: this.currentDataUrl()
    });
  }

  // --- AI Extraction Trigger ---

  async startAiExtraction(): Promise<void> {
    const dataUrl = this.currentDataUrl();
    if (!dataUrl) {
      this.errorMessage.set(
        this.langService.isArabic()
          ? 'يرجى الانتظار حتى اكتمال تحميل وعرض الصفحة.'
          : 'Please wait for the page preview to load completely.'
      );
      return;
    }

    this.isProcessing.set(true);
    this.errorMessage.set(null);
    this.processingMessage.set(
      this.langService.isArabic()
        ? 'جاري تحليل الصفحة بالذكاء الاصطناعي واستخراج المعادلات والرسومات...'
        : 'AI Vision is analyzing the page and extracting LaTeX questions...'
    );

    try {
      const payload: Record<string, any> = {
        imageBase64: dataUrl,
        mimeType: 'image/webp',
        mode: this.extractionMode(),
        curriculum: this.curriculum(),
        gradeLevel: this.gradeLevel()
      };

      const headers: Record<string, string> = {};
      const customKey = this.customApiKey().trim();
      if (customKey) {
        payload['apiKey'] = customKey;
        headers['x-gemini-api-key'] = customKey;
      }

      const res = await firstValueFrom(
        this.http.post<IAiExtractionBackendResponse>(
          '/api/v1/assessments/ai-extract-questions',
          payload,
          { headers }
        )
      );

      const rawQuestions = res?.data?.questions || [];

      if (rawQuestions.length === 0) {
        this.errorMessage.set(
          this.langService.isArabic()
            ? 'لم يتم العثور على أسئلة واضحة في هذه الصفحة، يمكنك تجربة صفحة أخرى أو تعديل نمط الاستخراج.'
            : 'No clear math questions found on this page. Try another page or change extraction mode.'
        );
        this.isProcessing.set(false);
        return;
      }

      // Process and auto-crop diagrams locally without uploading to Cloudinary
      const stagedList: IStagedQuestion[] = [];
      const isTextOnlyMode = this.extractionMode() === 'TEXT_LATEX_ONLY';

      for (let i = 0; i < rawQuestions.length; i++) {
        const rawQ = rawQuestions[i];
        let localCropBlob: Blob | null = null;
        let localCropPreviewUrl: string | null = null;
        let effectiveBox = isTextOnlyMode ? undefined : rawQ.box_2d;

        if (effectiveBox && this.currentCanvas && isPlatformBrowser(this.platformId) && !isTextOnlyMode) {
          try {
            // Apply generous safe margin padding (8%, min 16 units) so corner labels (A, B, C, D) are never cut off
            effectiveBox = applyBoundingBoxPadding(effectiveBox, 0.08, 16);
            const cropRes = await cropBoundingBoxToBlob(this.currentCanvas, effectiveBox);
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

        stagedList.push({
          id: `staged_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
          checked: true,
          pageNumber: this.currentPageNumber(),
          pageDataUrl: dataUrl,
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

      // Preserve previously staged questions from other pages; refresh active page
      this.stagedQuestions.update((prev) => {
        const otherPages = prev.filter((q) => q.pageNumber !== this.currentPageNumber());
        return [...otherPages, ...stagedList];
      });
      this.currentStep.set('STAGING_REVIEW');
    } catch (err: any) {
      let serverMsg = 'Server error';
      if (typeof err?.error === 'object' && err?.error !== null) {
        serverMsg =
          err.error?.error?.message ||
          err.error?.message ||
          err?.message ||
          'Server error';
      } else if (typeof err?.error === 'string' && err.error.trim().length > 0) {
        serverMsg = err.error.trim();
      } else if (err?.message) {
        serverMsg = err.message;
      }
      this.errorMessage.set(
        this.langService.isArabic()
          ? `فشل استخراج الأسئلة: ${serverMsg}`
          : `Extraction failed: ${serverMsg}`
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
        ? 'هل أنت متأكدة من رغبتك في استبعاد هذا السؤال من منطقة المراجعة؟ لن يتم إدراجه في الامتحان.'
        : 'Are you sure you want to remove this question from staging? It will not be added to the assessment.',
      confirmText: this.langService.isArabic() ? 'نعم، احذف السؤال' : 'Yes, Delete',
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
      title: this.langService.isArabic() ? 'تأكيد إزالة الرسم الهندسي' : 'Confirm Diagram Removal',
      message: this.langService.isArabic()
        ? 'هل أنت متأكدة من إزالة هذا الرسم الهندسي المقصوص من السؤال؟'
        : 'Are you sure you want to remove the cropped diagram from this question?',
      confirmText: this.langService.isArabic() ? 'نعم، إزالة الرسم' : 'Yes, Remove',
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

  setQuestionType(q: IStagedQuestion, type: 'MCQ' | 'ESSAY'): void {
    q.type = type;
    if (type === 'MCQ' && (!q.options || q.options.length === 0)) {
      q.options = ['', '', '', ''];
    }
    this.stagedQuestions.update((list) => [...list]);
    this.cdr.markForCheck();
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

  openMathKeyboard(target: HTMLInputElement | HTMLTextAreaElement): void {
    this.activeMathKeyboardInput.set(target);
    this.isMathKeyboardOpen.set(true);
  }

  onMathKeyboardValueChange(_val: string): void {
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
          ? 'يرجى تحديد سؤال واحد على الأقل لإدراجه بالامتحان.'
          : 'Please check at least one question to insert.'
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

        finalQuestions.push({
          id: `q_ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          order: 0, // Sequentially assigned by AssessmentStudio parent
          type: q.type,
          textAr: q.question_text.trim() || (finalImageUrl ? 'سؤال مصور من الملف' : ''),
          questionImageUrl: finalImageUrl,
          options: validOptions,
          correctOptionIndex: finalCorrectIndex,
          points: q.points > 0 ? q.points : 1,
          explanationAr: ''
        });
      }

      this.questionsExtracted.emit(finalQuestions);
      this.emitFileSession();
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

  close(): void {
    this.isOpen.set(false);
    this.cancelled.emit();
  }
}
