/**
 * Spider Math Educational Platform (v2.2)
 * Relative Time & Last Seen Helper
 * Formats presence timestamps cleanly in Arabic and English.
 * Zero-emoji convention.
 */

export function formatLastSeen(
  lastSeenAt: string | Date | null | undefined,
  isOnline: boolean,
  isArabic: boolean,
  referenceNow: Date = new Date()
): string {
  if (isOnline) {
    return isArabic ? 'متصل الآن' : 'Online now';
  }

  if (!lastSeenAt) {
    return isArabic ? 'غير متصل' : 'Offline';
  }

  const date = typeof lastSeenAt === 'string' ? new Date(lastSeenAt) : lastSeenAt;
  if (!date || isNaN(date.getTime())) {
    return isArabic ? 'غير متصل' : 'Offline';
  }

  const now = referenceNow;
  const diffMs = now.getTime() - date.getTime();

  // If timestamp is within the last 60 minutes (or slight clock skew)
  const diffMinutes = Math.max(1, Math.floor(diffMs / (60 * 1000)));
  if (diffMinutes < 60) {
    return isArabic
      ? `آخر ظهور منذ ${diffMinutes} د`
      : `Last seen ${diffMinutes}m ago`;
  }

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return isArabic
      ? `آخر ظهور اليوم الساعة ${timeStr}`
      : `Last seen today at ${timeStr}`;
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const dateStr = `${year}/${month}/${day}`;

  return isArabic
    ? `آخر ظهور ${dateStr} الساعة ${timeStr}`
    : `Last seen on ${dateStr} at ${timeStr}`;
}
