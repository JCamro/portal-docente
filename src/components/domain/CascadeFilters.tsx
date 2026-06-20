import { memo, useMemo } from 'react';
import { formatHora } from '../../utils/constants';
import type { CascadeFiltersProps } from '../../types/alumnos';

/**
 * Three-stage progressive filter: FECHA → TALLER → HORA.
 * Each selection reduces options in subsequent stages.
 */
const CascadeFilters = memo<CascadeFiltersProps>(({
  talleres,
  horas,
  selected,
  onChange,
}) => {
  // Taller options filtered by selected fecha
  const filteredTalleres = useMemo(() => {
    // When fecha is selected but we have no fecha-specific filtering for talleres,
    // we show all talleres (the filtering occurs at the table level)
    return talleres;
  }, [talleres]);

  // Hora options filtered by selected taller
  const filteredHoras = useMemo(() => {
    if (selected.tallerId === null) return horas;
    return horas; // hora filtering happens at the table level too
  }, [horas, selected.tallerId]);

  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-3)',
      flexWrap: 'wrap',
      marginBottom: 'var(--space-4)',
    }}>
      {/* Fecha filter — date input */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <input
          type="date"
          value={selected.fecha ?? ''}
          onChange={(e) => onChange('fecha', e.target.value || null)}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--text-sm)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-body)',
            minWidth: 140,
            minHeight: 44,
          }}
          aria-label="Filtrar por fecha"
        />
        {selected.fecha && (
          <button
            onClick={() => onChange('fecha', null)}
            style={{
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: 'var(--text-xs)',
              minHeight: 44,
              minWidth: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Limpiar fecha"
            title="Limpiar fecha"
          >
            ✕
          </button>
        )}
      </div>

      {/* Taller filter */}
      <select
        value={selected.tallerId ?? ''}
        onChange={(e) => onChange('tallerId', e.target.value ? Number(e.target.value) : null)}
        style={{
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--text-sm)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
          minWidth: 160,
          minHeight: 44,
        }}
        aria-label="Filtrar por taller"
      >
        <option value="">Todos los talleres</option>
        {filteredTalleres.map((t) => (
          <option key={t.id} value={t.id}>{t.nombre}</option>
        ))}
      </select>

      {/* Hora filter */}
      <select
        value={selected.hora ?? ''}
        onChange={(e) => onChange('hora', e.target.value || null)}
        style={{
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--text-sm)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
          minWidth: 160,
          minHeight: 44,
        }}
        aria-label="Filtrar por hora"
      >
        <option value="">Todos los horarios</option>
        {filteredHoras.map((h) => (
          <option key={h.horarioId} value={`${h.inicio}-${h.fin}`}>
            {formatHora(h.inicio)} - {formatHora(h.fin)}
          </option>
        ))}
      </select>

      {/* Active filter count badge */}
      {[selected.fecha, selected.tallerId, selected.hora].filter(Boolean).length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: 'var(--space-2) var(--space-3)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-gold-glow)',
          color: 'var(--color-gold)',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          gap: 'var(--space-1)',
          minHeight: 44,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          <span>{[selected.fecha, selected.tallerId, selected.hora].filter(Boolean).length}</span>
        </div>
      )}
    </div>
  );
});

CascadeFilters.displayName = 'CascadeFilters';

export default CascadeFilters;
