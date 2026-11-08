import { SafeHtml } from '@angular/platform-browser';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 1: Universal Mathematical Rendering Engine Models & Tokenizer
 */

export type MathTokenType = 'TEXT' | 'INLINE_MATH' | 'BLOCK_MATH';
export type MathMode = 'NONE' | 'INLINE' | 'BLOCK';

export interface IMathToken {
  type: MathTokenType;
  raw: string;
}

export interface ISafeMathToken extends IMathToken {
  safeHtml?: SafeHtml;
}

/**
 * Detects whether a string without dollar signs is a raw LaTeX expression
 * such as \frac{1}{2}, \sqrt{x}, single math variables (x, y, z), or pure algebraic notations.
 */
export function isPureLatex(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  // If starts with a backslash command: e.g. \frac, \sqrt, \int
  if (/^\\[a-zA-Z]+/.test(trimmed)) return true;
  // Single math variable letter: e.g. 'x', 'y', 'z', 'a', 'b', 'n'
  if (/^[a-zA-Z]$/.test(trimmed)) return true;
  // Common standalone math symbols: ±, ×, ÷, ≤, ≥, ≠, ≈, ∞, π, θ, °
  if (/^[±×÷≤≥≠≈∞πο°]$/.test(trimmed)) return true;
  // If it contains math expressions without Arabic text
  const hasArabic = /[\u0600-\u06FF]/.test(trimmed);
  if (!hasArabic && /[\^_{}\\]/.test(trimmed)) return true;
  return false;
}

/**
 * Pattern to identify LaTeX commands, superscripts/subscripts, and standalone math symbols
 * outside dollar signs so teachers and users never need to write or see dollar signs.
 */
const UNWRAPPED_LATEX_PATTERN = /(\\[a-zA-Z]+(?:\[[^\]]*\])?(?:\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})*|[a-zA-Z0-9]+(?:\^\{[^{}]*\}|\^[0-9a-zA-Z]|_\{[^{}]*\}|_[0-9a-zA-Z])+?|[±×÷≤≥≠≈∞πο°])/g;

/**
 * Splits plain text segments that may contain unwrapped LaTeX commands into TEXT and INLINE_MATH tokens.
 */
function tokenizeUnwrappedLatex(text: string): IMathToken[] {
  if (!text) return [];
  const tokens: IMathToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(UNWRAPPED_LATEX_PATTERN);

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const plain = text.slice(lastIndex, match.index);
      if (plain) {
        tokens.push({ type: 'TEXT', raw: plain });
      }
    }

    const matchedCmd = match[0];
    if (matchedCmd) {
      tokens.push({
        type: 'INLINE_MATH',
        raw: matchedCmd.trim()
      });
    }

    lastIndex = match.index + matchedCmd.length;
  }

  if (lastIndex < text.length) {
    const trailing = text.slice(lastIndex);
    if (trailing) {
      tokens.push({ type: 'TEXT', raw: trailing });
    }
  }

  return tokens.length > 0 ? tokens : [{ type: 'TEXT', raw: text }];
}

/**
 * Deterministically detects whether the cursor position is inside
 * an unclosed inline ($...$) or block ($$...$$) math mode.
 * Accurately skips escaped dollars (\$).
 */
export function getMathModeAtCursor(text: string, cursorPos: number): MathMode {
  const before = text.slice(0, cursorPos);
  let mode: MathMode = 'NONE';
  let i = 0;

  while (i < before.length) {
    // Check for escaped dollar: \$ -> skip
    if (before[i] === '\\' && i + 1 < before.length && before[i + 1] === '$') {
      i += 2;
      continue;
    }

    // Check for block math $$
    if (before[i] === '$' && i + 1 < before.length && before[i + 1] === '$') {
      if (mode === 'NONE') {
        mode = 'BLOCK';
      } else if (mode === 'BLOCK') {
        mode = 'NONE';
      }
      i += 2;
      continue;
    }

    // Check for inline math $
    if (before[i] === '$') {
      if (mode === 'NONE') {
        mode = 'INLINE';
      } else if (mode === 'INLINE') {
        mode = 'NONE';
      }
      i += 1;
      continue;
    }

    i += 1;
  }

  return mode;
}

/**
 * Parses mixed Arabic/English text and LaTeX expressions ($...$ and $$...$$, or unwrapped LaTeX) into tokens.
 * Accurately respects escaped dollars (\$), preventing false positives.
 * Allows LaTeX commands (e.g. \frac{1}{2}, \sqrt{x}, \pi) to render visually even without dollar signs,
 * keeping the UI completely free of raw dollar signs ($) for teachers and students.
 */
export function parseMathTokens(rawText: string | null | undefined): IMathToken[] {
  if (!rawText) return [];

  // Check if string contains unescaped dollar delimiters
  const hasUnescapedDollar = /(?<!\\)\$/.test(rawText);
  if (!hasUnescapedDollar) {
    if (isPureLatex(rawText)) {
      return [{ type: 'INLINE_MATH', raw: rawText.trim() }];
    }
    // Tokenize unwrapped LaTeX commands inside text
    return tokenizeUnwrappedLatex(rawText.replace(/\\\$/g, '$'));
  }

  // Matches unescaped $$...$$ (block) or $...$ (inline, ignoring $$)
  const pattern = /((?<!\\)\$\$[\s\S]+?(?<!\\)\$\$|(?<!\\)\$(?!\$)[\s\S]+?(?<!\\)\$)/g;
  const tokens: IMathToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(rawText)) !== null) {
    if (match.index > lastIndex) {
      const textPart = rawText.slice(lastIndex, match.index).replace(/\\\$/g, '$');
      if (textPart) {
        tokens.push(...tokenizeUnwrappedLatex(textPart));
      }
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith('$$') && matchedStr.endsWith('$$')) {
      tokens.push({
        type: 'BLOCK_MATH',
        raw: matchedStr.slice(2, -2).trim()
      });
    } else if (matchedStr.startsWith('$') && matchedStr.endsWith('$')) {
      tokens.push({
        type: 'INLINE_MATH',
        raw: matchedStr.slice(1, -1).trim()
      });
    }

    lastIndex = match.index + matchedStr.length;
  }

  if (lastIndex < rawText.length) {
    const trailingText = rawText.slice(lastIndex).replace(/\\\$/g, '$');
    if (trailingText) {
      tokens.push(...tokenizeUnwrappedLatex(trailingText));
    }
  }

  return tokens;
}
