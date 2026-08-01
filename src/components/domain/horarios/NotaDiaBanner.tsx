import { memo, useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { getNotasDia, createNotaDia, updateNotaDia, deleteNotaDia } from '../../../api/portalDocente';
import type { NotaDia } from '../../../types';

interface NotaDiaBannerProps {
  fecha: string;
}

const NotaDiaBanner = memo(({ fecha }: NotaDiaBannerProps) => {
  const cicloId = useAuthStore((s) => s.cicloActivo?.id);
  const [nota, setNota] = useState<NotaDia | null>(null);
  const [contenido, setContenido] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchNota = useCallback(async () => {
    if (!cicloId) return;
    setLoading(true);
    try {
      const res = await getNotasDia(cicloId, { fecha });
      if (res.results.length > 0) {
        setNota(res.results[0]);
        setContenido(res.results[0].contenido);
      } else {
        setNota(null);
        setContenido('');
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [cicloId, fecha]);

  useEffect(() => {
    fetchNota();
  }, [fetchNota]);

  if (!cicloId) return null;

  const handleSave = async () => {
    const trimmed = contenido.trim();
    if (!nota && !trimmed) return;
    setSaving(true);
    try {
      if (nota && !trimmed) {
        await deleteNotaDia(cicloId, nota.id);
        setNota(null);
      } else if (nota) {
        const updated = await updateNotaDia(cicloId, nota.id, { contenido: trimmed });
        setNota(updated);
      } else {
        const created = await createNotaDia(cicloId, { titulo: `Nota ${fecha}`, contenido: trimmed });
        setNota(created);
      }
      setIsEditing(false);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  if (!isEditing && !nota && !loading) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: 'var(--space-2) var(--space-3)',
          background: 'transparent',
          border: '1px dashed var(--color-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          transition: 'border-color 150ms ease, color 150ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-gold)';
          e.currentTarget.style.color = 'var(--color-gold-dark)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)';
          e.currentTarget.style.color = 'var(--color-text-muted)';
        }}
      >
        + Nota del día
      </button>
    );
  }

  if (!isEditing && nota) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: 'var(--space-2) var(--space-3)',
          background: 'var(--color-surface-hover)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text)',
          fontSize: 'var(--text-sm)',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          transition: 'background 150ms ease',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-2)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#ebebeb'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-surface-hover)'; }}
      >
        <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', flexShrink: 0, lineHeight: 1.5 }}>
          Nota:
        </span>
        <span style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          lineHeight: 1.5,
          flex: 1,
        }}>
          {nota.contenido}
        </span>
      </button>
    );
  }

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
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        rows={4}
        placeholder="Nota del día..."
        autoFocus
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
        }}
      />
      <div style={{
        display: 'flex',
        gap: 'var(--space-2)',
        justifyContent: 'flex-end',
      }}>
        <button
          onClick={() => setIsEditing(false)}
          style={{
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            minHeight: 28,
            fontFamily: 'var(--font-body)',
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving || (!nota && !contenido.trim())}
          style={{
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-gold)',
            border: 'none',
            color: 'var(--color-dark-bg)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            minHeight: 28,
            opacity: saving || (!nota && !contenido.trim()) ? 0.5 : 1,
            fontFamily: 'var(--font-body)',
          }}
        >
          {saving ? '...' : nota ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </div>
  );
});

NotaDiaBanner.displayName = 'NotaDiaBanner';

export default NotaDiaBanner;
