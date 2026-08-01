import { memo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = memo(({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: 'var(--space-1) var(--space-3)',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${active ? 'var(--color-gold)' : 'var(--color-border)'}`,
    background: active ? 'var(--color-gold)' : 'transparent',
    color: active ? 'var(--color-dark-bg)' : 'var(--color-text-secondary)',
    fontWeight: active ? 600 : 400,
    fontSize: 'var(--text-sm)',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    minHeight: 36,
    minWidth: 36,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 150ms ease',
  });

  const navBtnStyle: React.CSSProperties = {
    padding: 'var(--space-1) var(--space-2)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    minHeight: 36,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <nav style={{
      display: 'flex',
      gap: 'var(--space-1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 'var(--space-6)',
    }} aria-label="Paginación">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        style={navBtnStyle}
        aria-label="Anterior"
      >
        ←
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} style={{ padding: '0 var(--space-1)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={btnStyle(p === currentPage)}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        style={navBtnStyle}
        aria-label="Siguiente"
      >
        →
      </button>
    </nav>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
