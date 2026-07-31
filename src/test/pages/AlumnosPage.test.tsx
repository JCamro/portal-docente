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
vi.mock('../../api/portalDocente', () => ({
  getAlumnosCartilla: (...args: unknown[]) => mockGetAlumnosCartilla(...args),
  getHorarios: (...args: unknown[]) => mockGetHorarios(...args),
  getAlumnoDetalle: vi.fn().mockResolvedValue({ alumno: {}, talleres_activos: null, matricula_activa: null, matriculas_historicas: [], estadisticas: {} }),
  getNotasAlumno: vi.fn().mockResolvedValue([]),
}));

const paginatedResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      nombre: 'Ana',
      apellido: 'Garcia',
      dni: '11111111',
      telefono: '999111222',
      email: 'ana@example.com',
      estado: 'activo',
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
      estado: 'historico',
      fecha_ultima_asistencia: null,
      horarios: [
        { id: 2, taller_id: 2, taller_nombre: 'Canto', taller_tipo: 'taller', dia_semana: 2, hora_inicio: '14:00', hora_fin: '15:00' },
      ],
    },
  ],
};

const mockHorarios = [
  {
    id: 1, dia_semana: 1, hora_inicio: '10:00', hora_fin: '11:00',
    taller_id: 1, taller_nombre: 'Guitarra', taller_tipo: 'instrumento',
    cupo_maximo: 10, profesor: 1, ciclo: 1,
    alumnos_count: 1,
    alumnos: [{ id: 1, nombre: 'Ana', apellido: 'Garcia', dni: '11111111' }],
  },
  {
    id: 2, dia_semana: 2, hora_inicio: '14:00', hora_fin: '15:00',
    taller_id: 2, taller_nombre: 'Canto', taller_tipo: 'taller',
    cupo_maximo: 10, profesor: 1, ciclo: 1,
    alumnos_count: 1,
    alumnos: [{ id: 2, nombre: 'Luis', apellido: 'Perez', dni: '22222222' }],
  },
];

describe('AlumnosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders student list from paginated cartilla data', async () => {
    mockGetAlumnosCartilla.mockResolvedValueOnce(paginatedResponse);
    mockGetHorarios.mockResolvedValueOnce(mockHorarios);

    render(
      <MemoryRouter initialEntries={['/alumnos']}>
        <AlumnosPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Mis Alumnos')).toBeInTheDocument();
    expect(await screen.findByText('Ana Garcia')).toBeInTheDocument();
    expect(await screen.findByText('Luis Perez')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    mockGetAlumnosCartilla.mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] });
    mockGetHorarios.mockResolvedValueOnce([]);

    render(
      <MemoryRouter initialEntries={['/alumnos']}>
        <AlumnosPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Cargando alumnos...')).toBeInTheDocument();
  });

  it('shows empty state when no estudiantes', async () => {
    mockGetAlumnosCartilla.mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] });
    mockGetHorarios.mockResolvedValueOnce([]);

    render(
      <MemoryRouter initialEntries={['/alumnos']}>
        <AlumnosPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('No hay alumnos en este ciclo')).toBeInTheDocument();
  });

  it('renders CascadeFilters and AlumnoTable components', async () => {
    mockGetAlumnosCartilla.mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] });
    mockGetHorarios.mockResolvedValueOnce([]);

    render(
      <MemoryRouter initialEntries={['/alumnos']}>
        <AlumnosPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Mis Alumnos')).toBeInTheDocument();
    expect(await screen.findByLabelText('Filtrar por taller')).toBeInTheDocument();
    expect(await screen.findByLabelText('Buscar alumnos')).toBeInTheDocument();
  });

  it('calls getAlumnosCartilla with paginated response shape', async () => {
    mockGetAlumnosCartilla.mockResolvedValueOnce(paginatedResponse);
    mockGetHorarios.mockResolvedValueOnce(mockHorarios);

    render(
      <MemoryRouter initialEntries={['/alumnos']}>
        <AlumnosPage />
      </MemoryRouter>
    );

    await screen.findByText('Ana Garcia');

    expect(mockGetAlumnosCartilla).toHaveBeenCalledTimes(1);
    expect(mockGetAlumnosCartilla).toHaveBeenCalledWith(1, expect.objectContaining({ page: 1 }));
  });
});
