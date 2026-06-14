import React, { useState } from 'react';

interface NoteEditorProps {
  value: string;
  onSave: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  value,
  onSave,
  onCancel,
  placeholder = 'Escribe una nota...',
  autoFocus = false,
}) => {
  const [content, setContent] = useState(value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await onSave(content.trim());
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = content !== value;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          width: '100%',
          padding: 'var(--space-3) var(--space-4)',
          fontSize: 'var(--text-sm)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
          resize: 'vertical',
          minHeight: 72,
          boxSizing: 'border-box',
        }}
      />
      {hasChanges && (
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
              border: 'none',
              color: '#0a0a0a',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              minHeight: 36,
              opacity: saving || !content.trim() ? 0.6 : 1,
            }}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
                fontWeight: 500,
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                minHeight: 36,
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(NoteEditor);
