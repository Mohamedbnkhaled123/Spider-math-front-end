import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  model,
  input,
  output,
  effect,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppIconComponent } from '../app-icon/app-icon.component';
import { MathFormulaComponent } from '../math-formula/math-formula.component';
import { getMathModeAtCursor } from '../math-formula/math-formula.models';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import {
  MathKeyboardCategory,
  MATH_CATEGORY_TABS,
  MATH_KEYBOARD_KEYS,
  IMathSymbolKey,
  NUMERIC_KEYPAD_KEYS
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
  imports: [CommonModule, AppIconComponent, MathFormulaComponent],
  templateUrl: './math-virtual-keyboard.component.html',
  styleUrl: './math-virtual-keyboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MathVirtualKeyboardComponent {
  readonly langService = inject(LangService);

  // Model & Inputs
  readonly isOpen = model<boolean>(false);
  readonly targetInput = input<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Outputs
  readonly valueChange = output<string>();

  // State Signals
  readonly activeCategory = signal<MathKeyboardCategory>('BASIC');
  readonly previewFormula = signal<string>('');
  readonly isNativeMobileKeyboardActive = signal<boolean>(false);

  // Computed lists
  readonly categoryTabs = computed(() => MATH_CATEGORY_TABS);
  readonly numericKeys = computed(() => NUMERIC_KEYPAD_KEYS);
  readonly visibleKeys = computed(() =>
    MATH_KEYBOARD_KEYS.filter((key) => key.category === this.activeCategory())
  );

  constructor() {
    // Sync target element readonly state, live input listener, and cleanup on target switch or close
    effect((onCleanup) => {
      const open = this.isOpen();
      const el = this.targetInput();

      if (open && el) {
        el.setAttribute('readonly', 'true');
        this.isNativeMobileKeyboardActive.set(false);
        this.previewFormula.set(el.value);

        const handleInput = () => {
          this.previewFormula.set(el.value);
        };
        el.addEventListener('input', handleInput);

        onCleanup(() => {
          el.removeAttribute('readonly');
          el.removeEventListener('input', handleInput);
        });
      } else if (el) {
        el.removeAttribute('readonly');
      }
    });
  }

  selectCategory(category: MathKeyboardCategory): void {
    this.activeCategory.set(category);
  }

  /**
   * Re-activates mobile keyboard suppression if native prose typing mode was active,
   * keeping virtual keyboard controls in sync and soft keyboard dismissed.
   */
  private ensureReadonlySuppression(el: HTMLInputElement | HTMLTextAreaElement): void {
    if (this.isNativeMobileKeyboardActive()) {
      el.setAttribute('readonly', 'true');
      this.isNativeMobileKeyboardActive.set(false);
    }
  }

  /**
   * Prevents mouse/touch focus shift when tapping keys so target cursor is retained
   * and mobile software keyboard does not pop up unexpectedly.
   */
  preventFocusLoss(event: Event): void {
    event.preventDefault();
  }

  insertSymbol(latexCode: string, cursorOffset: number = 0): void {
    const el = this.targetInput();
    if (!el) {
      this.previewFormula.update((prev) => prev + latexCode);
      return;
    }

    this.ensureReadonlySuppression(el);

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const currentValue = el.value;

    // Detect if cursor is currently within unclosed $ ... $ or $$ ... $$ math mode
    const mathMode = getMathModeAtCursor(currentValue, start);
    const isInsideMathMode = mathMode !== 'NONE';

    let textToInsert = latexCode;
    if (!isInsideMathMode) {
      textToInsert = `$${latexCode}$`;
    }

    const nextValue = currentValue.slice(0, start) + textToInsert + currentValue.slice(end);
    el.value = nextValue;

    // Smart cursor position: place inside or after snippet
    let newCursorPos: number;
    if (!isInsideMathMode) {
      newCursorPos = start + textToInsert.length - 1 + cursorOffset;
    } else {
      newCursorPos = start + textToInsert.length + cursorOffset;
    }

    // Guard bounds
    newCursorPos = Math.max(0, Math.min(newCursorPos, el.value.length));
    el.setSelectionRange(newCursorPos, newCursorPos);

    // Trigger Angular and DOM listeners
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));

    this.previewFormula.set(nextValue);
    this.valueChange.emit(nextValue);
  }

  /**
   * Inserts digits, decimals, and basic arithmetic symbols directly into target input
   * without artificially wrapping every single digit into $...$ blocks.
   * Works smoothly both within active math formulas and inside plain text questions/options.
   */
  insertNumeric(value: string): void {
    const el = this.targetInput();
    if (!el) {
      this.previewFormula.update((prev) => prev + value);
      return;
    }

    this.ensureReadonlySuppression(el);

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const currentValue = el.value;

    const nextValue = currentValue.slice(0, start) + value + currentValue.slice(end);
    el.value = nextValue;

    const newCursorPos = start + value.length;
    el.setSelectionRange(newCursorPos, newCursorPos);

    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));

    this.previewFormula.set(nextValue);
    this.valueChange.emit(nextValue);
  }

  insertDelimiter(type: 'INLINE' | 'BLOCK'): void {
    const el = this.targetInput();
    const delimiter = type === 'BLOCK' ? '$$  $$' : '$  $';
    const offset = type === 'BLOCK' ? 2 : 1;

    if (!el) {
      this.previewFormula.update((prev) => prev + delimiter);
      return;
    }

    this.ensureReadonlySuppression(el);

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
    const el = this.targetInput();
    if (!el) {
      this.previewFormula.update((prev) => prev.slice(0, -1));
      return;
    }

    this.ensureReadonlySuppression(el);

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
    this.valueChange.emit(nextValue);
  }

  handleSpace(): void {
    const el = this.targetInput();
    if (!el) {
      this.previewFormula.update((prev) => prev + ' ');
      return;
    }

    this.ensureReadonlySuppression(el);

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const currentValue = el.value;

    const nextValue = currentValue.slice(0, start) + ' ' + currentValue.slice(end);
    el.value = nextValue;
    el.setSelectionRange(start + 1, start + 1);

    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));

    this.previewFormula.set(nextValue);
    this.valueChange.emit(nextValue);
  }

  handleClear(): void {
    const el = this.targetInput();
    if (el) {
      this.ensureReadonlySuppression(el);
      el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    this.previewFormula.set('');
    this.valueChange.emit('');
  }

  /**
   * User requested quick toggle:
   * Enables teacher to switch between Math Virtual Keyboard (readonly suppression)
   * and native OS phone keyboard for typing Arabic prose seamlessly.
   */
  toggleNativeKeyboard(): void {
    const el = this.targetInput();
    if (!el) return;

    if (this.isNativeMobileKeyboardActive()) {
      el.setAttribute('readonly', 'true');
      this.isNativeMobileKeyboardActive.set(false);
    } else {
      el.removeAttribute('readonly');
      this.isNativeMobileKeyboardActive.set(true);
      el.focus();
    }
  }

  close(): void {
    const el = this.targetInput();
    if (el) {
      el.removeAttribute('readonly');
    }
    this.isNativeMobileKeyboardActive.set(false);
    this.isOpen.set(false);
  }
}
