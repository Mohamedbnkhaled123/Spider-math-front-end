import {
  Component,
  ChangeDetectionStrategy,
  signal,
  input,
  output,
  model,
  inject,
  ElementRef,
  PLATFORM_ID,
  viewChild,
  effect,
  OnDestroy
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Cropper from 'cropperjs';
import { AppIconComponent } from '../app-icon/app-icon.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { CropAspectRatio, ISliceResult } from './manual-image-slicer-modal.models';
import { uploadBlobToCloudinary } from '../../utils/box2d-cropper.util';

@Component({
  selector: 'app-manual-image-slicer-modal',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  templateUrl: './manual-image-slicer-modal.component.html',
  styleUrl: './manual-image-slicer-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManualImageSlicerModalComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  readonly langService = inject(LangService);

  // Inputs & Two-Way Model
  readonly isOpen = model<boolean>(false);
  readonly imageSource = input<string | HTMLCanvasElement | Blob | null>(null);
  readonly initialBox2d = input<[number, number, number, number] | null>(null);
  readonly modalTitle = input<string>('قص وتحديد السؤال / الرسم الهندسي');
  readonly uploadToCloudinary = input<boolean>(true);

  // Outputs
  readonly sliceSaved = output<ISliceResult>();
  readonly cancelled = output<void>();

  // ViewChild for Image target
  readonly cropperImage = viewChild<ElementRef<HTMLImageElement>>('cropperImage');

  // Signals
  readonly isCropperReady = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly currentAspectRatio = signal<CropAspectRatio>('FREE');
  readonly approxSizeKb = signal<number>(0);
  readonly errorMessage = signal<string | null>(null);
  readonly imageSrcUrl = signal<string>('');

  private cropper: Cropper | null = null;
  private objectUrlToRevoke: string | null = null;

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const source = this.imageSource();
      if (!isPlatformBrowser(this.platformId)) return;

      if (open && source) {
        this.prepareAndInitCropper(source);
      } else {
        this.destroyCropper();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyCropper();
  }

  private prepareAndInitCropper(source: string | HTMLCanvasElement | Blob): void {
    this.cleanupObjectUrl();
    this.destroyCropper();
    this.errorMessage.set(null);
    this.isCropperReady.set(false);

    if (source instanceof HTMLCanvasElement) {
      this.imageSrcUrl.set(source.toDataURL('image/png'));
    } else if (source instanceof Blob) {
      this.objectUrlToRevoke = URL.createObjectURL(source);
      this.imageSrcUrl.set(this.objectUrlToRevoke);
    } else if (typeof source === 'string') {
      this.imageSrcUrl.set(source);
    }

    // Ensure cropper initializes precisely when image is fully loaded
    const checkAndInit = () => {
      const imgEl = this.cropperImage()?.nativeElement;
      if (!imgEl) {
        setTimeout(checkAndInit, 30);
        return;
      }
      if (imgEl.complete && imgEl.naturalWidth > 0) {
        this.initCropperInstance();
      } else {
        imgEl.onload = () => {
          imgEl.onload = null;
          this.initCropperInstance();
        };
        setTimeout(() => {
          if (!this.cropper && imgEl.naturalWidth > 0) {
            this.initCropperInstance();
          }
        }, 300);
      }
    };

    setTimeout(checkAndInit, 30);
  }

  private initCropperInstance(): void {
    const imgEl = this.cropperImage()?.nativeElement;
    if (!imgEl) return;

    try {
      this.cropper = new Cropper(imgEl, {
        viewMode: 1, // Keep crop box within image boundaries
        dragMode: 'move',
        responsive: true,
        restore: false,
        checkCrossOrigin: true,
        rotatable: true,
        scalable: true,
        zoomable: true,
        zoomOnTouch: true,
        initialAspectRatio: NaN,
        ready: () => {
          this.isCropperReady.set(true);
          const box = this.initialBox2d();
          if (box) {
            this.applyInitialBox2d(box);
          }
          this.updateApproxSize();
        },
        crop: () => {
          this.updateApproxSize();
        }
      });
    } catch (err) {
      console.error('Failed to initialize Cropper.js:', err);
      this.errorMessage.set('فشل تهيئة أداة القص التفاعلية.');
    }
  }

  private applyInitialBox2d(box: [number, number, number, number]): void {
    if (!this.cropper) return;
    const imgData = this.cropper.getImageData();
    if (!imgData || !imgData.naturalWidth || !imgData.naturalHeight) return;

    const [ymin, xmin, ymax, xmax] = box;
    const normYmin = Math.min(ymin, ymax);
    const normYmax = Math.max(ymin, ymax);
    const normXmin = Math.min(xmin, xmax);
    const normXmax = Math.max(xmin, xmax);

    const x = Math.max(0, Math.round((normXmin / 1000) * imgData.naturalWidth));
    const y = Math.max(0, Math.round((normYmin / 1000) * imgData.naturalHeight));
    const width = Math.max(10, Math.min(imgData.naturalWidth - x, Math.round(((normXmax - normXmin) / 1000) * imgData.naturalWidth)));
    const height = Math.max(10, Math.min(imgData.naturalHeight - y, Math.round(((normYmax - normYmin) / 1000) * imgData.naturalHeight)));

    this.cropper.setData({
      x,
      y,
      width,
      height
    });
  }

  private updateApproxSize(): void {
    if (!this.cropper) return;
    try {
      const data = this.cropper.getData();
      // Rough WebP estimation at 0.85 quality (~0.12 bytes per pixel for typical math diagrams)
      const pixels = data.width * data.height;
      const estimatedKb = Math.min(150, Math.max(8, Math.round((pixels * 0.12) / 1024)));
      this.approxSizeKb.set(estimatedKb);
    } catch {
      // ignore
    }
  }

  rotateLeft(): void {
    this.cropper?.rotate(-90);
  }

  rotateRight(): void {
    this.cropper?.rotate(90);
  }

  zoomIn(): void {
    this.cropper?.zoom(0.15);
  }

  zoomOut(): void {
    this.cropper?.zoom(-0.15);
  }

  resetCrop(): void {
    this.cropper?.reset();
    const box = this.initialBox2d();
    if (box) {
      this.applyInitialBox2d(box);
    }
  }

  setAspectRatio(ratio: CropAspectRatio): void {
    this.currentAspectRatio.set(ratio);
    if (!this.cropper) return;

    switch (ratio) {
      case '16:9':
        this.cropper.setAspectRatio(16 / 9);
        break;
      case '4:3':
        this.cropper.setAspectRatio(4 / 3);
        break;
      case '1:1':
        this.cropper.setAspectRatio(1);
        break;
      case 'FREE':
      default:
        this.cropper.setAspectRatio(NaN);
        break;
    }
  }

  async saveCrop(): Promise<void> {
    return this.saveAndConfirm();
  }

  async saveAndConfirm(): Promise<void> {
    if (!this.cropper || this.isSaving()) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);

    try {
      const croppedCanvas = this.cropper.getCroppedCanvas({
        maxWidth: 1600,
        maxHeight: 1600,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      });

      if (!croppedCanvas) {
        throw new Error('Could not retrieve cropped canvas');
      }

      // Step-down quality compression to enforce <= 150KB budget
      let quality = 0.85;
      let blob: Blob | null = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        blob = await new Promise<Blob | null>((resolve) => {
          croppedCanvas.toBlob((b) => resolve(b), 'image/webp', quality);
        });

        if (blob && blob.size <= 150 * 1024) {
          break;
        }
        quality -= 0.15;
      }

      if (!blob) {
        blob = await new Promise<Blob | null>((resolve) => {
          croppedCanvas.toBlob((b) => resolve(b), 'image/jpeg', 0.8);
        });
      }

      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      const dataUrl = croppedCanvas.toDataURL('image/webp', quality);
      const sizeKb = Math.round(blob.size / 1024);
      let finalImageUrl = dataUrl;

      // Only execute Cloudinary upload if confirmed
      if (this.uploadToCloudinary()) {
        finalImageUrl = await uploadBlobToCloudinary(blob, 'question', this.http);
      }

      this.sliceSaved.emit({
        imageUrl: finalImageUrl,
        blob,
        dataUrl,
        sizeKb,
        width: croppedCanvas.width,
        height: croppedCanvas.height
      });

      // Close modal on successful save WITHOUT emitting cancelled
      this.isOpen.set(false);
      this.destroyCropper();
    } catch (err: any) {
      console.error('Failed to save cropped image:', err);
      this.errorMessage.set('فشل حفظ القصاصة ورفعها. يرجى المحاولة مرة أخرى.');
    } finally {
      this.isSaving.set(false);
    }
  }

  /**
   * Invoked explicitly when the user cancels or closes the dialog without saving.
   */
  cancelCrop(): void {
    this.isOpen.set(false);
    this.cancelled.emit();
    this.destroyCropper();
  }

  closeModal(): void {
    this.cancelCrop();
  }

  private destroyCropper(): void {
    if (this.cropper) {
      try {
        this.cropper.destroy();
      } catch {
        // ignore
      }
      this.cropper = null;
    }
    this.isCropperReady.set(false);
    this.cleanupObjectUrl();
  }

  private cleanupObjectUrl(): void {
    if (this.objectUrlToRevoke && isPlatformBrowser(this.platformId)) {
      URL.revokeObjectURL(this.objectUrlToRevoke);
      this.objectUrlToRevoke = null;
    }
  }
}
