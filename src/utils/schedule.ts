/**
 * Schedule-related utilities for the weekly grid.
 */

import type { TallerAgrupado, HorarioSemanalConTaller } from '../types';

const DIAS_ESP: Record<number, string> = {
  0: 'lunes', 1: 'martes', 2: 'miércoles',
  3: 'jueves', 4: 'viernes', 5: 'sábado', 6: 'domingo',
};

/**
 * Given a dia_semana (0=Lunes..6=Domingo), find the nearest occurrence
 * relative to today. If today is the target day → use today.
 * If past → use next week's occurrence.
 * If future this week → use this week's occurrence.
 */
export function getNearestDate(diaSemana: number): Date {
  const today = new Date();
  // Convert JS getDay() (0=Dom) to backend convention (0=Lun)
  const jsDay = today.getDay();
  const todayBackend = jsDay === 0 ? 6 : jsDay - 1;

  const diff = diaSemana - todayBackend;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + diff);

  // If diff < 0 (target is in past this week), go to next week
  if (diff < 0) {
    targetDate.setDate(targetDate.getDate() + 7);
  }

  return targetDate;
}

/**
 * Format a Date to "Miércoles 18 de junio, 2026" style.
 */
export function formatDateSpanish(date: Date): string {
  const dayName = DIAS_ESP[date.getDay() === 0 ? 6 : date.getDay() - 1] || '';
  const day = date.getDate();
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  // Capitalize first letter
  return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${day} de ${month}, ${year}`;
}

/**
 * Format a Date to YYYY-MM-DD string in local timezone.
 */
export function dateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Move a YYYY-MM-DD date by n weeks (±7 days).
 */
export function shiftDateByWeeks(dateStr: string, weeks: number): string {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + weeks * 7);
  return dateToISO(d);
}

/**
 * Flatten grouped workshops into a single list of schedules with
 * their parent workshop name and color attached.
 */
export function flattenSchedules(talleres: TallerAgrupado[]): HorarioSemanalConTaller[] {
  return talleres.flatMap((t) =>
    t.horarios.map((h) => ({
      ...h,
      taller_nombre: t.taller_nombre,
      taller_color: t.taller_color,
    }))
  );
}
