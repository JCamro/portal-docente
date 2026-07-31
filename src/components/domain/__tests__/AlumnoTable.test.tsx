import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AlumnoTable from '../AlumnoTable';

// Mock useWindowWidth
const mockUseWindowWidth = vi.fn();
vi.mock('../../../hooks/useWindowWidth', () => ({
  useWindowWidth: () => mockUseWindowWidth(),
}));

describe('AlumnoTable', () => {
  const mockAlumnos = [
    {
      id: 1,
      nombre: 'Ana',
      apellido: 'Garcia',
      dni: '11111111',
      telefono: '999111222',
      email: 'ana@example.com',
      estado: 'activo' as const,
      fecha_ultima_asistencia: '2026-06-15',
      horarios: [
        { id: 1, taller_id: 1, taller_nombre: 'Guitarra', taller_tipo: 'instrumento', dia_semana: 1, hora_inicio: '10:00', hora_fin: '11:00' },
      ],
    },
    {
      id: 2,
      nombre: 'Luis',
      apellido: 'Perez',
      dni: '22222222',
      telefono: '',
      email: '',
      estado: 'historico' as const,
      fecha_ultima_asistencia: null,
      horarios: [
        { id: 2, taller_id: 2, taller_nombre: 'Canto', taller_tipo: 'taller', dia_semana: 2, hora_inicio: '14:00', hora_fin: '15:00' },
        { id: 3, taller_id: 3, taller_nombre: 'Piano', taller_tipo: 'instrumento', dia_semana: 3, hora_inicio: '16:00', hora_fin: '17:00' },
      ],
    },
  ];

  const onInspect = vi.fn();
  const onPageChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table on desktop with estado badge', () => {
    mockUseWindowWidth.mockReturnValue(1024);

    render(
      <AlumnoTable
        alumnos={mockAlumnos}
        count={2}
        page={1}
        pageSize={20}
        onPageChange={onPageChange}
        onInspect={onInspect}
      />
    );

    expect(screen.getByText('Ana Garcia')).toBeInTheDocument();
    expect(screen.getByText('Luis Perez')).toBeInTheDocument();
    // Estado badges
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Histórico')).toBeInTheDocument();
  });

  it('renders mobile cards', () => {
    mockUseWindowWidth.mockReturnValue(375);

    render(
      <AlumnoTable
        alumnos={mockAlumnos}
        count={2}
        page={1}
        pageSize={20}
        onPageChange={onPageChange}
        onInspect={onInspect}
      />
    );

    expect(screen.getByText('Ana Garcia')).toBeInTheDocument();
    expect(screen.getByText('Luis Perez')).toBeInTheDocument();
    // Mobile should also show estado
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Histórico')).toBeInTheDocument();
  });

  it('triggers onInspect when clicking Inspeccionar', () => {
    mockUseWindowWidth.mockReturnValue(1024);

    render(
      <AlumnoTable
        alumnos={mockAlumnos}
        count={2}
        page={1}
        pageSize={20}
        onPageChange={onPageChange}
        onInspect={onInspect}
      />
    );

    const buttons = screen.getAllByText('Inspeccionar');
    fireEvent.click(buttons[0]);
    expect(onInspect).toHaveBeenCalledWith(1);
  });

  it('shows pagination controls', () => {
    mockUseWindowWidth.mockReturnValue(1024);

    render(
      <AlumnoTable
        alumnos={mockAlumnos}
        count={25}
        page={1}
        pageSize={20}
        onPageChange={onPageChange}
        onInspect={onInspect}
      />
    );

    expect(screen.getAllByText('1 / 2')).toHaveLength(2);
    expect(screen.getAllByText('Siguiente →')).toHaveLength(2);
    expect(screen.getAllByText('← Anterior')).toHaveLength(2);
  });

  it('shows empty state when no alumnos', () => {
    mockUseWindowWidth.mockReturnValue(1024);

    render(
      <AlumnoTable
        alumnos={[]}
        count={0}
        page={1}
        pageSize={20}
        onPageChange={onPageChange}
        onInspect={onInspect}
      />
    );

    expect(screen.getByText('No hay alumnos en este ciclo')).toBeInTheDocument();
  });
});
