import api from './axios';
import type {
  LoginResponse,
  Profesor,
  Ciclo,
  HorarioDetalle,
  AsistenciaPorHorario,
  HoraTrabajada,
  DashboardDocente,
  NotaClase,
  NotaAlumno,
  NotaDia,
  PagoProfesorPortal,
  AlumnoCartilla,
  HorarioResumen,
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

export const getHorarios = async (cicloId: number): Promise<HorarioDetalle[]> => {
  const response = await api.get<HorarioDetalle[]>(`/portal-docente/ciclos/${cicloId}/horarios/`);
  return response.data;
};

export const getHorarioDetalle = async (cicloId: number, horarioId: number): Promise<HorarioDetalle> => {
  const response = await api.get<HorarioDetalle>(`/portal-docente/ciclos/${cicloId}/horarios/${horarioId}/`);
  return response.data;
};

// ─── Alumnos (Cartilla) ──────────────────────────────────────────────────────

export const getAlumnosCartilla = async (
  cicloId: number,
  params?: { search?: string; taller_id?: number }
): Promise<AlumnoCartilla[]> => {
  let url = `/portal-docente/ciclos/${cicloId}/alumnos/`;
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.taller_id) searchParams.set('taller_id', String(params.taller_id));
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }
  const response = await api.get<AlumnoCartilla[]>(url);
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

// ─── Asistencias por Horario ─────────────────────────────────────────────────

export const getAsistenciasPorHorario = async (
  cicloId: number
): Promise<{ horarios: HorarioResumen[] }> => {
  const response = await api.get<{ horarios: HorarioResumen[] }>(
    `/portal-docente/ciclos/${cicloId}/asistencias/por-horario/`
  );
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
  params?: { horario_id?: number; fecha?: string; ciclo_id?: number }
): Promise<NotaClase[]> => {
  let url = `/portal-docente/ciclos/${cicloId}/notas/`;
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.horario_id) searchParams.set('horario_id', String(params.horario_id));
    if (params.fecha) searchParams.set('fecha', params.fecha);
    if (params.ciclo_id) searchParams.set('ciclo_id', String(params.ciclo_id));
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

// ─── Notas Alumno ────────────────────────────────────────────────────────────

export const getNotasAlumno = async (
  cicloId: number,
  params?: { horario_id?: number; fecha?: string; alumno_id?: number }
): Promise<NotaAlumno[]> => {
  let url = `/portal-docente/ciclos/${cicloId}/notas-alumno/`;
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.horario_id) searchParams.set('horario_id', String(params.horario_id));
    if (params.fecha) searchParams.set('fecha', params.fecha);
    if (params.alumno_id) searchParams.set('alumno_id', String(params.alumno_id));
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }
  const response = await api.get<NotaAlumno[]>(url);
  return response.data;
};

export const createNotaAlumno = async (
  cicloId: number,
  data: { horario: number; alumno: number; fecha: string; contenido: string }
): Promise<NotaAlumno> => {
  const response = await api.post<NotaAlumno>(`/portal-docente/ciclos/${cicloId}/notas-alumno/`, data);
  return response.data;
};

export const updateNotaAlumno = async (
  cicloId: number,
  notaId: number,
  data: { contenido: string }
): Promise<NotaAlumno> => {
  const response = await api.patch<NotaAlumno>(`/portal-docente/ciclos/${cicloId}/notas-alumno/${notaId}/`, data);
  return response.data;
};

export const deleteNotaAlumno = async (cicloId: number, notaId: number): Promise<void> => {
  await api.delete(`/portal-docente/ciclos/${cicloId}/notas-alumno/${notaId}/`);
};

// ─── Notas Dia ────────────────────────────────────────────────────────────────

export const getNotasDia = async (
  cicloId: number,
  params?: { fecha?: string }
): Promise<NotaDia[]> => {
  let url = `/portal-docente/ciclos/${cicloId}/notas-dia/`;
  if (params?.fecha) {
    url += `?fecha=${params.fecha}`;
  }
  const response = await api.get<NotaDia[]>(url);
  return response.data;
};

export const createNotaDia = async (
  cicloId: number,
  data: { fecha: string; contenido: string }
): Promise<NotaDia> => {
  const response = await api.post<NotaDia>(`/portal-docente/ciclos/${cicloId}/notas-dia/`, data);
  return response.data;
};

export const updateNotaDia = async (
  cicloId: number,
  notaId: number,
  data: { contenido: string }
): Promise<NotaDia> => {
  const response = await api.patch<NotaDia>(`/portal-docente/ciclos/${cicloId}/notas-dia/${notaId}/`, data);
  return response.data;
};

export const deleteNotaDia = async (cicloId: number, notaId: number): Promise<void> => {
  await api.delete(`/portal-docente/ciclos/${cicloId}/notas-dia/${notaId}/`);
};

// ─── Pagos ───────────────────────────────────────────────────────────────────

export const getPagos = async (
  cicloId: number,
  estado?: string
): Promise<PagoProfesorPortal[]> => {
  let url = `/portal-docente/ciclos/${cicloId}/pagos/`;
  if (estado) {
    url += `?estado=${estado}`;
  }
  const response = await api.get<PagoProfesorPortal[]>(url);
  return response.data;
};
