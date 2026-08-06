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

export type PayrollPeriodType = 'Mensual' | 'Quincenal';

export type PayrollStatus = 'Generada' | 'Aprobada' | 'Pagada' | 'Anulada';

export interface PayrollDetailDB {
  id: number;
  payroll_id: number;
  employee_id: number;
  employee_name: string;
  employee_national_id: string;
  position: string | null;
  department: string | null;
  base_salary: number;
  overtime_hours: number;
  overtime_amount: number;
  gross_pay: number;
  afp: number;
  sfs: number;
  isr: number;
  other_deductions: number;
  total_deductions: number;
  net_pay: number;
}

export interface PayrollRunDB {
  id: number;
  period_start: string;
  period_end: string;
  period_type: PayrollPeriodType;
  status: PayrollStatus;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  created_at: string | null;
  // Solo viene poblado en GET /payroll/runs/:id
  details?: PayrollDetailDB[];
}

export interface GeneratePayrollInput {
  period_start: string; // 'YYYY-MM-DD'
  period_end: string;   // 'YYYY-MM-DD'
  period_type?: PayrollPeriodType; // default 'Mensual' en backend
}

export interface UpdatePayrollStatusInput {
  status: PayrollStatus;
}

export interface PayReceiptDB {
  receipt_number: string;
  issued_at: string;
  period: {
    start: string;
    end: string;
    type: PayrollPeriodType;
  };
  status: PayrollStatus;
  employee: {
    id: number;
    name: string;
    national_id: string;
    position: string | null;
    department: string | null;
  };
  earnings: {
    base_salary: number;
    overtime_hours: number;
    overtime_amount: number;
    gross_pay: number;
  };
  deductions: {
    afp: number;
    sfs: number;
    isr: number;
    other: number;
    total: number;
  };
  net_pay: number;
}