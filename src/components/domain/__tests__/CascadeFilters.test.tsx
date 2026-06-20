import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CascadeFilters from '../CascadeFilters';
import type { FilterState } from '../../../types/alumnos';

describe('CascadeFilters', () => {
  const fechas = ['2026-06-15', '2026-06-16', '2026-06-17'];
  const talleres = [
    { id: 1, nombre: 'Guitarra' },
    { id: 2, nombre: 'Canto' },
    { id: 3, nombre: 'Piano' },
  ];
  const horas = [
    { inicio: '10:00', fin: '11:00', horarioId: 1 },
    { inicio: '14:00', fin: '15:00', horarioId: 2 },
    { inicio: '16:00', fin: '17:00', horarioId: 3 },
  ];
  const selected: FilterState = { fecha: null, tallerId: null, hora: null };
  const onChange = vi.fn();

  it('renders three dropdowns with default "Todos" option', () => {
    render(
      <CascadeFilters
        fechas={fechas}
        talleres={talleres}
        horas={horas}
        selected={selected}
        onChange={onChange}
      />
    );

    expect(screen.getByLabelText('Filtrar por fecha')).toBeInTheDocument();
    expect(screen.getByLabelText('Filtrar por taller')).toBeInTheDocument();
    expect(screen.getByLabelText('Filtrar por hora')).toBeInTheDocument();
  });

  it('shows all talleres options', () => {
    render(
      <CascadeFilters
        fechas={fechas}
        talleres={talleres}
        horas={horas}
        selected={selected}
        onChange={onChange}
      />
    );

    const tallerSelect = screen.getByLabelText('Filtrar por taller');
    expect(tallerSelect).toContainHTML('Guitarra');
    expect(tallerSelect).toContainHTML('Canto');
    expect(tallerSelect).toContainHTML('Piano');
  });

  it('calls onChange when fecha is selected', () => {
    render(
      <CascadeFilters
        fechas={fechas}
        talleres={talleres}
        horas={horas}
        selected={selected}
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Filtrar por fecha'), {
      target: { value: '2026-06-15' },
    });
    expect(onChange).toHaveBeenCalledWith('fecha', '2026-06-15');
  });

  it('calls onChange when taller is selected', () => {
    render(
      <CascadeFilters
        fechas={fechas}
        talleres={talleres}
        horas={horas}
        selected={selected}
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Filtrar por taller'), {
      target: { value: '1' },
    });
    expect(onChange).toHaveBeenCalledWith('tallerId', 1);
  });

  it('shows active filter count badge when filters are active', () => {
    const activeSelected: FilterState = { fecha: '2026-06-15', tallerId: 1, hora: null };

    render(
      <CascadeFilters
        fechas={fechas}
        talleres={talleres}
        horas={horas}
        selected={activeSelected}
        onChange={onChange}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('does not show count badge when no filters active', () => {
    render(
      <CascadeFilters
        fechas={fechas}
        talleres={talleres}
        horas={horas}
        selected={selected}
        onChange={onChange}
      />
    );

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
