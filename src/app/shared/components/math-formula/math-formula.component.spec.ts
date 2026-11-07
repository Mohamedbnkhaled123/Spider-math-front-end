import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MathFormulaComponent } from './math-formula.component';
import { parseMathTokens, isPureLatex, getMathModeAtCursor } from './math-formula.models';

describe('MathFormulaComponent', () => {
  let component: MathFormulaComponent;
  let fixture: ComponentFixture<MathFormulaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MathFormulaComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MathFormulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('parseMathTokens & models', () => {
    it('should handle empty or null string', () => {
      expect(parseMathTokens('')).toEqual([]);
      expect(parseMathTokens(null)).toEqual([]);
      expect(parseMathTokens(undefined)).toEqual([]);
    });

    it('should parse plain text without dollar signs', () => {
      const tokens = parseMathTokens('سؤال عادي بدون أي معادلات');
      expect(tokens.length).toBe(1);
      expect(tokens[0].type).toBe('TEXT');
      expect(tokens[0].raw).toBe('سؤال عادي بدون أي معادلات');
    });

    it('should parse inline math delimited by $', () => {
      const tokens = parseMathTokens('أوجد قيمة $x^2 + y^2 = r^2$');
      expect(tokens.length).toBe(2);
      expect(tokens[0].type).toBe('TEXT');
      expect(tokens[0].raw).toBe('أوجد قيمة ');
      expect(tokens[1].type).toBe('INLINE_MATH');
      expect(tokens[1].raw).toBe('x^2 + y^2 = r^2');
    });

    it('should parse block math delimited by $$', () => {
      const tokens = parseMathTokens('$$\\int_{0}^{1} x dx$$');
      expect(tokens.length).toBe(1);
      expect(tokens[0].type).toBe('BLOCK_MATH');
      expect(tokens[0].raw).toBe('\\int_{0}^{1} x dx');
    });

    it('should parse mixed Arabic text, inline math and block math', () => {
      const input = 'إذا كان $f(x) = x^2$ فإن $$f(2) = 4$$ نتيجة صحيحة';
      const tokens = parseMathTokens(input);
      expect(tokens.length).toBe(5);
      expect(tokens[0].type).toBe('TEXT');
      expect(tokens[1].type).toBe('INLINE_MATH');
      expect(tokens[1].raw).toBe('f(x) = x^2');
      expect(tokens[2].type).toBe('TEXT');
      expect(tokens[3].type).toBe('BLOCK_MATH');
      expect(tokens[3].raw).toBe('f(2) = 4');
      expect(tokens[4].type).toBe('TEXT');
    });

    it('should parse pure LaTeX without $ as INLINE_MATH', () => {
      expect(isPureLatex('\\frac{1}{2}')).toBeTrue();
      expect(isPureLatex('x')).toBeTrue();
      expect(isPureLatex('±')).toBeTrue();
      const tokens = parseMathTokens('\\frac{1}{2}');
      expect(tokens.length).toBe(1);
      expect(tokens[0].type).toBe('INLINE_MATH');
      expect(tokens[0].raw).toBe('\\frac{1}{2}');
    });

    it('should handle escaped dollars without breaking into false math tokens', () => {
      const input = 'السعر \\$50 فقط واشتراك المنصة \\$100';
      const tokens = parseMathTokens(input);
      expect(tokens.length).toBe(1);
      expect(tokens[0].type).toBe('TEXT');
      expect(tokens[0].raw).toBe('السعر $50 فقط واشتراك المنصة $100');
    });

    it('should accurately detect math mode at cursor with getMathModeAtCursor', () => {
      expect(getMathModeAtCursor('', 0)).toBe('NONE');
      expect(getMathModeAtCursor('أوجد $x', 7)).toBe('INLINE');
      expect(getMathModeAtCursor('أوجد $x$', 8)).toBe('NONE');
      expect(getMathModeAtCursor('$$  $$', 2)).toBe('BLOCK');
      expect(getMathModeAtCursor('$$\\int_{0}^{1} x$$ والآن $y', 27)).toBe('INLINE');
      expect(getMathModeAtCursor('السعر \\$50 ثم $x', 16)).toBe('INLINE');
    });
  });

  describe('Component Rendering', () => {
    it('should render plain text correctly', () => {
      fixture.componentRef.setInput('text', 'نص مسألة بسيط');
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const plainText = el.querySelector('.math-plain-text');
      expect(plainText).toBeTruthy();
      expect(plainText?.textContent?.trim()).toBe('نص مسألة بسيط');
    });

    it('should render KaTeX inline math with LTR bidirectional isolation', () => {
      fixture.componentRef.setInput('text', 'إذا كان $x = 5$');
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const katexToken = el.querySelector('.math-katex-token');
      expect(katexToken).toBeTruthy();

      const katexHtml = el.querySelector('.katex');
      expect(katexHtml).toBeTruthy();

      const mathWrap = el.querySelector('.math-katex-wrap');
      expect(mathWrap?.getAttribute('dir')).toBe('ltr');
    });

    it('should render block math with block styling', () => {
      fixture.componentRef.setInput('text', '$$\\sum_{i=1}^{n} i$$');
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const blockToken = el.querySelector('.math-katex-token--block');
      expect(blockToken).toBeTruthy();
    });
  });
});
