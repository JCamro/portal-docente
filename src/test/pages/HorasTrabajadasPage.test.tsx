import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HorasTrabajadasPage from '../../pages/HorasTrabajadasPage';

const mockCicloActivo = { id: 1, nombre: 'Ciclo 2025-I', tipo: 'anual', fecha_inicio: '2025-03-01', fecha_fin: '2025-12-20', activo: true };

vi.mock('../../stores/authStore', () => ({
  useAuthStore: (selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      cicloActivo: mockCicloActivo,
    };
    return selector ? selector(state) : state;
  },
}));

const mockGetHorasTrabajadas = vi.fn();
vi.mock('../../api/portalDocente', () => ({
  getHorasTrabajadas: (...args: unknown[]) => mockGetHorasTrabajadas(...args),
}));

describe('HorasTrabajadasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hours records with filters', async () => {
    mockGetHorasTrabajadas.mockResolvedValueOnce([
      {
        id: 1, fecha: '2025-06-01', tipo: 'clase', horas_trabajadas: 1.5,
        num_alumnos: 3, monto_profesor: '25.50', ganancia_taller: '12.50',
        estado: 'aprobada', observacion: '',
      },
      {
        id: 2, fecha: '2025-06-03', tipo: 'clase', horas_trabajadas: 1,
        num_alumnos: 5, monto_profesor: '35.00', ganancia_taller: '20.00',
        estado: 'pendiente', observacion: '',
      },
    ]);

    render(
      <MemoryRouter>
        <HorasTrabajadasPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Horas Trabajadas')).toBeInTheDocument();
    expect(await screen.findByText('2 registros')).toBeInTheDocument();
  });

  it('shows empty state when no records found', async () => {
    mockGetHorasTrabajadas.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <HorasTrabajadasPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/No hay registros/i)).toBeInTheDocument();
  });

  it('shows error state on API failure', async () => {
    mockGetHorasTrabajadas.mockRejectedValueOnce(new Error('API Error'));

    render(
      <MemoryRouter>
        <HorasTrabajadasPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Error al cargar horas trabajadas')).toBeInTheDocument();
  });
});
