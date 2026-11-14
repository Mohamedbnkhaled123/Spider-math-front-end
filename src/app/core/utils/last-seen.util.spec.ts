import { formatLastSeen } from './last-seen.util';

describe('formatLastSeen Utility', () => {
  const fixedNow = new Date('2026-11-15T15:30:00');

  it('should return online text when isOnline is true', () => {
    expect(formatLastSeen(null, true, true)).toBe('متصل الآن');
    expect(formatLastSeen(null, true, false)).toBe('Online now');
    expect(formatLastSeen(new Date(), true, true)).toBe('متصل الآن');
    expect(formatLastSeen(new Date(), true, false)).toBe('Online now');
  });

  it('should return offline text when lastSeenAt is null or undefined or invalid', () => {
    expect(formatLastSeen(null, false, true)).toBe('غير متصل');
    expect(formatLastSeen(null, false, false)).toBe('Offline');
    expect(formatLastSeen(undefined, false, true)).toBe('غير متصل');
    expect(formatLastSeen(undefined, false, false)).toBe('Offline');
    expect(formatLastSeen('invalid-date', false, true)).toBe('غير متصل');
    expect(formatLastSeen('invalid-date', false, false)).toBe('Offline');
  });

  it('should format 1m ago when diff < 60 seconds or 1 minute', () => {
    const thirtySecAgo = new Date(fixedNow.getTime() - 30 * 1000);
    expect(formatLastSeen(thirtySecAgo, false, true, fixedNow)).toBe('آخر ظهور منذ 1 د');
    expect(formatLastSeen(thirtySecAgo, false, false, fixedNow)).toBe('Last seen 1m ago');

    const oneMinAgo = new Date(fixedNow.getTime() - 60 * 1000);
    expect(formatLastSeen(oneMinAgo, false, true, fixedNow)).toBe('آخر ظهور منذ 1 د');
    expect(formatLastSeen(oneMinAgo, false, false, fixedNow)).toBe('Last seen 1m ago');
  });

  it('should format minutes ago when diff < 60 minutes', () => {
    const twentyFiveMinAgo = new Date(fixedNow.getTime() - 25 * 60 * 1000);
    expect(formatLastSeen(twentyFiveMinAgo, false, true, fixedNow)).toBe('آخر ظهور منذ 25 د');
    expect(formatLastSeen(twentyFiveMinAgo, false, false, fixedNow)).toBe('Last seen 25m ago');
  });

  it('should format today with time when diff >= 60 minutes but same calendar day', () => {
    const twoHoursAgo = new Date(fixedNow.getTime() - 2 * 60 * 60 * 1000); // 13:30 on same day
    const resAr = formatLastSeen(twoHoursAgo, false, true, fixedNow);
    const resEn = formatLastSeen(twoHoursAgo, false, false, fixedNow);
    expect(resAr).toBe('آخر ظهور اليوم الساعة 13:30');
    expect(resEn).toBe('Last seen today at 13:30');
  });

  it('should format past date with YYYY/MM/DD and time when on a different calendar day', () => {
    const pastDate = new Date('2025-05-10T14:30:00');
    const resAr = formatLastSeen(pastDate, false, true, fixedNow);
    const resEn = formatLastSeen(pastDate, false, false, fixedNow);

    expect(resAr).toBe('آخر ظهور 2025/05/10 الساعة 14:30');
    expect(resEn).toBe('Last seen on 2025/05/10 at 14:30');
  });
});
