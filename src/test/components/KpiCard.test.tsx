import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import KpiCard from '../../components/ui/KpiCard';

describe('KpiCard', () => {
  it('renders label and value', () => {
    render(<KpiCard label="Clases hoy" value="3" />);
    expect(screen.getByText('Clases hoy')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders with numeric value', () => {
    render(<KpiCard label="Total alumnos" value={15} />);
    expect(screen.getByText('Total alumnos')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders with string currency value', () => {
    render(<KpiCard label="Monto" value="S/. 850.00" />);
    expect(screen.getByText('Monto')).toBeInTheDocument();
    expect(screen.getByText('S/. 850.00')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    const icon = <svg data-testid="test-icon" />;
    render(<KpiCard label="Test" value="1" icon={icon} />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
});
