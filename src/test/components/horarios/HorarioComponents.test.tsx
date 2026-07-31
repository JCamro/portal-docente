import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StudentList from '../../../components/domain/horarios/StudentList';
import AttendanceSummary from '../../../components/domain/horarios/AttendanceSummary';
import HorarioCard from '../../../components/domain/horarios/HorarioCard';
import type { HorarioSemanalConTaller, AsistenciaRegistro, AlumnoInfo } from '../../../types';

const mockAlumnos: AlumnoInfo[] = [
  { id: 1, nombre: 'Juan', apellido: 'Pérez', dni: '12345678' },
  { id: 2, nombre: 'Ana', apellido: 'García', dni: '87654321' },
];

const mockSchedule: HorarioSemanalConTaller = {
  id: 1,
  dia_semana: 0,
  hora_inicio: '14:00',
  hora_fin: '15:00',
  alumnos_count: 5,
  cupo_maximo: 10,
  cupo_disponible: 5,
  alumnos: mockAlumnos,
  taller_nombre: 'Guitarra',
  taller_color: '#e94560',
};

describe('StudentList', () => {
  it('renders empty message when no students', () => {
    render(
      <StudentList
        alumnos={[]}
        expandedAlumnoId={null}
        onToggleNota={vi.fn()}
        horarioId={1}
        fecha="2026-07-29"
        cicloId={1}
      />
    );
    expect(screen.getByText('No hay alumnos inscritos')).toBeInTheDocument();
  });

  it('renders student names in apellido, nombre order', () => {
    render(
      <StudentList
        alumnos={mockAlumnos}
        expandedAlumnoId={null}
        onToggleNota={vi.fn()}
        horarioId={1}
        fecha="2026-07-29"
        cicloId={1}
      />
    );
    expect(screen.getByText('Pérez, Juan')).toBeInTheDocument();
    expect(screen.getByText('García, Ana')).toBeInTheDocument();
  });
});

describe('AttendanceSummary', () => {
  it('renders zero counts when no records', () => {
    render(<AttendanceSummary registros={[]} />);
    expect(screen.getByText('0 presentes')).toBeInTheDocument();
    expect(screen.getByText('0 ausentes')).toBeInTheDocument();
    // falta grave hidden when count is 0 — no noise
    expect(screen.queryByText('falta grave')).not.toBeInTheDocument();
  });

  it('counts each attendance state correctly', () => {
    const registros: AsistenciaRegistro[] = [
      { alumno: mockAlumnos[0], estado: 'asistio' },
      { alumno: mockAlumnos[1], estado: 'falta' },
    ];
    render(<AttendanceSummary registros={registros} />);
    expect(screen.getByText('1 presentes')).toBeInTheDocument();
    expect(screen.getByText('1 ausentes')).toBeInTheDocument();
    expect(screen.getByText('Pérez, Juan')).toBeInTheDocument();
    expect(screen.getByText('García, Ana')).toBeInTheDocument();
  });
});

describe('HorarioCard', () => {
  it('renders taller name, time range and student count', () => {
    render(
      <HorarioCard
        schedule={mockSchedule}
        isExpanded={false}
        onToggle={vi.fn()}
      />
    );
    expect(screen.getByText('Guitarra')).toBeInTheDocument();
    expect(screen.getByText('14:00')).toBeInTheDocument();
    expect(screen.getByText('15:00')).toBeInTheDocument();
    expect(screen.getByText('5 alumnos')).toBeInTheDocument();
  });

  it('renders singular alumno label', () => {
    render(
      <HorarioCard
        schedule={{ ...mockSchedule, alumnos_count: 1 }}
        isExpanded={false}
        onToggle={vi.fn()}
      />
    );
    expect(screen.getByText('1 alumno')).toBeInTheDocument();
  });
});
