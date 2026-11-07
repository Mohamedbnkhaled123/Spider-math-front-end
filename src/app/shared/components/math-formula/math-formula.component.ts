import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import katex from 'katex';
import {
  ISafeMathToken,
  parseMathTokens
} from './math-formula.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 1: Universal Mathematical Rendering Engine (KaTeX)
 * 
 * - Parses text into tokens: plain text vs $inline$ vs $$block$$
 * - Isolates formulas with dir="ltr" and unicode-bidi: isolate inside Arabic text
 * - Server-Side Rendering (SSR) safe: KaTeX renders to string synchronously
 */
@Component({
  selector: 'app-math-formula',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './math-formula.component.html',
  styleUrl: './math-formula.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MathFormulaComponent {
  private readonly sanitizer = inject(DomSanitizer);

  // Inputs
  readonly text = input<string>('');
  readonly inline = input<boolean>(true);
  readonly dir = input<'auto' | 'ltr' | 'rtl'>('auto');

  // Computed parsed & rendered tokens
  readonly safeTokens = computed<ISafeMathToken[]>(() => {
    const rawContent = this.text();
    if (!rawContent) return [];

    const rawTokens = parseMathTokens(rawContent);
    return rawTokens.map((token) => {
      if (token.type === 'TEXT') {
        return token;
      }

      const isBlock = token.type === 'BLOCK_MATH' || (!this.inline() && rawTokens.length === 1);
      try {
        const rendered = katex.renderToString(token.raw, {
          displayMode: isBlock,
          throwOnError: false,
          strict: false,
          output: 'htmlAndMathml'
        });

        const displayStyle = isBlock ? 'block' : 'inline-block';
        const wrappedHtml = `<span class="math-katex-wrap" dir="ltr" style="unicode-bidi: isolate; display: ${displayStyle};">${rendered}</span>`;

        return {
          ...token,
          safeHtml: this.sanitizer.bypassSecurityTrustHtml(wrappedHtml)
        };
      } catch {
        const escaped = this.escapeHtml(token.raw);
        const fallbackHtml = `<span class="math-katex-error font-mono text-xs text-rose-500" dir="ltr">${escaped}</span>`;
        return {
          ...token,
          safeHtml: this.sanitizer.bypassSecurityTrustHtml(fallbackHtml)
        };
      }
    });
  });

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
