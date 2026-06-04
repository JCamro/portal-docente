import React from 'react';
import type { Horario } from '../../types';
import { DIA_SEMANA_MAP, formatHora } from '../../utils/constants';

interface HorarioCardProps {
  horario: Horario;
  alumnosCount?: number;
  onClick?: () => void;
}

const HorarioCard: React.FC<HorarioCardProps> = ({ horario, alumnosCount, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-5)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
        <div style={{
          background: 'var(--color-gold-glow)',
          color: 'var(--color-gold)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-1) var(--space-3)',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
        }}>
          {DIA_SEMANA_MAP[horario.dia_semana] || 'Día inválido'}
        </div>
        {alumnosCount !== undefined && (
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            fontWeight: 500,
          }}>
            {alumnosCount} {alumnosCount === 1 ? 'alumno' : 'alumnos'}
          </div>
        )}
      </div>

      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-lg)',
        color: 'var(--color-text)',
        margin: 0,
        marginBottom: 'var(--space-2)',
      }}>
        {horario.taller_nombre}
      </h3>

      <div style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        {formatHora(horario.hora_inicio)} - {formatHora(horario.hora_fin)}
      </div>
    </div>
  );
};

export default React.memo(HorarioCard);
