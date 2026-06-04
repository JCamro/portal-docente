import type React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, type RenderOptions } from '@testing-library/react';
import type { Profesor, Ciclo } from '../types';

// Mock auth state factory
export function createMockProfesor(overrides: Partial<Profesor> = {}): Profesor {
  return {
    id: 1,
    nombre: 'Carlos',
    apellido: 'López',
    dni: '12345678',
    email: 'carlos@example.com',
    telefono: '999888777',
    ...overrides,
  };
}

export function createMockCiclo(overrides: Partial<Ciclo> = {}): Ciclo {
  return {
    id: 1,
    nombre: 'Ciclo 2025-I',
    tipo: 'anual',
    fecha_inicio: '2025-03-01',
    fecha_fin: '2025-12-20',
    activo: true,
    ...overrides,
  };
}

// Wrapper component for tests
export function createWrapper(options: { initialEntries?: string[] } = {}) {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MemoryRouter initialEntries={options.initialEntries || ['/']}>
      {children}
    </MemoryRouter>
  );
  return Wrapper;
}

// Custom render with router
export function renderWithRouter(
  ui: React.ReactElement,
  options: RenderOptions & { initialEntries?: string[] } = {}
) {
  const Wrapper = createWrapper(options);
  return render(ui, { wrapper: Wrapper, ...options });
}
