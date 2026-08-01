// Core types for portal-docente

export interface Profesor {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string;
  telefono?: string;
}

export interface Ciclo {
  id: number;
  nombre: string;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

export interface Horario {
  id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  taller_id?: number;
  taller_nombre: string;
  taller_tipo: string;
  profesor_nombre?: string;
  cupo_maximo?: number;
  profesor?: number;
  ciclo?: number;
}

export interface HorarioDetalle extends Horario {
  taller_id: number;
  alumnos_count: number;
  alumnos: AlumnoInfo[];
}

export interface AlumnoInfo {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  edad?: number;
}

export interface Asistencia {
  id: number;
  fecha: string;
  hora: string;
  estado: 'presente' | 'ausente';
  matricula: number;
  horario: number;
  alumno_nombre?: string;
}

export interface AsistenciaDocente extends Asistencia {
  alumno: AlumnoInfo;
}

export interface AsistenciaRegistro {
  alumno: AlumnoInfo;
  estado: 'asistio' | 'falta' | 'falta_grave' | 'presente' | 'ausente';
  es_recuperacion?: boolean;
}

export interface AsistenciaPorHorario {
  horario: Horario;
  registros: AsistenciaRegistro[];
}

export interface AlumnoResumenEntry {
  alumno_id: number;
  nombre: string;
  apellido: string;
  dni: string;
  estado_asistencia: 'asistio' | 'falta' | 'falta_grave' | null;
  es_recuperacion: boolean;
  hora_asistencia: string | null;
  inscripcion_activa: boolean;
}

export interface HorarioResumenFecha {
  modo: 'pasado' | 'hoy' | 'futuro';
  fecha: string;
  aviso: string | null;
  horario_id: number;
  taller_nombre: string;
  hora_inicio: string;
  hora_fin: string;
  registros: AlumnoResumenEntry[];
}

export interface PagoProfesor {
  id: number;
  profesor: number;
  ciclo: number;
  horas_calculadas: number;
  monto_final: string;
  fecha_inicio: string;
  fecha_fin: string;
  total_alumnos_asistencias: number;
  ganancia_taller: string;
}

export interface PagoDetalle {
  id: number;
  pago_profesor: number;
  horario: number;
  fecha: string;
  num_alumnos: number;
  valor_generado: string;
  monto_base: string;
  monto_adicional: string;
  monto_profesor: string;
  ganancia_taller: string;
}

export interface HoraTrabajada {
  id: number;
  fecha: string;
  tipo: string;
  horas_trabajadas: number;
  num_alumnos: number;
  monto_profesor: string;
  ganancia_taller: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  observacion: string;
  taller_nombre?: string;
  dia_semana?: number;
}

// ─── Horas Trabajadas Detalle (Sheet) ──────────────────────────────────────────

export interface HoraTrabajadaDetalleAlumno {
  nombre_completo: string;
  estado: 'asistio' | 'falta' | 'falta_grave';
}

export interface HoraTrabajadaDetalleSlot {
  horario_id: number;
  hora_inicio: string;
  hora_fin: string;
  num_alumnos: number;
  monto_profesor: string;
  observacion: string;
  nota_clase: string | null;
  alumnos: HoraTrabajadaDetalleAlumno[];
  es_sustituto: boolean;
  profesor_que_trabajo: string;
  profesor_titular: string;
}

export interface HoraTrabajadaDetalleWorkshop {
  taller_nombre: string;
  slots: HoraTrabajadaDetalleSlot[];
}

export interface HoraTrabajadaDetalleDay {
  fecha: string;
  talleres: HoraTrabajadaDetalleWorkshop[];
}

export interface HoraTrabajadaDetalleSummary {
  total_horas: number;
  total_clases: number;
  total_alumnos: number;
  promedio_alumnos_por_hora: number;
  total_monto: number;
  dias_con_clases: number;
  promedio_horas_por_dia: number;
}

export interface HoraTrabajadaDetalleResponse {
  summary: HoraTrabajadaDetalleSummary;
  days: HoraTrabajadaDetalleDay[];
}

export interface DashboardData {
  total_horas: number;
  total_ingresos: string;
  total_clases: number;
  promedio_alumnos: number;
}

export interface DashboardDocente {
  clases_hoy: number;
  total_alumnos: number;
  total_horarios: number;
  horas_dia: number;
  horas_mes: number;
}

export interface NotaClase {
  id: number;
  horario: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  taller_nombre?: string;
  fecha: string;
  contenido: string;
  created_at: string;
  updated_at?: string;
}

export interface HorarioResumen {
  horario_id: number;
  taller_nombre: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  total_clases: number;
  fechas: string[];
}

export interface FechaAsistenciaResumen {
  fecha: string;
  presente: number;
  ausente: number;
}

export interface NotaAlumno {
  id: number;
  horario: number;
  alumno: number;
  alumno_nombre?: string;
  fecha: string;
  contenido: string;
  created_at: string;
  updated_at?: string;
}

export interface NotaDia {
  id: number;
  titulo: string;
  contenido: string;
  fecha: string;
  created_at: string;
  updated_at?: string;
}

export interface HorarioBadge {
  id: number;
  taller_id?: number;
  taller_nombre: string;
  taller_tipo: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

export interface AlumnoCartilla {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  estado: 'activo' | 'historico';
  fecha_ultima_asistencia: string | null;
  horarios: HorarioBadge[];
}

// ─── Paginated Response ────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── Alumno Detalle Consolidado ─────────────────────────────────

export interface AsistenciaAlumnoDetalle {
  fecha: string;
  estado: string;
  hora: string;
  horario_inicio: string | null;
  horario_fin: string | null;
  dia_semana: number | null;
}

export interface HorarioActivo {
  horario_id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

export interface MatriculaActiva {
  id: number;
  horario_id: number | null;
  taller_id: number;
  taller_nombre: string;
  horarios: HorarioActivo[];
  dia_semana: number | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  sesiones_contratadas: number;
  sesiones_consumidas: number;
  sesiones_disponibles: number;
  precio_por_sesion: string;
  asistencias: AsistenciaAlumnoDetalle[];
}

export interface TallerActivo {
  matricula_id: number;
  taller_id: number;
  taller_nombre: string;
}

export interface MatriculaHistorica {
  id: number;
  taller_id: number;
  taller_nombre: string;
  fecha_matricula: string;
  dia_semana: number | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  sesiones_contratadas: number;
  sesiones_consumidas: number;
  concluida: boolean;
  asistencias: AsistenciaAlumnoDetalle[];
}

export interface TallerHistoricoGrupo {
  taller_id: number;
  taller_nombre: string;
  matriculas: MatriculaHistorica[];
}

export interface EstadisticasAlumno {
  tasa_asistencia: number;
  total_asistencias: number;
  total_faltas: number;
}

export interface EstadisticasTaller {
  taller_id: number;
  taller_nombre: string;
  tasa_asistencia: number;
  total_asistencias: number;
  total_faltas: number;
}

export interface AlumnoDetalle {
  alumno: AlumnoCartilla;
  talleres_activos: TallerActivo[] | null;
  matricula_activa: MatriculaActiva | null;
  matriculas_historicas: MatriculaHistorica[];
  estadisticas: EstadisticasAlumno | null;
  estadisticas_por_taller: EstadisticasTaller[] | null;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: Profesor;
  ciclos: Ciclo[];
}

// ─── Weekly Schedule Grid ─────────────────────────────────────────

export interface HorarioSemanal {
  id: number;
  dia_semana: number; // 0=Lunes..6=Domingo
  hora_inicio: string; // "HH:MM"
  hora_fin: string;
  alumnos_count: number;
  cupo_maximo: number;
  cupo_disponible: number;
  alumnos: AlumnoInfo[];
}

export interface TallerAgrupado {
  taller_id: number;
  taller_nombre: string;
  taller_tipo: 'instrumento' | 'taller';
  taller_color: string;
  horarios: HorarioSemanal[];
}

export interface HorariosSemanalesResponse {
  talleres: TallerAgrupado[];
}

export interface HorarioSemanalConTaller extends HorarioSemanal {
  taller_nombre: string;
  taller_color: string;
}

// ─── Egresos Portal ─────────────────────────────────────────────────────────

export interface EgresoPortal {
  id: number;
  monto: number;
  descripcion: string;
  fecha: string;
  metodo_pago: 'efectivo' | 'transferencia' | 'yape' | 'plin';
  estado: 'pendiente' | 'cancelado';
  beneficiario: string;
  created_at: string;
}

export interface PagosStats {
  total_pagado: number;
  cantidad_pagos: number;
  promedio_pago: number;
  ultimo_pago: string | null;
}

export interface PagosResponse {
  pagos: EgresoPortal[];
  stats: PagosStats;
}
