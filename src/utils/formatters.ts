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
 * Format a date string to a readable format in Spanish.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'Z');
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
  const date = new Date(dateStr + 'Z');
  return date.toLocaleDateString('es-PE', {
    timeZone: 'America/Lima',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}