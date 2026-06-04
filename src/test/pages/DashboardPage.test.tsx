import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../../pages/DashboardPage';

const mockCicloActivo = { id: 1, nombre: 'Ciclo 2025-I', tipo: 'anual', fecha_inicio: '2025-03-01', fecha_fin: '2025-12-20', activo: true };

// Track the current mock auth state for per-test overrides
let currentAuthMock: Record<string, unknown> = { cicloActivo: mockCicloActivo };

vi.mock('../../stores/authStore', () => ({
  useAuthStore: (selector: (state: Record<string, unknown>) => unknown) => {
    const state = { ...currentAuthMock };
    return selector ? selector(state) : state;
  },
}));

const mockGetDashboard = vi.fn();
vi.mock('../../api/portalDocente', () => ({
  getDashboard: (...args: unknown[]) => mockGetDashboard(...args),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentAuthMock = { cicloActivo: mockCicloActivo };
  });

  it('renders KPI cards with data', async () => {
    mockGetDashboard.mockResolvedValueOnce({
      clases_hoy: 3,
      total_alumnos: 15,
      horas_mes: 24,
      monto_acumulado: 850.00,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(await screen.findByText('3')).toBeInTheDocument();
    expect(await screen.findByText('15')).toBeInTheDocument();
    expect(await screen.findByText('24')).toBeInTheDocument();
    expect(await screen.findByText(/850/)).toBeInTheDocument();
  });

  it('shows empty state when no ciclo selected', async () => {
    currentAuthMock = { cicloActivo: null };

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Selecciona un ciclo')).toBeInTheDocument();
  });

  it('shows error state on API failure', async () => {
    mockGetDashboard.mockRejectedValueOnce(new Error('API Error'));

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Error al cargar el dashboard')).toBeInTheDocument();
  });
});
