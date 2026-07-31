import { memo, useState, useMemo } from 'react';
import type { HorarioSemanalConTaller } from '../../../types';
import { DIA_SEMANA_MAP } from '../../../utils/constants';
import { formatLimaDate, getLimaDate } from '../../../utils/timezone';
import NotaDiaBanner from './NotaDiaBanner';
import ScheduleRow from './ScheduleRow';

interface DayGroupProps {
  dayIndex: number;
  date: string;
  schedules: HorarioSemanalConTaller[];
  cicloId: number;
  defaultExpanded?: boolean;
}

const tallerCardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden',
};

const DayGroup = memo(({
  dayIndex,
  date,
  schedules,
  cicloId,
  defaultExpanded = false,
}: DayGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [expandedCardId, setExpandedCardId] = useState<number | null>(
    defaultExpanded ? schedules[0]?.id ?? null : null
  );

  const todayStr = formatLimaDate(getLimaDate());
  const isToday = date === todayStr;

  const dayName = DIA_SEMANA_MAP[dayIndex] || '';
  const parts = date.split('-').map(Number);
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  const dateLabel = dateObj.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
  });

  const grouped = useMemo(() => {
    const map = new Map<string, HorarioSemanalConTaller[]>();
    for (const s of schedules) {
      const list = map.get(s.taller_nombre) || [];
      list.push(s);
      map.set(s.taller_nombre, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
    }
    return Array.from(map.entries());
  }, [schedules]);

  const handleToggleCard = (id: number) => {
    setExpandedCardId((prev) => (prev === id ? null : id));
  };

  return (
    <div style={{
      background: isToday ? 'rgba(212, 175, 55, 0.03)' : 'var(--color-surface)',
      border: `1px solid ${isToday ? 'var(--color-gold-border)' : 'var(--color-border)'}`,
      borderLeft: isToday ? '3px solid var(--color-gold)' : '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: isToday
        ? '0 2px 8px rgba(212, 175, 55, 0.08)'
        : '0 1px 3px rgba(0,0,0,0.04)',
      overflow: 'hidden',
      transition: 'border-color 200ms ease, box-shadow 200ms ease',
    }}>
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto',
          alignItems: 'center',
          gap: 'var(--space-3)',
          width: '100%',
          padding: 'var(--space-3) var(--space-4)',
          background: isExpanded
            ? (isToday ? 'rgba(212, 175, 55, 0.06)' : 'var(--color-surface-hover)')
            : 'transparent',
          border: 'none',
          borderBottom: isExpanded ? `1px solid ${isToday ? 'var(--color-gold-border)' : 'var(--color-border)'}` : 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          textAlign: 'left',
        }}
      >
        {/* Col 1: Day name — stretches */}
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-lg)',
          fontWeight: 700,
          color: isToday ? 'var(--color-gold)' : 'var(--color-text)',
          whiteSpace: 'nowrap',
        }}>
          {dayName}
        </span>

        {/* Col 2: Date + badges — right side */}
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          justifySelf: 'end',
        }}>
          <span style={{
            fontSize: 'var(--text-sm)',
            color: isToday ? 'var(--color-gold-dark)' : 'var(--color-text-muted)',
            fontWeight: isToday ? 600 : 400,
          }}>
            {dateLabel}
          </span>
          <span style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: isToday ? 'var(--color-gold-dark)' : 'var(--color-text-secondary)',
            background: isToday ? 'var(--color-gold-glow)' : 'var(--color-surface-hover)',
            padding: '2px var(--space-2)',
            borderRadius: 'var(--radius-full)',
            whiteSpace: 'nowrap',
          }}>
            {schedules.length} {schedules.length === 1 ? 'clase' : 'clases'}
          </span>
          {isToday && (
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-gold-dark)',
              background: 'var(--color-gold-glow)',
              border: '1px solid var(--color-gold-border)',
              padding: '1px var(--space-2)',
              borderRadius: 'var(--radius-sm)',
              whiteSpace: 'nowrap',
            }}>
              Hoy
            </span>
          )}
        </span>

        {/* Col 3: Chevron — far right */}
        <span style={{
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: `6px solid ${isExpanded ? 'var(--color-gold)' : 'var(--color-text-muted)'}`,
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 150ms ease',
          justifySelf: 'end',
        }} />
      </button>

      {isExpanded && (
        <div style={{
          padding: 'var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}>
          <NotaDiaBanner fecha={date} />

          {grouped.map(([tallerNombre, tallerSchedules]) => (
            <div key={tallerNombre} style={tallerCardStyle}>
              <div style={{
                padding: 'var(--space-2) var(--space-4)',
                background: '#faf5e6',
                borderBottom: '1px solid #e8dcc8',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}>
                <span style={{
                  width: 3,
                  height: 16,
                  background: 'var(--color-gold-dark)',
                  borderRadius: 2,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  color: 'var(--color-gold-dark)',
                }}>
                  {tallerNombre}
                </span>
                <span style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 500,
                  color: '#6b6b6b',
                }}>
                  {tallerSchedules.length} {tallerSchedules.length === 1 ? 'clase' : 'clases'}
                </span>
              </div>

              {tallerSchedules.map((schedule, idx) => (
                <ScheduleRow
                  key={schedule.id}
                  schedule={schedule}
                  fecha={date}
                  cicloId={cicloId}
                  isExpanded={expandedCardId === schedule.id}
                  onToggle={() => handleToggleCard(schedule.id)}
                  isLast={idx === tallerSchedules.length - 1}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

DayGroup.displayName = 'DayGroup';

export default DayGroup;
