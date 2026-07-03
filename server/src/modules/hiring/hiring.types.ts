import { z } from 'zod';

export const VacancyStatusSchema = z.enum(['Abierta', 'En evaluacion', 'Cerrada']);
export const ApplicationStatusSchema = z.enum([
  'En evaluacion',
  'Aprobado',
  'Rechazado',
  'Contratado',
]);
export const RequirementTypeSchema = z.enum(['Requisito', 'Responsabilidad']);
export const InterviewResultSchema = z.enum([
  'Pendiente',
  'Aprobado',
  'Rechazado',
  'Requiere segunda entrevista',
]);

export type VacancyStatus = z.infer<typeof VacancyStatusSchema>;
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;
export type RequirementType = z.infer<typeof RequirementTypeSchema>;
export type InterviewResult = z.infer<typeof InterviewResultSchema>;

export interface VacancyRequirement {
  id: number;
  vacancy_id: number;
  description: string;
  type: RequirementType;
}

export interface Vacancy {
  id: number;
  title: string;
  description: string;
  department_id: number | null;
  publication_date: string;
  status: VacancyStatus;
  requirements: VacancyRequirement[];
}

export interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  national_id: string;
  email: string;
  phone: string;
  address: string;
  birth_date: string | null;
  academic_level: string;
  work_experience: string;
}

export interface Application {
  id: number;
  candidate_id: number;
  vacancy_id: number;
  application_date: string;
  status: ApplicationStatus;
  candidate?: Candidate;
  vacancy?: Vacancy;
  interviews?: Interview[];
}

export interface Interview {
  id: number;
  application_id: number;
  interview_date: string;
  interviewer: string;
  observations: string;
  result: InterviewResult;
}

export interface EmployeeHire {
  id: number;
  candidate_id: number;
  first_name: string;
  last_name: string;
  national_id: string;
  hire_date: string;
  status: string;
}

export const CreateVacancySchema = z.object({
  title: z.string().min(1, 'El titulo es requerido'),
  description: z.string().min(1, 'La descripcion es requerida'),
  department_id: z.number().int().positive().nullable().default(null),
  publication_date: z.string().date().optional(),
  status: VacancyStatusSchema.default('Abierta'),
  requirements: z
    .array(
      z.object({
        description: z.string().min(1, 'La descripcion del requisito es requerida'),
        type: RequirementTypeSchema,
      }),
    )
    .min(1, 'Debe registrar al menos un requisito o responsabilidad'),
});

export const CreateCandidateSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().min(1, 'El apellido es requerido'),
  national_id: z.string().min(1, 'La cedula es requerida'),
  email: z.string().email('El email debe ser valido'),
  phone: z.string().min(1, 'El telefono es requerido'),
  address: z.string().min(1, 'La direccion es requerida'),
  birth_date: z.string().date().nullable().default(null),
  academic_level: z.string().min(1, 'El nivel academico es requerido'),
  work_experience: z.string().min(1, 'La experiencia laboral es requerida'),
});

export const UpdateCandidateSchema = CreateCandidateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Debe enviar al menos un campo para actualizar',
);

export const CreateApplicationSchema = z.object({
  candidate_id: z.number().int().positive(),
  vacancy_id: z.number().int().positive(),
  application_date: z.string().date().optional(),
  status: ApplicationStatusSchema.default('En evaluacion'),
});

export const UpdateApplicationStatusSchema = z.object({
  status: ApplicationStatusSchema,
});

export const CreateInterviewSchema = z.object({
  interview_date: z.string().date(),
  interviewer: z.string().min(1, 'El entrevistador es requerido'),
  observations: z.string().min(1, 'Las observaciones son requeridas'),
  result: InterviewResultSchema.default('Pendiente'),
});

export const HireCandidateSchema = z.object({
  hire_date: z.string().date().optional(),
  status: z.string().min(1).default('Activo'),
});

export type CreateVacancyDto = z.infer<typeof CreateVacancySchema>;
export type CreateCandidateDto = z.infer<typeof CreateCandidateSchema>;
export type UpdateCandidateDto = z.infer<typeof UpdateCandidateSchema>;
export type CreateApplicationDto = z.infer<typeof CreateApplicationSchema>;
export type UpdateApplicationStatusDto = z.infer<typeof UpdateApplicationStatusSchema>;
export type CreateInterviewDto = z.infer<typeof CreateInterviewSchema>;
export type HireCandidateDto = z.infer<typeof HireCandidateSchema>;
