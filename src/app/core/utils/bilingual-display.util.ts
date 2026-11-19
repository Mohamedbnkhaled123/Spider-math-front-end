const ARABIC_CHAR_REGEX = /[\u0600-\u06FF]/;

/**
 * Returns true if the given string contains any Arabic letters or Arabic-Indic digits.
 */
export function hasArabicChars(value?: string | null): boolean {
  return !!value && ARABIC_CHAR_REGEX.test(value);
}

/**
 * Resolves an English label without leaking Arabic characters when `enVal` is absent.
 */
export function sanitizeEnglishText(
  enVal?: string | null,
  arVal?: string | null,
  fallback = ''
): string {
  const trimmedEn = typeof enVal === 'string' ? enVal.trim() : '';
  if (trimmedEn && !hasArabicChars(trimmedEn)) {
    return trimmedEn;
  }
  const trimmedAr = typeof arVal === 'string' ? arVal.trim() : '';
  if (trimmedAr && !hasArabicChars(trimmedAr)) {
    return trimmedAr;
  }
  return fallback;
}

/**
 * Picks the appropriate Arabic or sanitized English string for the active UI language.
 */
export function pickLocalizedLabel(
  isArabic: boolean,
  arVal?: string | null,
  enVal?: string | null,
  englishFallback = ''
): string {
  if (isArabic) {
    return arVal && arVal.trim() ? arVal : (enVal || '');
  }
  return sanitizeEnglishText(enVal, arVal, englishFallback);
}

/**
 * Formats video/lesson durations strictly in the active UI language.
 */
export function formatLocalizedDuration(isArabic: boolean, seconds?: number): string {
  const totalSec = Math.max(0, Math.round(seconds || 0));
  if (totalSec <= 0) return '00:00';
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  if (mins === 0) return isArabic ? `${secs} ثانية` : `${secs} sec`;
  if (secs === 0) return isArabic ? `${mins} دقيقة` : `${mins} min`;
  return isArabic ? `${mins} د و ${secs} ث` : `${mins}m ${secs}s`;
}
