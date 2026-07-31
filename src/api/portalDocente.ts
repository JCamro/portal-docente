import api from './axios';
import type {
  LoginResponse,
  Profesor,
  Ciclo,
  HorarioDetalle,
  AsistenciaPorHorario,
  HorarioResumenFecha,
  HoraTrabajada,
  DashboardDocente,
  NotaClase,
  NotaAlumno,
  NotaDia,
  PagoProfesorPortal,
  AlumnoCartilla,
  HorarioResumen,
  PaginatedResponse,
  AlumnoDetalle,
  HorariosSemanalesResponse,
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

export const getHorariosSemanales = async (cicloId: number): Promise<HorariosSemanalesResponse> => {
  const response = await api.get<HorariosSemanalesResponse>(`/portal-docente/ciclos/${cicloId}/horarios/semanal/`);
  return response.data;
};

// ─── Alumnos (Cartilla) ──────────────────────────────────────────────────────

export interface GetAlumnosCartillaParams {
  search?: string;
  taller_id?: number;
  estado?: string;
  dia_semana?: string;
  hora?: string;
  page?: number;
}

export const getAlumnosCartilla = async (
  cicloId: number,
  params?: GetAlumnosCartillaParams
): Promise<PaginatedResponse<AlumnoCartilla>> => {
  const searchParams = new URLSearchParams();
  if (params) {
    if (params.search) searchParams.set('search', params.search);
    if (params.taller_id) searchParams.set('taller_id', String(params.taller_id));
    if (params.estado) searchParams.set('estado', params.estado);
    if (params.dia_semana) searchParams.set('dia_semana', params.dia_semana);
    if (params.hora) searchParams.set('hora', params.hora);
    if (params.page) searchParams.set('page', String(params.page));
  }
  const qs = searchParams.toString();
  let url = `/portal-docente/ciclos/${cicloId}/alumnos/`;
  if (qs) url += `?${qs}`;
  const response = await api.get<PaginatedResponse<AlumnoCartilla>>(url);
  return response.data;
};

// ─── Alumno Detalle Consolidado ─────────────────────────────────

export const getAlumnoDetalle = async (
  cicloId: number,
  alumnoId: number,
  tallerId?: number
): Promise<AlumnoDetalle> => {
  let url = `/portal-docente/ciclos/${cicloId}/alumnos/${alumnoId}/detalle/`;
  if (tallerId !== undefined) {
    url += `?taller_id=${tallerId}`;
  }
  const response = await api.get<AlumnoDetalle>(url);
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

export const getHorarioResumenFecha = async (
  cicloId: number,
  horarioId: number,
  fecha: string
): Promise<HorarioResumenFecha> => {
  const response = await api.get<HorarioResumenFecha>(
    `/portal-docente/ciclos/${cicloId}/horarios/${horarioId}/resumen-fecha/`,
    { params: { fecha } }
  );
  return response.data;
};

// ─── Asistencias por Alumno (SidePanel) ─────────────────────────────────────

export interface MatriculaMini {
  id: number;
  taller_nombre: string;
  taller_id: number;
  activa: boolean;
  concluida: boolean;
  sesiones_contratadas: number;
}

export interface AsistenciaAlumnoItem {
  id: number;
  fecha: string;
  hora: string;
  estado: string;
  horario_id: number;
}

export interface AlumnoAsistenciaGrupo {
  matricula: MatriculaMini;
  asistencias: AsistenciaAlumnoItem[];
}

export const getAlumnoAsistencias = async (
  cicloId: number,
  alumnoId: number,
  params?: {
    limite?: number;
    incluir_concluidas?: boolean;
    horario_id?: number;
    fecha?: string;
  }
): Promise<AlumnoAsistenciaGrupo[]> => {
  const searchParams = new URLSearchParams();
  if (params?.limite) searchParams.set('limite', String(params.limite));
  if (params?.incluir_concluidas) searchParams.set('incluir_concluidas', 'true');
  if (params?.horario_id) searchParams.set('horario_id', String(params.horario_id));
  if (params?.fecha) searchParams.set('fecha', params.fecha);
  const qs = searchParams.toString();
  let url = `/portal-docente/ciclos/${cicloId}/alumnos/${alumnoId}/asistencias/`;
  if (qs) url += `?${qs}`;
  const response = await api.get<AlumnoAsistenciaGrupo[]>(url);
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
  data: { horario: number; fecha: string; contenido: string }
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
