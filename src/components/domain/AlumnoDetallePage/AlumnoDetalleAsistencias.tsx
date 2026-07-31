import { memo } from 'react';
import { useWindowWidth } from '../../../hooks/useWindowWidth';
import { formatDate } from '../../../utils/formatters';
import { toLocalDate, dotColor, estadoBadge, sectionLabel, DIA_SEMANA_MAP } from './utils';
import type { AsistenciaAlumnoDetalle } from '../../../types';

interface Props {
  asistencias: AsistenciaAlumnoDetalle[];
}

const AlumnoDetalleAsistencias = memo(({ asistencias }: Props) => {
  const width = useWindowWidth();
  const isMobile = width <= 768;

  if (asistencias.length === 0) return null;

  const grupos = new Map<string, typeof asistencias>();
  for (const a of asistencias) {
    const arr = grupos.get(a.fecha) ?? [];
    arr.push(a);
    grupos.set(a.fecha, arr);
  }

  const totalAsistio = asistencias.filter((a) => a.estado === 'asistio').length;
  const totalFaltas = asistencias.length - totalAsistio;

  return (
    <div>
      <div style={sectionLabel}>Últimas Asistencias</div>
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-base)', fontWeight: 600 }}>
        <span style={{ color: 'var(--color-success)' }}>
          {totalAsistio} asistencia{totalAsistio !== 1 ? 's' : ''}
        </span>
        <span style={{ color: 'var(--color-error)' }}>
          {totalFaltas} falta{totalFaltas !== 1 ? 's' : ''}
        </span>
      </div>
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}>
        {Array.from(grupos.entries()).map(([fecha, registros]) => {
          const date = toLocalDate(fecha);
          const diaLabel = DIA_SEMANA_MAP[(date.getUTCDay() + 6) % 7];
          return registros.map((a, i) => {
            const badge = estadoBadge(a.estado);
            const horarioLabel = a.horario_inicio && a.horario_fin
              ? `${a.horario_inicio.slice(0, 5)}–${a.horario_fin.slice(0, 5)}`
              : null;
            return (
              <div
                key={`${fecha}-${i}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr auto' : '1fr 1fr auto',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-4)',
                  borderBottom: '1px solid var(--color-border)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 'var(--radius-full)',
                      background: dotColor(a.estado),
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.3 }}>
                      {diaLabel}
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gold)', fontWeight: 500, lineHeight: 1.3 }}>
                      {horarioLabel ?? '—'}
                    </div>
                    {isMobile && (
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.3, marginTop: 2 }}>
                        {formatDate(fecha)}
                      </div>
                    )}
                  </div>
                </div>
                {!isMobile && (
                  <span style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-text-muted)',
                    textAlign: 'center',
                  }}>
                    {formatDate(fecha)}
                  </span>
                )}
                <span style={badge.style}>{badge.label}</span>
              </div>
            );
          });
        })}
      </div>
    </div>
  );
});

export default AlumnoDetalleAsistencias;
