import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MathVirtualKeyboardComponent } from './math-virtual-keyboard.component';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';

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

  it('should auto-wrap in $...$ when inserting symbol outside math mode', () => {
    inputEl.value = 'أوجد ';
    inputEl.selectionStart = 5;
    inputEl.selectionEnd = 5;

    fixture.componentRef.setInput('targetInput', inputEl);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    component.insertSymbol('\\frac{a}{b}');

    expect(inputEl.value).toBe('أوجد $\\frac{a}{b}$');
    expect(component.previewFormula()).toBe('أوجد $\\frac{a}{b}$');
  });

  it('should NOT add extra $ when inserting symbol already inside math mode', () => {
    inputEl.value = 'أوجد $\\frac{a}{b} ';
    inputEl.selectionStart = inputEl.value.length;
    inputEl.selectionEnd = inputEl.value.length;

    fixture.componentRef.setInput('targetInput', inputEl);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    component.insertSymbol('+');

    expect(inputEl.value).toBe('أوجد $\\frac{a}{b} +');
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

  it('should clear readonly from previous element when targetInput changes to a new element', () => {
    const secondInput = document.createElement('input');
    document.body.appendChild(secondInput);

    try {
      fixture.componentRef.setInput('targetInput', inputEl);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      expect(inputEl.hasAttribute('readonly')).toBeTrue();

      // Switch target to second input
      fixture.componentRef.setInput('targetInput', secondInput);
      fixture.detectChanges();

      // First input MUST have readonly removed!
      expect(inputEl.hasAttribute('readonly')).toBeFalse();
      expect(secondInput.hasAttribute('readonly')).toBeTrue();
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

  it('should re-apply readonly suppression when clicking virtual keys while native keyboard was active', () => {
    fixture.componentRef.setInput('targetInput', inputEl);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    component.toggleNativeKeyboard();
    expect(inputEl.hasAttribute('readonly')).toBeFalse();
    expect(component.isNativeMobileKeyboardActive()).toBeTrue();

    // User taps a virtual key
    component.handleSpace();
    expect(inputEl.hasAttribute('readonly')).toBeTrue();
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

  it('should toggle native phone keyboard unlocking readonly attribute', () => {
    fixture.componentRef.setInput('targetInput', inputEl);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    // On open, input gets readonly
    expect(inputEl.hasAttribute('readonly')).toBeTrue();
    expect(component.isNativeMobileKeyboardActive()).toBeFalse();

    // Toggle to native keyboard
    component.toggleNativeKeyboard();
    expect(inputEl.hasAttribute('readonly')).toBeFalse();
    expect(component.isNativeMobileKeyboardActive()).toBeTrue();

    // Toggle back to virtual keyboard
    component.toggleNativeKeyboard();
    expect(inputEl.hasAttribute('readonly')).toBeTrue();
    expect(component.isNativeMobileKeyboardActive()).toBeFalse();
  });

  it('should clean up readonly on close', () => {
    fixture.componentRef.setInput('targetInput', inputEl);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    expect(inputEl.hasAttribute('readonly')).toBeTrue();

    component.close();
    expect(component.isOpen()).toBeFalse();
    expect(inputEl.hasAttribute('readonly')).toBeFalse();
  });
});
