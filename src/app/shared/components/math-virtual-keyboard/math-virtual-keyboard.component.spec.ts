import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MathVirtualKeyboardComponent } from './math-virtual-keyboard.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import { parseMathSymbolsFromText, findSymbolAtCursor, toVisualMath } from './math-virtual-keyboard.models';

describe('MathVirtualKeyboardComponent', () => {
  let component: MathVirtualKeyboardComponent;
  let fixture: ComponentFixture<MathVirtualKeyboardComponent>;
  let inputEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MathVirtualKeyboardComponent],
      providers: [
        {
          provide: LangService,
          useValue: {
            isArabic: () => true,
            currentLang: () => 'ar'
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MathVirtualKeyboardComponent);
    component = fixture.componentInstance;

    inputEl = document.createElement('input');
    inputEl.type = 'text';
    document.body.appendChild(inputEl);

    fixture.detectChanges();
  });

  afterEach(() => {
    if (inputEl.parentElement) {
      inputEl.parentElement.removeChild(inputEl);
    }
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should switch categories between tabs', () => {
    expect(component.activeCategory()).toBe('BASIC');
    component.selectCategory('ALGEBRA');
    expect(component.activeCategory()).toBe('ALGEBRA');
    expect(component.visibleKeys().length).toBeGreaterThan(0);

    component.selectCategory('GEOMETRY');
    expect(component.activeCategory()).toBe('GEOMETRY');

    component.selectCategory('CALCULUS');
    expect(component.activeCategory()).toBe('CALCULUS');
  });

  it('should render numeric keys (0-9) and allow inserting digits into target input', () => {
    expect(component.numericKeys().length).toBe(15);
    expect(component.numericKeys().some(k => k.value === '7')).toBeTrue();
    expect(component.numericKeys().some(k => k.value === '0')).toBeTrue();

    inputEl.value = 'x = ';
    inputEl.selectionStart = 4;
    inputEl.selectionEnd = 4;

    fixture.componentRef.setInput('targetInput', inputEl);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    component.insertNumeric('5');
    component.insertNumeric('0');
    expect(inputEl.value).toBe('x = 50');
    expect(component.previewFormula()).toBe('x = 50');
  });

  it('should NOT insert raw dollar signs ($) into target input when inserting symbols', () => {
    inputEl.value = 'أوجد ';
    inputEl.selectionStart = 5;
    inputEl.selectionEnd = 5;

    fixture.componentRef.setInput('targetInput', inputEl);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    component.insertSymbol('\\pi');

    expect(inputEl.value).toBe('أوجد \\pi');
    expect(inputEl.value).not.toContain('$');
    expect(component.previewFormula()).toBe('أوجد \\pi');
  });

  it('should open direct visual template on screen when tapping composite key like fraction', () => {
    inputEl.value = 'أوجد ';
    inputEl.selectionStart = 5;
    inputEl.selectionEnd = 5;

    fixture.componentRef.setInput('targetInput', inputEl);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    component.insertSymbol('\\frac{a}{b}');

    // Visual template opens directly for teacher to edit on screen
    expect(component.activeVisualTemplate()).toBeTruthy();
    expect(component.activeVisualTemplate()?.type).toBe('FRACTION');
    expect(component.activeVisualTemplate()?.slots.length).toBe(2);
    expect(inputEl.value).not.toContain('$');
  });

  it('should allow editing visual template slots directly on screen and apply without dollar signs', () => {
    inputEl.value = 'أوجد ';
    inputEl.selectionStart = 5;
    inputEl.selectionEnd = 5;

    fixture.componentRef.setInput('targetInput', inputEl);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    component.openVisualTemplate('FRACTION');
    component.insertNumeric('3'); // Types into numerator (slot 0)
    expect(component.activeVisualTemplate()?.slots[0].value).toBe('3');

    component.nextSlot(); // Move to denominator (slot 1)
    expect(component.activeVisualTemplate()?.activeSlotIndex).toBe(1);

    component.insertNumeric('5'); // Types into denominator
    expect(component.activeVisualTemplate()?.slots[1].value).toBe('5');
    expect(component.templateKaTeXPreview()).toBe('\\frac{3}{5}');

    component.applyVisualTemplate();
    expect(component.activeVisualTemplate()).toBeNull();
    expect(inputEl.value).toBe('أوجد \\frac{3}{5}');
    expect(inputEl.value).not.toContain('$');
  });

  it('should NOT add extra $ when inserting symbol into existing math string', () => {
    inputEl.value = 'أوجد \\frac{a}{b} ';
    inputEl.selectionStart = inputEl.value.length;
    inputEl.selectionEnd = inputEl.value.length;

    fixture.componentRef.setInput('targetInput', inputEl);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    component.insertSymbol('+');

    expect(inputEl.value).toBe('أوجد \\frac{a}{b} +');
    expect(inputEl.value).not.toContain('$');
  });

  it('should NOT add extra $ when inserting symbol inside block math mode $$...$$', () => {
    inputEl.value = '$$  $$';
    inputEl.selectionStart = 2;
    inputEl.selectionEnd = 2;

    fixture.componentRef.setInput('targetInput', inputEl);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    component.insertSymbol('\\int');

    expect(inputEl.value).not.toContain('$$$');
    expect(inputEl.value).toBe('$$\\int  $$');
  });

  it('should clear inputmode from previous element when targetInput changes to a new element', () => {
    const secondInput = document.createElement('input');
    document.body.appendChild(secondInput);

    try {
      fixture.componentRef.setInput('targetInput', inputEl);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      expect(inputEl.getAttribute('inputmode')).toBe('none');
      expect(inputEl.hasAttribute('readonly')).toBeFalse();

      // Switch target to second input
      fixture.componentRef.setInput('targetInput', secondInput);
      fixture.detectChanges();

      // First input MUST have inputmode removed!
      expect(inputEl.hasAttribute('inputmode')).toBeFalse();
      expect(inputEl.hasAttribute('readonly')).toBeFalse();
      expect(secondInput.getAttribute('inputmode')).toBe('none');
      expect(secondInput.hasAttribute('readonly')).toBeFalse();
    } finally {
      if (secondInput.parentElement) {
        secondInput.parentElement.removeChild(secondInput);
      }
    }
  });

  it('should synchronize previewFormula when target input event fires in prose mode', () => {
    fixture.componentRef.setInput('targetInput', inputEl);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    component.toggleNativeKeyboard();
    expect(component.isNativeMobileKeyboardActive()).toBeTrue();

    // User types into inputEl using native mobile keyboard
    inputEl.value = 'مسألة جديدة';
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(component.previewFormula()).toBe('مسألة جديدة');
  });

  it('should re-apply inputmode suppression when clicking virtual keys while native keyboard was active', () => {
    fixture.componentRef.setInput('targetInput', inputEl);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    component.toggleNativeKeyboard();
    expect(inputEl.hasAttribute('inputmode')).toBeFalse();
    expect(inputEl.hasAttribute('readonly')).toBeFalse();
    expect(component.isNativeMobileKeyboardActive()).toBeTrue();

    // User taps a virtual key
    component.handleSpace();
    expect(inputEl.getAttribute('inputmode')).toBe('none');
    expect(inputEl.hasAttribute('readonly')).toBeFalse();
    expect(component.isNativeMobileKeyboardActive()).toBeFalse();
  });

  it('should handle backspace properly on single character and range', () => {
    inputEl.value = 'abc';
    inputEl.selectionStart = 3;
    inputEl.selectionEnd = 3;

    fixture.componentRef.setInput('targetInput', inputEl);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    component.handleBackspace();
    expect(inputEl.value).toBe('ab');

    // Test selection range deletion
    inputEl.value = 'hello world';
    inputEl.selectionStart = 5;
    inputEl.selectionEnd = 11;
    component.handleBackspace();
    expect(inputEl.value).toBe('hello');
  });

  it('should handle space key insertion', () => {
    inputEl.value = 'مرحبا';
    inputEl.selectionStart = 5;
    inputEl.selectionEnd = 5;

    fixture.componentRef.setInput('targetInput', inputEl);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    component.handleSpace();
    expect(inputEl.value).toBe('مرحبا ');
  });

  it('should clear input on handleClear', () => {
    inputEl.value = 'نص للتجربة';
    fixture.componentRef.setInput('targetInput', inputEl);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    component.handleClear();
    expect(inputEl.value).toBe('');
    expect(component.previewFormula()).toBe('');
  });

  it('should toggle native phone keyboard unlocking inputmode attribute', () => {
    fixture.componentRef.setInput('targetInput', inputEl);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    // On open, input gets inputmode="none"
    expect(inputEl.getAttribute('inputmode')).toBe('none');
    expect(inputEl.hasAttribute('readonly')).toBeFalse();
    expect(component.isNativeMobileKeyboardActive()).toBeFalse();

    // Toggle to native keyboard
    component.toggleNativeKeyboard();
    expect(inputEl.hasAttribute('inputmode')).toBeFalse();
    expect(inputEl.hasAttribute('readonly')).toBeFalse();
    expect(component.isNativeMobileKeyboardActive()).toBeTrue();

    // Toggle back to virtual keyboard
    component.toggleNativeKeyboard();
    expect(inputEl.getAttribute('inputmode')).toBe('none');
    expect(inputEl.hasAttribute('readonly')).toBeFalse();
    expect(component.isNativeMobileKeyboardActive()).toBeFalse();
  });

  it('should clean up inputmode on close', () => {
    fixture.componentRef.setInput('targetInput', inputEl);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    expect(inputEl.getAttribute('inputmode')).toBe('none');
    expect(inputEl.hasAttribute('readonly')).toBeFalse();

    component.close();
    expect(component.isOpen()).toBeFalse();
    expect(inputEl.hasAttribute('inputmode')).toBeFalse();
    expect(inputEl.hasAttribute('readonly')).toBeFalse();
  });

  describe('Direct Visual Math Templates (Zero Dollar Signs & WYSIWYG Editing)', () => {
    it('should edit square root directly and insert clean LaTeX without dollars', () => {
      inputEl.value = 'الناتج = ';
      fixture.componentRef.setInput('targetInput', inputEl);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      component.openVisualTemplate('SQRT');
      expect(component.activeVisualTemplate()?.type).toBe('SQRT');

      component.insertNumeric('6');
      component.insertNumeric('4');
      expect(component.templateKaTeXPreview()).toBe('\\sqrt{64}');

      component.applyVisualTemplate();
      expect(component.activeVisualTemplate()).toBeNull();
      expect(inputEl.value).toBe('الناتج = \\sqrt{64}');
      expect(inputEl.value).not.toContain('$');
    });

    it('should edit power/exponent directly and insert clean LaTeX without dollars', () => {
      inputEl.value = '';
      fixture.componentRef.setInput('targetInput', inputEl);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      component.openVisualTemplate('POWER');
      expect(component.activeVisualTemplate()?.type).toBe('POWER');

      component.selectSlot(0); // Base slot
      component.handleClear();
      component.insertSymbol('y');

      component.selectSlot(1); // Exponent slot
      component.handleClear();
      component.insertNumeric('3');

      expect(component.templateKaTeXPreview()).toBe('y^{3}');

      component.applyVisualTemplate();
      expect(inputEl.value).toBe('y^{3}');
      expect(inputEl.value).not.toContain('$');
    });

    it('should edit definite integral directly and insert clean LaTeX without dollars', () => {
      inputEl.value = '';
      fixture.componentRef.setInput('targetInput', inputEl);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      component.openVisualTemplate('INTEGRAL');
      expect(component.activeVisualTemplate()?.type).toBe('INTEGRAL');

      component.selectSlot(0); // Lower limit
      component.handleClear();
      component.insertNumeric('0');

      component.selectSlot(1); // Upper limit
      component.handleClear();
      component.insertSymbol('\\pi');

      component.selectSlot(2); // Integrand
      component.handleClear();
      component.insertSymbol('\\sin(x)');

      expect(component.templateKaTeXPreview()).toBe('\\int_{0}^{\\pi} \\sin(x) \\, dx');

      component.applyVisualTemplate();
      expect(inputEl.value).toBe('\\int_{0}^{\\pi} \\sin(x) \\, dx');
      expect(inputEl.value).not.toContain('$');
    });

    it('should cancel visual template without changing target input', () => {
      inputEl.value = 'قيمة أولية';
      fixture.componentRef.setInput('targetInput', inputEl);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      component.openVisualTemplate('FRACTION');
      component.insertNumeric('99');
      component.cancelVisualTemplate();

      expect(component.activeVisualTemplate()).toBeNull();
      expect(inputEl.value).toBe('قيمة أولية');
    });

    it('should handle backspace and space inside visual template slots', () => {
      fixture.componentRef.setInput('targetInput', inputEl);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      component.openVisualTemplate('FRACTION');
      component.insertNumeric('1');
      component.insertNumeric('2');
      component.insertNumeric('3');
      expect(component.activeVisualTemplate()?.slots[0].value).toBe('123');

      component.handleBackspace();
      expect(component.activeVisualTemplate()?.slots[0].value).toBe('12');

      component.handleSpace();
      expect(component.activeVisualTemplate()?.slots[0].value).toBe('12 ');
    });

    it('should accurately parse existing math symbols from text with parseMathSymbolsFromText', () => {
      const text = 'أوجد قيمة \\frac{3}{5} + \\sqrt{16} عندما x^2 = 4';
      const symbols = parseMathSymbolsFromText(text);

      expect(symbols.length).toBe(3);
      expect(symbols[0].type).toBe('FRACTION');
      expect(symbols[0].rawLatex).toBe('\\frac{3}{5}');
      expect(symbols[0].template.slots[0].value).toBe('3');
      expect(symbols[0].template.slots[1].value).toBe('5');

      expect(symbols[1].type).toBe('SQRT');
      expect(symbols[1].rawLatex).toBe('\\sqrt{16}');
      expect(symbols[1].template.slots[0].value).toBe('16');

      expect(symbols[2].type).toBe('POWER');
      expect(symbols[2].rawLatex).toBe('x^2');
      expect(symbols[2].template.slots[0].value).toBe('x');
      expect(symbols[2].template.slots[1].value).toBe('2');
    });

    it('should find symbol at cursor accurately with findSymbolAtCursor', () => {
      const text = 'احسب \\frac{3}{5} ثم قارن';
      const symbols = parseMathSymbolsFromText(text);

      expect(symbols.length).toBe(1);
      const frac = symbols[0];

      // Cursor before fraction
      expect(findSymbolAtCursor(symbols, 2)).toBeNull();

      // Cursor at fraction start, inside, and end
      expect(findSymbolAtCursor(symbols, frac.startIndex)).toEqual(frac);
      expect(findSymbolAtCursor(symbols, frac.startIndex + 3)).toEqual(frac);
      expect(findSymbolAtCursor(symbols, frac.endIndex)).toEqual(frac);

      // Cursor after fraction
      expect(findSymbolAtCursor(symbols, frac.endIndex + 2)).toBeNull();
    });

    it('should allow directly editing an existing math symbol in-place without seeing LaTeX or dollar signs', () => {
      inputEl.value = 'أوجد قيمة \\frac{3}{5} في أبسط صورة';
      fixture.componentRef.setInput('targetInput', inputEl);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      const symbols = component.parsedMathSymbols();
      expect(symbols.length).toBe(1);
      const existingFrac = symbols[0];

      // Teacher taps the existing fraction to edit it directly
      component.editExistingSymbol(existingFrac);
      expect(component.activeVisualTemplate()).toBeTruthy();
      expect(component.activeVisualTemplate()?.type).toBe('FRACTION');
      expect(component.activeVisualTemplate()?.slots[0].value).toBe('3');
      expect(component.activeVisualTemplate()?.slots[1].value).toBe('5');

      // Teacher changes numerator to 7 using on-screen numeric keypad
      component.selectSlot(0);
      component.handleClear();
      component.insertNumeric('7');
      expect(component.templateKaTeXPreview()).toBe('\\frac{7}{5}');

      // Teacher taps update
      component.applyVisualTemplate();
      expect(component.activeVisualTemplate()).toBeNull();
      expect(inputEl.value).toBe('أوجد قيمة \\frac{7}{5} في أبسط صورة');
      expect(inputEl.value).not.toContain('$');
    });

    it('should allow deleting an existing math symbol directly from the question text', () => {
      inputEl.value = 'احسب المقدار \\sqrt{25} الآن';
      fixture.componentRef.setInput('targetInput', inputEl);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      const symbols = component.parsedMathSymbols();
      expect(symbols.length).toBe(1);

      component.editExistingSymbol(symbols[0]);
      expect(component.activeVisualTemplate()).toBeTruthy();

      // Teacher taps "حذف الرمز"
      component.deleteEditingSymbol();
      expect(component.activeVisualTemplate()).toBeNull();
      expect(inputEl.value).toBe('احسب المقدار  الآن');
      expect(inputEl.value).not.toContain('\\sqrt');
      expect(inputEl.value).not.toContain('$');
    });

    it('should insert calculus derivative d/dx directly without opening fraction template', () => {
      inputEl.value = 'المشتقة: ';
      inputEl.selectionStart = inputEl.value.length;
      inputEl.selectionEnd = inputEl.value.length;

      fixture.componentRef.setInput('targetInput', inputEl);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      // Tapping derivative key \frac{d}{dx}
      component.insertSymbol('\\frac{d}{dx}');

      // Must NOT open template, must insert \frac{d}{dx} directly
      expect(component.activeVisualTemplate()).toBeNull();
      expect(inputEl.value).toBe('المشتقة: \\frac{d}{dx}');
      expect(inputEl.value).not.toContain('$');
    });

    it('should render interactive symbol chips and cursor-detected strip in the UI', () => {
      inputEl.value = 'قارن بين \\frac{1}{2} و \\frac{3}{4}';
      inputEl.selectionStart = 11; // Inside \frac{1}{2}
      inputEl.selectionEnd = 11;

      fixture.componentRef.setInput('targetInput', inputEl);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      expect(component.parsedMathSymbols().length).toBe(2);

      const hostEl: HTMLElement = fixture.nativeElement;
      expect(hostEl.textContent).toContain('الرموز الرياضية بالمسألة');

      // Symbol chips should be rendered
      const chips = hostEl.querySelectorAll('.visual-template-card, button');
      expect(chips.length).toBeGreaterThan(0);
    });

    it('should convert LaTeX commands to clean visual symbols via toVisualMath without raw syntax', () => {
      expect(toVisualMath('\\le')).toBe('≤');
      expect(toVisualMath('\\neq')).toBe('≠');
      expect(toVisualMath('\\ge')).toBe('≥');
      expect(toVisualMath('\\pm')).toBe('±');
      expect(toVisualMath('\\frac{1}{2}')).toBe('½');
      expect(toVisualMath('\\frac{3}{5}')).toBe('(3/5)');
      expect(toVisualMath('\\sqrt{16}')).toBe('√16');
      expect(toVisualMath('\\sqrt[3]{8}')).toBe('3√8');
      expect(toVisualMath('x^2')).toBe('x²');
      expect(toVisualMath('1س\\le\\neq\\neq')).toBe('1س≤≠≠');
    });

    it('should parse visual mathematical symbols from text with parseMathSymbolsFromText', () => {
      const text = 'احسب (3/5) + √16 + 3√8 عندما x² = 4';
      const symbols = parseMathSymbolsFromText(text);

      expect(symbols.length).toBe(4);
      expect(symbols[0].type).toBe('FRACTION');
      expect(symbols[0].template.slots[0].value).toBe('3');
      expect(symbols[0].template.slots[1].value).toBe('5');

      expect(symbols[1].type).toBe('SQRT');
      expect(symbols[1].template.slots[0].value).toBe('16');

      expect(symbols[2].type).toBe('NTH_ROOT');
      expect(symbols[2].template.slots[0].value).toBe('3');
      expect(symbols[2].template.slots[1].value).toBe('8');

      expect(symbols[3].type).toBe('POWER');
      expect(symbols[3].template.slots[0].value).toBe('x');
      expect(symbols[3].template.slots[1].value).toBe('2');
    });

    it('should render compact Google-style keyboard layout with numeric-grid and close button X', () => {
      fixture.componentRef.setInput('targetInput', inputEl);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const keyboardAside = hostEl.querySelector('aside.google-math-keyboard');
      expect(keyboardAside).toBeTruthy();

      // Verify prominent close button X exists
      const closeBtn = hostEl.querySelector('button[aria-label="Close keyboard"]');
      expect(closeBtn).toBeTruthy();

      // Verify numeric grid with 15 columns container exists
      const numericGrid = hostEl.querySelector('.numeric-grid');
      expect(numericGrid).toBeTruthy();

      // Verify no preview bar exists inside the keyboard component (R1)
      const previewBar = hostEl.querySelector('.preview-bar, .keyboard-preview');
      expect(previewBar).toBeNull();
    });
  });
});
