import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { useHorarioNotes } from '../../../hooks/useHorarioNotes';

interface ClassNoteProps {
  horarioId: number;
  fecha: string;
  cicloId: number;
  onSaved?: () => void;
}

const Spinner = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    style={{ animation: 'spin 0.7s linear infinite' }}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const ClassNote = memo(({ horarioId, fecha, cicloId, onSaved }: ClassNoteProps) => {
  const { nota, loading, saving, error, save } = useHorarioNotes({ cicloId, horarioId, fecha });

  const [isOpen, setIsOpen] = useState(false);
  const [editValue, setEditValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync edit value when nota loads
  useEffect(() => {
    if (!loading) {
      setEditValue(nota?.contenido ?? '');
    }
  }, [nota, loading]);

  // Reset on horario/fecha change
  useEffect(() => {
    setIsOpen(false);
    setEditValue('');
  }, [horarioId, fecha]);

  const isEmpty = editValue.trim().length === 0;
  const hasNote = nota !== null && nota.contenido.trim().length > 0;

  const handleSave = useCallback(async () => {
    const ok = await save(editValue);
    if (ok) {
      setIsOpen(false);
      onSaved?.();
    }
  }, [save, editValue, onSaved]);

  const handleOpen = useCallback(() => {
    setEditValue(nota?.contenido ?? '');
    setIsOpen(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, [nota]);

  const handleCancel = useCallback(() => {
    setEditValue(nota?.contenido ?? '');
    setIsOpen(false);
  }, [nota]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleCancel();
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSave();
  }, [handleCancel, handleSave]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-1) var(--space-2)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-muted)',
      }}>
        <Spinner />
        <span>Cargando nota...</span>
      </div>
    );
  }

  // Collapsed: show note preview or placeholder
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-3)',
          background: hasNote ? 'var(--color-surface-hover)' : 'transparent',
          border: `1px solid ${hasNote ? 'var(--color-border)' : '1px dashed var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          width: '100%',
          textAlign: 'left',
          transition: 'background 150ms ease, border-color 150ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#ebebeb'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = hasNote ? 'var(--color-surface-hover)' : 'transparent'; }}
      >
        <span style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          flexShrink: 0,
          lineHeight: 1.5,
        }}>
          Nota:
        </span>
        <span style={{
          fontSize: 'var(--text-sm)',
          color: hasNote ? 'var(--color-text)' : '#9ca3af',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          flex: 1,
          lineHeight: 1.5,
        }}>
          {hasNote ? nota.contenido : 'Agregar nota...'}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
    );
  }

  // Expanded: edit mode
  return (
    <div style={{
      padding: 'var(--space-3)',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
    }}>
      <textarea
        ref={textareaRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={4}
        placeholder="Nota de la clase..."
        autoFocus
        disabled={saving}
        className="note-textarea"
        style={{
          width: '100%',
          padding: 'var(--space-2)',
          fontSize: 'var(--text-sm)',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          background: 'transparent',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
          resize: 'vertical',
          minHeight: 100,
          maxHeight: 200,
          overflow: 'auto',
          boxSizing: 'border-box',
          outline: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          lineHeight: 1.5,
          opacity: saving ? 0.6 : 1,
        }}
      />

      {error && (
        <span style={{ fontSize: 'var(--text-xs)', color: '#ef4444' }}>{error}</span>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          style={{
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
            fontSize: 'var(--text-sm)',
            cursor: saving ? 'default' : 'pointer',
            minHeight: 28,
            fontFamily: 'var(--font-body)',
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving || (!hasNote && isEmpty)}
          style={{
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-gold)',
            border: 'none',
            color: 'var(--color-dark-bg)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            cursor: saving || (!hasNote && isEmpty) ? 'default' : 'pointer',
            minHeight: 28,
            opacity: saving || (!hasNote && isEmpty) ? 0.5 : 1,
            fontFamily: 'var(--font-body)',
          }}
        >
          {saving ? '...' : hasNote ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </div>
  );
});

ClassNote.displayName = 'ClassNote';

export default ClassNote;
