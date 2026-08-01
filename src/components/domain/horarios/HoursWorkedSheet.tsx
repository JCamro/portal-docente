import React, { useState, useRef, useEffect } from 'react';
import { useWindowWidth } from '../../../hooks/useWindowWidth';
import { useHorarioNotes } from '../../../hooks/useHorarioNotes';
import { formatMonto } from '../../../utils/formatters';
import { DIA_SEMANA_MAP, jsDayToBackendDay, formatHora } from '../../../utils/constants';
import NoteEditor from '../NoteEditor';
import type {
  HoraTrabajadaDetalleResponse,
  HoraTrabajadaDetalleDay,
  HoraTrabajadaDetalleWorkshop,
  HoraTrabajadaDetalleSlot,
} from '../../../types';

interface HoursWorkedSheetProps {
  data: HoraTrabajadaDetalleResponse;
  cicloId: number;
}

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDayHeader(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const backendDay = jsDayToBackendDay(date.getDay());
  const weekday = DIA_SEMANA_MAP[backendDay];
  const monthName = date.toLocaleDateString('es-PE', {
    month: 'long',
    timeZone: 'America/Lima',
  });
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${weekday.toUpperCase()} ${day} DE ${monthName.toUpperCase()} ${year}`;
}

function studentDotColor(estado: string): string {
  if (estado === 'asistio') return 'var(--color-success)';
  if (estado === 'falta' || estado === 'falta_grave') return 'var(--color-error)';
  return 'var(--color-text-muted)';
}

const HoursWorkedSheet: React.FC<HoursWorkedSheetProps> = ({ data, cicloId }) => {
  const width = useWindowWidth();
  const isMobile = width <= 768;

  if (data.days.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
    >
      {data.days.map((day) => (
        <SheetDay key={day.fecha} day={day} isMobile={isMobile} cicloId={cicloId} />
      ))}
    </div>
  );
};

interface SheetDayProps {
  day: HoraTrabajadaDetalleDay;
  isMobile: boolean;
  cicloId: number;
}

const SheetDay: React.FC<SheetDayProps> = React.memo(({ day, isMobile, cicloId }) => {
  return (
    <section>
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: isMobile ? 'var(--text-lg)' : 'var(--text-xl)',
          color: 'var(--color-gold)',
          margin: 0,
          marginBottom: 'var(--space-4)',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
        }}
      >
        {formatDayHeader(day.fecha)}
      </h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
        }}
      >
        {day.talleres.map((workshop) => (
          <SheetWorkshop
            key={`${day.fecha}-${workshop.taller_nombre}`}
            workshop={workshop}
            fecha={day.fecha}
            isMobile={isMobile}
            cicloId={cicloId}
          />
        ))}
      </div>
    </section>
  );
});

interface SheetWorkshopProps {
  workshop: HoraTrabajadaDetalleWorkshop;
  fecha: string;
  isMobile: boolean;
  cicloId: number;
}

const SheetWorkshop: React.FC<SheetWorkshopProps> = React.memo(({ workshop, fecha, isMobile, cicloId }) => {
  return (
    <div>
      <h3
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          color: 'var(--color-text)',
          margin: 0,
          marginBottom: 'var(--space-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {workshop.taller_nombre}
      </h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        {workshop.slots.map((slot) => (
          <SheetSlot
            key={`${fecha}-${slot.horario_id}-${slot.hora_inicio}`}
            slot={slot}
            fecha={fecha}
            isMobile={isMobile}
            cicloId={cicloId}
          />
        ))}
      </div>
    </div>
  );
});

interface SheetSlotProps {
  slot: HoraTrabajadaDetalleSlot;
  fecha: string;
  isMobile: boolean;
  cicloId: number;
}

const SheetSlot: React.FC<SheetSlotProps> = React.memo(({ slot, fecha, isMobile, cicloId }) => {
  const [expanded, setExpanded] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const { nota, save, saving, error, deleted } = useHorarioNotes({
    cicloId,
    horarioId: slot.horario_id,
    fecha,
    enabled: expanded,
  });

  const displayNote = deleted ? '' : (nota?.contenido ?? slot.nota_clase ?? '').trim();
  const hasNote = !deleted && displayNote.length > 0;
  const canEditNote = slot.horario_id > 0;

  // Close editor when clicking outside
  useEffect(() => {
    if (!expanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (noteRef.current && !noteRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };

    // Use mousedown to fire before the click
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded]);

  const handleSave = async (content: string) => {
    const ok = await save(content);
    if (ok) {
      setExpanded(false);
    }
  };

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: isMobile ? 'var(--space-3)' : 'var(--space-4)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-3)',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            background: 'var(--color-gold-glow)',
            color: 'var(--color-gold)',
            border: '1px solid var(--color-gold-border)',
            fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap',
          }}
        >
          {formatHora(slot.hora_inicio)}–{formatHora(slot.hora_fin)}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-base)',
            color: slot.es_sustituto ? 'var(--color-text-muted)' : 'var(--color-gold)',
            whiteSpace: 'nowrap',
          }}
        >
          {slot.es_sustituto ? (
            <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>
              {formatMonto(parseFloat(slot.monto_profesor || '0'))}
            </span>
          ) : (
            formatMonto(parseFloat(slot.monto_profesor || '0'))
          )}
        </span>
      </div>

      {slot.es_sustituto && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            background: 'rgba(212, 175, 55, 0.08)',
            color: 'var(--color-gold)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            marginBottom: 'var(--space-3)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Dictada por {slot.profesor_que_trabajo} — No se contabiliza en tu pago
        </div>
      )}

      {slot.alumnos.length === 0 ? (
        <p
          style={{
            fontSize: 'var(--text-sm)',
            fontStyle: 'italic',
            color: 'var(--color-text-muted)',
            margin: 0,
            marginBottom: 'var(--space-3)',
          }}
        >
          Sin alumnos registrados
        </p>
      ) : (
        <ul
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            margin: 0,
            marginBottom: 'var(--space-3)',
            padding: 0,
          }}
        >
          {slot.alumnos.map((alumno, index) => (
            <li
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: studentDotColor(alumno.estado),
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
              <span>{alumno.nombre_completo}</span>
            </li>
          ))}
        </ul>
      )}

      {canEditNote && (
        <div ref={noteRef} style={{ marginTop: 'var(--space-2)' }}>
          {expanded ? (
            /* ── Edit mode: inline textarea ── */
            <div>
              <NoteEditor
                value={displayNote}
                onSave={handleSave}
                onCancel={() => setExpanded(false)}
                placeholder="Escribe una nota para esta clase..."
                autoFocus
              />
              {saving && (
                <p
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    margin: 0,
                    marginTop: 'var(--space-2)',
                  }}
                >
                  Guardando...
                </p>
              )}
              {error && (
                <p
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-error)',
                    margin: 0,
                    marginTop: 'var(--space-2)',
                  }}
                >
                  {error}
                </p>
              )}
            </div>
          ) : hasNote ? (
            /* ── View mode: preview with click to edit ── */
            <button
              onClick={() => setExpanded(true)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                fontStyle: 'italic',
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.4,
                transition: 'border-color 150ms ease, background 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-gold)';
                e.currentTarget.style.background = 'var(--color-gold-glow)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.background = 'var(--color-bg)';
              }}
            >
              <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {displayNote}
              </span>
              <span style={{ display: 'block', marginTop: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'normal' }}>
                Click para editar
              </span>
            </button>
          ) : (
            /* ── No note: add button ── */
            <button
              onClick={() => setExpanded(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Agregar nota
            </button>
          )}
        </div>
      )}
    </div>
  );
});

export default React.memo(HoursWorkedSheet);
