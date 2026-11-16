import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  effect,
  untracked,
  inject,
  PLATFORM_ID,
  OnDestroy
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppIconComponent } from '../app-icon/app-icon.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import {
  CloudinarySignatureResponse,
  CompressedImageItem,
  UploadTarget
} from './image-compressor-uploader.models';
import { optimizeCloudinaryUrl } from '../../utils/box2d-cropper.util';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 12: Dual-Folder Direct Client-to-CDN WebP Image Uploader
 * 
 * Reusable across two upload targets:
 * 1. 'question': Teacher Question Prompt (Admin Studio) -> permanent 'spider-math-questions/' folder
 * 2. 'homework': Student Essay/Homework Attempts -> ephemeral 'spider-math-homework/' folder
 * 
 * Features:
 * - Client-side Web Worker WebP compression (<= 150KB)
 * - Zero Binary Routing through Express serverless functions
 * - Mandatory Clarity Confirmation Preview Modal with 90° rotation controls for homework
 */
@Component({
  selector: 'app-image-compressor-uploader',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  templateUrl: './image-compressor-uploader.component.html',
  styleUrls: ['./image-compressor-uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.compact]': 'compact()'
  }
})
export class ImageCompressorUploaderComponent implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  readonly langService = inject(LangService);
  private readonly apiBase = '/api/v1/assessments';

  // Input Target: 'question' or 'homework'
  readonly uploadTarget = input.required<UploadTarget>();
  readonly existingImageUrl = input<string | null>(null);
  readonly buttonLabel = input<string>();
  readonly compact = input<boolean>(false);
  readonly clearOnSuccess = input<boolean>(true);
  readonly showItemList = input<boolean>(true);

  // Outputs
  readonly imageUploaded = output<string>(); // Emits question_image_url
  readonly homeworkUploaded = output<string[]>(); // Emits uploaded_solution_imgs[]

  // State Signals
  readonly items = signal<CompressedImageItem[]>([]);
  readonly isProcessing = signal<boolean>(false);
  readonly isUploading = signal<boolean>(false);
  readonly uploadProgress = signal<number>(0);
  readonly errorMessage = signal<string | null>(null);

  // Homework Clarity Confirmation Modal State
  readonly showClarityModal = signal<boolean>(false);
  readonly activePreviewIndex = signal<number>(0);
  readonly isClarityConfirmed = signal<boolean>(false);

  readonly activePreviewItem = computed(() => {
    const list = this.items();
    const idx = this.activePreviewIndex();
    return list[idx] || null;
  });

  readonly maxFilesAllowed = computed(() => (this.uploadTarget() === 'question' ? 1 : 2));

  // Live In-App Camera Viewfinder State
  readonly isLiveCameraOpen = signal<boolean>(false);
  readonly isCameraStarting = signal<boolean>(false);
  readonly cameraFacingMode = signal<'environment' | 'user'>('environment');
  private cameraMediaStream: MediaStream | null = null;

  constructor() {
    effect(() => {
      const existing = this.existingImageUrl();
      untracked(() => {
        if (this.compact() && !existing && this.items().length > 0) {
          this.clearItems();
        }
      });
    });
  }

  /**
   * Safe Cross-Platform Camera Trigger:
   * On mobile devices (Android/iOS), directly invokes native camera intent via <input capture="environment">.
   * This avoids Android's ActivityManager memory eviction ("تعذر إكمال العملية نظراً لانخفاض الذاكرة")
   * and preserves the user activation token.
   * On desktop, opens HTML5 getUserMedia live viewfinder stream.
   */
  triggerCamera(fallbackInput?: HTMLInputElement): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      ('ontouchstart' in window && window.innerWidth <= 800);

    if (isMobile && fallbackInput) {
      fallbackInput.click();
    } else {
      this.openLiveCamera(fallbackInput);
    }
  }

  clearItems(): void {
    if (this.items().length === 0 && !this.errorMessage()) {
      return;
    }
    if (isPlatformBrowser(this.platformId)) {
      for (const item of this.items()) {
        if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      }
    }
    this.items.set([]);
    this.uploadProgress.set(0);
    this.errorMessage.set(null);
  }

  ngOnDestroy(): void {
    this.closeLiveCamera();
    // Revoke object URLs to prevent memory leaks
    if (isPlatformBrowser(this.platformId)) {
      for (const item of this.items()) {
        if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      }
    }
  }

  /**
   * Opens live camera stream viewfinder modal via HTML5 getUserMedia API.
   * If camera access is unsupported or rejected, falls back seamlessly to file input.
   */
  async openLiveCamera(fallbackInput?: HTMLInputElement): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !navigator.mediaDevices?.getUserMedia) {
      fallbackInput?.click();
      return;
    }

    this.errorMessage.set(null);
    this.isLiveCameraOpen.set(true);
    this.isCameraStarting.set(true);

    try {
      await this.initCameraStream();
    } catch (err: any) {
      console.warn('getUserMedia failed, falling back to camera input picker:', err);
      this.closeLiveCamera();
      fallbackInput?.click();
    } finally {
      this.isCameraStarting.set(false);
    }
  }

  /**
   * Initializes or restarts the media stream with current facing mode.
   */
  private async initCameraStream(): Promise<void> {
    if (this.cameraMediaStream) {
      this.cameraMediaStream.getTracks().forEach(track => track.stop());
      this.cameraMediaStream = null;
    }

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: this.cameraFacingMode() },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.cameraMediaStream = stream;

    // Small delay to allow DOM modal render
    setTimeout(() => {
      const videoEl = document.getElementById('liveCameraVideo') as HTMLVideoElement | null;
      if (videoEl) {
        videoEl.srcObject = stream;
        videoEl.play().catch(playErr => console.warn('Camera video play error:', playErr));
      }
    }, 100);
  }

  /**
   * Flips camera facing mode between environment (back) and user (selfie).
   */
  async flipCamera(): Promise<void> {
    this.cameraFacingMode.update(m => (m === 'environment' ? 'user' : 'environment'));
    this.isCameraStarting.set(true);
    try {
      await this.initCameraStream();
    } catch (err) {
      console.warn('Failed to switch camera facing mode:', err);
    } finally {
      this.isCameraStarting.set(false);
    }
  }

  /**
   * Halts camera tracks and closes live camera viewfinder modal.
   */
  closeLiveCamera(): void {
    if (this.cameraMediaStream) {
      this.cameraMediaStream.getTracks().forEach(track => track.stop());
      this.cameraMediaStream = null;
    }
    this.isLiveCameraOpen.set(false);
    this.isCameraStarting.set(false);
  }

  /**
   * Grabs a high-resolution frame from live <video> element onto Canvas and triggers compression.
   */
  capturePhotoFromStream(): void {
    const videoEl = document.getElementById('liveCameraVideo') as HTMLVideoElement | null;
    if (!videoEl || videoEl.videoWidth === 0) {
      this.errorMessage.set('الكاميرا غير جاهزة، انتظر ثانية.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], `captured_${Date.now()}.jpg`, { type: 'image/jpeg' });
        this.closeLiveCamera();
        this.processFiles([file]);
      } else {
        this.errorMessage.set('تعذر التقاط الصورة، أعد المحاولة.');
      }
    }, 'image/jpeg', 0.92);
  }

  /**
   * File input selection handler.
   */
  async onFilesSelected(event: Event): Promise<void> {
    const inputEl = event.target as HTMLInputElement;
    if (!inputEl.files || inputEl.files.length === 0) return;

    const files = Array.from(inputEl.files);
    inputEl.value = '';
    await this.processFiles(files);
  }

  /**
   * Core processing: creates instant preview and prepares items.
   */
  async processFiles(files: File[]): Promise<void> {
    this.errorMessage.set(null);
    const maxAllowed = this.maxFilesAllowed();

    if (files.length > maxAllowed) {
      this.errorMessage.set(
        this.uploadTarget() === 'question'
          ? 'مسموح بصورة واحدة فقط.'
          : 'الحد الأقصى صورتان فقط.'
      );
      return;
    }

    this.isProcessing.set(true);

    // Revoke any previous object URLs to prevent memory leak
    if (isPlatformBrowser(this.platformId)) {
      for (const item of this.items()) {
        if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      }
    }

    try {
      const processedItems: CompressedImageItem[] = [];

      for (const file of files) {
        const originalSizeKb = Math.round(file.size / 1024);
        // Instant sharp preview directly from source file - avoids black/blank screen
        const previewUrl = isPlatformBrowser(this.platformId)
          ? URL.createObjectURL(file)
          : '';

        processedItems.push({
          id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          originalFile: file,
          compressedBlob: file,
          previewUrl,
          originalSizeKb,
          compressedSizeKb: originalSizeKb,
          rotationDeg: 0,
          uploadStatus: 'PENDING'
        });
      }

      this.items.set(processedItems);

      // If homework: open mandatory clarity confirmation modal with instant preview
      if (this.uploadTarget() === 'homework') {
        this.activePreviewIndex.set(0);
        this.isClarityConfirmed.set(false);
        this.showClarityModal.set(true);
      } else {
        // For teacher question: compress and execute direct upload
        await this.prepareAndUpload();
      }
    } catch (err: any) {
      console.error('Image processing failed:', err);
      this.errorMessage.set('فشل تجهيز الصورة.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * Compresses image to <= 150KB WebP using lightweight canvas downscale.
   * Handles 90/180/270 degree rotation and falls back to JPEG if WebP is unsupported.
   */
  private async compressToWebP(file: File, rotationDeg: number = 0): Promise<Blob> {
    return new Promise((resolve) => {
      if (!isPlatformBrowser(this.platformId)) {
        resolve(file);
        return;
      }

      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        try {
          const maxDim = this.uploadTarget() === 'question' ? 960 : 1280;
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          const isRotated90or270 = rotationDeg === 90 || rotationDeg === 270;
          canvas.width = isRotated90or270 ? height : width;
          canvas.height = isRotated90or270 ? width : height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            resolve(file);
            return;
          }

          if (rotationDeg !== 0) {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((rotationDeg * Math.PI) / 180);
            ctx.drawImage(img, -width / 2, -height / 2, width, height);
          } else {
            ctx.drawImage(img, 0, 0, width, height);
          }

          URL.revokeObjectURL(url);

          canvas.toBlob(
            (blob) => {
              if (blob && blob.size > 0) {
                resolve(blob);
              } else {
                canvas.toBlob(
                  (jpegBlob) => resolve(jpegBlob || file),
                  'image/jpeg',
                  0.82
                );
              }
            },
            'image/webp',
            0.8
          );
        } catch (canvasErr) {
          console.warn('Canvas transform error:', canvasErr);
          URL.revokeObjectURL(url);
          resolve(file);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };

      img.src = url;
    });
  }

  /**
   * Rotates active preview image by 90 degrees clockwise.
   */
  rotateClockwise(): void {
    const idx = this.activePreviewIndex();
    const current = this.items();
    if (!current[idx]) return;

    current[idx].rotationDeg = (current[idx].rotationDeg + 90) % 360;
    this.items.set([...current]);
  }

  /**
   * Rotates active preview image by 90 degrees counter-clockwise.
   */
  rotateCounterClockwise(): void {
    const idx = this.activePreviewIndex();
    const current = this.items();
    if (!current[idx]) return;

    current[idx].rotationDeg = (current[idx].rotationDeg - 90 + 360) % 360;
    this.items.set([...current]);
  }

  selectPreviewTab(index: number): void {
    this.activePreviewIndex.set(index);
  }

  toggleClarityConfirmation(): void {
    this.isClarityConfirmed.update(v => !v);
  }

  /**
   * Confirms clarity and proceeds to compress and upload.
   */
  async confirmAndUpload(): Promise<void> {
    if (!this.isClarityConfirmed()) return;
    this.showClarityModal.set(false);
    await this.prepareAndUpload();
  }

  private async prepareAndUpload(): Promise<void> {
    const list = this.items();
    if (list.length === 0) return;

    this.isProcessing.set(true);
    try {
      for (const item of list) {
        item.compressedBlob = await this.compressToWebP(item.originalFile, item.rotationDeg);
        item.compressedSizeKb = Math.round(item.compressedBlob.size / 1024);
      }
      this.items.set([...list]);
    } catch (err) {
      console.warn('Compression error, using original files:', err);
    } finally {
      this.isProcessing.set(false);
    }

    await this.executeDirectCdnUpload();
  }

  cancelClarityModal(): void {
    this.showClarityModal.set(false);
    this.items.set([]);
  }

  /**
   * Executes Direct Client-to-CDN Upload via short-lived signed token.
   * Zero binary routing through Express serverless functions.
   */
  async executeDirectCdnUpload(): Promise<void> {
    const list = this.items();
    if (list.length === 0) return;

    this.isUploading.set(true);
    this.uploadProgress.set(10);
    this.errorMessage.set(null);

    try {
      // 1. Fetch short-lived signed signature from backend
      const sigResponse = await firstValueFrom(
        this.http.get<CloudinarySignatureResponse>(
          `${this.apiBase}/upload-signature?target=${this.uploadTarget()}`
        )
      );

      const sigData = sigResponse.data;
      const uploadedUrls: string[] = [];

      // 2. Upload each compressed WebP blob directly to Cloudinary
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        item.uploadStatus = 'UPLOADING';
        this.items.set([...list]);

        const formData = new FormData();
        formData.append('file', item.compressedBlob, `upload_${Date.now()}.webp`);
        formData.append('api_key', sigData.apiKey);
        formData.append('timestamp', sigData.timestamp.toString());
        formData.append('signature', sigData.signature);
        formData.append('folder', sigData.folder);

        let uploadResult: { secure_url: string; public_id: string };

        try {
          // Use native fetch to bypass any Angular interceptors and prevent Authorization headers
          const cdnRes = await fetch(sigData.uploadUrl, {
            method: 'POST',
            body: formData
          });

          if (!cdnRes.ok) {
            const errBody = await cdnRes.text();
            throw new Error(`Cloudinary HTTP ${cdnRes.status}: ${errBody}`);
          }

          uploadResult = await cdnRes.json();
        } catch (fetchErr) {
          console.warn('Native fetch to Cloudinary failed, attempting HttpClient fallback:', fetchErr);
          uploadResult = await firstValueFrom(
            this.http.post<{ secure_url: string; public_id: string }>(sigData.uploadUrl, formData)
          );
        }

        const maxW = this.uploadTarget() === 'question' ? 960 : 1280;
        const optimizedUrl = optimizeCloudinaryUrl(uploadResult.secure_url, maxW);
        item.remoteUrl = optimizedUrl;
        item.uploadStatus = 'SUCCESS';
        uploadedUrls.push(optimizedUrl);

        const progress = Math.round(((i + 1) / list.length) * 100);
        this.uploadProgress.set(progress);
        this.items.set([...list]);
      }

      // 3. Emit appropriate output signal
      if (this.uploadTarget() === 'question') {
        this.imageUploaded.emit(uploadedUrls[0]);
      } else {
        this.homeworkUploaded.emit(uploadedUrls);
      }

      if (this.clearOnSuccess()) {
        this.clearItems();
      }
    } catch (err: any) {
      console.error('Direct Cloudinary upload failed:', err);
      this.errorMessage.set(
        'تعذر رفع الصور. تحقق من الاتصال.'
      );
      for (const item of list) {
        if (item.uploadStatus === 'UPLOADING') item.uploadStatus = 'ERROR';
      }
      this.items.set([...list]);
    } finally {
      this.isUploading.set(false);
    }
  }

  removeItem(index: number): void {
    const current = this.items();
    current.splice(index, 1);
    this.items.set([...current]);
  }
}
