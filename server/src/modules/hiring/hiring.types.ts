import { z } from 'zod';

export const VacancyStatusSchema = z.enum(['Abierta', 'En evaluacion', 'Cerrada']);
export const CandidateStatusSchema = z.enum([
  'En evaluacion',
  'Aprobado',
  'Rechazado',
  'Contratado',
]);

export type VacancyStatus = z.infer<typeof VacancyStatusSchema>;
export type CandidateStatus = z.infer<typeof CandidateStatusSchema>;

export interface Vacancy {
  id: string;
  title: string;
  area: string;
  status: VacancyStatus;
  requirements: string;
  responsibilities: string;
  created_at: string;
}

export interface Candidate {
  id: string;
  name: string;
  vacancy_id: string;
  experience: string;
  interview_notes?: string;
  status: CandidateStatus;
  created_at: string;
}

export const CreateVacancySchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  area: z.string().min(1, 'El área es requerida'),
  status: VacancyStatusSchema.default('Abierta'),
  requirements: z.string().min(1, 'Los requisitos son requeridos'),
  responsibilities: z.string().min(1, 'Las responsabilidades son requeridas'),
});

export const CreateCandidateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  vacancy_id: z.string().uuid('El ID de vacante debe ser un UUID válido'),
  experience: z.string().min(1, 'La experiencia es requerida'),
  interview_notes: z.string().optional(),
  status: CandidateStatusSchema.default('En evaluacion'),
});

export const UpdateCandidateStatusSchema = z.object({
  status: CandidateStatusSchema,
});

export type CreateVacancyDto = z.infer<typeof CreateVacancySchema>;
export type CreateCandidateDto = z.infer<typeof CreateCandidateSchema>;
export type UpdateCandidateStatusDto = z.infer<typeof UpdateCandidateStatusSchema>;
