import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HorariosPage from '../../pages/HorariosPage';

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
vi.mock('../../api/portalDocente', () => ({
  getHorarios: (...args: unknown[]) => mockGetHorarios(...args),
}));

describe('HorariosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders schedule cards with data', async () => {
    mockGetHorarios.mockResolvedValueOnce([
      {
        id: 1, dia_semana: 1, hora_inicio: '14:00:00', hora_fin: '15:00:00',
        taller_nombre: 'Guitarra', taller_tipo: 'instrumento',
        cupo_maximo: 10, profesor: 1, ciclo: 1,
      },
      {
        id: 2, dia_semana: 3, hora_inicio: '16:00:00', hora_fin: '17:30:00',
        taller_nombre: 'Canto', taller_tipo: 'taller',
        cupo_maximo: 15, profesor: 1, ciclo: 1,
      },
    ]);

    render(
      <MemoryRouter>
        <HorariosPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Mis Horarios')).toBeInTheDocument();
    expect(await screen.findByText('Guitarra')).toBeInTheDocument();
    expect(await screen.findByText('Canto')).toBeInTheDocument();
    expect(await screen.findByText('2 clases')).toBeInTheDocument();
  });

  it('shows empty state when no horarios', async () => {
    mockGetHorarios.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <HorariosPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/No tienes horarios asignados/i)).toBeInTheDocument();
  });

  it('shows error state on API failure', async () => {
    mockGetHorarios.mockRejectedValueOnce(new Error('API Error'));

    render(
      <MemoryRouter>
        <HorariosPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Error al cargar los horarios')).toBeInTheDocument();
  });
});
