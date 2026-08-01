import { memo, useState, useCallback } from 'react';
import { jsDayToBackendDay } from '../../utils/constants';

interface NotaDayGroupProps {
  date: string;
  children: React.ReactNode;
}

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

function formatDayHeader(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const backendDay = jsDayToBackendDay(date.getDay());
  const dia = DIAS[backendDay];
  const dayNum = date.getDate();
  const mes = MESES[date.getMonth()];
  return `${dia.charAt(0).toUpperCase() + dia.slice(1)} ${dayNum} de ${mes}`;
}

const NotaDayGroup = memo(({ date, children }: NotaDayGroupProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggle = useCallback(() => setCollapsed((c) => !c), []);

  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <button
        onClick={toggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          width: '100%',
          padding: 'var(--space-2) var(--space-3)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-base)',
          color: 'var(--color-gold)',
          textAlign: 'left',
          marginBottom: 'var(--space-2)',
          transition: 'opacity 150ms ease',
        }}
        aria-expanded={!collapsed}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        {formatDayHeader(date)}
      </button>
      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {children}
        </div>
      )}
    </div>
  );
});

NotaDayGroup.displayName = 'NotaDayGroup';

export default NotaDayGroup;
