import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon, color }) => {
  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-6)',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-4)',
    }}>
      {icon && (
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-gold-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color || 'var(--color-gold)',
          flexShrink: 0,
        }}>
          {icon}
        </div>
      )}
      <div>
        <p style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontWeight: 600,
          margin: 0,
          marginBottom: 'var(--space-1)',
        }}>
          {label}
        </p>
        <p style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          color: color || 'var(--color-text)',
          margin: 0,
          fontFamily: 'var(--font-heading)',
        }}>
          {value}
        </p>
      </div>
    </div>
  );
};

export default React.memo(KpiCard);
