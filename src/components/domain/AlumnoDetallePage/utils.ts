import type { CSSProperties } from 'react';
import { DIA_SEMANA_MAP as DIA_MAP } from '../../../utils/constants';

export const DIA_SEMANA_MAP = DIA_MAP;

export function toLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function dotColor(estado: string): string {
  switch (estado) {
    case 'asistio': return 'var(--color-success)';
    case 'falta': return 'var(--color-error)';
    case 'falta_grave': return 'var(--color-warning)';
    default: return 'var(--color-text-muted)';
  }
}

export function estadoBadge(estado: string): { label: string; style: CSSProperties } {
  const base: CSSProperties = {
    padding: '3px 10px',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  };
  switch (estado) {
    case 'asistio':
      return {
        label: 'Asistió',
        style: {
          ...base,
          background: 'var(--color-success-bg)',
          color: 'var(--color-success)',
          border: '1px solid var(--color-success)',
        },
      };
    case 'falta_grave':
      return {
        label: 'Falta Grave',
        style: {
          ...base,
          background: 'var(--color-warning-bg)',
          color: 'var(--color-warning)',
          border: '1px solid var(--color-warning)',
        },
      };
    case 'falta':
    default:
      return {
        label: 'Falta',
        style: {
          ...base,
          background: 'var(--color-error-bg)',
          color: 'var(--color-error)',
          border: '1px solid var(--color-error)',
        },
      };
  }
}

export const cardStyle: CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-5)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-sm)',
};

export const sectionLabel: CSSProperties = {
  fontSize: 'var(--text-lg)',
  fontWeight: 700,
  color: 'var(--color-text)',
  marginBottom: 'var(--space-4)',
};
