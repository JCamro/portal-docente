import { memo, useMemo } from 'react';
import type { HorarioSemanalConTaller } from '../../../types';
import { jsDayToBackendDay } from '../../../utils/constants';
import DayGroup from './DayGroup';
import EmptyState from '../../ui/EmptyState';

interface PeriodoViewProps {
  allSchedules: HorarioSemanalConTaller[];
  cicloId: number;
  periodStart: string;
  periodEnd: string;
  onPeriodStartChange: (date: string) => void;
  onPeriodEndChange: (date: string) => void;
}

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const parts = start.split('-').map(Number);
  const startDate = new Date(parts[0], parts[1] - 1, parts[2]);
  const endParts = end.split('-').map(Number);
  const endDate = new Date(endParts[0], endParts[1] - 1, endParts[2]);

  const current = new Date(startDate);
  while (current <= endDate) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

const PeriodoView = memo(({
  allSchedules,
  cicloId,
  periodStart,
  periodEnd,
  onPeriodStartChange,
  onPeriodEndChange,
}: PeriodoViewProps) => {
  const dates = useMemo(() => getDatesInRange(periodStart, periodEnd), [periodStart, periodEnd]);

  const daysWithSchedules = useMemo(() => {
    return dates
      .map((date) => {
        const parts = date.split('-').map(Number);
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        const backendDay = jsDayToBackendDay(d.getDay());
        const schedules = allSchedules.filter((s) => s.dia_semana === backendDay);
        return { date, backendDay, schedules };
      })
      .filter((day) => day.schedules.length > 0);
  }, [dates, allSchedules]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Date range picker */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        flexWrap: 'wrap',
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          Del
          <input
            type="date"
            value={periodStart}
            max={periodEnd}
            onChange={(e) => onPeriodStartChange(e.target.value)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-body)',
            }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          al
          <input
            type="date"
            value={periodEnd}
            min={periodStart}
            onChange={(e) => onPeriodEndChange(e.target.value)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-body)',
            }}
          />
        </label>
      </div>

      {/* Results */}
      {daysWithSchedules.length === 0 ? (
        <EmptyState
          message="Sin clases en este período"
          description="No hay horarios programados en el rango seleccionado."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {daysWithSchedules.map(({ date, backendDay, schedules }) => (
            <DayGroup
              key={date}
              dayIndex={backendDay}
              date={date}
              schedules={schedules}
              cicloId={cicloId}
              defaultExpanded={daysWithSchedules.length <= 3}
            />
          ))}
        </div>
      )}
    </div>
  );
});

PeriodoView.displayName = 'PeriodoView';

export default PeriodoView;
