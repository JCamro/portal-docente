import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from '../../components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders message', () => {
    render(<EmptyState message="No hay datos" />);
    expect(screen.getByText('No hay datos')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <EmptyState
        message="Sin horarios"
        description="No hay horarios disponibles para este ciclo."
      />
    );
    expect(screen.getByText('Sin horarios')).toBeInTheDocument();
    expect(screen.getByText('No hay horarios disponibles para este ciclo.')).toBeInTheDocument();
  });

  it('renders without description', () => {
    render(<EmptyState message="Vacío" />);
    expect(screen.getByText('Vacío')).toBeInTheDocument();
    expect(screen.queryByText('No hay horarios disponibles')).not.toBeInTheDocument();
  });
});
