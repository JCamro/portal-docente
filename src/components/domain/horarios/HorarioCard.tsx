import { memo } from 'react';
import type { HorarioSemanalConTaller } from '../../../types';

interface HorarioCardProps {
  schedule: HorarioSemanalConTaller;
  isExpanded: boolean;
  onToggle: () => void;
}

// Override the backend taller_color with a muted, professional tone
const MUTED_COLOR = '#38414f'; // slate-800

const HorarioCard = memo(({ schedule, isExpanded, onToggle }: HorarioCardProps) => {
  const start = schedule.hora_inicio.slice(0, 5);
  const end = schedule.hora_fin.slice(0, 5);

  return (
    <div
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
      style={{
        background: isExpanded ? 'var(--color-surface)' : 'var(--color-surface)',
        borderRadius: isExpanded ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)',
        border: `1px solid ${isExpanded ? 'var(--color-gold-border)' : 'var(--color-border)'}`,
        boxShadow: isExpanded ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        padding: 'var(--space-4)',
        cursor: 'pointer',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-gold-border)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isExpanded ? 'var(--color-gold-border)' : 'var(--color-border)';
        e.currentTarget.style.boxShadow = isExpanded ? 'var(--shadow-md)' : 'var(--shadow-sm)';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        minWidth: 0,
        flex: 1,
      }}>
        {/* Time block */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: 64,
          padding: 'var(--space-2)',
          background: 'var(--color-surface-hover)',
          borderRadius: 'var(--radius-md)',
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: 'var(--text-base)',
            fontWeight: 700,
            color: 'var(--color-text)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.2,
          }}>
            {start}
          </span>
          <span style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.2,
          }}>
            —
          </span>
          <span style={{
            fontSize: 'var(--text-base)',
            fontWeight: 700,
            color: 'var(--color-text)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.2,
          }}>
            {end}
          </span>
        </div>

        {/* Info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
          minWidth: 0,
        }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            fontWeight: 600,
            color: MUTED_COLOR,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {schedule.taller_nombre}
          </span>
          <span style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
          }}>
            {schedule.alumnos_count} {schedule.alumnos_count === 1 ? 'alumno' : 'alumnos'}
          </span>
        </div>
      </div>

      <span style={{
        width: 0,
        height: 0,
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        borderTop: `6px solid ${isExpanded ? 'var(--color-gold)' : 'var(--color-text-muted)'}`,
        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 150ms ease',
        flexShrink: 0,
      }} />
    </div>
  );
});

HorarioCard.displayName = 'HorarioCard';

export default HorarioCard;
