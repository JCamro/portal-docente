import React from 'react';

const Loading: React.FC<{ message?: string }> = ({ message = 'Cargando...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 'var(--space-4)',
      padding: 'var(--space-8)',
    }}>
      <div className="spinner" style={{
        width: 32,
        height: 32,
        border: '3px solid var(--color-border)',
        borderTopColor: 'var(--color-gold)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{
        color: 'var(--color-text-muted)',
        fontSize: 'var(--text-sm)',
        margin: 0,
      }}>
        {message}
      </p>
    </div>
  );
};

export default React.memo(Loading);
