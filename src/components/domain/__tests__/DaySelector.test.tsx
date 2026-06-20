import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DaySelector from '../DaySelector';

describe('DaySelector', () => {
  const dates = ['2026-06-15', '2026-06-16', '2026-06-17'];
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all provided dates as chips', () => {
    render(
      <DaySelector
        dates={dates}
        selected="2026-06-15"
        onChange={onChange}
      />
    );

    // Check that each date has a button with aria-label
    expect(screen.getByLabelText('Seleccionar fecha 15/6')).toBeInTheDocument();
    expect(screen.getByLabelText('Seleccionar fecha 16/6')).toBeInTheDocument();
    expect(screen.getByLabelText('Seleccionar fecha 17/6')).toBeInTheDocument();
  });

  it('calls onChange when a date chip is clicked', () => {
    render(
      <DaySelector
        dates={dates}
        selected="2026-06-15"
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Seleccionar fecha 16/6'));
    expect(onChange).toHaveBeenCalledWith('2026-06-16');
  });

  it('generates dates when empty array provided', () => {
    render(
      <DaySelector
        dates={[]}
        selected=""
        onChange={onChange}
      />
    );

    // Should render at least some generated dates
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('highlights selected date with gold border', () => {
    render(
      <DaySelector
        dates={dates}
        selected="2026-06-16"
        onChange={onChange}
      />
    );

    // The selected button should have a 2px gold border
    const selectedButton = screen.getByLabelText('Seleccionar fecha 16/6');
    expect(selectedButton.style.border).toContain('2px');
  });
});
