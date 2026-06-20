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
  estado: 'presente' | 'ausente' | 'tardanza';
  matricula: number;
  horario: number;
  alumno_nombre?: string;
}

export interface AsistenciaDocente extends Asistencia {
  alumno: AlumnoInfo;
}

export interface AsistenciaRegistro {
  alumno: AlumnoInfo;
  estado: 'asistio' | 'falta' | 'falta_grave' | 'presente' | 'ausente' | 'tardanza';
}

export interface AsistenciaPorHorario {
  horario: Horario;
  registros: AsistenciaRegistro[];
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
  horas_mes: number;
  monto_acumulado: number;
  tiene_pagos: boolean;
}

export interface PagoProfesorPortal {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  horas_calculadas: number;
  monto_final: number;
  estado: string;
  estado_display: string;
  fecha_pago: string | null;
  detalles: PagoProfesorDetallePortal[];
}

export interface PagoProfesorDetallePortal {
  id: number;
  fecha: string;
  taller_nombre: string | null;
  num_alumnos: number;
  monto_profesor: number;
  ganancia_taller: number;
}

export interface NotaClase {
  id: number;
  horario: number;
  horario_info?: Horario;
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
  tardanza: number;
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
  fecha: string;
  contenido: string;
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
  horarios: HorarioBadge[];
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: Profesor;
  ciclos: Ciclo[];
}
