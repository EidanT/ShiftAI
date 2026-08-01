export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

export interface LoginResult {
  user: AuthUser;
  session: AuthSession;
}

export interface CargoDB {
  nombre: string;
}

export interface DepartamentoDB {
  nombre: string;
}

export interface EmpleadoDB {
  id_empleado: number;
  nombre: string;
  apellido: string;

  email: string | null;

  estado: string;

  fecha_ingreso: string;

  salario_inicial: number | null;

  id_cargo: number | null;

  id_departamento: number | null;

  cargos: CargoDB[] | null;

  departamentos: DepartamentoDB[] | null;
}

// =========================
// Attendance
// =========================

export type EstadoAsistencia =
  | 'Presente'
  | 'Tardanza'
  | 'Ausente';

export interface AsistenciaDB {
  id_asistencia: number;
  id_empleado: number;

  fecha: string;

  hora_entrada: string | null;
  hora_salida: string | null;

  horas_laboradas: number | null;

  estado: EstadoAsistencia;

  created_at: string;
  updated_at: string;

  // Relaciones (cuando se hagan JOINs)
  empleados?: EmpleadoDB;
}

export interface CrearAsistenciaInput {
  id_empleado: number;

  fecha: string;

  hora_entrada: string | null;
  hora_salida: string | null;

  horas_laboradas: number | null;

  estado: EstadoAsistencia;
}

export interface ActualizarAsistenciaInput {
  hora_entrada?: string | null;

  hora_salida?: string | null;

  horas_laboradas?: number | null;

  estado?: EstadoAsistencia;
}

export interface AttendanceFilters {
  fecha?: string;
}