import { memo, useMemo } from 'react';
import { DIA_SEMANA_CORTO } from '../../utils/constants';
import { getTodayString } from '../../utils/formatters';
import type { DaySelectorProps } from '../../types/alumnos';

const DAYS_TO_SHOW = 14; // Show 2 weeks of dates

/**
 * Horizontal scrollable date chips.
 * Highlights today + selected date. Format: "DD/MM".
 */
const DaySelector = memo<DaySelectorProps>(({
  dates,
  selected,
  onChange,
}) => {
  // Generate dates: use provided dates, or fall back to next 2 weeks
  const displayDates = useMemo(() => {
    if (dates.length > 0) return dates;

    // Generate next 14 days
    const result: string[] = [];
    const today = new Date();
    for (let i = 0; i < DAYS_TO_SHOW; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      result.push(`${year}-${month}-${day}`);
    }
    return result;
  }, [dates]);

  const todayStr = useMemo(() => getTodayString(), []);

  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-2)',
      overflowX: 'auto',
      paddingBottom: 'var(--space-2)',
      scrollbarWidth: 'thin',
    }}>
      {displayDates.map((date) => {
        const d = new Date(date + 'T12:00:00');
        const dayOfWeek = d.getDay();
        // Convert JS day (0=Sun) to backend (0=Mon)
        const backendDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const dayName = DIA_SEMANA_CORTO[backendDay] || '';
        const dayNum = d.getDate();
        const monthNum = d.getMonth() + 1;
        const isToday = date === todayStr;
        const isSelected = date === selected;

        return (
          <button
            key={date}
            onClick={() => onChange(date)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-1)',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-lg)',
              border: isSelected
                ? '2px solid var(--color-gold)'
                : '1px solid var(--color-border)',
              background: isSelected
                ? 'var(--color-gold-glow)'
                : isToday
                  ? 'var(--color-surface)'
                  : 'transparent',
              color: isSelected ? 'var(--color-gold)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              minWidth: 52,
              minHeight: 56,
              fontFamily: 'var(--font-body)',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
            aria-label={`Seleccionar fecha ${dayNum}/${monthNum}`}
          >
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {dayName}
            </span>
            <span style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
            }}>
              {dayNum}
            </span>
          </button>
        );
      })}
    </div>
  );
});

DaySelector.displayName = 'DaySelector';

export default DaySelector;
