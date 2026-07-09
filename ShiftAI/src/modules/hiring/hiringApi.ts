export type VacancyStatus = 'Abierta' | 'En evaluacion' | 'Cerrada';
export type ApplicationStatus = 'En evaluacion' | 'Aprobado' | 'Rechazado' | 'Contratado';
export type RequirementType = 'Requisito' | 'Responsabilidad';
export type InterviewResult = 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Requiere segunda entrevista';

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

export interface Interview {
  id: number;
  application_id: number;
  interview_date: string;
  interviewer: string;
  observations: string;
  result: InterviewResult;
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

export interface EmployeeHire {
  id: number;
  candidate_id: number;
  first_name: string;
  last_name: string;
  national_id: string;
  hire_date: string;
  status: string;
}

export interface CreateVacancyDto {
  title: string;
  description: string;
  department_id: number | null;
  publication_date?: string;
  status?: VacancyStatus;
  requirements: Array<{
    description: string;
    type: RequirementType;
  }>;
}

export interface CreateCandidateDto {
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

export type UpdateCandidateDto = Partial<CreateCandidateDto>;

export interface CreateApplicationDto {
  candidate_id: number;
  vacancy_id: number;
  application_date?: string;
  status?: ApplicationStatus;
}

export interface CreateInterviewDto {
  interview_date: string;
  interviewer: string;
  observations: string;
  result?: InterviewResult;
}

export interface HireCandidateDto {
  hire_date?: string;
  status?: string;
}

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const rawBody = await response.text();
  let body: unknown = null;

  if (rawBody) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = rawBody;
    }
  }

  if (!response.ok) {
    const payload = body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
    const message =
      (payload && typeof payload.message === 'string' && payload.message) ||
      (payload && typeof payload.error === 'string' && payload.error) ||
      rawBody ||
      `Solicitud fallida (${response.status})`;

    throw new Error(message);
  }

  return body as T;
}

export function getVacancies(): Promise<Vacancy[]> {
  return request<Vacancy[]>('/hiring/vacancies');
}

export function createVacancy(data: CreateVacancyDto): Promise<Vacancy> {
  return request<Vacancy>('/hiring/vacancies', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getCandidates(): Promise<Candidate[]> {
  return request<Candidate[]>('/hiring/candidates');
}

export function createCandidate(data: CreateCandidateDto): Promise<Candidate> {
  return request<Candidate>('/hiring/candidates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateCandidate(id: number, data: UpdateCandidateDto): Promise<Candidate> {
  return request<Candidate>(`/hiring/candidates/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function getApplications(): Promise<Application[]> {
  return request<Application[]>('/hiring/applications');
}

export function createApplication(data: CreateApplicationDto): Promise<Application> {
  return request<Application>('/hiring/applications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateApplicationStatus(id: number, status: ApplicationStatus): Promise<Application> {
  return request<Application>(`/hiring/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function createInterview(applicationId: number, data: CreateInterviewDto): Promise<Interview> {
  return request<Interview>(`/hiring/applications/${applicationId}/interviews`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function hireCandidate(applicationId: number, data: HireCandidateDto): Promise<EmployeeHire> {
  return request<EmployeeHire>(`/hiring/applications/${applicationId}/hire`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
