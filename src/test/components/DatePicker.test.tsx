import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DatePicker from '../../components/ui/DatePicker';

describe('DatePicker', () => {
  it('renders with label', () => {
    render(<DatePicker value="2025-06-01" onChange={vi.fn()} label="Fecha" />);
    expect(screen.getByText('Fecha')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<DatePicker value="2025-06-01" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('2025-06-01')).toBeInTheDocument();
  });

  it('calls onChange when date changes', () => {
    const onChange = vi.fn();
    render(<DatePicker value="2025-06-01" onChange={onChange} />);
    const input = screen.getByDisplayValue('2025-06-01');
    fireEvent.change(input, { target: { value: '2025-06-15' } });
    expect(onChange).toHaveBeenCalledWith('2025-06-15');
  });
});
