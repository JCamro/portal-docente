import { memo, useMemo } from 'react';
import type { HorarioSemanalConTaller } from '../../../types';
import { jsDayToBackendDay } from '../../../utils/constants';
import { dateToISO } from '../../../utils/schedule';
import DayGroup from './DayGroup';

interface WeekViewProps {
  weekSchedules: Map<number, HorarioSemanalConTaller[]>;
  cicloId: number;
}

function getCurrentWeekStart(): Date {
  const today = new Date();
  const backendDay = jsDayToBackendDay(today.getDay());
  const start = new Date(today);
  start.setDate(today.getDate() - backendDay);
  start.setHours(0, 0, 0, 0);
  return start;
}

const WeekView = memo(({ weekSchedules, cicloId }: WeekViewProps) => {
  const todayBackend = jsDayToBackendDay(new Date().getDay());

  const days = useMemo(() => {
    const weekStart = getCurrentWeekStart();
    const result: { index: number; date: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      result.push({ index: i, date: dateToISO(d) });
    }
    return result;
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
    }}>
      {days.map(({ index, date }) => {
        const schedules = weekSchedules.get(index) || [];
        if (schedules.length === 0) return null;
        return (
          <DayGroup
            key={index}
            dayIndex={index}
            date={date}
            schedules={schedules}
            cicloId={cicloId}
            defaultExpanded={index === todayBackend}
          />
        );
      })}
    </div>
  );
});

WeekView.displayName = 'WeekView';

export default WeekView;
