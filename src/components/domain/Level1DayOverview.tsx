import React, { useState, useEffect, useMemo } from 'react';
import { DIA_SEMANA_CORTO, jsDayToBackendDay } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import NoteEditor from './NoteEditor';
import { getNotasDia, createNotaDia, updateNotaDia } from '../../api/portalDocente';
import type { NotaDia, HorarioDetalle } from '../../types';

interface DayWorkshop {
  tallerId: number;
  tallerNombre: string;
  tallerTipo: string;
  horarioCount: number;
  alumnoCount: number;
}

interface Level1DayOverviewProps {
  cicloId: number;
  horarios: HorarioDetalle[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSelectTaller: (tallerId: number) => void;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const Level1DayOverview: React.FC<Level1DayOverviewProps> = ({
  cicloId,
  horarios,
  selectedDate,
  onSelectDate,
  onSelectTaller,
}) => {
  const [notaDia, setNotaDia] = useState<NotaDia | null>(null);
  const [notaDiaLoading, setNotaDiaLoading] = useState(false);

  // Derive day of week from selected date (convert JS getDay to backend convention)
  const selectedDayOfWeek = useMemo(() => {
    const d = new Date(selectedDate + 'T12:00:00');
    return jsDayToBackendDay(d.getDay()); // Convert JS 0=Sun to backend 0=Mon
  }, [selectedDate]);

  // Filter horarios for selected day
  const dayHorarios = useMemo(() => {
    return horarios.filter((h) => h.dia_semana === selectedDayOfWeek);
  }, [horarios, selectedDayOfWeek]);

  // Group by taller
  const workshops = useMemo(() => {
    const map = new Map<number, DayWorkshop>();
    for (const h of dayHorarios) {
      const tid = h.taller_id ?? 0;
      const existing = map.get(tid);
      if (existing) {
        existing.horarioCount += 1;
      } else {
        map.set(tid, {
          tallerId: tid,
          tallerNombre: h.taller_nombre,
          tallerTipo: h.taller_tipo,
          horarioCount: 1,
          alumnoCount: h.alumnos_count,
        });
      }
    }
    return Array.from(map.values());
  }, [dayHorarios]);

  // Fetch NotaDia for selected date
  useEffect(() => {
    let cancelled = false;
    const fetchNotaDia = async () => {
      setNotaDiaLoading(true);
      try {
        const notas = await getNotasDia(cicloId, { fecha: selectedDate });
        if (!cancelled) {
          setNotaDia(notas.length > 0 ? notas[0] : null);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setNotaDiaLoading(false);
      }
    };
    fetchNotaDia();
    return () => { cancelled = true; };
  }, [cicloId, selectedDate]);

  const handleSaveNotaDia = async (content: string) => {
    if (notaDia) {
      const updated = await updateNotaDia(cicloId, notaDia.id, { contenido: content });
      setNotaDia(updated);
    } else {
      const created = await createNotaDia(cicloId, { fecha: selectedDate, contenido: content });
      setNotaDia(created);
    }
  };

  // Generate week dates starting from Monday of current week
  const weekDates = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Day selector */}
      <div>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-sm)',
          fontWeight: 700,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: 0,
          marginBottom: 'var(--space-3)',
        }}>
          Seleccionar día
        </h3>
        <div style={{
          display: 'flex',
          gap: 'var(--space-2)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-2)',
        }}>
          {weekDates.map((date) => {
            const d = new Date(date + 'T12:00:00');
            const backendDay = jsDayToBackendDay(d.getDay());
            const dayName = DIA_SEMANA_CORTO[backendDay] || '';
            const dayNum = d.getDate();
            const isToday = date === getTodayString();
            const isSelected = date === selectedDate;
            return (
              <button
                key={date}
                onClick={() => onSelectDate(date)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  padding: 'var(--space-3) var(--space-3)',
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
                  minWidth: 56,
                  minHeight: 64,
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.15s',
                }}
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
                  fontSize: 'var(--text-base)',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                }}>
                  {dayNum}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom date input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <label style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
        }}>
          Otra fecha
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onSelectDate(e.target.value)}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--text-sm)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-body)',
          }}
        />
      </div>

      {/* Workshop summary for selected day */}
      <div>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-sm)',
          fontWeight: 700,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: 0,
          marginBottom: 'var(--space-3)',
        }}>
          Clases del {formatDate(selectedDate)}
        </h3>
        {dayHorarios.length === 0 ? (
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            padding: 'var(--space-8) 0',
          }}>
            No hay clases programadas para este día.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {workshops.map((w) => (
              <div
                key={w.tallerId}
                onClick={() => onSelectTaller(w.tallerId)}
                style={{
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    margin: 0,
                    marginBottom: 'var(--space-1)',
                  }}>
                    {w.tallerNombre}
                  </p>
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    margin: 0,
                  }}>
                    {w.horarioCount} {w.horarioCount === 1 ? 'horario' : 'horarios'} · {w.alumnoCount} {w.alumnoCount === 1 ? 'alumno' : 'alumnos'}
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NotaDia editor */}
      <div>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-sm)',
          fontWeight: 700,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: 0,
          marginBottom: 'var(--space-3)',
        }}>
          Nota del día
        </h3>
        {notaDiaLoading ? (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Cargando...</p>
        ) : (
          <NoteEditor
            value={notaDia?.contenido || ''}
            onSave={handleSaveNotaDia}
            placeholder="Escribe una nota general sobre este día..."
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(Level1DayOverview);
