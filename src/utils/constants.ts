// Constants for portal-docente

export const DIA_SEMANA_MAP: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

export const DIA_SEMANA_CORTO: Record<number, string> = {
  0: 'Dom',
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
  6: 'Sáb',
};

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
