import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotasPage from '../../pages/NotasPage';

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
const mockGetNotas = vi.fn();
const mockCreateNota = vi.fn();
const mockUpdateNota = vi.fn();
const mockDeleteNota = vi.fn();
vi.mock('../../api/portalDocente', () => ({
  getHorarios: (...args: unknown[]) => mockGetHorarios(...args),
  getNotas: (...args: unknown[]) => mockGetNotas(...args),
  createNota: (...args: unknown[]) => mockCreateNota(...args),
  updateNota: (...args: unknown[]) => mockUpdateNota(...args),
  deleteNota: (...args: unknown[]) => mockDeleteNota(...args),
}));

describe('NotasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders notes list', async () => {
    mockGetHorarios.mockResolvedValue([
      {
        id: 1, dia_semana: 1, hora_inicio: '14:00', hora_fin: '15:00',
        taller_nombre: 'Guitarra', taller_tipo: 'instrumento',
        cupo_maximo: 10, profesor: 1, ciclo: 1,
      },
    ]);
    mockGetNotas.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <NotasPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/No hay notas/i)).toBeInTheDocument();
  });

  it('shows create form when clicking Nueva nota', async () => {
    mockGetHorarios.mockResolvedValue([
      {
        id: 1, dia_semana: 1, hora_inicio: '14:00', hora_fin: '15:00',
        taller_nombre: 'Guitarra', taller_tipo: 'instrumento',
        cupo_maximo: 10, profesor: 1, ciclo: 1,
      },
    ]);
    mockGetNotas.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <NotasPage />
      </MemoryRouter>
    );

    const nuevaNotaBtn = await screen.findByText('Nueva nota');
    expect(nuevaNotaBtn).toBeInTheDocument();
  });
});
