import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  model,
  input,
  output,
  effect,
  inject,
  viewChild,
  ElementRef,
  OnDestroy,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppIconComponent } from '../app-icon/app-icon.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import {
  MathKeyboardCategory,
  MATH_CATEGORY_TABS,
  MATH_KEYBOARD_KEYS,
  IMathSymbolKey,
  NUMERIC_KEYPAD_KEYS,
  IVisualTemplate,
  VisualTemplateType,
  IParsedMathSymbol,
  createVisualTemplate,
  compileTemplateLatex,
  parseMathSymbolsFromText,
  findSymbolAtCursor
} from './math-virtual-keyboard.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 2: Teacher Virtual Math Keyboard Component
 * 
 * - Docked bottom sheet styling with categorized math symbol tabs
 * - Native mobile keyboard suppression with toggle for Arabic prose typing
 * - Live formula preview powered by MathFormulaComponent
 * - Bidirectional LTR equation isolation inside Arabic sentences
 */
@Component({
  selector: 'app-math-virtual-keyboard',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  templateUrl: './math-virtual-keyboard.component.html',
  styleUrl: './math-virtual-keyboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MathVirtualKeyboardComponent implements OnDestroy {
  readonly langService = inject(LangService);

  // Model & Inputs
  readonly isOpen = model<boolean>(false);
  readonly targetInput = input<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Outputs
  readonly valueChange = output<string>();

  // Draggable Floating State
  readonly keyboardContainerRef = viewChild<ElementRef<HTMLElement>>('keyboardContainer');
  readonly dragPosition = signal<{ x: number; y: number } | null>(null);
  readonly isDragging = signal<boolean>(false);

  private dragStartPointer: { x: number; y: number } | null = null;
  private dragStartRect: { x: number; y: number; width: number; height: number } | null = null;

  // State Signals
  readonly activeCategory = signal<MathKeyboardCategory>('BASIC');
  readonly previewFormula = signal<string>('');
  readonly isNativeMobileKeyboardActive = signal<boolean>(false);
  readonly activeVisualTemplate = signal<IVisualTemplate | null>(null);
  readonly activeCursorPos = signal<number>(0);
  readonly editingSymbolRange = signal<{ start: number; end: number } | null>(null);

  // Parsed math symbols from preview formula
  readonly parsedMathSymbols = computed<IParsedMathSymbol[]>(() => {
    return parseMathSymbolsFromText(this.previewFormula());
  });

  // Symbol at current cursor position (if any)
  readonly symbolAtCursor = computed<IParsedMathSymbol | null>(() => {
    return findSymbolAtCursor(this.parsedMathSymbols(), this.activeCursorPos());
  });

  // Live KaTeX formula rendered for the currently active visual template
  readonly templateKaTeXPreview = computed<string>(() => {
    const tmpl = this.activeVisualTemplate();
    if (!tmpl) return '';
    return compileTemplateLatex(tmpl);
  });

  // Computed lists
  readonly categoryTabs = computed(() => MATH_CATEGORY_TABS);
  readonly numericKeys = computed(() => NUMERIC_KEYPAD_KEYS);
  readonly visibleKeys = computed(() =>
    MATH_KEYBOARD_KEYS.filter((key) => key.category === this.activeCategory())
  );

  constructor() {
    // Sync target element inputmode state, live input listener, and cleanup on target switch or close
    effect((onCleanup) => {
      const open = this.isOpen();
      const el = this.targetInput();

      if (open && el) {
        // Defensive guard: auto-dismiss if target element is detached from the DOM
        if (typeof el.isConnected === 'boolean' && !el.isConnected) {
          this.isOpen.set(false);
          return;
        }
        el.setAttribute('inputmode', 'none');
        el.removeAttribute('readonly');
        this.isNativeMobileKeyboardActive.set(false);
        this.activeVisualTemplate.set(null);
        this.editingSymbolRange.set(null);
        this.previewFormula.set(el.value);
        this.activeCursorPos.set(el.selectionStart ?? el.value.length);

        const handleInput = () => {
          this.previewFormula.set(el.value);
          this.activeCursorPos.set(el.selectionStart ?? el.value.length);
        };

        const handleCursorSync = () => {
          this.activeCursorPos.set(el.selectionStart ?? el.value.length);
        };

        el.addEventListener('input', handleInput);
        el.addEventListener('click', handleCursorSync);
        el.addEventListener('keyup', handleCursorSync);
        el.addEventListener('select', handleCursorSync);

        onCleanup(() => {
          el.removeAttribute('inputmode');
          el.removeAttribute('readonly');
          el.removeEventListener('input', handleInput);
          el.removeEventListener('click', handleCursorSync);
          el.removeEventListener('keyup', handleCursorSync);
          el.removeEventListener('select', handleCursorSync);
        });
      } else if (el) {
        el.removeAttribute('inputmode');
        el.removeAttribute('readonly');
      }
    });
  }

  selectCategory(category: MathKeyboardCategory): void {
    this.activeCategory.set(category);
  }

  /**
   * Opens the interactive visual template on screen so teacher can edit the
   * math symbol directly (e.g. numerator/denominator) without touching raw LaTeX or dollars.
   */
  openVisualTemplate(type: VisualTemplateType): void {
    this.editingSymbolRange.set(null);
    const tmpl = createVisualTemplate(type);
    this.activeVisualTemplate.set(tmpl);
  }

  /**
   * Opens an existing parsed math symbol in the visual template editor so the teacher
   * can modify its values (numerator, denominator, exponent, etc.) directly on screen.
   */
  editExistingSymbol(symbol: IParsedMathSymbol): void {
    this.editingSymbolRange.set({ start: symbol.startIndex, end: symbol.endIndex });
    this.activeVisualTemplate.set(symbol.template);
  }

  /**
   * Defensive guard: returns targetInput if it exists and is still connected to the DOM tree.
   * If the target element has been unmounted/detached (isConnected === false),
   * automatically dismisses the virtual keyboard to prevent orphaned mutations.
   */
  private getConnectedTarget(): (HTMLInputElement | HTMLTextAreaElement) | null {
    const el = this.targetInput();
    if (!el) return null;
    if (typeof el.isConnected === 'boolean' && !el.isConnected) {
      this.close();
      return null;
    }
    return el;
  }

  /**
   * Deletes the currently edited math symbol completely from the input behind the scenes.
   */
  deleteEditingSymbol(): void {
    const range = this.editingSymbolRange();
    const el = this.getConnectedTarget();
    if (range && el) {
      this.ensureInputModeSuppression(el);
      const currentVal = el.value;
      const nextVal = currentVal.slice(0, range.start) + currentVal.slice(range.end);
      el.value = nextVal;
      const newPos = Math.max(0, Math.min(range.start, nextVal.length));
      el.setSelectionRange(newPos, newPos);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      this.previewFormula.set(nextVal);
      this.activeCursorPos.set(newPos);
      this.valueChange.emit(nextVal);
    }
    this.editingSymbolRange.set(null);
    this.activeVisualTemplate.set(null);
  }

  cancelVisualTemplate(): void {
    this.activeVisualTemplate.set(null);
    this.editingSymbolRange.set(null);
  }

  selectSlot(index: number): void {
    const tmpl = this.activeVisualTemplate();
    if (!tmpl || index < 0 || index >= tmpl.slots.length) return;
    this.activeVisualTemplate.set({
      ...tmpl,
      activeSlotIndex: index
    });
  }

  nextSlot(): void {
    const tmpl = this.activeVisualTemplate();
    if (!tmpl) return;
    const nextIndex = (tmpl.activeSlotIndex + 1) % tmpl.slots.length;
    this.selectSlot(nextIndex);
  }

  updateSlotValue(index: number, val: string): void {
    const tmpl = this.activeVisualTemplate();
    if (!tmpl || index < 0 || index >= tmpl.slots.length) return;
    const updatedSlots = tmpl.slots.map((s, i) => (i === index ? { ...s, value: val } : s));
    this.activeVisualTemplate.set({
      ...tmpl,
      slots: updatedSlots
    });
  }

  applyVisualTemplate(): void {
    const tmpl = this.activeVisualTemplate();
    if (!tmpl) return;
    const latex = compileTemplateLatex(tmpl);
    const range = this.editingSymbolRange();
    this.activeVisualTemplate.set(null);
    this.editingSymbolRange.set(null);

    const el = this.getConnectedTarget();
    if (!el) {
      this.previewFormula.update((prev) => prev + latex);
      return;
    }

    this.ensureInputModeSuppression(el);

    if (range) {
      // In-place replacement of existing math symbol
      const currentVal = el.value;
      const nextVal = currentVal.slice(0, range.start) + latex + currentVal.slice(range.end);
      el.value = nextVal;
      const newCursor = Math.max(0, Math.min(range.start + latex.length, nextVal.length));
      el.setSelectionRange(newCursor, newCursor);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      this.previewFormula.set(nextVal);
      this.activeCursorPos.set(newCursor);
      this.valueChange.emit(nextVal);
    } else {
      // Insertion of new math symbol at cursor
      this.insertSymbolDirect(latex);
    }
  }

  /**
   * Re-activates mobile keyboard suppression if native prose typing mode was active,
   * keeping virtual keyboard controls in sync and soft keyboard dismissed without readonly freeze.
   */
  private ensureInputModeSuppression(el: HTMLInputElement | HTMLTextAreaElement): void {
    if (this.isNativeMobileKeyboardActive()) {
      el.setAttribute('inputmode', 'none');
      el.removeAttribute('readonly');
      this.isNativeMobileKeyboardActive.set(false);
    }
  }

  /**
   * Prevents mouse focus shift when clicking keys on desktop so target cursor is retained.
   * On mobile touch devices, returns early without calling preventDefault() to avoid cancelling
   * synthetic click events per W3C Touch Events Level 2 specification.
   */
  preventFocusLoss(event: Event): void {
    if (typeof PointerEvent !== 'undefined' && event instanceof PointerEvent && event.pointerType === 'touch') {
      return;
    }
    event.preventDefault();
  }

  /**
   * Direct symbol insertion into target input without artificial dollar signs.
   * All mathematical formatting happens behind the scenes.
   */
  private insertSymbolDirect(latexCode: string, cursorOffset: number = 0): void {
    const el = this.getConnectedTarget();
    if (!el) {
      this.previewFormula.update((prev) => prev + latexCode);
      return;
    }

    this.ensureInputModeSuppression(el);

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const currentValue = el.value;

    const nextValue = currentValue.slice(0, start) + latexCode + currentValue.slice(end);
    el.value = nextValue;

    const newCursorPos = Math.max(0, Math.min(start + latexCode.length + cursorOffset, el.value.length));
    el.setSelectionRange(newCursorPos, newCursorPos);

    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));

    this.previewFormula.set(nextValue);
    this.activeCursorPos.set(newCursorPos);
    this.valueChange.emit(nextValue);
  }

  /**
   * Main insertion handler:
   * - If an interactive visual template is currently open, types into its active slot.
   * - If a composite key is tapped, checks if cursor is on an existing symbol to edit it, or launches visual template.
   * - If a simple symbol or derivative key is tapped, inserts directly into formula without dollar signs.
   */
  insertSymbol(latexCode: string, cursorOffset: number = 0, templateType?: VisualTemplateType): void {
    const tmpl = this.activeVisualTemplate();
    if (tmpl) {
      const activeIdx = tmpl.activeSlotIndex;
      const currentVal = tmpl.slots[activeIdx]?.value ?? '';
      this.updateSlotValue(activeIdx, currentVal + latexCode);
      return;
    }

    const matchedKey = MATH_KEYBOARD_KEYS.find((k) => k.latex === latexCode || k.label === latexCode);
    const effectiveTemplate = templateType || matchedKey?.templateType;

    if (effectiveTemplate) {
      // Check if cursor is on an existing symbol of this type to edit it directly
      const atCursor = this.symbolAtCursor();
      if (atCursor && atCursor.type === effectiveTemplate) {
        this.editExistingSymbol(atCursor);
        return;
      }
      this.openVisualTemplate(effectiveTemplate);
      return;
    }

    this.insertSymbolDirect(latexCode, cursorOffset);
  }

  /**
   * Inserts digits, decimals, and arithmetic symbols directly.
   * If a visual template is active, writes directly into the selected slot on screen.
   */
  insertNumeric(value: string): void {
    const tmpl = this.activeVisualTemplate();
    if (tmpl) {
      const activeIdx = tmpl.activeSlotIndex;
      const currentVal = tmpl.slots[activeIdx]?.value ?? '';
      this.updateSlotValue(activeIdx, currentVal + value);
      return;
    }

    this.insertSymbolDirect(value);
  }

  /**
   * Legacy delimiter support maintained for backwards compatibility.
   * No raw dollar signs are exposed in UI buttons.
   */
  insertDelimiter(type: 'INLINE' | 'BLOCK'): void {
    const el = this.getConnectedTarget();
    const delimiter = type === 'BLOCK' ? '$$  $$' : '$  $';
    const offset = type === 'BLOCK' ? 2 : 1;

    if (!el) {
      this.previewFormula.update((prev) => prev + delimiter);
      return;
    }

    this.ensureInputModeSuppression(el);

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const currentValue = el.value;

    const nextValue = currentValue.slice(0, start) + delimiter + currentValue.slice(end);
    el.value = nextValue;

    const newCursor = start + offset;
    el.setSelectionRange(newCursor, newCursor);

    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));

    this.previewFormula.set(nextValue);
    this.valueChange.emit(nextValue);
  }

  handleBackspace(): void {
    const tmpl = this.activeVisualTemplate();
    if (tmpl) {
      const activeIdx = tmpl.activeSlotIndex;
      const currentVal = tmpl.slots[activeIdx]?.value ?? '';
      this.updateSlotValue(activeIdx, currentVal.slice(0, -1));
      return;
    }

    const el = this.getConnectedTarget();
    if (!el) {
      this.previewFormula.update((prev) => prev.slice(0, -1));
      return;
    }

    this.ensureInputModeSuppression(el);

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const currentValue = el.value;

    if (start !== end) {
      const nextValue = currentValue.slice(0, start) + currentValue.slice(end);
      el.value = nextValue;
      el.setSelectionRange(start, start);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      this.previewFormula.set(nextValue);
      this.activeCursorPos.set(start);
      this.valueChange.emit(nextValue);
      return;
    }

    if (start === 0) return;

    const nextValue = currentValue.slice(0, start - 1) + currentValue.slice(start);
    el.value = nextValue;
    el.setSelectionRange(start - 1, start - 1);

    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));

    this.previewFormula.set(nextValue);
    this.activeCursorPos.set(start - 1);
    this.valueChange.emit(nextValue);
  }

  handleSpace(): void {
    const tmpl = this.activeVisualTemplate();
    if (tmpl) {
      const activeIdx = tmpl.activeSlotIndex;
      const currentVal = tmpl.slots[activeIdx]?.value ?? '';
      this.updateSlotValue(activeIdx, currentVal + ' ');
      return;
    }

    this.insertSymbolDirect(' ');
  }

  handleClear(): void {
    const tmpl = this.activeVisualTemplate();
    if (tmpl) {
      const activeIdx = tmpl.activeSlotIndex;
      this.updateSlotValue(activeIdx, '');
      return;
    }

    const el = this.getConnectedTarget();
    if (el) {
      this.ensureInputModeSuppression(el);
      el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    this.previewFormula.set('');
    this.activeCursorPos.set(0);
    this.valueChange.emit('');
  }

  /**
   * User requested quick toggle:
   * Enables teacher to switch between Math Virtual Keyboard (inputmode suppression)
   * and native OS phone keyboard for typing Arabic prose seamlessly.
   */
  toggleNativeKeyboard(): void {
    const el = this.getConnectedTarget();
    if (!el) return;

    if (this.isNativeMobileKeyboardActive()) {
      el.setAttribute('inputmode', 'none');
      el.removeAttribute('readonly');
      this.isNativeMobileKeyboardActive.set(false);
    } else {
      el.removeAttribute('inputmode');
      el.removeAttribute('readonly');
      this.isNativeMobileKeyboardActive.set(true);
      el.focus();
    }
  }

  private readonly onWindowPointerMove = (e: PointerEvent): void => {
    if (this.isDragging()) {
      this.onDragMove(e);
    }
  };

  private readonly onWindowPointerUp = (e: PointerEvent): void => {
    if (this.isDragging()) {
      this.onDragEnd(e);
    }
  };

  @HostListener('document:pointerdown')
  onDocumentPointerDown(): void {
    if (!this.isOpen()) return;
    const el = this.targetInput();
    if (el && typeof el.isConnected === 'boolean' && !el.isConnected) {
      this.close();
    }
  }

  /**
   * Automatically re-clamps the keyboard position if the browser viewport shrinks
   * or rotates so it never gets stranded off-screen.
   */
  @HostListener('window:resize')
  @HostListener('window:orientationchange')
  onWindowResize(): void {
    const containerEl = this.keyboardContainerRef()?.nativeElement;
    if (typeof window === 'undefined') return;

    const viewportWidth = Math.min(window.innerWidth, document.documentElement.clientWidth || window.innerWidth);
    const viewportHeight = Math.min(window.innerHeight, document.documentElement.clientHeight || window.innerHeight);

    // On narrow screens (mobile viewports < 640px), auto-dock to bottom for optimal ergonomics
    if (viewportWidth < 640) {
      if (this.dragPosition() !== null) {
        this.dragPosition.set(null);
      }
      return;
    }

    const pos = this.dragPosition();
    if (!pos || !containerEl) return;

    const rect = containerEl.getBoundingClientRect();
    const padding = 8;
    const maxX = Math.max(padding, viewportWidth - rect.width - padding);
    const maxY = Math.max(padding, viewportHeight - rect.height - padding);

    const clampedX = Math.min(Math.max(padding, pos.x), maxX);
    const clampedY = Math.min(Math.max(padding, pos.y), maxY);

    if (clampedX !== pos.x || clampedY !== pos.y) {
      this.dragPosition.set({ x: clampedX, y: clampedY });
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointermove', this.onWindowPointerMove);
      window.removeEventListener('pointerup', this.onWindowPointerUp);
      window.removeEventListener('pointercancel', this.onWindowPointerUp);
    }
  }

  /**
   * Starts dragging the keyboard anywhere on screen using pointer events
   * with pointer capture, window listeners fallback, and bounds clamping.
   */
  onDragStart(event: PointerEvent): void {
    if (event.button !== 0 && event.pointerType === 'mouse') return;

    const targetEl = event.target as HTMLElement;
    if (targetEl.closest('button') || targetEl.closest('input') || targetEl.closest('select')) {
      return;
    }

    const containerEl = this.keyboardContainerRef()?.nativeElement;
    if (!containerEl) return;

    const rect = containerEl.getBoundingClientRect();
    this.dragStartPointer = { x: event.clientX, y: event.clientY };
    this.dragStartRect = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };
    this.isDragging.set(true);

    const handleEl = event.currentTarget as HTMLElement;
    try {
      handleEl.setPointerCapture(event.pointerId);
    } catch {}

    if (typeof window !== 'undefined') {
      window.addEventListener('pointermove', this.onWindowPointerMove);
      window.addEventListener('pointerup', this.onWindowPointerUp);
      window.addEventListener('pointercancel', this.onWindowPointerUp);
    }

    event.preventDefault();
  }

  onDragMove(event: PointerEvent): void {
    if (!this.isDragging() || !this.dragStartPointer || !this.dragStartRect || typeof window === 'undefined') return;

    const deltaX = event.clientX - this.dragStartPointer.x;
    const deltaY = event.clientY - this.dragStartPointer.y;

    const rawX = this.dragStartRect.x + deltaX;
    const rawY = this.dragStartRect.y + deltaY;

    // Viewport boundaries padding (8px)
    const padding = 8;
    const viewportWidth = Math.min(window.innerWidth, document.documentElement.clientWidth || window.innerWidth);
    const viewportHeight = Math.min(window.innerHeight, document.documentElement.clientHeight || window.innerHeight);

    const maxX = Math.max(padding, viewportWidth - this.dragStartRect.width - padding);
    const maxY = Math.max(padding, viewportHeight - this.dragStartRect.height - padding);

    const clampedX = Math.min(Math.max(padding, rawX), maxX);
    const clampedY = Math.min(Math.max(padding, rawY), maxY);

    this.dragPosition.set({ x: clampedX, y: clampedY });
  }

  onDragEnd(event: PointerEvent): void {
    if (!this.isDragging()) return;

    const handleEl = event.currentTarget as HTMLElement;
    try {
      if (handleEl && handleEl.hasPointerCapture && handleEl.hasPointerCapture(event.pointerId)) {
        handleEl.releasePointerCapture(event.pointerId);
      }
    } catch {}

    if (typeof window !== 'undefined') {
      window.removeEventListener('pointermove', this.onWindowPointerMove);
      window.removeEventListener('pointerup', this.onWindowPointerUp);
      window.removeEventListener('pointercancel', this.onWindowPointerUp);
    }

    this.isDragging.set(false);
    this.dragStartPointer = null;
    this.dragStartRect = null;
  }

  resetDragPosition(): void {
    this.dragPosition.set(null);
  }

  close(): void {
    this.activeVisualTemplate.set(null);
    const el = this.targetInput();
    if (el) {
      el.removeAttribute('inputmode');
      el.removeAttribute('readonly');
    }
    this.isNativeMobileKeyboardActive.set(false);
    this.isOpen.set(false);
  }
}
