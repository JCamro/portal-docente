import React from 'react';

interface CalendarBlockProps {
  tallerId: number;
  tallerNombre: string;
  tallerTipo: string;
  horaInicio: string;
  horaFin: string;
  alumnosCount: number;
  alumnos: Array<{ id: number; nombre: string; apellido: string; edad?: number }>;
  onClick: () => void;
}

const CalendarBlock: React.FC<CalendarBlockProps> = ({
  tallerNombre,
  tallerTipo,
  horaInicio,
  horaFin: _horaFin,
  alumnosCount,
  alumnos,
  onClick,
}) => {
  const visibleAlumnos = alumnos.slice(0, 3);
  const overflowCount = alumnosCount - 3;

  return (
    <div
      onClick={onClick}
      style={{
        background: tallerTipo === 'instrumento'
          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.02))'
          : 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.02))',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-2)',
        border: tallerTipo === 'instrumento'
          ? '1px solid rgba(59, 130, 246, 0.15)'
          : '1px solid rgba(139, 92, 246, 0.15)',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
        overflow: 'hidden',
        transition: 'box-shadow 0.15s, transform 0.15s',
        minHeight: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'none';
      }}
    >
      {/* Header: time + count badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color: tallerTipo === 'instrumento' ? '#3b82f6' : '#8b5cf6',
          fontFamily: 'var(--font-heading)',
          lineHeight: 1.2,
        }}>
          {horaInicio.slice(0, 5)}
        </span>
        {alumnosCount > 0 && (
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            color: 'var(--color-text-muted)',
            background: 'var(--color-bg)',
            borderRadius: 'var(--radius-full)',
            padding: '0 var(--space-1)',
            lineHeight: '16px',
            minWidth: 16,
            textAlign: 'center',
          }}>
            {alumnosCount}
          </span>
        )}
      </div>

      {/* Workshop name */}
      <span style={{
        fontSize: 10,
        fontWeight: 600,
        color: 'var(--color-text)',
        fontFamily: 'var(--font-heading)',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {tallerNombre}
      </span>

      {/* Student names */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        flex: 1,
        justifyContent: 'flex-end',
      }}>
        {visibleAlumnos.map((a) => (
          <span key={a.id} style={{
            fontSize: 9,
            color: 'var(--color-text-muted)',
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {a.nombre} {a.apellido.charAt(0)}.
            {a.edad !== undefined && a.edad !== null && (
              <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>
                {' '}({a.edad})
              </span>
            )}
          </span>
        ))}
        {overflowCount > 0 && (
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            color: 'var(--color-gold)',
            lineHeight: 1.3,
          }}>
            +{overflowCount} más
          </span>
        )}
      </div>
    </div>
  );
};

export default React.memo(CalendarBlock);
