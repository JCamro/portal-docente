import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AlumnoTable from '../AlumnoTable';
import type { AlumnoCartilla } from '../../../types';

// Mock useWindowWidth
const mockUseWindowWidth = vi.fn();
vi.mock('../../../hooks/useWindowWidth', () => ({
  useWindowWidth: () => mockUseWindowWidth(),
}));

describe('AlumnoTable', () => {
  const mockAlumnos: AlumnoCartilla[] = [
    {
      id: 1,
      nombre: 'Ana',
      apellido: 'García',
      dni: '11111111',
      telefono: '999111222',
      email: 'ana@example.com',
      horarios: [
        { id: 1, taller_nombre: 'Guitarra', taller_tipo: 'instrumento', dia_semana: 1, hora_inicio: '10:00', hora_fin: '11:00' },
      ],
    },
    {
      id: 2,
      nombre: 'Luis',
      apellido: 'Pérez',
      dni: '22222222',
      telefono: '',
      email: '',
      horarios: [
        { id: 2, taller_nombre: 'Canto', taller_tipo: 'taller', dia_semana: 2, hora_inicio: '14:00', hora_fin: '15:00' },
        { id: 3, taller_nombre: 'Piano', taller_tipo: 'instrumento', dia_semana: 3, hora_inicio: '16:00', hora_fin: '17:00' },
      ],
    },
  ];

  const fechaUltimaAsistencia: Record<number, string | null> = {
    1: '2026-06-15',
    2: null,
  };

  const onInspect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table on desktop (width > 768)', () => {
    mockUseWindowWidth.mockReturnValue(1024);

    render(
      <AlumnoTable
        alumnos={mockAlumnos}
        fechaUltimaAsistencia={fechaUltimaAsistencia}
        onInspect={onInspect}
      />
    );

    expect(screen.getByText('Ana García')).toBeInTheDocument();
    expect(screen.getByText('Luis Pérez')).toBeInTheDocument();
    expect(screen.getByText('11111111')).toBeInTheDocument();
    expect(screen.getByText('22222222')).toBeInTheDocument();
  });

  it('renders mobile cards (width <= 768)', () => {
    mockUseWindowWidth.mockReturnValue(375);

    render(
      <AlumnoTable
        alumnos={mockAlumnos}
        fechaUltimaAsistencia={fechaUltimaAsistencia}
        onInspect={onInspect}
      />
    );

    // On mobile, we should see the names
    expect(screen.getByText('Ana García')).toBeInTheDocument();
    expect(screen.getByText('Luis Pérez')).toBeInTheDocument();
  });

  it('triggers onInspect when clicking Inspeccionar', () => {
    mockUseWindowWidth.mockReturnValue(1024);

    render(
      <AlumnoTable
        alumnos={mockAlumnos}
        fechaUltimaAsistencia={fechaUltimaAsistencia}
        onInspect={onInspect}
      />
    );

    const buttons = screen.getAllByText('Inspeccionar');
    fireEvent.click(buttons[0]);
    expect(onInspect).toHaveBeenCalledWith(1);
  });

  it('shows empty state when no alumnos', () => {
    mockUseWindowWidth.mockReturnValue(1024);

    render(
      <AlumnoTable
        alumnos={[]}
        fechaUltimaAsistencia={{}}
        onInspect={onInspect}
      />
    );

    expect(screen.getByText('No hay alumnos inscritos en este ciclo')).toBeInTheDocument();
  });
});
