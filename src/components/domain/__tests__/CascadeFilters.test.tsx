import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CascadeFilters from '../CascadeFilters';
import type { FilterState } from '../../../types/alumnos';

describe('CascadeFilters', () => {
  const talleres = [
    { id: 1, nombre: 'Guitarra' },
    { id: 2, nombre: 'Canto' },
    { id: 3, nombre: 'Piano' },
  ];
  const selected: FilterState = {
    fecha: null,
    tallerId: null,
    hora: null,
    estado: null,
    search: null,
    dia_semana: null,
  };
  const onChange = vi.fn();

  it('renders search input, estado toggle, and taller select', () => {
    render(
      <CascadeFilters
        fechas={[]}
        talleres={talleres}
        horas={[]}
        selected={selected}
        onChange={onChange}
      />
    );

    expect(screen.getByLabelText('Buscar alumnos')).toBeInTheDocument();
    expect(screen.getByLabelText('Filtrar por taller')).toBeInTheDocument();
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Activos')).toBeInTheDocument();
    expect(screen.getByText('Históricos')).toBeInTheDocument();
  });

  it('shows all talleres options', () => {
    render(
      <CascadeFilters
        fechas={[]}
        talleres={talleres}
        horas={[]}
        selected={selected}
        onChange={onChange}
      />
    );

    const tallerSelect = screen.getByLabelText('Filtrar por taller');
    expect(tallerSelect).toContainHTML('Guitarra');
    expect(tallerSelect).toContainHTML('Canto');
    expect(tallerSelect).toContainHTML('Piano');
  });

  it('calls onChange with estado when estado toggle is clicked', () => {
    render(
      <CascadeFilters
        fechas={[]}
        talleres={talleres}
        horas={[]}
        selected={selected}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByText('Activos'));
    expect(onChange).toHaveBeenCalledWith('estado', 'activo');

    fireEvent.click(screen.getByText('Históricos'));
    expect(onChange).toHaveBeenCalledWith('estado', 'historico');

    fireEvent.click(screen.getByText('Todos'));
    expect(onChange).toHaveBeenCalledWith('estado', null);
  });

  it('calls onChange with search on confirm (Enter key)', () => {
    render(
      <CascadeFilters
        fechas={[]}
        talleres={talleres}
        horas={[]}
        selected={selected}
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText('Buscar alumnos');
    fireEvent.change(input, { target: { value: 'ana' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('search', 'ana');
  });

  it('calls onChange when taller is selected', () => {
    render(
      <CascadeFilters
        fechas={[]}
        talleres={talleres}
        horas={[]}
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
    const activeSelected: FilterState = {
      fecha: null,
      tallerId: 1,
      hora: null,
      estado: 'activo',
      search: null,
      dia_semana: null,
    };

    render(
      <CascadeFilters
        fechas={[]}
        talleres={talleres}
        horas={[]}
        selected={activeSelected}
        onChange={onChange}
      />
    );

    expect(screen.getByText(/2 filtro/)).toBeInTheDocument();
  });

  it('does not show count badge when no filters active', () => {
    render(
      <CascadeFilters
        fechas={[]}
        talleres={talleres}
        horas={[]}
        selected={selected}
        onChange={onChange}
      />
    );

    expect(screen.queryByText(/filtro/)).not.toBeInTheDocument();
  });
});
