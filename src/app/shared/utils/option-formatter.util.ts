/**
 * Standard MCQ Option Labeling and Text Sanitization Utility
 * Enforces canonical lettered choices (a:, b:, c:, d:) across all portals.
 */

export const MCQ_OPTION_LABELS = ['a:', 'b:', 'c:', 'd:', 'e:'] as const;

export function getMcqOptionLabel(index: number): string {
  if (index >= 0 && index < MCQ_OPTION_LABELS.length) {
    return MCQ_OPTION_LABELS[index];
  }
  return `${index + 1}:`;
}

export function cleanOptionText(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/^(\(?[a-eA-Eأ-د]\)?[\:\.\)\-]\s*)/, '').trim();
}
