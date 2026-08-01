import type { IHiringRepository } from './hiring.repository';
import type {
  Application,
  ApplicationStatus,
  Candidate,
  CreateApplicationDto,
  CreateCandidateDto,
  CreateInterviewDto,
  CreateVacancyDto,
  EmployeeHire,
  HireCandidateDto,
  Interview,
  UpdateCandidateDto,
  Vacancy,
} from './hiring.types';

export class HiringService {
  constructor(private readonly repository: IHiringRepository) {}

  async getVacancies(): Promise<Vacancy[]> {
    return this.repository.findAllVacancies();
  }

  async createVacancy(data: CreateVacancyDto): Promise<Vacancy> {
    return this.repository.insertVacancy(data);
  }

  async getCandidates(): Promise<Candidate[]> {
    return this.repository.findAllCandidates();
  }

  async createCandidate(data: CreateCandidateDto): Promise<Candidate> {
    return this.repository.insertCandidate(data);
  }

  async updateCandidate(id: number, data: UpdateCandidateDto): Promise<Candidate> {
    return this.repository.updateCandidate(id, data);
  }

  async getApplications(): Promise<Application[]> {
    return this.repository.findAllApplications();
  }

  async createApplication(data: CreateApplicationDto): Promise<Application> {
    return this.repository.insertApplication(data);
  }

  async updateApplicationStatus(id: number, status: ApplicationStatus): Promise<Application> {
    return this.repository.updateApplicationStatus(id, status);
  }

  async createInterview(applicationId: number, data: CreateInterviewDto): Promise<Interview> {
    return this.repository.insertInterview(applicationId, data);
  }

  async hireCandidate(applicationId: number, data: HireCandidateDto): Promise<EmployeeHire> {
    return this.repository.hireCandidate(applicationId, data);
  }

  async analyzeCV(
    fileBuffer: Buffer,
    filename: string,
    requirements: string,
  ): Promise<{
    score: number;
    experiencia: string;
    especializacion: string;
    recomendado: boolean;
    justificacion: string;
    resumen: string;
  }> {
    const SERVICES_URL = process.env.SERVICES_URL ?? 'http://localhost:8001';

    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    formData.append('file', blob, filename);
    formData.append('requirements', requirements);

    const response = await fetch(`${SERVICES_URL}/v1/cv/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servicio de analisis: ${response.status} - ${errorText}`);
    }

    interface AnalyzeResponse {
      score: number;
      experiencia: string;
      especializacion: string;
      recomendado: boolean;
      justificacion: string;
      resumen: string;
    }
    const data = (await response.json()) as AnalyzeResponse;
    return {
      score: data.score,
      experiencia: data.experiencia,
      especializacion: data.especializacion,
      recomendado: data.recomendado,
      justificacion: data.justificacion,
      resumen: data.resumen,
    };
  }
}
