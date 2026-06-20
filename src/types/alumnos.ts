// Types for the Alumnos module (flat table + cascade filters + side panel)

export interface FilterState {
  fecha: string | null;
  tallerId: number | null;
  hora: string | null; // "HH:mm-HH:mm" format
}

export type FilterAction =
  | { type: 'SET_FECHA'; payload: string | null }
  | { type: 'SET_TALLER'; payload: number | null }
  | { type: 'SET_HORA'; payload: string | null }
  | { type: 'RESET_ALL' };

// Cascade filter component props
export interface CascadeFiltersProps {
  fechas: string[];
  talleres: { id: number; nombre: string }[];
  horas: { inicio: string; fin: string; horarioId: number }[];
  selected: FilterState;
  onChange: (field: 'fecha' | 'tallerId' | 'hora', value: string | number | null) => void;
}

// Alumno table component props
export interface AlumnoTableProps {
  alumnos: import('../types').AlumnoCartilla[];
  fechaUltimaAsistencia: Record<number, string | null>;
  onInspect: (alumnoId: number) => void;
}

// SidePanel adapted props
export interface SidePanelProps {
  isOpen: boolean;
  alumnoId: number | null;
  cicloId: number;
  onClose: () => void;
}

// DaySelector component props
export interface DaySelectorProps {
  dates: string[];
  selected: string;
  onChange: (date: string) => void;
}

// AlumnoProfile component props
export interface AlumnoProfileProps {
  alumno: import('../types').AlumnoCartilla | null;
  loading: boolean;
}

// AttendanceHistory component props
export interface AttendanceHistoryProps {
  asistencias: import('../types').AsistenciaPorHorario[];
  loading: boolean;
}

// Note section level
export type NoteLevel = 'general' | 'dia' | 'taller' | 'clase' | 'alumno';

export interface NoteSectionProps {
  alumnoId: number;
  cicloId: number;
  selectedDate: string;
  horarios: import('../types').HorarioDetalle[];
}

// Extended AlumnoCartilla with last attendance (computed client-side)
export interface AlumnoCartillaExt {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  horarios: import('../types').HorarioBadge[];
  fecha_ultima_asistencia: string | null;
}
