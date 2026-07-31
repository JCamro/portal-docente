import { memo, useState } from 'react';
import type { HorarioSemanalConTaller, AlumnoResumenEntry } from '../../../types';
import { ESTADO_ASISTENCIA_MAP } from '../../../utils/constants';
import StudentNoteToggle from './StudentNoteToggle';
import ClassNote from './ClassNote';

interface HorarioCardExpandedProps {
  schedule: HorarioSemanalConTaller;
  fecha: string;
  cicloId: number;
  registros: AlumnoResumenEntry[];
  modo: 'pasado' | 'hoy' | 'futuro';
  aviso: string | null;
  loading: boolean;
}

const sectionLabel: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
  fontSize: 'var(--text-xs)',
  fontWeight: 700,
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 'var(--space-2)',
};

const sectionAccent: React.CSSProperties = {
  width: 3,
  height: 12,
  background: 'var(--color-gold)',
  borderRadius: 2,
  flexShrink: 0,
};

const sectionBlock: React.CSSProperties = {
  paddingBottom: 'var(--space-5)',
  marginBottom: 'var(--space-3)',
};

const disclaimerText: React.CSSProperties = {
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-muted)',
  fontStyle: 'italic',
  marginTop: 'var(--space-2)',
  paddingLeft: 'var(--space-3)',
};

const emptyMessage: React.CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: '#6b6b6b',
  margin: 0,
  padding: 'var(--space-1) 0 var(--space-1) var(--space-3)',
};

const badgeStyle = (color: string, bg: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-1)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  color,
  padding: '2px var(--space-2)',
  borderRadius: 'var(--radius-sm)',
  background: bg,
});

const recoveryBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  color: '#7c3aed',
  padding: '2px var(--space-2)',
  borderRadius: 'var(--radius-sm)',
  background: '#ede9fe',
};

const sinRegistroStyle: React.CSSProperties = {
  fontSize: 'var(--text-xs)',
  fontWeight: 500,
  color: '#9ca3af',
  padding: '2px var(--space-2)',
};

function RegistroRow({
  registro,
  isExpanded,
  onToggle,
  horarioId,
  fecha,
  cicloId,
  showEstado,
}: {
  registro: AlumnoResumenEntry;
  isExpanded: boolean;
  onToggle: () => void;
  horarioId: number;
  fecha: string;
  cicloId: number;
  showEstado: boolean;
}) {
  const estadoMeta = registro.estado_asistencia
    ? ESTADO_ASISTENCIA_MAP[registro.estado_asistencia]
    : null;

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) 0',
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid var(--color-border-light)',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'var(--font-body)',
          transition: 'background 150ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <span style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          color: 'var(--color-text)',
        }}>
          {registro.apellido}, {registro.nombre}
        </span>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
        }}>
          {showEstado && estadoMeta && (
            <span style={badgeStyle(estadoMeta.color, estadoMeta.bg)}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: estadoMeta.color,
                display: 'inline-block',
              }} />
              {estadoMeta.label}
            </span>
          )}
          {showEstado && registro.es_recuperacion && (
            <span style={recoveryBadgeStyle}>Recuperación</span>
          )}
          {showEstado && !estadoMeta && (
            <span style={sinRegistroStyle}>Sin registro</span>
          )}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, opacity: 0, transition: 'opacity 150ms ease' }}
            className="edit-icon"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </span>
      </button>
      {isExpanded && (
        <div style={{
          padding: 'var(--space-1) 0 var(--space-2)',
        }}>
          <StudentNoteToggle
            alumnoId={registro.alumno_id}
            alumnoNombre={`${registro.apellido}, ${registro.nombre}`}
            horarioId={horarioId}
            fecha={fecha}
            cicloId={cicloId}
            onSaved={onToggle}
          />
        </div>
      )}
    </div>
  );
}

const HorarioCardExpanded = memo(({
  schedule, fecha, cicloId, registros, modo, aviso, loading: attendanceLoading,
}: HorarioCardExpandedProps) => {
  const [expandedAlumnoId, setExpandedAlumnoId] = useState<number | null>(null);

  const isEmpty = registros.length === 0;

  return (
    <div style={{
      background: 'var(--color-surface)',
      padding: 'var(--space-4) var(--space-10)',
      paddingLeft: 'calc(var(--space-4) + 20px)',
      paddingBottom: '40px',
      borderBottom: '2px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideDown 0.2s ease-out',
    }}>
      {/* HOY: Una sola sección unificada */}
      {modo === 'hoy' && (
        <div style={sectionBlock}>
          <div style={sectionLabel}>
            <span style={sectionAccent} />
            Asistencia de hoy
          </div>
          {attendanceLoading ? (
            <p style={emptyMessage}>Cargando...</p>
          ) : isEmpty ? (
            <p style={emptyMessage}>No hay alumnos inscritos en este horario</p>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              paddingLeft: 'var(--space-3)',
            }}>
              {registros.map((registro) => (
                <RegistroRow
                  key={registro.alumno_id}
                  registro={registro}
                  isExpanded={expandedAlumnoId === registro.alumno_id}
                  onToggle={() => setExpandedAlumnoId(
                    expandedAlumnoId === registro.alumno_id ? null : registro.alumno_id
                  )}
                  horarioId={schedule.id}
                  fecha={fecha}
                  cicloId={cicloId}
                  showEstado={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* PASADO: Solo asistencia */}
      {modo === 'pasado' && (
        <div style={sectionBlock}>
          <div style={sectionLabel}>
            <span style={sectionAccent} />
            Asistencia
          </div>
          {attendanceLoading ? (
            <p style={emptyMessage}>Cargando...</p>
          ) : isEmpty ? (
            <p style={emptyMessage}>No hay registros de asistencia</p>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              paddingLeft: 'var(--space-3)',
            }}>
              {registros.map((registro) => (
                <RegistroRow
                  key={registro.alumno_id}
                  registro={registro}
                  isExpanded={expandedAlumnoId === registro.alumno_id}
                  onToggle={() => setExpandedAlumnoId(
                    expandedAlumnoId === registro.alumno_id ? null : registro.alumno_id
                  )}
                  horarioId={schedule.id}
                  fecha={fecha}
                  cicloId={cicloId}
                  showEstado={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* FUTURO: Solo inscritos */}
      {modo === 'futuro' && (
        <div style={sectionBlock}>
          <div style={sectionLabel}>
            <span style={sectionAccent} />
            Alumnos inscritos
          </div>
          {attendanceLoading ? (
            <p style={emptyMessage}>Cargando...</p>
          ) : isEmpty ? (
            <p style={emptyMessage}>No hay alumnos inscritos</p>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              paddingLeft: 'var(--space-3)',
            }}>
              {registros.map((registro) => (
                <RegistroRow
                  key={registro.alumno_id}
                  registro={registro}
                  isExpanded={expandedAlumnoId === registro.alumno_id}
                  onToggle={() => setExpandedAlumnoId(
                    expandedAlumnoId === registro.alumno_id ? null : registro.alumno_id
                  )}
                  horarioId={schedule.id}
                  fecha={fecha}
                  cicloId={cicloId}
                  showEstado={false}
                />
              ))}
            </div>
          )}
          {aviso && <p style={disclaimerText}>{aviso}</p>}
        </div>
      )}

      <div>
        <div style={sectionLabel}>
          <span style={sectionAccent} />
          Nota de la clase
        </div>
        <ClassNote horarioId={schedule.id} fecha={fecha} cicloId={cicloId} />
      </div>
    </div>
  );
});

HorarioCardExpanded.displayName = 'HorarioCardExpanded';

export default HorarioCardExpanded;
