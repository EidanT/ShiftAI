import { z } from 'zod';

export const LicenseTypeSchema = z.enum(['PERMISO', 'LICENCIA', 'VACACIONES']);

export const LicenseStatusSchema = z.enum(['PENDIENTE', 'APROBADO', 'RECHAZADO']);

export type LicenseType = z.infer<typeof LicenseTypeSchema>;
export type LicenseStatus = z.infer<typeof LicenseStatusSchema>;

export interface License {
  id: number;
  employee_id: number;
  employee_name: string;
  type: LicenseType;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: LicenseStatus;
  approved_by: string | null;
}

export interface EmployeeOption {
  id: number;
  name: string;
}

export const CreateLicenseSchema = z
  .object({
    employee_id: z.number().int().positive('El empleado es requerido'),

    type: LicenseTypeSchema,

    start_date: z.string().date('La fecha de inicio debe tener un formato válido'),

    end_date: z.string().date('La fecha final debe tener un formato válido'),

    reason: z.string().nullable().optional().default(null),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: 'La fecha final debe ser mayor o igual a la fecha de inicio',
    path: ['end_date'],
  });

export const UpdateLicenseSchema = z
  .object({
    employee_id: z.number().int().positive().optional(),

    type: LicenseTypeSchema.optional(),

    start_date: z.string().date('La fecha de inicio debe tener un formato válido').optional(),

    end_date: z.string().date('La fecha final debe tener un formato válido').optional(),

    reason: z.string().nullable().optional(),

    status: LicenseStatusSchema.optional(),

    approved_by: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return data.end_date >= data.start_date;
      }

      return true;
    },
    {
      message: 'La fecha final debe ser mayor o igual a la fecha de inicio',
      path: ['end_date'],
    },
  )
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

export const UpdateLicenseStatusSchema = z.object({
  status: LicenseStatusSchema,

  approved_by: z.string().min(1, 'Debe indicar quién procesa la solicitud'),
});

export type CreateLicenseDto = z.infer<typeof CreateLicenseSchema>;

export type UpdateLicenseDto = z.infer<typeof UpdateLicenseSchema>;

export type UpdateLicenseStatusDto = z.infer<typeof UpdateLicenseStatusSchema>;
