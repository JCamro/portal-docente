import { memo, useState, useMemo } from 'react';
import type { CascadeFiltersProps } from '../../types/alumnos';

/**
 * Cascade filters for student roster.
 * All filters dispatch to URL and are applied server-side.
 * - Search: text input with confirm button (Enter or click)
 * - Estado toggle: Activos / Históricos / Todos
 * - Taller: dropdown from profesor's horarios
 * - Día de semana: date picker converts to dia_semana (0-6)
 */
const CascadeFilters = memo<CascadeFiltersProps>(({
  talleres,
  selected,
  onChange,
}) => {
  // Local search state — only dispatched on confirm (Enter or button click)
  const [searchInput, setSearchInput] = useState(selected.search ?? '');

  // Sync local state if search is cleared externally (e.g., reset)
  const searchActive = selected.search && selected.search.length > 0;
  const displaySearch = searchActive ? selected.search : searchInput;

  const handleSearchConfirm = () => {
    const trimmed = searchInput.trim();
    onChange('search', trimmed || null);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchConfirm();
    }
  };

  const handleSearchClear = () => {
    setSearchInput('');
    onChange('search', null);
  };
  const hasActiveFilters = [
    selected.search,
    selected.estado,
    selected.tallerId,
  ].some(Boolean);

  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-3)',
      flexWrap: 'wrap',
      marginBottom: 'var(--space-4)',
      alignItems: 'center',
    }}>
      {/* Search input with confirm button */}
      <div style={{ position: 'relative', flex: 1, minWidth: 200, display: 'flex', gap: 0 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            value={displaySearch ?? ''}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Buscar por nombre, apellido o DNI..."
            style={{
              padding: 'var(--space-2) var(--space-3)',
              paddingLeft: 32,
              paddingRight: searchActive ? 28 : 8,
              fontSize: 'var(--text-sm)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
              minHeight: 44,
              width: '100%',
              boxSizing: 'border-box',
            }}
            aria-label="Buscar alumnos"
          />
          <svg
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }}
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {searchActive && (
            <button
              onClick={handleSearchClear}
              style={{
                position: 'absolute',
                right: 4,
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '2px 6px',
                border: 'none',
                background: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                fontSize: 14,
                lineHeight: 1,
              }}
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={handleSearchConfirm}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            border: '1px solid var(--color-border)',
            borderLeft: 'none',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            background: 'var(--color-surface)',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap',
            minHeight: 44,
          }}
          aria-label="Buscar"
        >
          Buscar
        </button>
      </div>

      {/* Estado toggle */}
      <div style={{
        display: 'flex',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        minHeight: 44,
      }}>
        {(['todos', 'activo', 'historico'] as const).map((value) => {
          const isActive = (selected.estado || 'todos') === value;
          return (
            <button
              key={value}
              onClick={() => onChange('estado', value === 'todos' ? null : value)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                border: 'none',
                borderRight: value !== 'historico' ? '1px solid var(--color-border)' : 'none',
                background: isActive ? 'var(--color-gold-glow)' : 'transparent',
                color: isActive ? 'var(--color-gold)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
              aria-label={`Filtrar ${value === 'todos' ? 'todos' : value === 'activo' ? 'activos' : 'históricos'}`}
            >
              {value === 'todos' ? 'Todos' : value === 'activo' ? 'Activos' : 'Históricos'}
            </button>
          );
        })}
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
        {talleres.map((t) => (
          <option key={t.id} value={t.id}>{t.nombre}</option>
        ))}
      </select>

      {/* Active filter count badge */}
      {hasActiveFilters && (
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
          <span>{[selected.search, selected.estado, selected.tallerId].filter(Boolean).length} filtro(s)</span>
        </div>
      )}
    </div>
  );
});

CascadeFilters.displayName = 'CascadeFilters';

export default CascadeFilters;
