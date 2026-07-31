// Shared formatters for the portal-docente app

/**
 * Format a number as Peruvian Soles currency.
 * Example: formatMonto(1234.5) → "S/. 1,234.50"
 */
export function formatMonto(monto: number): string {
  return `S/. ${monto.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Get today's date as YYYY-MM-DD string in local timezone.
 * Avoids UTC timezone shift issues from toISOString().
 */
export function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date object as YYYY-MM-DD string in local timezone.
 * Avoids UTC timezone shift issues from toISOString().
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a "YYYY-MM-DD" string as local date parts (not UTC).
 * Avoids the day-shift bug from `new Date(dateStr + 'Z')`.
 */
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format a date string to a readable format in Spanish.
 */
export function formatDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format a date string to a long readable format.
 */
export function formatDateLong(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('es-PE', {
    timeZone: 'America/Lima',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}