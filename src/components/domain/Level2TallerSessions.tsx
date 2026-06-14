import React, { useMemo } from 'react';
import { formatHora } from '../../utils/constants';
import { DIA_SEMANA_MAP } from '../../utils/constants';
import type { HorarioDetalle } from '../../types';

interface Level2TallerSessionsProps {
  horarios: HorarioDetalle[];
  tallerId: number;
  fecha: string;
  onSelectSession: (horarioId: number) => void;
  onBack: () => void;
}

const Level2TallerSessions: React.FC<Level2TallerSessionsProps> = ({
  horarios,
  tallerId,
  fecha,
  onSelectSession,
  onBack,
}) => {
  // Filter horarios for this taller
  const sessions = useMemo(() => {
    return horarios.filter((h) => h.taller_id === tallerId);
  }, [horarios, tallerId]);

  const tallerNombre = sessions.length > 0 ? sessions[0].taller_nombre : '';

  const dayOfWeek = useMemo(() => {
    const d = new Date(fecha + 'T12:00:00');
    return d.getDay();
  }, [fecha]);

  // Further filter by day of week
  const daySessions = useMemo(() => {
    return sessions.filter((h) => h.dia_semana === dayOfWeek);
  }, [sessions, dayOfWeek]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Back button + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button
          onClick={onBack}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: 'transparent',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 36,
            minWidth: 36,
          }}
          aria-label="Volver"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text)',
            margin: 0,
          }}>
            {tallerNombre}
          </h2>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            margin: 'var(--space-1) 0 0 0',
          }}>
            {DIA_SEMANA_MAP[dayOfWeek]} · {daySessions.length} {daySessions.length === 1 ? 'horario' : 'horarios'}
          </p>
        </div>
      </div>

      {/* Sessions list */}
      {daySessions.length === 0 ? (
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          padding: 'var(--space-8) 0',
        }}>
          No hay horarios para este taller en este día.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {daySessions.map((h) => (
            <div
              key={h.id}
              onClick={() => onSelectSession(h.id)}
              style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  margin: 0,
                  marginBottom: 'var(--space-1)',
                }}>
                  {formatHora(h.hora_inicio)} - {formatHora(h.hora_fin)}
                </p>
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  margin: 0,
                }}>
                  {h.alumnos_count} {h.alumnos_count === 1 ? 'alumno inscrito' : 'alumnos inscritos'}
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(Level2TallerSessions);
