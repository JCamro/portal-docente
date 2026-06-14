import React, { useState, useMemo } from 'react';
import { useWindowWidth } from '../../hooks/useWindowWidth';
import { DIA_SEMANA_CORTO } from '../../utils/constants';
import CalendarBlock from './CalendarBlock';

interface HorarioCalendarEntry {
  id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  taller_id: number;
  taller_nombre: string;
  taller_tipo: string;
  alumnos_count: number;
  alumnos: { id: number; nombre: string; apellido: string; edad?: number }[];
}

interface WeeklyCalendarProps {
  horarios: HorarioCalendarEntry[];
  onBlockClick: (horarioId: number) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => `${i + 9}:00`);
const DAYS = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun

const HEADER_HEIGHT = 44;
const ROW_HEIGHT = 72;

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ horarios, onBlockClick }) => {
  const width = useWindowWidth();
  const isMobile = width <= 768;
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    // Default to today's day of week (1=Mon...0=Sun)
    const today = new Date().getDay();
    return today === 0 ? 0 : today;
  });

  const blocksByDayAndHour = useMemo(() => {
    const map: Record<number, Record<string, HorarioCalendarEntry[]>> = {};
    for (const h of horarios) {
      if (!map[h.dia_semana]) map[h.dia_semana] = {};
      const hourKey = h.hora_inicio.slice(0, 5);
      if (!map[h.dia_semana][hourKey]) map[h.dia_semana][hourKey] = [];
      map[h.dia_semana][hourKey].push(h);
    }
    return map;
  }, [horarios]);

  // ── Mobile: Day tabs + single column ──
  if (isMobile) {
    const dayBlocks = blocksByDayAndHour[selectedDay] || {};
    const sortedHours = Object.keys(dayBlocks).sort();

    return (
      <div>
        {/* Day tabs */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-4)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-2)',
        }}>
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                flex: 1,
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: day === selectedDay
                  ? '2px solid var(--color-gold)'
                  : '1px solid var(--color-border)',
                background: day === selectedDay
                  ? 'var(--color-gold-glow)'
                  : 'var(--color-surface)',
                color: day === selectedDay ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                fontSize: 'var(--text-xs)',
                fontWeight: day === selectedDay ? 700 : 500,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                textAlign: 'center',
                minHeight: 44,
                minWidth: 0,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {DIA_SEMANA_CORTO[day]}
            </button>
          ))}
        </div>

        {/* Single day column */}
        {sortedHours.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-8) var(--space-4)',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)',
          }}>
            No hay clases este día
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {sortedHours.map((hour) => (
              <div key={hour}>
                <div style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-2)',
                  fontFamily: 'var(--font-heading)',
                }}>
                  {hour}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {dayBlocks[hour].map((h) => (
                    <CalendarBlock
                      key={h.id}
                      tallerId={h.taller_id}
                      tallerNombre={h.taller_nombre}
                      tallerTipo={h.taller_tipo}
                      horaInicio={h.hora_inicio}
                      horaFin={h.hora_fin}
                      alumnosCount={h.alumnos_count}
                      alumnos={h.alumnos}
                      onClick={() => onBlockClick(h.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Desktop: Full 7×13 grid ──
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '60px repeat(7, 1fr)',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
      }}>
        <div style={{ padding: 'var(--space-2)', textAlign: 'center' }} />
        {DAYS.map((day) => (
          <div key={day} style={{
            padding: `${HEADER_HEIGHT > 50 ? 'var(--space-3)' : 'var(--space-2)'} var(--space-2)`,
            textAlign: 'center',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            color: day === 0 || day === 6 ? '#dc2626' : 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderLeft: '1px solid var(--color-border)',
          }}>
            {DIA_SEMANA_CORTO[day]}
          </div>
        ))}
      </div>

      {/* Grid body */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '60px repeat(7, 1fr)',
        position: 'relative',
      }}>
        {HOURS.map((hour) => (
          <React.Fragment key={hour}>
            {/* Hour label */}
            <div style={{
              gridColumn: 1,
              padding: 'var(--space-1) var(--space-2)',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textAlign: 'right',
              borderRight: '1px solid var(--color-border)',
              borderBottom: '1px solid var(--color-border)',
              height: ROW_HEIGHT,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              paddingTop: 2,
            }}>
              {hour}
            </div>

            {/* 7 day cells for this hour slot */}
            {DAYS.map((day) => {
              const blocks = (blocksByDayAndHour[day] || {})[hour] || [];
              return (
                <div
                  key={`${day}-${hour}`}
                  style={{
                    gridColumn: day + 2,
                    borderBottom: '1px solid var(--color-border)',
                    borderLeft: '1px solid var(--color-border)',
                    height: ROW_HEIGHT,
                    padding: blocks.length > 0 ? 'var(--space-1)' : 0,
                    background: day === 0 || day === 6
                      ? 'rgba(220, 38, 38, 0.02)'
                      : 'transparent',
                    overflow: 'hidden',
                  }}
                >
                  {blocks.map((h) => (
                    <div key={h.id} style={{ height: '100%' }}>
                      <CalendarBlock
                        tallerId={h.taller_id}
                        tallerNombre={h.taller_nombre}
                        tallerTipo={h.taller_tipo}
                        horaInicio={h.hora_inicio}
                        horaFin={h.hora_fin}
                        alumnosCount={h.alumnos_count}
                        alumnos={h.alumnos}
                        onClick={() => onBlockClick(h.id)}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default React.memo(WeeklyCalendar);
