import { memo, useMemo } from 'react';
import { ESTADO_ASISTENCIA_MAP, formatHora } from '../../utils/constants';
import Loading from '../ui/Loading';
import type { AttendanceHistoryProps } from '../../types/alumnos';

/**
 * Attendance rows for a selected date.
 * Shows taller, horario, and estado badge for each attendance record.
 */
const AttendanceHistory = memo<AttendanceHistoryProps>(({ asistencias, loading }) => {
  const allRegistros = useMemo(() => {
    return asistencias.flatMap((a) => a.registros || []);
  }, [asistencias]);

  if (loading) {
    return <Loading message="Cargando asistencia..." />;
  }

  if (allRegistros.length === 0) {
    return (
      <p style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-muted)',
        textAlign: 'center',
        padding: 'var(--space-4) 0',
      }}>
        Sin clases programadas para este día.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {allRegistros.map((r, idx) => {
        const estadoInfo = ESTADO_ASISTENCIA_MAP[r.estado] || ESTADO_ASISTENCIA_MAP.ausente;
        const tallerNombre = asistencias[0]?.horario?.taller_nombre || 'Clase';
        const horaInicio = asistencias[0]?.horario?.hora_inicio || '';
        const horaFin = asistencias[0]?.horario?.hora_fin || '';

        return (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div>
              <p style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--color-text)',
                margin: 0,
                marginBottom: 2,
              }}>
                {tallerNombre}
              </p>
              {horaInicio && (
                <p style={{
                  fontSize: 10,
                  color: 'var(--color-text-muted)',
                  margin: 0,
                }}>
                  {formatHora(horaInicio)} - {formatHora(horaFin)}
                </p>
              )}
            </div>
            <span style={{
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              fontSize: 10,
              fontWeight: 600,
              background: estadoInfo.bg,
              color: estadoInfo.color,
              flexShrink: 0,
            }}>
              {estadoInfo.label}
            </span>
          </div>
        );
      })}
    </div>
  );
});

AttendanceHistory.displayName = 'AttendanceHistory';

export default AttendanceHistory;
