import { memo } from 'react';
import type { AlumnoInfo } from '../../../types';
import StudentNoteToggle from './StudentNoteToggle';

interface StudentListProps {
  alumnos: AlumnoInfo[];
  expandedAlumnoId: number | null;
  onToggleNota: (alumnoId: number) => void;
  horarioId: number;
  fecha: string;
  cicloId: number;
}

const StudentList = memo(({
  alumnos,
  expandedAlumnoId,
  onToggleNota,
  horarioId,
  fecha,
  cicloId,
}: StudentListProps) => {
  if (alumnos.length === 0) {
    return (
      <p style={{
        fontSize: 'var(--text-sm)',
        color: '#6b6b6b',
        margin: 0,
        padding: 'var(--space-1) 0',
      }}>
        No hay alumnos inscritos
      </p>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: 'var(--space-3)',
    }}>
      {alumnos.map((alumno, idx) => (
        <div key={alumno.id}>
          <button
            type="button"
            onClick={() => onToggleNota(alumno.id)}
            className="student-row"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-2) 0',
              borderBottom: idx < alumnos.length - 1 ? '1px solid var(--color-border-light)' : 'none',
              background: 'transparent',
              border: 'none',
              borderBottomStyle: 'solid',
              borderBottomWidth: idx < alumnos.length - 1 ? '1px' : '0',
              borderBottomColor: 'var(--color-border-light)',
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
              {alumno.apellido}, {alumno.nombre}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="edit-icon"
              style={{ flexShrink: 0, opacity: 0, transition: 'opacity 150ms ease' }}
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          {expandedAlumnoId === alumno.id && (
            <div style={{
              padding: 'var(--space-1) 0 var(--space-2)',
            }}>
              <StudentNoteToggle
                alumnoId={alumno.id}
                alumnoNombre={`${alumno.apellido}, ${alumno.nombre}`}
                horarioId={horarioId}
                fecha={fecha}
                cicloId={cicloId}
                onSaved={() => onToggleNota(alumno.id)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

StudentList.displayName = 'StudentList';

export default StudentList;
