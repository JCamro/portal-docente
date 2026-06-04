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
  taller_nombre: string;
  taller_tipo: string;
  cupo_maximo: number;
  profesor: number;
  ciclo: number;
}

export interface HorarioDetalle extends Horario {
  alumnos_count: number;
  alumnos: AlumnoInfo[];
}

export interface AlumnoInfo {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
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
  estado: 'presente' | 'ausente' | 'tardanza';
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
}

export interface NotaClase {
  id: number;
  horario: number;
  horario_info?: Horario;
  fecha: string;
  contenido: string;
  created_at: string;
  updated_at?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: Profesor;
  ciclos: Ciclo[];
}
