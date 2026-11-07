import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import katex from 'katex';
import { parseMathTokens } from '../components/math-formula/math-formula.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 1: Universal Math LaTeX Sanitizing Pipe
 * 
 * Transforms text containing $inline$ and $$block$$ LaTeX formulas
 * into sanitized, accessible KaTeX HTML with LTR bidirectional isolation.
 */
@Pipe({
  name: 'mathLatex',
  standalone: true
})
export class MathLatexPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';

    const tokens = parseMathTokens(value);
    const htmlChunks = tokens.map((token) => {
      if (token.type === 'TEXT') {
        return `<span class="math-plain-text">${this.escapeHtml(token.raw)}</span>`;
      }

      const isBlock = token.type === 'BLOCK_MATH';
      try {
        const rendered = katex.renderToString(token.raw, {
          displayMode: isBlock,
          throwOnError: false,
          strict: false,
          output: 'htmlAndMathml'
        });

        const displayStyle = isBlock ? 'block' : 'inline-block';
        return `<span class="math-katex-wrap" dir="ltr" style="unicode-bidi: isolate; display: ${displayStyle};">${rendered}</span>`;
      } catch {
        const escaped = this.escapeHtml(token.raw);
        return `<span class="math-katex-error font-mono text-xs text-rose-500" dir="ltr">${escaped}</span>`;
      }
    });

    return this.sanitizer.bypassSecurityTrustHtml(htmlChunks.join(''));
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
