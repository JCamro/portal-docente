import { memo } from 'react';
import { cardStyle, sectionLabel } from './utils';

interface Props {
  sesionesConsumidas: number;
  sesionesContratadas: number;
  sesionesDisponibles: number;
}

const AlumnoDetalleProgreso = memo(({ sesionesConsumidas, sesionesContratadas, sesionesDisponibles }: Props) => {
  const pct = sesionesContratadas > 0
    ? Math.round((sesionesConsumidas / sesionesContratadas) * 100)
    : 0;
  const isComplete = pct >= 100;

  return (
    <div style={cardStyle}>
      <div style={sectionLabel}>Progreso</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)' }}>
        <span>{sesionesConsumidas} / {sesionesContratadas} sesiones</span>
        <span style={{ color: 'var(--color-gold)' }}>{sesionesDisponibles} disponibles</span>
      </div>
      <div style={{ height: 10, borderRadius: 5, background: 'var(--color-border)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(pct, 100)}%`,
          borderRadius: 5,
          background: isComplete ? 'var(--color-success)' : 'var(--color-gold)',
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
});

export default AlumnoDetalleProgreso;
