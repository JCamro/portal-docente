import React from 'react';

interface EmptyStateProps {
  message: string;
  description?: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, description, icon }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-12) var(--space-4)',
      textAlign: 'center',
    }}>
      {icon ? (
        <div style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', opacity: 0.5 }}>
          {icon}
        </div>
      ) : (
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', opacity: 0.5 }}
        >
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <polyline points="13 2 13 9 20 9" />
        </svg>
      )}
      <p style={{
        fontSize: 'var(--text-base)',
        fontWeight: 600,
        color: 'var(--color-text-secondary)',
        margin: 0,
        marginBottom: description ? 'var(--space-2)' : 0,
      }}>
        {message}
      </p>
      {description && (
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          margin: 0,
          maxWidth: 300,
        }}>
          {description}
        </p>
      )}
    </div>
  );
};

export default React.memo(EmptyState);
