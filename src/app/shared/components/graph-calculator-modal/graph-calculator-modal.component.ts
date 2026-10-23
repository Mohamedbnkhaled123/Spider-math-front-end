import {
  Component,
  ChangeDetectionStrategy,
  input,
  model,
  output,
  signal,
  computed,
  inject,
  PLATFORM_ID,
  HostListener,
  SecurityContext
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppIconComponent } from '../app-icon/app-icon.component';
import { CalculatorModalFactory } from './calculator-modal.factory';
import {
  CalculatorCoordinates,
  CalculatorPreset,
  CalculatorType
} from './graph-calculator-modal.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 12: Graph Calculator Modal Component (Desmos Graphing Embed)
 * 
 * - Embeds official Desmos interactive graphing calculator inside a draggable/collapsible modal
 * - Supports quick calculus/algebra function shortcuts
 * - Obeying strict 'NONE' | 'DESMOS' contract (GeoGebra completely excluded)
 */
@Component({
  selector: 'app-graph-calculator-modal',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  templateUrl: './graph-calculator-modal.component.html',
  styleUrls: ['./graph-calculator-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphCalculatorModalComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sanitizer = inject(DomSanitizer);

  // Inputs & Outputs
  readonly isOpen = model<boolean>(false);
  readonly calculatorType = input<CalculatorType>('DESMOS');
  readonly initialExpression = input<string>('');
  readonly closed = output<void>();

  // State Signals
  readonly isCollapsed = signal<boolean>(false);
  readonly isMaximized = signal<boolean>(false);
  readonly position = signal<CalculatorCoordinates>({ x: 30, y: 90 });
  readonly isDragging = signal<boolean>(false);

  // Dragging mechanics
  private dragStartX = 0;
  private dragStartY = 0;
  private initialPosX = 0;
  private initialPosY = 0;

  // Active Calculator Configuration via Factory
  readonly config = computed(() => {
    try {
      return CalculatorModalFactory.resolveCalculator(this.calculatorType());
    } catch {
      return CalculatorModalFactory.resolveCalculator('NONE');
    }
  });

  // Sanitized Embed URL
  readonly safeEmbedUrl = computed<SafeResourceUrl>(() => {
    const rawUrl = this.config().embedUrl;
    if (!rawUrl) return '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
  });

  // Quick Curricular Function Shortcuts for Eng. Heba's Students
  readonly presets: CalculatorPreset[] = [
    { labelAr: 'دالة تربيعية', labelEn: 'Quadratic', latex: 'y=x^2-4' },
    { labelAr: 'دالة جيبية', labelEn: 'Sine Wave', latex: 'y=\\sin(x)' },
    { labelAr: 'دالة أسية', labelEn: 'Exponential', latex: 'y=e^x' },
    { labelAr: 'معادلة خطية', labelEn: 'Linear', latex: 'y=2x+1' },
    { labelAr: 'دالة لوغاريتمية', labelEn: 'Logarithmic', latex: 'y=\\ln(x)' }
  ];

  readonly copiedNotification = signal<string | null>(null);

  /**
   * Starts modal dragging on header grip.
   */
  startDrag(event: MouseEvent | TouchEvent): void {
    if (this.isMaximized()) return;
    this.isDragging.set(true);

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    this.dragStartX = clientX;
    this.dragStartY = clientY;
    this.initialPosX = this.position().x;
    this.initialPosY = this.position().y;

    event.preventDefault();
  }

  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  onDragMove(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging() || !isPlatformBrowser(this.platformId)) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const deltaX = clientX - this.dragStartX;
    const deltaY = clientY - this.dragStartY;

    const newX = Math.max(10, Math.min(window.innerWidth - 320, this.initialPosX + deltaX));
    const newY = Math.max(70, Math.min(window.innerHeight - 150, this.initialPosY + deltaY));

    this.position.set({ x: newX, y: newY });
  }

  @HostListener('window:mouseup')
  @HostListener('window:touchend')
  onDragEnd(): void {
    if (this.isDragging()) {
      this.isDragging.set(false);
    }
  }

  toggleCollapse(): void {
    this.isCollapsed.update(v => !v);
  }

  toggleMaximize(): void {
    this.isMaximized.update(v => !v);
  }

  closeModal(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  copyPreset(latex: string, label: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    navigator.clipboard?.writeText(latex).then(() => {
      this.copiedNotification.set(`تم نسخ "${label}" للصقها في ديسموس!`);
      setTimeout(() => this.copiedNotification.set(null), 3000);
    });
  }
}
