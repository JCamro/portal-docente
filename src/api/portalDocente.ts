import api from './axios';
import type {
  LoginResponse,
  Profesor,
  Ciclo,
  Horario,
  HorarioDetalle,
  AsistenciaPorHorario,
  HoraTrabajada,
  DashboardDocente,
  NotaClase,
} from '../types';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const docenteLogin = async (dni: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/portal-docente/auth/login/', { dni });
  return response.data;
};

export const docenteRefresh = async (refresh: string): Promise<{ access: string }> => {
  const response = await api.post<{ access: string }>('/portal-docente/auth/refresh/', { refresh });
  return response.data;
};

export const docenteLogout = async (refresh: string): Promise<void> => {
  await api.post('/portal-docente/auth/logout/', { refresh });
};

// ─── Me ──────────────────────────────────────────────────────────────────────

export const getProfesor = async (): Promise<Profesor> => {
  const response = await api.get<Profesor>('/portal-docente/me/');
  return response.data;
};

// ─── Ciclos ──────────────────────────────────────────────────────────────────

export const getCiclos = async (): Promise<Ciclo[]> => {
  const response = await api.get<Ciclo[]>('/portal-docente/ciclos/');
  return response.data;
};

// ─── Horarios ────────────────────────────────────────────────────────────────

export const getHorarios = async (cicloId: number): Promise<Horario[]> => {
  const response = await api.get<Horario[]>(`/portal-docente/ciclos/${cicloId}/horarios/`);
  return response.data;
};

export const getHorarioDetalle = async (cicloId: number, horarioId: number): Promise<HorarioDetalle> => {
  const response = await api.get<HorarioDetalle>(`/portal-docente/ciclos/${cicloId}/horarios/${horarioId}/`);
  return response.data;
};

// ─── Asistencias ─────────────────────────────────────────────────────────────

export const getAsistencias = async (
  cicloId: number,
  horarioId: number,
  fecha: string
): Promise<AsistenciaPorHorario[]> => {
  const response = await api.get<AsistenciaPorHorario[]>(
    `/portal-docente/ciclos/${cicloId}/asistencias/?horario_id=${horarioId}&fecha=${fecha}`
  );
  return response.data;
};

// ─── Horas Trabajadas ────────────────────────────────────────────────────────

export const getHorasTrabajadas = async (
  cicloId: number,
  params?: { fecha_desde?: string; fecha_hasta?: string; estado?: string }
): Promise<HoraTrabajada[]> => {
  let url = `/portal-docente/ciclos/${cicloId}/horas-trabajadas/`;
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.fecha_desde) searchParams.set('fecha_desde', params.fecha_desde);
    if (params.fecha_hasta) searchParams.set('fecha_hasta', params.fecha_hasta);
    if (params.estado) searchParams.set('estado', params.estado);
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }
  const response = await api.get<HoraTrabajada[]>(url);
  return response.data;
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const getDashboard = async (cicloId: number): Promise<DashboardDocente> => {
  const response = await api.get<DashboardDocente>(`/portal-docente/ciclos/${cicloId}/dashboard/`);
  return response.data;
};

// ─── Notas ───────────────────────────────────────────────────────────────────

export const getNotas = async (
  cicloId: number,
  params?: { horario_id?: number; fecha?: string }
): Promise<NotaClase[]> => {
  let url = `/portal-docente/ciclos/${cicloId}/notas/`;
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.horario_id) searchParams.set('horario_id', String(params.horario_id));
    if (params.fecha) searchParams.set('fecha', params.fecha);
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }
  const response = await api.get<NotaClase[]>(url);
  return response.data;
};

export const createNota = async (
  cicloId: number,
  data: { horario_id: number; fecha: string; contenido: string }
): Promise<NotaClase> => {
  const response = await api.post<NotaClase>(`/portal-docente/ciclos/${cicloId}/notas/`, data);
  return response.data;
};

export const updateNota = async (
  cicloId: number,
  notaId: number,
  data: { contenido: string; fecha?: string }
): Promise<NotaClase> => {
  const response = await api.patch<NotaClase>(`/portal-docente/ciclos/${cicloId}/notas/${notaId}/`, data);
  return response.data;
};

export const deleteNota = async (cicloId: number, notaId: number): Promise<void> => {
  await api.delete(`/portal-docente/ciclos/${cicloId}/notas/${notaId}/`);
};
