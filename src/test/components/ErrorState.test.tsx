import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorState from '../../components/ui/ErrorState';

describe('ErrorState', () => {
  it('renders error message', () => {
    render(<ErrorState message="Error al cargar" />);
    expect(screen.getByText('Error al cargar')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);
    const button = screen.getByText('Intentar nuevamente');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorState message="Error" />);
    expect(screen.queryByText('Intentar nuevamente')).not.toBeInTheDocument();
  });
});
