import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotesPage from '../../pages/NotesPage';

const mockCicloActivo = { id: 1, nombre: 'Ciclo 2025-I', tipo: 'anual', fecha_inicio: '2025-03-01', fecha_fin: '2025-12-20', activo: true };

vi.mock('../../stores/authStore', () => ({
  useAuthStore: (selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      cicloActivo: mockCicloActivo,
    };
    return selector ? selector(state) : state;
  },
}));

const mockGetNotas = vi.fn();
const mockGetHorarios = vi.fn();
const mockGetAsistenciasPorHorario = vi.fn();
vi.mock('../../api/portalDocente', () => ({
  getNotas: (...args: unknown[]) => mockGetNotas(...args),
  getHorarios: (...args: unknown[]) => mockGetHorarios(...args),
  getAsistenciasPorHorario: (...args: unknown[]) => mockGetAsistenciasPorHorario(...args),
  createNota: () => Promise.resolve({ id: 1, horario: 1, fecha: '2026-06-15', contenido: 'test', created_at: '2026-06-15T10:00:00Z' }),
  updateNota: () => Promise.resolve({ id: 1, horario: 1, fecha: '2026-06-15', contenido: 'test', created_at: '2026-06-15T10:00:00Z' }),
  deleteNota: () => Promise.resolve(),
}));

describe('NotesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders notes list', async () => {
    mockGetNotas.mockResolvedValueOnce([
      {
        id: 1,
        horario: 1,
        taller_nombre: 'Guitarra',
        fecha: '2026-06-15',
        contenido: 'Nota de prueba',
        created_at: '2026-06-15T10:00:00Z',
      },
    ]);
    mockGetHorarios.mockResolvedValueOnce([
      {
        id: 1, dia_semana: 1, hora_inicio: '10:00', hora_fin: '11:00',
        taller_id: 1, taller_nombre: 'Guitarra', taller_tipo: 'instrumento',
        cupo_maximo: 10, profesor: 1, ciclo: 1,
        alumnos_count: 1, alumnos: [],
      },
    ]);
    mockGetAsistenciasPorHorario.mockResolvedValueOnce({ horarios: [] });

    render(
      <MemoryRouter initialEntries={['/notas']}>
        <NotesPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Notas')).toBeInTheDocument();
    expect(await screen.findByText('Nota de prueba')).toBeInTheDocument();
  });

  it('shows empty state when no notes', async () => {
    mockGetNotas.mockResolvedValueOnce([]);
    mockGetHorarios.mockResolvedValueOnce([]);
    mockGetAsistenciasPorHorario.mockResolvedValueOnce({ horarios: [] });

    render(
      <MemoryRouter initialEntries={['/notas']}>
        <NotesPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('No tienes notas')).toBeInTheDocument();
  });

  it('shows CascadeFilters instead of NotesFilterBar', async () => {
    mockGetNotas.mockResolvedValueOnce([]);
    mockGetHorarios.mockResolvedValueOnce([]);
    mockGetAsistenciasPorHorario.mockResolvedValueOnce({ horarios: [] });

    render(
      <MemoryRouter initialEntries={['/notas']}>
        <NotesPage />
      </MemoryRouter>
    );

    expect(await screen.findByLabelText('Filtrar por fecha')).toBeInTheDocument();
    expect(await screen.findByLabelText('Filtrar por taller')).toBeInTheDocument();
    expect(await screen.findByLabelText('Filtrar por hora')).toBeInTheDocument();
  });

  it('shows nivel filter dropdown', async () => {
    mockGetNotas.mockResolvedValueOnce([]);
    mockGetHorarios.mockResolvedValueOnce([]);
    mockGetAsistenciasPorHorario.mockResolvedValueOnce({ horarios: [] });

    render(
      <MemoryRouter initialEntries={['/notas']}>
        <NotesPage />
      </MemoryRouter>
    );

    expect(await screen.findByLabelText('Filtrar por nivel')).toBeInTheDocument();
  });

  it('nivel filter changes to Alumno', async () => {
    mockGetNotas.mockResolvedValueOnce([]);
    mockGetHorarios.mockResolvedValueOnce([]);
    mockGetAsistenciasPorHorario.mockResolvedValueOnce({ horarios: [] });

    render(
      <MemoryRouter initialEntries={['/notas']}>
        <NotesPage />
      </MemoryRouter>
    );

    const nivelSelect = await screen.findByLabelText('Filtrar por nivel');
    fireEvent.change(nivelSelect, { target: { value: 'alumno' } });
    expect((nivelSelect as HTMLSelectElement).value).toBe('alumno');
  });
});
