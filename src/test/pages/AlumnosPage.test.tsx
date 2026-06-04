import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AlumnosPage from '../../pages/AlumnosPage';

const mockCicloActivo = { id: 1, nombre: 'Ciclo 2025-I', tipo: 'anual', fecha_inicio: '2025-03-01', fecha_fin: '2025-12-20', activo: true };

vi.mock('../../stores/authStore', () => ({
  useAuthStore: (selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      cicloActivo: mockCicloActivo,
    };
    return selector ? selector(state) : state;
  },
}));

const mockGetHorarios = vi.fn();
const mockGetHorarioDetalle = vi.fn();
vi.mock('../../api/portalDocente', () => ({
  getHorarios: (...args: unknown[]) => mockGetHorarios(...args),
  getHorarioDetalle: (...args: unknown[]) => mockGetHorarioDetalle(...args),
}));

describe('AlumnosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders student list when horarios and detalle are loaded', async () => {
    mockGetHorarios.mockResolvedValueOnce([
      {
        id: 1, dia_semana: 1, hora_inicio: '14:00', hora_fin: '15:00',
        taller_nombre: 'Guitarra', taller_tipo: 'instrumento',
        cupo_maximo: 10, profesor: 1, ciclo: 1,
      },
    ]);
    mockGetHorarioDetalle.mockResolvedValueOnce({
      id: 1, dia_semana: 1, hora_inicio: '14:00', hora_fin: '15:00',
      taller_nombre: 'Guitarra', taller_tipo: 'instrumento',
      cupo_maximo: 10, profesor: 1, ciclo: 1,
      alumnos_count: 2,
      alumnos: [
        { id: 1, nombre: 'Ana', apellido: 'García', dni: '11111111', telefono: '999111222' },
        { id: 2, nombre: 'Luis', apellido: 'Pérez', dni: '22222222' },
      ],
    });

    render(
      <MemoryRouter initialEntries={['/alumnos?horarioId=1']}>
        <AlumnosPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Mis Alumnos')).toBeInTheDocument();
    expect(await screen.findByText('Ana García')).toBeInTheDocument();
    expect(await screen.findByText('Luis Pérez')).toBeInTheDocument();
    expect(await screen.findByText('11111111')).toBeInTheDocument();
  });

  it('shows empty state when no horarios exist', async () => {
    mockGetHorarios.mockResolvedValueOnce([]);

    render(
      <MemoryRouter initialEntries={['/alumnos']}>
        <AlumnosPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Mis Alumnos')).toBeInTheDocument();
  });

  it('shows empty when horario has no students', async () => {
    mockGetHorarios.mockResolvedValueOnce([
      {
        id: 1, dia_semana: 1, hora_inicio: '14:00', hora_fin: '15:00',
        taller_nombre: 'Guitarra', taller_tipo: 'instrumento',
        cupo_maximo: 10, profesor: 1, ciclo: 1,
      },
    ]);
    mockGetHorarioDetalle.mockResolvedValueOnce({
      id: 1, dia_semana: 1, hora_inicio: '14:00', hora_fin: '15:00',
      taller_nombre: 'Guitarra', taller_tipo: 'instrumento',
      cupo_maximo: 10, profesor: 1, ciclo: 1,
      alumnos_count: 0,
      alumnos: [],
    });

    render(
      <MemoryRouter initialEntries={['/alumnos?horarioId=1']}>
        <AlumnosPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/No hay alumnos inscritos/i)).toBeInTheDocument();
  });
});
