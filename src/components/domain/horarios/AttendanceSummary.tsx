import { memo } from 'react';
import type { AsistenciaRegistro } from '../../../types';
import { ESTADO_ASISTENCIA_MAP } from '../../../utils/constants';

interface AttendanceSummaryProps {
  registros: AsistenciaRegistro[];
}

const AttendanceSummary = memo(({ registros }: AttendanceSummaryProps) => {
  const presentes = registros.filter((r) => r.estado === 'asistio' || r.estado === 'presente').length;
  const ausentes = registros.filter((r) => r.estado === 'falta' || r.estado === 'ausente').length;
  const faltasGraves = registros.filter((r) => r.estado === 'falta_grave').length;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-muted)',
        flexWrap: 'wrap',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--color-success)',
            display: 'inline-block',
          }} />
          {presentes} presentes
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--color-error)',
            display: 'inline-block',
          }} />
          {ausentes} ausentes
        </span>
        {faltasGraves > 0 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#d97706',
              display: 'inline-block',
            }} />
            {faltasGraves} falta grave
          </span>
        )}
      </div>

      {registros.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          margin: 0,
          padding: 0,
          paddingLeft: 'var(--space-3)',
        }}>
          {registros.map((registro, idx) => {
            const meta = ESTADO_ASISTENCIA_MAP[registro.estado] || {
              label: registro.estado,
              color: 'var(--color-text-muted)',
              bg: 'transparent',
            };
            return (
              <div
                key={registro.alumno.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) 0',
                  borderBottom: idx < registros.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                }}
              >
                <span style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  color: 'var(--color-text)',
                }}>
                  {registro.alumno.apellido}, {registro.alumno.nombre}
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: meta.color,
                  padding: '2px var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  background: meta.bg,
                }}>
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: meta.color,
                    display: 'inline-block',
                  }} />
                  {meta.label}
                </span>
                {registro.es_recuperacion && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    color: '#7c3aed',
                    padding: '2px var(--space-2)',
                    borderRadius: 'var(--radius-sm)',
                    background: '#ede9fe',
                  }}>
                    Recuperación
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

AttendanceSummary.displayName = 'AttendanceSummary';

export default AttendanceSummary;
