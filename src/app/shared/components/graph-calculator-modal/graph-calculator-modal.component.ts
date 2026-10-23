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
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AppIconComponent } from '../app-icon/app-icon.component';
import { CalculatorModalFactory } from './calculator-modal.factory';
import {
  CalculatorCoordinates,
  CalculatorPreset,
  CalculatorType
} from './graph-calculator-modal.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 12: Graph Calculator Modal Component (Full Desmos API Engine)
 * 
 * - Embeds official Desmos Graphing Calculator API with full interactivity:
 *   * Left expressions panel (+ menu, functions, sliders, tables, f(x))
 *   * Bottom on-screen math keypad (sin, cos, tan, log, roots, variables, digits)
 *   * Graph settings menu (radians/degrees, grid toggle, axis bounds)
 *   * Interactive zoom & trace tools
 * - Strictly obeys 'NONE' | 'DESMOS' contract (GeoGebra completely excluded)
 */
@Component({
  selector: 'app-graph-calculator-modal',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  templateUrl: './graph-calculator-modal.component.html',
  styleUrls: ['./graph-calculator-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphCalculatorModalComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  // Inputs & Outputs
  readonly isOpen = model<boolean>(false);
  readonly calculatorType = input<CalculatorType>('DESMOS');
  readonly initialExpression = input<string>('');
  readonly closed = output<void>();

  // State Signals
  readonly isCollapsed = signal<boolean>(false);
  readonly isMaximized = signal<boolean>(false);
  readonly position = signal<CalculatorCoordinates>({ x: 40, y: 80 });
  readonly isDragging = signal<boolean>(false);
  readonly isEngineLoading = signal<boolean>(false);
  readonly copiedNotification = signal<string | null>(null);

  // Dragging mechanics
  private dragStartX = 0;
  private dragStartY = 0;
  private initialPosX = 0;
  private initialPosY = 0;

  // Desmos API Instance
  private calculatorInstance: any = null;
  private containerElement: HTMLDivElement | null = null;

  @ViewChild('desmosContainer') set desmosContainer(
    elementRef: ElementRef<HTMLDivElement> | undefined
  ) {
    if (elementRef && isPlatformBrowser(this.platformId)) {
      this.containerElement = elementRef.nativeElement;
      this.initDesmosEngine(elementRef.nativeElement);
    }
  }

  // Active Calculator Configuration via Factory
  readonly config = computed(() => {
    try {
      return CalculatorModalFactory.resolveCalculator(this.calculatorType());
    } catch {
      return CalculatorModalFactory.resolveCalculator('NONE');
    }
  });

  // Quick Curricular Function Shortcuts for Eng. Heba's Students
  readonly presets: CalculatorPreset[] = [
    { labelAr: 'دالة تربيعية', labelEn: 'Quadratic', latex: 'y=x^2-4' },
    { labelAr: 'دالة جيبية', labelEn: 'Sine Wave', latex: 'y=\\sin(x)' },
    { labelAr: 'دالة أسية', labelEn: 'Exponential', latex: 'y=e^x' },
    { labelAr: 'معادلة خطية', labelEn: 'Linear', latex: 'y=2x+1' },
    { labelAr: 'دالة لوغاريتمية', labelEn: 'Logarithmic', latex: 'y=\\ln(x)' }
  ];

  ngOnDestroy(): void {
    if (this.calculatorInstance) {
      try {
        this.calculatorInstance.destroy();
      } catch {}
      this.calculatorInstance = null;
    }
  }

  /**
   * Initializes genuine Desmos Graphing Calculator API with full expressions panel & keypad.
   */
  private initDesmosEngine(element: HTMLDivElement): void {
    if (!isPlatformBrowser(this.platformId) || this.calculatorInstance) return;

    const win = window as any;
    if (win.Desmos && win.Desmos.GraphingCalculator) {
      this.mountCalculator(win.Desmos, element);
    } else {
      this.isEngineLoading.set(true);
      const scriptId = 'desmos-api-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement;

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src =
          'https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
        script.async = true;
        document.head.appendChild(script);
      }

      script.onload = () => {
        this.isEngineLoading.set(false);
        if (win.Desmos && win.Desmos.GraphingCalculator) {
          this.mountCalculator(win.Desmos, element);
        }
      };

      script.onerror = () => {
        this.isEngineLoading.set(false);
        console.warn('Failed to load Desmos script from CDN');
      };
    }
  }

  private mountCalculator(desmos: any, element: HTMLDivElement): void {
    try {
      element.innerHTML = '';
      this.calculatorInstance = desmos.GraphingCalculator(element, {
        keypad: true,
        expressions: true,
        settingsMenu: true,
        zoomButtons: true,
        pointsOfInterest: true,
        trace: true,
        border: false,
        fontSize: 14,
        language: 'en'
      });

      // Plot initial expression if provided
      if (this.initialExpression()) {
        this.calculatorInstance.setExpression({
          id: 'initial_expr',
          latex: this.initialExpression()
        });
      }
    } catch (err) {
      console.error('Error mounting Desmos calculator instance:', err);
    }
  }

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

    const newX = Math.max(10, Math.min(window.innerWidth - 360, this.initialPosX + deltaX));
    const newY = Math.max(60, Math.min(window.innerHeight - 150, this.initialPosY + deltaY));

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
    if (this.calculatorInstance) {
      setTimeout(() => {
        try {
          this.calculatorInstance.resize();
        } catch {}
      }, 100);
    }
  }

  closeModal(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  /**
   * Directly plots preset function into Desmos and shows feedback.
   */
  applyPreset(preset: CalculatorPreset): void {
    if (this.calculatorInstance) {
      this.calculatorInstance.setExpression({
        id: `preset_${Date.now()}`,
        latex: preset.latex
      });
      this.copiedNotification.set(`تم رسم "${preset.labelAr}" مباشرة!`);
      setTimeout(() => this.copiedNotification.set(null), 3000);
    } else if (isPlatformBrowser(this.platformId)) {
      navigator.clipboard?.writeText(preset.latex).then(() => {
        this.copiedNotification.set(`تم نسخ "${preset.labelAr}"!`);
        setTimeout(() => this.copiedNotification.set(null), 3000);
      });
    }
  }
}
