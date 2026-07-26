import { HttpError } from '../../utils/httpError';
import type { IPayrollRepository } from './payroll.repository';
import type {
  AttendanceRecord,
  GeneratePayrollDto,
  NewPayrollDetail,
  PayReceipt,
  PayrollDetail,
  PayrollEmployee,
  PayrollPeriodType,
  PayrollRun,
  PayrollStatus,
} from './payroll.types';

// Reglas de nomina de Republica Dominicana.
const AFP_RATE = 0.0287; // Aporte del empleado al fondo de pensiones (TSS).
const SFS_RATE = 0.0304; // Aporte del empleado al seguro familiar de salud (TSS).
const OVERTIME_MULTIPLIER = 1.35; // Recargo del 35% por hora extra (Codigo de Trabajo, art. 203).
const STANDARD_DAILY_HOURS = 8;
const AVG_MONTHLY_WORKDAYS = 23.83; // Promedio de dias laborables al mes usado por la TSS.

// Escala anual del ISR (DGII), montos en RD$.
const ISR_BRACKETS = [
  { limit: 416_220, base: 0, rate: 0 },
  { limit: 624_329, base: 0, rate: 0.15 },
  { limit: 867_123, base: 31_216, rate: 0.2 },
  { limit: Infinity, base: 79_776, rate: 0.25 },
];

const PERIODS_PER_YEAR: Record<PayrollPeriodType, number> = {
  Mensual: 12,
  Quincenal: 24,
};

const round2 = (value: number): number => Math.round(value * 100) / 100;

export class PayrollService {
  constructor(private readonly repository: IPayrollRepository) {}

  async generatePayroll(dto: GeneratePayrollDto): Promise<PayrollRun> {
    const existing = await this.repository.findRunByPeriod(
      dto.period_start,
      dto.period_end,
      dto.period_type,
    );
    if (existing) {
      throw new HttpError(409, 'Ya existe una nomina generada para este periodo');
    }

    const employees = await this.repository.findActiveEmployees();
    const payable = employees.filter((employee) => employee.monthly_salary > 0);
    if (payable.length === 0) {
      throw new HttpError(422, 'No hay empleados activos con salario asignado');
    }

    const attendance = await this.repository.findAttendanceByPeriod(
      dto.period_start,
      dto.period_end,
    );
    const attendanceByEmployee = new Map<number, AttendanceRecord[]>();
    for (const record of attendance) {
      const records = attendanceByEmployee.get(record.employee_id) ?? [];
      records.push(record);
      attendanceByEmployee.set(record.employee_id, records);
    }

    const details = payable.map((employee) =>
      this.calculateDetail(employee, attendanceByEmployee.get(employee.id) ?? [], dto.period_type),
    );

    const totals = details.reduce(
      (acc, detail) => ({
        gross: acc.gross + detail.gross_pay,
        deductions: acc.deductions + detail.total_deductions,
        net: acc.net + detail.net_pay,
      }),
      { gross: 0, deductions: 0, net: 0 },
    );

    return this.repository.insertRun(
      {
        period_start: dto.period_start,
        period_end: dto.period_end,
        period_type: dto.period_type,
        status: 'Generada',
        total_gross: round2(totals.gross),
        total_deductions: round2(totals.deductions),
        total_net: round2(totals.net),
      },
      details,
    );
  }

  async getRuns(): Promise<PayrollRun[]> {
    return this.repository.findAllRuns();
  }

  async getRun(id: number): Promise<PayrollRun> {
    return this.repository.findRunById(id);
  }

  async updateStatus(id: number, status: PayrollStatus): Promise<PayrollRun> {
    return this.repository.updateRunStatus(id, status);
  }

  async getReceipts(runId: number): Promise<PayReceipt[]> {
    const run = await this.repository.findRunById(runId);
    return (run.details ?? []).map((detail) => buildReceipt(run, detail));
  }

  async getReceipt(runId: number, employeeId: number): Promise<PayReceipt> {
    const run = await this.repository.findRunById(runId);
    const detail = (run.details ?? []).find((item) => item.employee_id === employeeId);
    if (!detail) {
      throw new HttpError(404, 'Comprobante no encontrado para este empleado en la nomina');
    }
    return buildReceipt(run, detail);
  }

  private calculateDetail(
    employee: PayrollEmployee,
    attendance: AttendanceRecord[],
    periodType: PayrollPeriodType,
  ): NewPayrollDetail {
    const monthlySalary = employee.monthly_salary;
    const baseSalary = round2(periodType === 'Quincenal' ? monthlySalary / 2 : monthlySalary);
    const hourlyRate = monthlySalary / AVG_MONTHLY_WORKDAYS / STANDARD_DAILY_HOURS;

    const overtimeHours = round2(
      attendance.reduce(
        (total, record) => total + Math.max(0, record.hours_worked - STANDARD_DAILY_HOURS),
        0,
      ),
    );
    const overtimeAmount = round2(overtimeHours * hourlyRate * OVERTIME_MULTIPLIER);

    const grossPay = round2(baseSalary + overtimeAmount);
    const afp = round2(grossPay * AFP_RATE);
    const sfs = round2(grossPay * SFS_RATE);
    const isr = round2(calculatePeriodIsr(grossPay - afp - sfs, periodType));
    const totalDeductions = round2(afp + sfs + isr);

    return {
      employee_id: employee.id,
      employee_name: `${employee.first_name} ${employee.last_name}`,
      employee_national_id: employee.national_id,
      position: employee.position,
      department: employee.department,
      base_salary: baseSalary,
      overtime_hours: overtimeHours,
      overtime_amount: overtimeAmount,
      gross_pay: grossPay,
      afp,
      sfs,
      isr,
      other_deductions: 0,
      total_deductions: totalDeductions,
      net_pay: round2(grossPay - totalDeductions),
    };
  }
}

// El ISR es una escala anual: se anualiza el salario del periodo (luego de TSS),
// se calcula el impuesto del anio y se divide entre los periodos del anio.
function calculatePeriodIsr(taxablePeriodIncome: number, periodType: PayrollPeriodType): number {
  const periodsPerYear = PERIODS_PER_YEAR[periodType];
  const annualIncome = taxablePeriodIncome * periodsPerYear;

  let annualTax = 0;
  let previousLimit = 0;
  for (const bracket of ISR_BRACKETS) {
    if (annualIncome <= bracket.limit) {
      annualTax = bracket.base + Math.max(0, annualIncome - previousLimit) * bracket.rate;
      break;
    }
    previousLimit = bracket.limit;
  }

  return annualTax / periodsPerYear;
}

function buildReceipt(run: PayrollRun, detail: PayrollDetail): PayReceipt {
  return {
    receipt_number: `NOM-${String(run.id).padStart(4, '0')}-${String(detail.employee_id).padStart(4, '0')}`,
    issued_at: run.created_at ?? '',
    period: {
      start: run.period_start,
      end: run.period_end,
      type: run.period_type,
    },
    status: run.status,
    employee: {
      id: detail.employee_id,
      name: detail.employee_name,
      national_id: detail.employee_national_id,
      position: detail.position,
      department: detail.department,
    },
    earnings: {
      base_salary: detail.base_salary,
      overtime_hours: detail.overtime_hours,
      overtime_amount: detail.overtime_amount,
      gross_pay: detail.gross_pay,
    },
    deductions: {
      afp: detail.afp,
      sfs: detail.sfs,
      isr: detail.isr,
      other: detail.other_deductions,
      total: detail.total_deductions,
    },
    net_pay: detail.net_pay,
  };
}
