import { z } from 'zod';

export const PayrollPeriodTypeSchema = z.enum(['Mensual', 'Quincenal']);
export const PayrollStatusSchema = z.enum(['Generada', 'Aprobada', 'Pagada', 'Anulada']);

export type PayrollPeriodType = z.infer<typeof PayrollPeriodTypeSchema>;
export type PayrollStatus = z.infer<typeof PayrollStatusSchema>;

export interface PayrollEmployee {
  id: number;
  first_name: string;
  last_name: string;
  national_id: string;
  monthly_salary: number;
  position: string | null;
  department: string | null;
}

export interface AttendanceRecord {
  employee_id: number;
  date: string;
  hours_worked: number;
}

export interface PayrollDetail {
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

export type NewPayrollDetail = Omit<PayrollDetail, 'id' | 'payroll_id'>;

export interface PayrollRun {
  id: number;
  period_start: string;
  period_end: string;
  period_type: PayrollPeriodType;
  status: PayrollStatus;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  created_at: string | null;
  details?: PayrollDetail[];
}

export interface NewPayrollRun {
  period_start: string;
  period_end: string;
  period_type: PayrollPeriodType;
  status: PayrollStatus;
  total_gross: number;
  total_deductions: number;
  total_net: number;
}

export interface PayReceipt {
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

export const GeneratePayrollSchema = z
  .object({
    period_start: z.string().date(),
    period_end: z.string().date(),
    period_type: PayrollPeriodTypeSchema.default('Mensual'),
  })
  .refine(
    (value) => value.period_start <= value.period_end,
    'La fecha de inicio del periodo debe ser anterior o igual a la fecha de fin',
  );

export const UpdatePayrollStatusSchema = z.object({
  status: PayrollStatusSchema,
});

export type GeneratePayrollDto = z.infer<typeof GeneratePayrollSchema>;
export type UpdatePayrollStatusDto = z.infer<typeof UpdatePayrollStatusSchema>;
