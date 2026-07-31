import { memo } from 'react';

type ViewMode = 'dia' | 'semana' | 'periodo';

interface HorarioNavBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const HorarioNavBar = memo(({
  viewMode,
  onViewModeChange,
}: HorarioNavBarProps) => {
  return (
    <div style={{
      display: 'inline-flex',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: 4,
      width: 'fit-content',
    }}>
      {(['dia', 'semana', 'periodo'] as const).map((mode) => {
        const labels: Record<ViewMode, string> = {
          dia: 'Día',
          semana: 'Semana',
          periodo: 'Periodo',
        };
        const isActive = viewMode === mode;
        return (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: isActive ? 'var(--color-gold-glow)' : 'transparent',
              color: isActive ? 'var(--color-gold)' : 'var(--color-text-secondary)',
              fontWeight: isActive ? 700 : 500,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'background 150ms ease, color 150ms ease',
            }}
          >
            {labels[mode]}
          </button>
        );
      })}
    </div>
  );
});

HorarioNavBar.displayName = 'HorarioNavBar';

export default HorarioNavBar;
