import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  inject,
  PLATFORM_ID,
  OnDestroy
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import imageCompression from 'browser-image-compression';
import { AppIconComponent } from '../app-icon/app-icon.component';
import {
  CloudinarySignatureResponse,
  CompressedImageItem,
  UploadTarget
} from './image-compressor-uploader.models';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageCompressorUploaderComponent implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiBase = '/api/v1/assessments';

  // Input Target: 'question' or 'homework'
  readonly uploadTarget = input.required<UploadTarget>();
  readonly existingImageUrl = input<string | null>(null);

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
      this.errorMessage.set('الكاميرا غير جاهزة بعد، يرجى الانتظار ثانية.');
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
        this.errorMessage.set('تعذر التقاط لقطة من الكاميرا، يرجى المحاولة ثانية.');
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
   * Core processing: compresses selected/captured files into WebP <= 150KB.
   */
  async processFiles(files: File[]): Promise<void> {
    this.errorMessage.set(null);
    const maxAllowed = this.maxFilesAllowed();

    if (files.length > maxAllowed) {
      this.errorMessage.set(
        this.uploadTarget() === 'question'
          ? 'مسموح برفع صورة واحدة فقط لنص السؤال.'
          : 'الحد الأقصى المسموح به هو صورتان فقط لحل الواجب لحماية سرعة المعالجة.'
      );
      return;
    }

    this.isProcessing.set(true);

    try {
      const processedItems: CompressedImageItem[] = [];

      for (const file of files) {
        const originalSizeKb = Math.round(file.size / 1024);
        const compressedBlob = await this.compressToWebP(file);
        const compressedSizeKb = Math.round(compressedBlob.size / 1024);

        const previewUrl = isPlatformBrowser(this.platformId)
          ? URL.createObjectURL(compressedBlob)
          : '';

        processedItems.push({
          id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          originalFile: file,
          compressedBlob,
          previewUrl,
          originalSizeKb,
          compressedSizeKb,
          rotationDeg: 0,
          uploadStatus: 'PENDING'
        });
      }

      this.items.set(processedItems);

      // If homework: open mandatory clarity confirmation modal
      if (this.uploadTarget() === 'homework') {
        this.activePreviewIndex.set(0);
        this.isClarityConfirmed.set(false);
        this.showClarityModal.set(true);
      } else {
        // For teacher question: direct upload
        await this.executeDirectCdnUpload();
      }
    } catch (err: any) {
      console.error('Image processing/compression failed:', err);
      this.errorMessage.set('فشل ضغط الصورة، يرجى اختيار ملف صورة صالح.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * Compresses image to <= 150KB WebP using Web Worker with Canvas fallback.
   */
  private async compressToWebP(file: File): Promise<Blob> {
    const options = {
      maxSizeMB: 0.15, // <= 150KB budget (RULES.md Section 5.2)
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.78
    };

    try {
      return await imageCompression(file, options);
    } catch (workerErr) {
      console.warn('Worker compression fallback to canvas:', workerErr);
      return this.canvasCompressFallback(file);
    }
  }

  /**
   * Lightweight HTML5 Canvas WebP fallback.
   */
  private canvasCompressFallback(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > 1600 || height > 1600) {
          if (width > height) {
            height = Math.round((height * 1600) / width);
            width = 1600;
          } else {
            width = Math.round((width * 1600) / height);
            height = 1600;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context unavailable'));

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          blob => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas toBlob failed'));
          },
          'image/webp',
          0.78
        );
      };
      img.onerror = reject;
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
   * Confirms clarity and proceeds to direct Cloudinary upload.
   */
  async confirmAndUpload(): Promise<void> {
    if (!this.isClarityConfirmed()) return;
    this.showClarityModal.set(false);
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

        item.remoteUrl = uploadResult.secure_url;
        item.uploadStatus = 'SUCCESS';
        uploadedUrls.push(uploadResult.secure_url);

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
    } catch (err: any) {
      console.error('Direct Cloudinary upload failed:', err);
      this.errorMessage.set(
        'تعذر رفع الصور إلى سيرفر التخزين السحابي، يرجى التحقق من الاتصال وإعادة المحاولة.'
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
