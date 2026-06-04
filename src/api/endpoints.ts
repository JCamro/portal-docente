// API endpoints for portal-docente
// Consumes HoraTrabajada API endpoints from sistema-asistencia-taller backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const endpoints = {
  // Auth (portal-docente specific endpoints - to be defined in backend)
  auth: {
    login: `${API_URL}/portal-docente/auth/login/`,
    refresh: `${API_URL}/portal-docente/auth/refresh/`,
    logout: `${API_URL}/portal-docente/auth/logout/`,
  },

  // Professor data
  profesor: {
    me: `${API_URL}/portal-docente/me/`,
  },

  // Horarios (schedules)
  horarios: {
    byCiclo: (cicloId: number) => `${API_URL}/portal-docente/ciclos/${cicloId}/horarios/`,
  },

  // Asistencias (attendance)
  asistencias: {
    byCiclo: (cicloId: number) => `${API_URL}/portal-docente/ciclos/${cicloId}/asistencias/`,
  },

  // Pagos (payments)
  pagos: {
    byCiclo: (cicloId: number) => `${API_URL}/portal-docente/ciclos/${cicloId}/pagos/`,
  },

  // Dashboard
  dashboard: {
    byCiclo: (cicloId: number) => `${API_URL}/portal-docente/ciclos/${cicloId}/dashboard/`,
  },

  // Ciclos (academic cycles)
  ciclos: {
    list: `${API_URL}/portal-docente/ciclos/`,
  },
} as const;

export default endpoints;