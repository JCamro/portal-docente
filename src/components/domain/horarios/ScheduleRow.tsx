import { memo } from 'react';
import type { HorarioSemanalConTaller } from '../../../types';
import { useAttendance } from '../../../hooks/useAttendance';
import { formatLimaDate, getLimaDate } from '../../../utils/timezone';
import HorarioCardExpanded from './HorarioCardExpanded';

interface ScheduleRowProps {
  schedule: HorarioSemanalConTaller;
  fecha: string;
  cicloId: number;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}

function getDateMode(fecha: string): 'pasado' | 'hoy' | 'futuro' {
  const today = formatLimaDate(getLimaDate());
  if (fecha === today) return 'hoy';
  if (fecha < today) return 'pasado';
  return 'futuro';
}

const ScheduleRow = memo(({
  schedule, fecha, cicloId, isExpanded, onToggle, isLast,
}: ScheduleRowProps) => {
  const { registros, modo, aviso, loading } = useAttendance({
    cicloId,
    horarioId: schedule.id,
    fecha,
  });

  const mode = modo || getDateMode(fecha);
  const isEmpty = schedule.alumnos_count === 0 && registros.length === 0;
  const tieneRecuperacion = schedule.alumnos_count === 0 && registros.length > 0;
  const start = schedule.hora_inicio.slice(0, 5);
  const end = schedule.hora_fin.slice(0, 5);

  const asistieron = registros.filter((r) => r.estado_asistencia === 'asistio').length;
  const faltaron = registros.filter((r) => r.estado_asistencia === 'falta' || r.estado_asistencia === 'falta_grave').length;
  const sinRegistro = registros.filter((r) => !r.estado_asistencia).length;

  return (
    <div style={{ marginBottom: isExpanded ? 'var(--space-3)' : 0 }}>
      <div
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto auto',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: '10px var(--space-4)',
          cursor: 'pointer',
          background: isExpanded ? 'var(--color-surface-hover)' : 'transparent',
          borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
          marginBottom: isExpanded ? 'var(--space-3)' : 0,
          transition: 'background 150ms ease, border-left-color 150ms ease',
          borderLeft: '2px solid transparent',
        }}
        onMouseEnter={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.background = 'var(--color-surface-hover)';
            e.currentTarget.style.borderLeftColor = 'var(--color-gold)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderLeftColor = 'transparent';
          }
        }}
      >
        {/* Col 1: Time block */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          minWidth: 90,
        }}>
          <span style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--color-text)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {start}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: '#9ca3af' }}>–</span>
          <span style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: '#6b6b6b',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {end}
          </span>
        </div>

        {/* Col 2: Taller name */}
        <span style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          color: isEmpty ? '#9ca3af' : 'var(--color-text)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          paddingLeft: 'var(--space-2)',
        }}>
          {isEmpty ? 'Sin alumnos' : tieneRecuperacion ? `${schedule.taller_nombre} · recuperación` : schedule.taller_nombre}
        </span>

        {/* Col 3: Mode-based summary */}
        <span style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          textAlign: 'right',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
        }}>
          {isEmpty ? (
            <span style={{ color: '#9ca3af' }}>Sin alumnos</span>
          ) : mode === 'pasado' ? (
            <span style={{ color: asistieron === schedule.alumnos_count ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
              {asistieron} asist
            </span>
          ) : mode === 'hoy' ? (
            <>
              <span style={{ color: 'var(--color-success)' }}>{asistieron} asist</span>
              <span style={{ color: '#d1d5db' }}>·</span>
              <span style={{ color: 'var(--color-error)' }}>{faltaron} falt</span>
              <span style={{ color: '#d1d5db' }}>·</span>
              <span style={{ color: '#9ca3af' }}>{sinRegistro} pend</span>
            </>
          ) : (
            <span style={{ color: aviso ? '#c4721e' : 'var(--color-text-secondary)' }}>
              {aviso || `${schedule.alumnos_count} inscritos`}
            </span>
          )}
        </span>

        {/* Col 4: Chevron */}
        <span style={{
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: `5px solid ${isExpanded ? 'var(--color-gold)' : '#9ca3af'}`,
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 150ms ease',
        }} />
      </div>
      {isExpanded && (
        <HorarioCardExpanded
          schedule={schedule}
          fecha={fecha}
          cicloId={cicloId}
          registros={registros}
          modo={mode}
          aviso={aviso}
          loading={loading}
        />
      )}
    </div>
  );
});

ScheduleRow.displayName = 'ScheduleRow';
export default ScheduleRow;
