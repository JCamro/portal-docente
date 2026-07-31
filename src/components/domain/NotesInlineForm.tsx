import { memo, useState, useMemo } from 'react';
import type { HorarioDetalle } from '../../types';
import { DIA_SEMANA_MAP, formatHora } from '../../utils/constants';
import { getTodayString } from '../../utils/formatters';

interface NotesInlineFormProps {
  horarios: HorarioDetalle[];
  initialContenido?: string;
  initialHorarioId?: number | null;
  saving?: boolean;
  onSave: (data: { horario: number; fecha: string; contenido: string }) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

/**
 * Inline create/edit form for NotaClase.
 * Embedded in the notes list — no modal or side panel needed.
 */
const NotesInlineForm = memo<NotesInlineFormProps>(({
  horarios,
  initialContenido = '',
  initialHorarioId = null,
  saving = false,
  onSave,
  onCancel,
  isEditing = false,
}) => {
  const [contenido, setContenido] = useState(initialContenido);
  const [selectedTallerId, setSelectedTallerId] = useState<number | null>(() => {
    if (initialHorarioId) {
      const h = horarios.find((h) => h.id === initialHorarioId);
      return h?.taller_id ?? null;
    }
    return null;
  });
  const [selectedHorarioId, setSelectedHorarioId] = useState<number | null>(initialHorarioId);

  // Unique talleres
  const talleres = useMemo(() => {
    const map = new Map<number, string>();
    for (const h of horarios) {
      if (h.taller_id && !map.has(h.taller_id)) {
        map.set(h.taller_id, h.taller_nombre);
      }
    }
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [horarios]);

  // Horarios filtered by selected taller
  const horariosFiltrados = useMemo(() => {
    if (!selectedTallerId) return horarios;
    return horarios.filter((h) => h.taller_id === selectedTallerId);
  }, [horarios, selectedTallerId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHorarioId || !contenido.trim()) return;

    onSave({
      horario: selectedHorarioId,
      fecha: getTodayString(),
      contenido: contenido.trim(),
    });
  };

  const isValid = selectedHorarioId && contenido.trim();

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      border: '1px solid var(--color-gold)',
      marginBottom: 'var(--space-4)',
    }}>
      <h4 style={{
        fontSize: 'var(--text-sm)',
        fontWeight: 700,
        color: 'var(--color-gold)',
        fontFamily: 'var(--font-heading)',
        margin: 0,
        marginBottom: 'var(--space-3)',
      }}>
        {isEditing ? 'Editar nota' : 'Nueva nota'}
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Taller dropdown */}
        <select
          value={selectedTallerId ?? ''}
          onChange={(e) => {
            setSelectedTallerId(e.target.value ? Number(e.target.value) : null);
            setSelectedHorarioId(null);
          }}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--text-sm)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <option value="">Selecciona un taller</option>
          {talleres.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>

        {/* Horario dropdown */}
        <select
          value={selectedHorarioId ?? ''}
          onChange={(e) => setSelectedHorarioId(e.target.value ? Number(e.target.value) : null)}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--text-sm)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <option value="">Selecciona un horario</option>
          {horariosFiltrados.map((h) => (
            <option key={h.id} value={h.id}>
              {DIA_SEMANA_MAP[h.dia_semana]} {formatHora(h.hora_inicio)} - {formatHora(h.hora_fin)}
            </option>
          ))}
        </select>

        {/* Contenido textarea */}
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          rows={3}
          placeholder="Escribe tu nota..."
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            fontSize: 'var(--text-sm)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-body)',
            resize: 'vertical',
            minHeight: 60,
            boxSizing: 'border-box',
          }}
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-text-muted)',
                fontWeight: 500,
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                minHeight: 44,
              }}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={saving || !isValid}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
              border: 'none',
              color: '#0a0a0a',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              minHeight: 44,
              opacity: saving || !isValid ? 0.6 : 1,
            }}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </form>
  );
});

NotesInlineForm.displayName = 'NotesInlineForm';

export default NotesInlineForm;
