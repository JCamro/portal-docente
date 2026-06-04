import React from 'react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-12) var(--space-4)',
      textAlign: 'center',
    }}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p style={{
        fontSize: 'var(--text-base)',
        fontWeight: 600,
        color: 'var(--color-text)',
        margin: 0,
        marginBottom: 'var(--space-4)',
      }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-6)',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
            border: 'none',
            color: '#0a0a0a',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            minHeight: 44,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Intentar nuevamente
        </button>
      )}
    </div>
  );
};

export default React.memo(ErrorState);
