import React, { memo, useMemo } from 'react';
import type { HorarioDetalle } from '../../types';
import { DIA_SEMANA_MAP, formatHora } from '../../utils/constants';

interface NotesFilterBarProps {
  horarios: HorarioDetalle[];
  tallerFilter: number | null;
  horaFilter: number | null;
  onTallerChange: (tallerId: number | null) => void;
  onHoraChange: (horaIndex: number | null) => void;
}

/**
 * Filter bar for notes page.
 * Provides taller and hora dropdown filters derived from the profesor's horarios.
 */
const NotesFilterBar = memo<NotesFilterBarProps>(({
  horarios,
  tallerFilter,
  horaFilter,
  onTallerChange,
  onHoraChange,
}) => {
  // Unique talleres from horarios
  const talleres = useMemo(() => {
    const map = new Map<number, string>();
    for (const h of horarios) {
      if (h.taller_id && !map.has(h.taller_id)) {
        map.set(h.taller_id, h.taller_nombre);
      }
    }
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [horarios]);

  // Unique hour slots from horarios
  const horas = useMemo(() => {
    const set = new Set<string>();
    for (const h of horarios) {
      set.add(`${h.hora_inicio}-${h.hora_fin}`);
    }
    return Array.from(set).sort().map((slot, idx) => ({
      index: idx,
      label: `${formatHora(slot.split('-')[0])} - ${formatHora(slot.split('-')[1])}`,
      slot,
    }));
  }, [horarios]);

  // Hora index mapping
  const horaIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    horas.forEach((h) => map.set(h.slot, h.index));
    return map;
  }, [horas]);

  const currentHoraSlot = horaFilter !== null ? horas[horaFilter]?.slot : null;

  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-3)',
      flexWrap: 'wrap',
      marginBottom: 'var(--space-4)',
    }}>
      {/* Taller filter */}
      <select
        value={tallerFilter ?? ''}
        onChange={(e) => onTallerChange(e.target.value ? Number(e.target.value) : null)}
        style={{
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--text-sm)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
          minWidth: 160,
        }}
      >
        <option value="">Todos los talleres</option>
        {talleres.map((t) => (
          <option key={t.id} value={t.id}>{t.nombre}</option>
        ))}
      </select>

      {/* Hora filter */}
      <select
        value={currentHoraSlot ?? ''}
        onChange={(e) => {
          const slot = e.target.value;
          if (!slot) {
            onHoraChange(null);
          } else {
            const idx = horaIndexMap.get(slot);
            onHoraChange(idx ?? null);
          }
        }}
        style={{
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--text-sm)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
          minWidth: 160,
        }}
      >
        <option value="">Todos los horarios</option>
        {horas.map((h) => (
          <option key={h.index} value={h.slot}>{h.label}</option>
        ))}
      </select>
    </div>
  );
});

NotesFilterBar.displayName = 'NotesFilterBar';

export default NotesFilterBar;
