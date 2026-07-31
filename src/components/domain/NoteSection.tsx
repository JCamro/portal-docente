import { memo, useState, useEffect, useCallback } from 'react';
import NoteEditor from './NoteEditor';
import {
  getNotasDia, createNotaDia, updateNotaDia, deleteNotaDia,
  getNotas, createNota, updateNota, deleteNota,
  getNotasAlumno, createNotaAlumno, updateNotaAlumno, deleteNotaAlumno,
  getHorarios,
} from '../../api/portalDocente';
import { formatDate } from '../../utils/formatters';
import type { NoteLevel, NoteSectionProps } from '../../types/alumnos';
import type { NotaDia, NotaClase, NotaAlumno, HorarioDetalle } from '../../types';

interface AccordionLevel {
  key: NoteLevel;
  label: string;
}

const LEVELS: AccordionLevel[] = [
  { key: 'general', label: 'General' },
  { key: 'dia', label: 'Día' },
  { key: 'taller', label: 'Taller' },
  { key: 'clase', label: 'Clase' },
  { key: 'alumno', label: 'Alumno' },
];

type NoteItem = {
  id: number;
  level: NoteLevel;
  content: string;
  date: string;
  context?: string;
};

/**
 * Five-level accordion notes section.
 * General, Día, Taller, Clase, Alumno.
 * Uses existing NoteEditor for inline CRUD.
 */
const NoteSection = memo<NoteSectionProps>(({
  alumnoId,
  cicloId,
  selectedDate,
  horarios,
}) => {
  const [expandedLevel, setExpandedLevel] = useState<NoteLevel | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, NoteItem[]>>({});
  const [addingLevel, setAddingLevel] = useState<NoteLevel | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [horariosList, setHorariosList] = useState<HorarioDetalle[]>(horarios);

  // Load horarios if not provided
  useEffect(() => {
    if (horarios.length > 0) {
      setHorariosList(horarios);
      return;
    }
    let cancelled = false;
    const fetch = async () => {
      try {
        const data = await getHorarios(cicloId);
        if (!cancelled) setHorariosList(data);
      } catch {
        // ignore
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [cicloId, horarios]);

  // Load notes when a level is expanded
  useEffect(() => {
    if (!expandedLevel) return;
    if (notes[expandedLevel]) return; // already loaded

    let cancelled = false;

    const loadNotes = async () => {
      setLoading((prev) => ({ ...prev, [expandedLevel]: true }));
      try {
        let items: NoteItem[] = [];

        switch (expandedLevel) {
          case 'dia': {
            const data = await getNotasDia(cicloId, { fecha: selectedDate });
            if (!cancelled) {
              items = data.map((n: NotaDia) => ({
                id: n.id,
                level: 'dia' as NoteLevel,
                content: n.contenido,
                date: selectedDate,
              }));
            }
            break;
          }
          case 'clase': {
            const data = await getNotas(cicloId, { fecha: selectedDate });
            if (!cancelled) {
              items = data.map((n: NotaClase) => ({
                id: n.id,
                level: 'clase' as NoteLevel,
                content: n.contenido,
                date: n.fecha,
                context: n.taller_nombre,
              }));
            }
            break;
          }
          case 'alumno': {
            const data = await getNotasAlumno(cicloId, { alumno_id: alumnoId });
            if (!cancelled) {
              items = data.map((n: NotaAlumno) => ({
                id: n.id,
                level: 'alumno' as NoteLevel,
                content: n.contenido,
                date: n.fecha,
              }));
            }
            break;
          }
          case 'general':
          case 'taller':
            // These levels may not have APIs yet — show empty state
            items = [];
            break;
        }

        if (!cancelled) {
          setNotes((prev) => ({ ...prev, [expandedLevel]: items }));
        }
      } catch {
        // ignore errors
      } finally {
        if (!cancelled) {
          setLoading((prev) => ({ ...prev, [expandedLevel]: false }));
        }
      }
    };

    loadNotes();
    return () => { cancelled = true; };
  }, [expandedLevel, cicloId, selectedDate, alumnoId, notes]);

  const handleToggleLevel = (level: NoteLevel) => {
    setExpandedLevel((prev) => prev === level ? null : level);
    setAddingLevel(null);
    setEditingNoteId(null);
  };

  const handleSaveNewNote = useCallback(async (level: NoteLevel, content: string) => {
    try {
      let newItem: NoteItem | null = null;

      switch (level) {
        case 'dia': {
          const created = await createNotaDia(cicloId, { fecha: selectedDate, contenido: content });
          newItem = { id: created.id, level: 'dia', content: created.contenido, date: selectedDate };
          break;
        }
        case 'clase': {
          const firstHorario = horariosList[0];
          if (!firstHorario) return;
          const created = await createNota(cicloId, {
            horario: firstHorario.id,
            fecha: selectedDate,
            contenido: content,
          });
          newItem = { id: created.id, level: 'clase', content: created.contenido, date: created.fecha, context: created.taller_nombre };
          break;
        }
        case 'alumno': {
          const firstHorario = horariosList[0];
          if (!firstHorario) return;
          const created = await createNotaAlumno(cicloId, {
            horario: firstHorario.id,
            alumno: alumnoId,
            fecha: selectedDate,
            contenido: content,
          });
          newItem = { id: created.id, level: 'alumno', content: created.contenido, date: created.fecha };
          break;
        }
      }

      if (newItem) {
        setNotes((prev) => ({
          ...prev,
          [level]: [...(prev[level] || []), newItem!],
        }));
        setAddingLevel(null);
      }
    } catch {
      // ignore
    }
  }, [cicloId, selectedDate, alumnoId, horariosList]);

  const handleEditNote = useCallback(async (level: NoteLevel, noteId: number, content: string) => {
    try {
      switch (level) {
        case 'dia': {
          await updateNotaDia(cicloId, noteId, { contenido: content });
          break;
        }
        case 'clase': {
          await updateNota(cicloId, noteId, { contenido: content });
          break;
        }
        case 'alumno': {
          await updateNotaAlumno(cicloId, noteId, { contenido: content });
          break;
        }
      }

      setNotes((prev) => ({
        ...prev,
        [level]: (prev[level] || []).map((n) =>
          n.id === noteId ? { ...n, content } : n
        ),
      }));
      setEditingNoteId(null);
    } catch {
      // ignore
    }
  }, [cicloId]);

  const handleDeleteNote = useCallback(async (level: NoteLevel, noteId: number) => {
    try {
      switch (level) {
        case 'dia':
          await deleteNotaDia(cicloId, noteId);
          break;
        case 'clase':
          await deleteNota(cicloId, noteId);
          break;
        case 'alumno':
          await deleteNotaAlumno(cicloId, noteId);
          break;
      }

      setNotes((prev) => ({
        ...prev,
        [level]: (prev[level] || []).filter((n) => n.id !== noteId),
      }));
    } catch {
      // ignore
    }
  }, [cicloId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      {(LEVELS as AccordionLevel[]).map((level) => {
        const isExpanded = expandedLevel === level.key;
        const levelNotes = notes[level.key] || [];
        const count = levelNotes.length;
        const isLoading = loading[level.key];

        return (
          <div
            key={level.key}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            {/* Accordion header */}
            <button
              onClick={() => handleToggleLevel(level.key)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                border: 'none',
                background: isExpanded ? 'var(--color-gold-glow)' : 'transparent',
                color: 'var(--color-text)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                minHeight: 44,
                transition: 'background 0.15s',
              }}
              aria-expanded={isExpanded}
              aria-label={`${level.label} - ${count} notas`}
            >
              <span>{level.label}</span>
              <span style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-md)',
                fontSize: 10,
                fontWeight: 600,
                background: count > 0 ? 'var(--color-gold-glow)' : 'transparent',
                color: count > 0 ? 'var(--color-gold)' : 'var(--color-text-muted)',
                border: count > 0 ? 'none' : '1px solid var(--color-border)',
              }}>
                {isLoading ? '...' : `Notas (${count})`}
              </span>
            </button>

            {/* Accordion content */}
            {isExpanded && (
              <div style={{
                padding: 'var(--space-3) var(--space-4)',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}>
                {/* Loading state */}
                {isLoading && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
                    Cargando notas...
                  </p>
                )}

                {/* Empty state */}
                {!isLoading && count === 0 && (
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    textAlign: 'center',
                    margin: 0,
                    padding: 'var(--space-2) 0',
                  }}>
                    {level.key === 'general' || level.key === 'taller'
                      ? 'Nivel de notas no disponible'
                      : 'No hay notas para este nivel.'}
                  </p>
                )}

                {/* Note list */}
                {!isLoading && levelNotes.map((note) => (
                  <div key={note.id}>
                    {editingNoteId === note.id ? (
                      <NoteEditor
                        value={note.content}
                        onSave={async (content) => {
                          await handleEditNote(level.key, note.id, content);
                        }}
                        onCancel={() => setEditingNoteId(null)}
                        placeholder="Edita tu nota..."
                        autoFocus
                      />
                    ) : (
                      <div style={{
                        padding: 'var(--space-2) var(--space-3)',
                        background: 'var(--color-bg)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                      }}>
                        <p style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text)',
                          margin: 0,
                          marginBottom: 'var(--space-1)',
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.5,
                        }}>
                          {note.content}
                        </p>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>
                            {formatDate(note.date)}
                            {note.context && ` · ${note.context}`}
                          </span>
                          <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                            <button
                              onClick={() => setEditingNoteId(note.id)}
                              style={{
                                padding: 'var(--space-1)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                background: 'transparent',
                                color: 'var(--color-text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: 28,
                                minWidth: 28,
                              }}
                              aria-label="Editar nota"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteNote(level.key, note.id)}
                              style={{
                                padding: 'var(--space-1)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                background: 'transparent',
                                color: '#fca5a5',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: 28,
                                minWidth: 28,
                              }}
                              aria-label="Eliminar nota"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add button or inline form */}
                {addingLevel === level.key ? (
                  <NoteEditor
                    value=""
                    onSave={async (content) => {
                      await handleSaveNewNote(level.key, content);
                    }}
                    onCancel={() => setAddingLevel(null)}
                    placeholder={`Escribe una nota de nivel "${level.label}"...`}
                    autoFocus
                  />
                ) : (
                  level.key !== 'general' && level.key !== 'taller' && (
                    <button
                      onClick={() => setAddingLevel(level.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px dashed var(--color-border)',
                        background: 'transparent',
                        color: 'var(--color-text-muted)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        minHeight: 36,
                        width: '100%',
                        justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-gold)';
                        e.currentTarget.style.color = 'var(--color-gold)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.color = 'var(--color-text-muted)';
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Agregar
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

NoteSection.displayName = 'NoteSection';

export default NoteSection;
