import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

const mockGetHorariosSemanales = vi.fn();
vi.mock('../../api/portalDocente', () => ({
  getHorariosSemanales: (...args: unknown[]) => mockGetHorariosSemanales(...args),
}));

describe('HorariosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders today schedule with data', async () => {
    mockGetHorariosSemanales.mockResolvedValueOnce({
      talleres: [
        {
          taller_id: 1,
          taller_nombre: 'Guitarra',
          taller_tipo: 'instrumento',
          taller_color: '#e94560',
          horarios: [
            {
              id: 1,
              dia_semana: 0,
              hora_inicio: '14:00',
              hora_fin: '15:00',
              alumnos_count: 5,
              cupo_maximo: 10,
              cupo_disponible: 5,
              alumnos: [
                { id: 1, nombre: 'Juan', apellido: 'Pérez', dni: '12345678', telefono: '999888777' },
              ],
            },
          ],
        },
        {
          taller_id: 2,
          taller_nombre: 'Canto',
          taller_tipo: 'taller',
          taller_color: '#0f3460',
          horarios: [
            {
              id: 2,
              dia_semana: 2,
              hora_inicio: '16:00',
              hora_fin: '17:30',
              alumnos_count: 3,
              cupo_maximo: 8,
              cupo_disponible: 5,
              alumnos: [],
            },
          ],
        },
      ],
    });

    render(
      <MemoryRouter>
        <HorariosPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Mis Horarios')).toBeInTheDocument();
    // Default view is "Hoy"; assert controls exist
    expect(screen.getByRole('button', { name: /Hoy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Semana/i })).toBeInTheDocument();
  });

  it('switches to week view and shows grouped schedules', async () => {
    mockGetHorariosSemanales.mockResolvedValueOnce({
      talleres: [
        {
          taller_id: 1,
          taller_nombre: 'Guitarra',
          taller_tipo: 'instrumento',
          taller_color: '#e94560',
          horarios: [
            {
              id: 1,
              dia_semana: 0,
              hora_inicio: '14:00',
              hora_fin: '15:00',
              alumnos_count: 5,
              cupo_maximo: 10,
              cupo_disponible: 5,
              alumnos: [],
            },
          ],
        },
      ],
    });

    render(
      <MemoryRouter>
        <HorariosPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Mis Horarios')).toBeInTheDocument();
    const semanaButton = screen.getByRole('button', { name: /Semana/i });
    semanaButton.click();

    await waitFor(() => {
      expect(screen.getByText('Lunes')).toBeInTheDocument();
    });
    screen.getByText('Lunes').click();
    await waitFor(() => {
      expect(screen.getAllByText('Guitarra').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows empty state when no horarios', async () => {
    mockGetHorariosSemanales.mockResolvedValueOnce({ talleres: [] });

    render(
      <MemoryRouter>
        <HorariosPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/No tienes horarios/i)).toBeInTheDocument();
  });

  it('shows error state on API failure', async () => {
    mockGetHorariosSemanales.mockRejectedValueOnce(new Error('API Error'));

    render(
      <MemoryRouter>
        <HorariosPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Error al cargar los horarios')).toBeInTheDocument();
  });

  it('shows cycle selection prompt when no active ciclo', async () => {
    const mockStore = await import('../../stores/authStore');
    vi.spyOn(mockStore, 'useAuthStore').mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) => {
        const state = { cicloActivo: null };
        return selector ? selector(state) : state;
      }
    );

    render(
      <MemoryRouter>
        <HorariosPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Selecciona un ciclo/i)).toBeInTheDocument();
  });
});
