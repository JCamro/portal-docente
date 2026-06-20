// Constants for portal-docente
// Backend uses: 0=Lunes, 1=Martes, ..., 6=Domingo (Python weekday())
// Frontend JS getDay() uses: 0=Domingo, 1=Lunes, ..., 6=Sábado
// We align with backend convention (0=Lunes)

export const DIA_SEMANA_MAP: Record<number, string> = {
  0: 'Lunes',
  1: 'Martes',
  2: 'Miércoles',
  3: 'Jueves',
  4: 'Viernes',
  5: 'Sábado',
  6: 'Domingo',
};

export const DIA_SEMANA_CORTO: Record<number, string> = {
  0: 'Lun',
  1: 'Mar',
  2: 'Mié',
  3: 'Jue',
  4: 'Vie',
  5: 'Sáb',
  6: 'Dom',
};

// Convert JS getDay() (0=Domingo) to backend convention (0=Lunes)
export function jsDayToBackendDay(jsDay: number): number {
  // JS: 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
  // BE: 0=Lun, 1=Mar, 2=Mié, 3=Jue, 4=Vie, 5=Sáb, 6=Dom
  return jsDay === 0 ? 6 : jsDay - 1;
}

export const ESTADO_ASISTENCIA_MAP: Record<string, { label: string; color: string; bg: string }> = {
  // Backend states
  asistio: { label: 'Presente', color: '#16a34a', bg: '#dcfce7' },
  falta: { label: 'Ausente', color: '#dc2626', bg: '#fee2e2' },
  falta_grave: { label: 'Falta Grave', color: '#d97706', bg: '#fef3c7' },
  // Legacy/alternative states
  presente: { label: 'Presente', color: '#16a34a', bg: '#dcfce7' },
  ausente: { label: 'Ausente', color: '#dc2626', bg: '#fee2e2' },
  tardanza: { label: 'Tardanza', color: '#d97706', bg: '#fef3c7' },
};

export const ESTADO_PAGO_MAP: Record<string, { label: string; color: string; bg: string }> = {
  calculado: { label: 'Calculado', color: '#d97706', bg: '#fef3c7' },
  pagado: { label: 'Pagado', color: '#16a34a', bg: '#dcfce7' },
  anulado: { label: 'Anulado', color: '#dc2626', bg: '#fee2e2' },
};

export const ESTADO_HT_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pendiente: { label: 'Pendiente', color: '#d97706', bg: '#fef3c7' },
  aprobada: { label: 'Aprobada', color: '#16a34a', bg: '#dcfce7' },
  rechazada: { label: 'Rechazada', color: '#dc2626', bg: '#fee2e2' },
};

export function formatHora(hora: string): string {
  if (!hora) return '';
  const [hours, minutes] = hora.split(':');
  return `${hours}:${minutes}`;
}
