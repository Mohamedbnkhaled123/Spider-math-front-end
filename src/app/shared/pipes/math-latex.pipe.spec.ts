import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { MathLatexPipe } from './math-latex.pipe';

describe('MathLatexPipe', () => {
  let pipe: MathLatexPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MathLatexPipe]
    });
    pipe = TestBed.inject(MathLatexPipe);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null or undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('should transform plain text into safe HTML', () => {
    const result = pipe.transform('نص عادي');
    expect(result).toBeTruthy();
  });

  it('should transform inline math $x^2$ into KaTeX markup', () => {
    const result = pipe.transform('قيمة $x^2$ تساوي 4');
    expect(result).toBeTruthy();
    // In Angular, SafeHtml serialized or inspected
    const serialized = (result as any)?.changingThisBreaksApplicationSecurity || '';
    expect(serialized).toContain('katex');
    expect(serialized).toContain('dir="ltr"');
  });
});
