import { getSupabase } from '../../config/supabase';
import { HttpError } from '../../utils/httpError';
import type {
  AttendanceRecord,
  NewPayrollDetail,
  NewPayrollRun,
  PayrollDetail,
  PayrollEmployee,
  PayrollPeriodType,
  PayrollRun,
  PayrollStatus,
} from './payroll.types';

export interface IPayrollRepository {
  findActiveEmployees(): Promise<PayrollEmployee[]>;
  findAttendanceByPeriod(start: string, end: string): Promise<AttendanceRecord[]>;
  findRunByPeriod(start: string, end: string, type: PayrollPeriodType): Promise<PayrollRun | null>;
  insertRun(run: NewPayrollRun, details: NewPayrollDetail[]): Promise<PayrollRun>;
  findAllRuns(): Promise<PayrollRun[]>;
  findRunById(id: number): Promise<PayrollRun>;
  updateRunStatus(id: number, status: PayrollStatus): Promise<PayrollRun>;
}

const EMPLOYEE_SELECT =
  'nombre, apellido, cedula, cargo:cargos(nombre), departamento:departamentos(nombre)';

export class SupabasePayrollRepository implements IPayrollRepository {
  async findActiveEmployees(): Promise<PayrollEmployee[]> {
    const { data, error } = await getSupabase()
      .from('empleados')
      .select(`id_empleado, salario_inicial, ${EMPLOYEE_SELECT}`)
      .eq('estado', 'Activo')
      .order('id_empleado', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapEmployeeFromDb);
  }

  async findAttendanceByPeriod(start: string, end: string): Promise<AttendanceRecord[]> {
    const { data, error } = await getSupabase()
      .from('asistencia')
      .select('id_empleado, fecha, horas_laboradas')
      .gte('fecha', start)
      .lte('fecha', end);

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      employee_id: Number(row.id_empleado),
      date: String(row.fecha),
      hours_worked: row.horas_laboradas === null ? 0 : Number(row.horas_laboradas),
    }));
  }

  async findRunByPeriod(
    start: string,
    end: string,
    type: PayrollPeriodType,
  ): Promise<PayrollRun | null> {
    const { data, error } = await getSupabase()
      .from('nominas')
      .select('*')
      .eq('periodo_inicio', start)
      .eq('periodo_fin', end)
      .eq('tipo_periodo', type)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapRunFromDb(data) : null;
  }

  async insertRun(run: NewPayrollRun, details: NewPayrollDetail[]): Promise<PayrollRun> {
    const { data: inserted, error } = await getSupabase()
      .from('nominas')
      .insert({
        periodo_inicio: run.period_start,
        periodo_fin: run.period_end,
        tipo_periodo: run.period_type,
        estado: run.status,
        total_bruto: run.total_gross,
        total_descuentos: run.total_deductions,
        total_neto: run.total_net,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const runId = Number(inserted.id_nomina);
    const rows = details.map((detail) => ({
      id_nomina: runId,
      id_empleado: detail.employee_id,
      salario_base: detail.base_salary,
      horas_extras: detail.overtime_hours,
      monto_horas_extras: detail.overtime_amount,
      total_bruto: detail.gross_pay,
      descuento_afp: detail.afp,
      descuento_sfs: detail.sfs,
      descuento_isr: detail.isr,
      otros_descuentos: detail.other_deductions,
      total_descuentos: detail.total_deductions,
      salario_neto: detail.net_pay,
    }));

    const { error: detailError } = await getSupabase().from('detalle_nomina').insert(rows);

    if (detailError) {
      await getSupabase().from('nominas').delete().eq('id_nomina', runId);
      throw new Error(detailError.message);
    }

    return this.findRunById(runId);
  }

  async findAllRuns(): Promise<PayrollRun[]> {
    const { data, error } = await getSupabase()
      .from('nominas')
      .select('*')
      .order('periodo_inicio', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapRunFromDb);
  }

  async findRunById(id: number): Promise<PayrollRun> {
    const { data, error } = await getSupabase()
      .from('nominas')
      .select(`*, details:detalle_nomina(*, employee:empleados(${EMPLOYEE_SELECT}))`)
      .eq('id_nomina', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new HttpError(404, 'Nomina no encontrada');

    return mapRunFromDb(data);
  }

  async updateRunStatus(id: number, status: PayrollStatus): Promise<PayrollRun> {
    const { data, error } = await getSupabase()
      .from('nominas')
      .update({ estado: status, updated_at: new Date().toISOString() })
      .eq('id_nomina', id)
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new HttpError(404, 'Nomina no encontrada');

    return mapRunFromDb(data);
  }
}

function mapEmployeeFromDb(row: Record<string, unknown>): PayrollEmployee {
  return {
    id: Number(row.id_empleado),
    first_name: String(row.nombre),
    last_name: String(row.apellido),
    national_id: String(row.cedula),
    monthly_salary: row.salario_inicial === null ? 0 : Number(row.salario_inicial),
    position: relationName(row.cargo),
    department: relationName(row.departamento),
  };
}

function mapRunFromDb(row: Record<string, unknown>): PayrollRun {
  return {
    id: Number(row.id_nomina),
    period_start: String(row.periodo_inicio),
    period_end: String(row.periodo_fin),
    period_type: row.tipo_periodo as PayrollRun['period_type'],
    status: row.estado as PayrollRun['status'],
    total_gross: Number(row.total_bruto),
    total_deductions: Number(row.total_descuentos),
    total_net: Number(row.total_neto),
    created_at: row.created_at ? String(row.created_at) : null,
    ...(row.details !== undefined && {
      details: ((row.details as Record<string, unknown>[]) ?? []).map(mapDetailFromDb),
    }),
  };
}

function mapDetailFromDb(row: Record<string, unknown>): PayrollDetail {
  const employee = (row.employee ?? {}) as Record<string, unknown>;

  return {
    id: Number(row.id_detalle),
    payroll_id: Number(row.id_nomina),
    employee_id: Number(row.id_empleado),
    employee_name: `${employee.nombre ?? ''} ${employee.apellido ?? ''}`.trim(),
    employee_national_id: employee.cedula ? String(employee.cedula) : '',
    position: relationName(employee.cargo),
    department: relationName(employee.departamento),
    base_salary: Number(row.salario_base),
    overtime_hours: Number(row.horas_extras),
    overtime_amount: Number(row.monto_horas_extras),
    gross_pay: Number(row.total_bruto),
    afp: Number(row.descuento_afp),
    sfs: Number(row.descuento_sfs),
    isr: Number(row.descuento_isr),
    other_deductions: Number(row.otros_descuentos),
    total_deductions: Number(row.total_descuentos),
    net_pay: Number(row.salario_neto),
  };
}

function relationName(value: unknown): string | null {
  if (!value) return null;
  const record = (Array.isArray(value) ? value[0] : value) as Record<string, unknown> | undefined;
  return record?.nombre ? String(record.nombre) : null;
}
