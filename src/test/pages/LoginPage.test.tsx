import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';

// Mock the auth store
const mockSetTokens = vi.fn();
const mockSetProfesor = vi.fn();
const mockSetCiclos = vi.fn();
const mockSetCicloActivo = vi.fn();

vi.mock('../../stores/authStore', () => ({
  useAuthStore: (selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      setTokens: mockSetTokens,
      setProfesor: mockSetProfesor,
      setCiclos: mockSetCiclos,
      setCicloActivo: mockSetCicloActivo,
    };
    return selector ? selector(state) : state;
  },
}));

// Mock the API
const mockDocenteLogin = vi.fn();
vi.mock('../../api/portalDocente', () => ({
  docenteLogin: (...args: unknown[]) => mockDocenteLogin(...args),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLogin = () =>
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

  it('renders DNI input and submit button', () => {
    renderLogin();
    expect(screen.getByLabelText(/Número de DNI/i)).toBeInTheDocument();
    expect(screen.getByText('Continuar')).toBeInTheDocument();
  });

  it('shows validation error for short DNI', async () => {
    renderLogin();
    const input = screen.getByLabelText(/Número de DNI/i);
    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.click(screen.getByText('Continuar'));
    expect(await screen.findByText(/El DNI debe tener entre 7 y 15 caracteres/i)).toBeInTheDocument();
  });

  it('shows error on 401 response', async () => {
    mockDocenteLogin.mockRejectedValueOnce({ response: { status: 401 } });
    renderLogin();
    fireEvent.change(screen.getByLabelText(/Número de DNI/i), { target: { value: '12345678' } });
    fireEvent.click(screen.getByText('Continuar'));
    await waitFor(() => {
      expect(screen.getByText(/DNI no encontrado/i)).toBeInTheDocument();
    });
  });

  it('shows connection error on network failure', async () => {
    mockDocenteLogin.mockRejectedValueOnce(new Error('Network error'));
    renderLogin();
    fireEvent.change(screen.getByLabelText(/Número de DNI/i), { target: { value: '12345678' } });
    fireEvent.click(screen.getByText('Continuar'));
    await waitFor(() => {
      expect(screen.getByText(/Error de conexión/i)).toBeInTheDocument();
    });
  });

  it('disables button while loading', async () => {
    // Keep promise pending to simulate loading
    mockDocenteLogin.mockImplementationOnce(() => new Promise(() => {}));
    renderLogin();
    fireEvent.change(screen.getByLabelText(/Número de DNI/i), { target: { value: '12345678' } });
    fireEvent.click(screen.getByText('Continuar'));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ingresando/i })).toBeDisabled();
    });
  });

  it('renders brand elements', () => {
    renderLogin();
    expect(screen.getByText('Taller de Música Elguera')).toBeInTheDocument();
    expect(screen.getByText('Portal del Docente')).toBeInTheDocument();
  });
});
