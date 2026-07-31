import { memo, useState, useEffect } from 'react';
import { useStudentNotes } from '../../../hooks/useStudentNotes';

interface StudentNoteToggleProps {
  alumnoId: number;
  alumnoNombre: string;
  horarioId: number;
  fecha: string;
  cicloId: number;
  onSaved?: () => void;
}

const StudentNoteToggle = memo(({
  alumnoId,
  alumnoNombre,
  horarioId,
  fecha,
  cicloId,
  onSaved,
}: StudentNoteToggleProps) => {
  const [contenido, setContenido] = useState('');
  const { notas, saving, save } = useStudentNotes({ cicloId, horarioId, fecha });

  const existing = notas[alumnoId];

  // Seed textarea when existing note loads (by id, so different students re-seed)
  useEffect(() => {
    setContenido(existing?.contenido ?? '');
  }, [existing?.id]);

  const handleSave = async () => {
    await save(alumnoId, contenido);
    onSaved?.();
  };

  const isChanged = contenido !== (existing?.contenido ?? '');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      padding: 'var(--space-2) 0',
    }}>
      <div style={{
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        color: 'var(--color-text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Nota — {alumnoNombre}
      </div>
      <textarea
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        rows={2}
        placeholder="Escribe una nota sobre este alumno..."
        style={{
          width: '100%',
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--text-sm)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
          resize: 'vertical',
          minHeight: 48,
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />
      {isChanged && (
        <div style={{
          display: 'flex',
          gap: 'var(--space-2)',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={handleSave}
            disabled={saving || (!existing && !contenido.trim())}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-gold)',
              border: 'none',
              color: 'var(--color-dark-bg)',
              fontWeight: 600,
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              minHeight: 28,
              opacity: saving || (!existing && !contenido.trim()) ? 0.6 : 1,
              fontFamily: 'var(--font-body)',
            }}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      )}
    </div>
  );
});

StudentNoteToggle.displayName = 'StudentNoteToggle';

export default StudentNoteToggle;
