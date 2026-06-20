import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AlumnoProfile from '../AlumnoProfile';
import type { AlumnoCartilla } from '../../../types';

describe('AlumnoProfile', () => {
  const mockAlumno: AlumnoCartilla = {
    id: 1,
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '12345678',
    telefono: '999888777',
    email: 'juan@example.com',
    horarios: [
      { id: 1, taller_nombre: 'Guitarra', taller_tipo: 'instrumento', dia_semana: 1, hora_inicio: '10:00', hora_fin: '11:00' },
      { id: 2, taller_nombre: 'Canto', taller_tipo: 'taller', dia_semana: 2, hora_inicio: '14:00', hora_fin: '15:00' },
    ],
  };

  it('renders student name and DNI', () => {
    render(<AlumnoProfile alumno={mockAlumno} loading={false} />);

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('12345678')).toBeInTheDocument();
  });

  it('renders phone and email', () => {
    render(<AlumnoProfile alumno={mockAlumno} loading={false} />);

    expect(screen.getByText('999888777')).toBeInTheDocument();
    expect(screen.getByText('juan@example.com')).toBeInTheDocument();
  });

  it('renders taller badges', () => {
    render(<AlumnoProfile alumno={mockAlumno} loading={false} />);

    expect(screen.getByText('Guitarra')).toBeInTheDocument();
    expect(screen.getByText('Canto')).toBeInTheDocument();
  });

  it('shows "No registrado" when phone is missing', () => {
    const alumnoSinTel: AlumnoCartilla = {
      ...mockAlumno,
      telefono: '',
    };

    render(<AlumnoProfile alumno={alumnoSinTel} loading={false} />);

    expect(screen.getByText('No registrado')).toBeInTheDocument();
  });

  it('shows "No registrado" when email is missing', () => {
    const alumnoSinEmail: AlumnoCartilla = {
      ...mockAlumno,
      email: '',
    };

    render(<AlumnoProfile alumno={alumnoSinEmail} loading={false} />);

    expect(screen.getByText('No registrado')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<AlumnoProfile alumno={null} loading={true} />);

    expect(screen.getByText('Cargando perfil...')).toBeInTheDocument();
  });

  it('shows error state when alumno is null and not loading', () => {
    render(<AlumnoProfile alumno={null} loading={false} />);

    expect(screen.getByText('No se pudo cargar el perfil del alumno.')).toBeInTheDocument();
  });
});
