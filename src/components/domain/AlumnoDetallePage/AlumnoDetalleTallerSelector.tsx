import { memo } from 'react';
import type { TallerActivo } from '../../../types';

interface Props {
  talleres: TallerActivo[];
  selectedTallerId: number | null;
  onSelect: (id: number | null) => void;
}

const AlumnoDetalleTallerSelector = memo(({ talleres, selectedTallerId, onSelect }: Props) => {
  if (talleres.length <= 1) return null;

  return (
    <div>
      <div style={{
        fontSize: 'var(--text-lg)',
        fontWeight: 700,
        color: 'var(--color-text)',
        marginBottom: 'var(--space-4)',
      }}>
        Seleccionar Taller
      </div>
      <select
        value={selectedTallerId ?? ''}
        onChange={(e) => onSelect(e.target.value ? Number(e.target.value) : null)}
        style={{
          padding: 'var(--space-3) var(--space-4)',
          fontSize: 'var(--text-base)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
          minHeight: 44,
          width: '100%',
        }}
        aria-label="Seleccionar taller"
      >
        <option value="">Selecciona un taller...</option>
        {talleres.map((t: TallerActivo) => (
          <option key={t.matricula_id} value={t.taller_id}>{t.taller_nombre}</option>
        ))}
      </select>
    </div>
  );
});

export default AlumnoDetalleTallerSelector;
