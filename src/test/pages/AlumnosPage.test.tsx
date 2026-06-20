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

const mockGetAlumnosCartilla = vi.fn();
const mockGetHorarios = vi.fn();
const mockGetAsistenciasPorHorario = vi.fn();
vi.mock('../../api/portalDocente', () => ({
  getAlumnosCartilla: (...args: unknown[]) => mockGetAlumnosCartilla(...args),
  getHorarios: (...args: unknown[]) => mockGetHorarios(...args),
  getAsistenciasPorHorario: (...args: unknown[]) => mockGetAsistenciasPorHorario(...args),
}));

describe('AlumnosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders student list from cartilla data', async () => {
    mockGetAlumnosCartilla.mockResolvedValueOnce([
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
        ],
      },
    ]);
    mockGetHorarios.mockResolvedValueOnce([
      {
        id: 1, dia_semana: 1, hora_inicio: '10:00', hora_fin: '11:00',
        taller_id: 1, taller_nombre: 'Guitarra', taller_tipo: 'instrumento',
        cupo_maximo: 10, profesor: 1, ciclo: 1,
        alumnos_count: 1,
        alumnos: [{ id: 1, nombre: 'Ana', apellido: 'García', dni: '11111111' }],
      },
      {
        id: 2, dia_semana: 2, hora_inicio: '14:00', hora_fin: '15:00',
        taller_id: 2, taller_nombre: 'Canto', taller_tipo: 'taller',
        cupo_maximo: 10, profesor: 1, ciclo: 1,
        alumnos_count: 1,
        alumnos: [{ id: 2, nombre: 'Luis', apellido: 'Pérez', dni: '22222222' }],
      },
    ]);
    mockGetAsistenciasPorHorario.mockResolvedValueOnce({
      horarios: [
        { horario_id: 1, taller_nombre: 'Guitarra', dia_semana: 1, hora_inicio: '10:00', hora_fin: '11:00', total_clases: 2, fechas: ['2026-06-15', '2026-06-16'] },
        { horario_id: 2, taller_nombre: 'Canto', dia_semana: 2, hora_inicio: '14:00', hora_fin: '15:00', total_clases: 2, fechas: ['2026-06-15', '2026-06-17'] },
      ],
    });

    render(
      <MemoryRouter initialEntries={['/alumnos']}>
        <AlumnosPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Mis Alumnos')).toBeInTheDocument();
    expect(await screen.findByText('Ana García')).toBeInTheDocument();
    expect(await screen.findByText('Luis Pérez')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    mockGetAlumnosCartilla.mockResolvedValueOnce([]);
    mockGetHorarios.mockResolvedValueOnce([]);
    mockGetAsistenciasPorHorario.mockResolvedValueOnce({ horarios: [] });

    render(
      <MemoryRouter initialEntries={['/alumnos']}>
        <AlumnosPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Cargando alumnos...')).toBeInTheDocument();
  });

  it('shows empty state when no estudiantes', async () => {
    mockGetAlumnosCartilla.mockResolvedValueOnce([]);
    mockGetHorarios.mockResolvedValueOnce([]);
    mockGetAsistenciasPorHorario.mockResolvedValueOnce({ horarios: [] });

    render(
      <MemoryRouter initialEntries={['/alumnos']}>
        <AlumnosPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('No hay alumnos inscritos en este ciclo')).toBeInTheDocument();
  });

  it('renders CascadeFilters and AlumnoTable components', async () => {
    mockGetAlumnosCartilla.mockResolvedValueOnce([]);
    mockGetHorarios.mockResolvedValueOnce([]);
    mockGetAsistenciasPorHorario.mockResolvedValueOnce({ horarios: [] });

    render(
      <MemoryRouter initialEntries={['/alumnos']}>
        <AlumnosPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Mis Alumnos')).toBeInTheDocument();
    // CascadeFilters should render its filter dropdowns
    expect(await screen.findByLabelText('Filtrar por fecha')).toBeInTheDocument();
    expect(await screen.findByLabelText('Filtrar por taller')).toBeInTheDocument();
    expect(await screen.findByLabelText('Filtrar por hora')).toBeInTheDocument();
  });
});
