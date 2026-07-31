import React from 'react';
import { useWindowWidth } from '../../../hooks/useWindowWidth';
import { formatMonto } from '../../../utils/formatters';
import type { HoraTrabajadaDetalleSummary } from '../../../types';

interface SummaryBarProps {
  summary: HoraTrabajadaDetalleSummary;
}

const SummaryBar: React.FC<SummaryBarProps> = ({ summary }) => {
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const items = [
    { label: 'Total horas', value: `${summary.total_horas.toFixed(1)}h` },
    { label: 'Promedio alumnos/hora', value: summary.promedio_alumnos_por_hora.toFixed(1) },
    { label: 'Promedio horas/día', value: summary.promedio_horas_por_dia.toFixed(1) },
    { label: 'Total monto', value: formatMonto(summary.total_monto) },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: 'var(--space-4)',
      }}
      role="region"
      aria-label="Resumen del período"
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            background: 'var(--color-dark-card)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            border: '1px solid var(--color-gold-border)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {item.label}
          </p>
          <p
            style={{
              margin: 0,
              marginTop: 'var(--space-2)',
              fontSize: 'var(--text-lg)',
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-gold)',
            }}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default React.memo(SummaryBar);
