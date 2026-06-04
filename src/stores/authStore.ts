import { create } from 'zustand';

interface Profesor {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string;
  telefono?: string;
}

interface Ciclo {
  id: number;
  nombre: string;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

interface AuthState {
  // In-memory tokens (NOT localStorage)
  accessToken: string | null;
  refreshToken: string | null;
  profesor: Profesor | null;
  ciclos: Ciclo[];
  cicloActivo: Ciclo | null;
  isAuthenticated: boolean;

  // Actions
  setTokens: (access: string, refresh: string) => void;
  setProfesor: (profesor: Profesor) => void;
  setCiclos: (ciclos: Ciclo[]) => void;
  setCicloActivo: (ciclo: Ciclo) => void;
  clearAuth: () => void;
  hasValidSession: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  profesor: null,
  ciclos: [],
  cicloActivo: null,
  isAuthenticated: false,

  setTokens: (access, refresh) =>
    set({
      accessToken: access,
      refreshToken: refresh,
      isAuthenticated: true,
    }),

  setProfesor: (profesor) => set({ profesor }),

  setCiclos: (ciclos) => set({ ciclos }),

  setCicloActivo: (ciclo) => set({ cicloActivo: ciclo }),

  clearAuth: () =>
    set({
      accessToken: null,
      refreshToken: null,
      profesor: null,
      ciclos: [],
      cicloActivo: null,
      isAuthenticated: false,
    }),

  hasValidSession: () => {
    const state = get();
    return !!(
      state.isAuthenticated &&
      state.accessToken &&
      state.refreshToken &&
      state.profesor
    );
  },
}));