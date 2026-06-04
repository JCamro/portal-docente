// Timezone utilities - America/Lima (UTC-5)
// Matches the convention from sistema-asistencia-taller

/**
 * Returns the current date in Lima timezone as a Date object.
 * Useful for comparing dates without timezone drift.
 */
export function getLimaDate(): Date {
  const now = new Date();
  const limaOffset = -5 * 60; // UTC-5
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcTime + limaOffset * 60000);
}

/**
 * Formats a Date to YYYY-MM-DD in Lima timezone.
 */
export function formatLimaDate(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
}

/**
 * Transforms a UTC date string to Lima date string (YYYY-MM-DD).
 */
export function utcToLimaDate(utcDateStr: string): string {
  const date = new Date(utcDateStr + 'Z');
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
}