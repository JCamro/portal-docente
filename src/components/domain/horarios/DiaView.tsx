import { memo, useState, useMemo } from 'react';
import type { HorarioSemanalConTaller } from '../../../types';
import { jsDayToBackendDay } from '../../../utils/constants';
import { dateToISO } from '../../../utils/schedule';
import EmptyState from '../../ui/EmptyState';
import NotaDiaBanner from './NotaDiaBanner';
import ScheduleGroup from './ScheduleGroup';

interface DiaViewProps {
  allSchedules: HorarioSemanalConTaller[];
  cicloId: number;
}

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const DiaView = memo(({ allSchedules, cicloId }: DiaViewProps) => {
  const [selectedDate, setSelectedDate] = useState(() => dateToISO(new Date()));

  const selectedDayBackend = useMemo(() => {
    const parts = selectedDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return jsDayToBackendDay(d.getDay());
  }, [selectedDate]);

  const daySchedules = useMemo(() =>
    allSchedules.filter((s) => s.dia_semana === selectedDayBackend),
    [allSchedules, selectedDayBackend]
  );

  const selectedDateObj = useMemo(() => {
    const parts = selectedDate.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }, [selectedDate]);

  const dayName = DIAS_SEMANA[selectedDateObj.getDay()];
  const dateLabel = selectedDateObj.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrevDay = () => {
    const parts = selectedDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() - 1);
    setSelectedDate(dateToISO(d));
  };

  const handleNextDay = () => {
    const parts = selectedDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + 1);
    setSelectedDate(dateToISO(d));
  };

  const handleToday = () => {
    setSelectedDate(dateToISO(new Date()));
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
    }}>
      {/* Date display + navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
      }}>
        <button
          onClick={handlePrevDay}
          aria-label="Día anterior"
          title="Día anterior"
          style={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-gold-border)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span style={{
            width: 0,
            height: 0,
            borderTop: '5px solid transparent',
            borderBottom: '5px solid transparent',
            borderRight: '7px solid var(--color-text-secondary)',
          }} />
        </button>

        <button
          onClick={() => {
            const picker = document.getElementById('historial-date-input') as HTMLInputElement | null;
            picker?.showPicker();
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-1)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            transition: 'background 150ms ease',
            flex: 1,
            maxWidth: 280,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-surface-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-2xl)',
            color: 'var(--color-gold)',
            lineHeight: 1.1,
          }}>
            {dayName}
          </span>
          <span style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
          }}>
            {dateLabel}
          </span>
        </button>

        <button
          onClick={handleNextDay}
          aria-label="Día siguiente"
          title="Día siguiente"
          style={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-gold-border)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span style={{
            width: 0,
            height: 0,
            borderTop: '5px solid transparent',
            borderBottom: '5px solid transparent',
            borderLeft: '7px solid var(--color-text-secondary)',
          }} />
        </button>
      </div>

      {/* Hidden date input + Hoy button row */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 'var(--space-2)',
      }}>
        <input
          id="historial-date-input"
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
          }}
          style={{
            position: 'absolute',
            opacity: 0,
            width: 0,
            height: 0,
            pointerEvents: 'none',
          }}
        />
        <button
          onClick={handleToday}
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--color-gold)',
            background: 'var(--color-gold-glow)',
            border: '1px solid var(--color-gold-border)',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            padding: 'var(--space-1) var(--space-3)',
            fontFamily: 'var(--font-body)',
          }}
        >
          Volver a hoy
        </button>
      </div>

      {/* Schedules */}
      <NotaDiaBanner fecha={selectedDate} />

      {daySchedules.length === 0 ? (
        <EmptyState
          message="Sin clases este día"
          description="No hay horarios programados para la fecha seleccionada."
        />
      ) : (
        <ScheduleGroup schedules={daySchedules} fecha={selectedDate} cicloId={cicloId} />
      )}
    </div>
  );
});

DiaView.displayName = 'DiaView';

export default DiaView;
