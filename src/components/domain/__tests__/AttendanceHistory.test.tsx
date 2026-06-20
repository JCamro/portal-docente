import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AttendanceHistory from '../AttendanceHistory';
import type { AsistenciaPorHorario } from '../../../types';

describe('AttendanceHistory', () => {
  const mockAsistencias: AsistenciaPorHorario[] = [
    {
      horario: { id: 1, dia_semana: 1, hora_inicio: '10:00', hora_fin: '11:00', taller_nombre: 'Guitarra', taller_tipo: 'instrumento' },
      registros: [
        { alumno: { id: 1, nombre: 'Ana', apellido: 'García', dni: '11111111' }, estado: 'presente' },
      ],
    },
    {
      horario: { id: 2, dia_semana: 1, hora_inicio: '14:00', hora_fin: '15:00', taller_nombre: 'Canto', taller_tipo: 'taller' },
      registros: [
        { alumno: { id: 1, nombre: 'Ana', apellido: 'García', dni: '11111111' }, estado: 'ausente' },
      ],
    },
  ];

  it('renders attendance rows', () => {
    render(<AttendanceHistory asistencias={mockAsistencias} loading={false} />);

    expect(screen.getByText('Presente')).toBeInTheDocument();
    expect(screen.getByText('Ausente')).toBeInTheDocument();
  });

  it('shows empty state when no registros', () => {
    render(<AttendanceHistory asistencias={[]} loading={false} />);

    expect(screen.getByText('Sin clases programadas para este día.')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<AttendanceHistory asistencias={[]} loading={true} />);

    expect(screen.getByText('Cargando asistencia...')).toBeInTheDocument();
  });

  it('applies correct color for presente badge', () => {
    render(<AttendanceHistory asistencias={mockAsistencias} loading={false} />);

    const presenteBadge = screen.getByText('Presente');
    expect(presenteBadge).toBeInTheDocument();
    // presente should have green background (jsdom returns rgb)
    expect(presenteBadge.style.background).toBe('rgb(220, 252, 231)');
    expect(presenteBadge.style.color).toBe('rgb(22, 163, 74)');
  });

  it('applies correct color for ausente badge', () => {
    render(<AttendanceHistory asistencias={mockAsistencias} loading={false} />);

    const ausenteBadge = screen.getByText('Ausente');
    expect(ausenteBadge).toBeInTheDocument();
    // ausente should have red background (jsdom returns rgb)
    expect(ausenteBadge.style.background).toBe('rgb(254, 226, 226)');
    expect(ausenteBadge.style.color).toBe('rgb(220, 38, 38)');
  });
});
