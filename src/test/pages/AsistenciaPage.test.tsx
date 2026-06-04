import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AsistenciaPage from '../../pages/AsistenciaPage';

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
const mockGetAsistencias = vi.fn();
vi.mock('../../api/portalDocente', () => ({
  getHorarios: (...args: unknown[]) => mockGetHorarios(...args),
  getAsistencias: (...args: unknown[]) => mockGetAsistencias(...args),
}));

describe('AsistenciaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders attendance table with data', async () => {
    mockGetHorarios.mockResolvedValueOnce([
      {
        id: 1, dia_semana: 1, hora_inicio: '14:00', hora_fin: '15:00',
        taller_nombre: 'Guitarra', taller_tipo: 'instrumento',
        cupo_maximo: 10, profesor: 1, ciclo: 1,
      },
    ]);
    mockGetAsistencias.mockResolvedValueOnce([
      {
        horario: { id: 1, dia_semana: 1, hora_inicio: '14:00', hora_fin: '15:00', taller_nombre: 'Guitarra', taller_tipo: 'instrumento', cupo_maximo: 10, profesor: 1, ciclo: 1 },
        registros: [
          { alumno: { id: 1, nombre: 'Ana', apellido: 'García', dni: '11111111' }, estado: 'presente' },
          { alumno: { id: 2, nombre: 'Luis', apellido: 'Pérez', dni: '22222222' }, estado: 'ausente' },
        ],
      },
    ]);

    render(
      <MemoryRouter>
        <AsistenciaPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Asistencia')).toBeInTheDocument();
    expect(await screen.findByText('Solo lectura')).toBeInTheDocument();
    expect(await screen.findByText('Ana García')).toBeInTheDocument();
    expect(await screen.findByText('Luis Pérez')).toBeInTheDocument();
    expect(await screen.findByText('Presente')).toBeInTheDocument();
    expect(await screen.findByText('Ausente')).toBeInTheDocument();
  });

  it('shows empty state when no attendance records', async () => {
    mockGetHorarios.mockResolvedValueOnce([
      {
        id: 1, dia_semana: 1, hora_inicio: '14:00', hora_fin: '15:00',
        taller_nombre: 'Guitarra', taller_tipo: 'instrumento',
        cupo_maximo: 10, profesor: 1, ciclo: 1,
      },
    ]);
    mockGetAsistencias.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <AsistenciaPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Sin registros de asistencia/i)).toBeInTheDocument();
  });
});
