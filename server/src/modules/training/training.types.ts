import { z } from 'zod';

export const TrainingFormatSchema = z.enum(['Virtual', 'Presencial', 'Híbrido']);
export const TrainingStatusSchema = z.enum(['Pendiente', 'En progreso', 'Completado', 'Vencido']);

export type TrainingFormat = z.infer<typeof TrainingFormatSchema>;
export type TrainingStatus = z.infer<typeof TrainingStatusSchema>;

export interface TrainingEmployee {
  id: number;
  code: string;
  name: string;
  department: string | null;
  position: string | null;
  initials: string;
}

export interface TrainingCourse {
  id: number;
  code: string;
  title: string;
  description: string;
  category: string;
  department: string;
  provider: string;
  duration_hours: number;
  format: TrainingFormat;
  capacity: number;
  active: boolean;
  enrolled_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface TrainingProgram {
  id: number;
  code: string;
  name: string;
  description: string;
  department: string;
  level: string;
  course_ids: number[];
  active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface TrainingAssignment {
  id: number;
  code: string;
  employee_id: number;
  employee_code: string;
  employee_name: string;
  employee_department: string | null;
  employee_position: string | null;
  course_id: number;
  course_title: string;
  course_category: string;
  program_id: number | null;
  program_name: string | null;
  assigned_on: string;
  due_date: string;
  progress: number;
  status: TrainingStatus;
  score: number | null;
  completed_on: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TrainingSummary {
  active_courses: number;
  active_programs: number;
  open_assignments: number;
  completed_assignments: number;
  completion_rate: number;
  pending_employees: number;
  overdue_assignments: number;
}

export interface TrainingReportRow {
  assignment_code: string;
  employee_code: string;
  employee_name: string;
  department: string | null;
  course: string;
  program: string | null;
  assigned_on: string;
  due_date: string;
  status: TrainingStatus;
  progress: number;
  score: number | null;
  completed_on: string | null;
  notes: string | null;
}

const OptionalTextSchema = z.string().trim().max(1000).optional();

export const CreateTrainingCourseSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(1000).default(''),
  category: z.string().trim().min(2).max(80),
  department: z.string().trim().min(2).max(100).default('Todos los departamentos'),
  provider: z.string().trim().min(2).max(120),
  duration_hours: z.coerce.number().int().min(1).max(2000),
  format: TrainingFormatSchema,
  capacity: z.coerce.number().int().min(1).max(10000),
});

export const UpdateTrainingCourseSchema = CreateTrainingCourseSchema.partial()
  .extend({ active: z.boolean().optional() })
  .refine((value) => Object.keys(value).length > 0, 'Debes enviar al menos un campo');

export const CreateTrainingProgramSchema = z.object({
  name: z.string().trim().min(3).max(160),
  description: z.string().trim().max(1000).default(''),
  department: z.string().trim().min(2).max(100).default('Todos los departamentos'),
  level: z.string().trim().min(2).max(60),
  course_ids: z.array(z.coerce.number().int().positive()).min(1),
});

export const UpdateTrainingProgramSchema = CreateTrainingProgramSchema.partial()
  .extend({ active: z.boolean().optional() })
  .refine((value) => Object.keys(value).length > 0, 'Debes enviar al menos un campo');

export const CreateTrainingAssignmentSchema = z.object({
  employee_id: z.coerce.number().int().positive(),
  course_id: z.coerce.number().int().positive(),
  program_id: z.coerce.number().int().positive().nullable().optional(),
  due_date: z.string().date(),
  notes: OptionalTextSchema,
});

export const UpdateTrainingAssignmentSchema = z
  .object({
    status: TrainingStatusSchema.optional(),
    progress: z.coerce.number().int().min(0).max(100).optional(),
    score: z.coerce.number().min(0).max(100).nullable().optional(),
    completed_on: z.string().date().nullable().optional(),
    notes: z.string().trim().max(1000).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Debes enviar al menos un campo');

export type CreateTrainingCourseDto = z.infer<typeof CreateTrainingCourseSchema>;
export type UpdateTrainingCourseDto = z.infer<typeof UpdateTrainingCourseSchema>;
export type CreateTrainingProgramDto = z.infer<typeof CreateTrainingProgramSchema>;
export type UpdateTrainingProgramDto = z.infer<typeof UpdateTrainingProgramSchema>;
export type CreateTrainingAssignmentDto = z.infer<typeof CreateTrainingAssignmentSchema>;
export type UpdateTrainingAssignmentDto = z.infer<typeof UpdateTrainingAssignmentSchema>;
