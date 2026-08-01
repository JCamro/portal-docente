import { memo, useState, useMemo, useRef, useEffect } from 'react';
import type { HorarioSemanalConTaller } from '../../../types';
import ScheduleRow from './ScheduleRow';

interface ScheduleGroupProps {
  schedules: HorarioSemanalConTaller[];
  fecha: string;
  cicloId: number;
  initialExpandedId?: number;
}

const tallerCardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden',
};

const ScheduleGroup = memo(({ schedules, fecha, cicloId, initialExpandedId }: ScheduleGroupProps) => {
  const [expandedCardId, setExpandedCardId] = useState<number | null>(
    initialExpandedId ?? schedules[0]?.id ?? null
  );
  const expandedRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to expanded card on initial mount (redirect from notes)
  useEffect(() => {
    if (initialExpandedId != null && expandedRef.current) {
      expandedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [initialExpandedId]);

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

  const handleToggle = (id: number) => {
    setExpandedCardId((prev) => (prev === id ? null : id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
            <div
              key={schedule.id}
              ref={expandedCardId === schedule.id ? expandedRef : undefined}
            >
              <ScheduleRow
                schedule={schedule}
                fecha={fecha}
                cicloId={cicloId}
                isExpanded={expandedCardId === schedule.id}
                onToggle={() => handleToggle(schedule.id)}
                isLast={idx === tallerSchedules.length - 1}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
});

ScheduleGroup.displayName = 'ScheduleGroup';

export default ScheduleGroup;
