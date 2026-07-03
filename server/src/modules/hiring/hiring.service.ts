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
}
