import type { IHiringRepository } from './hiring.repository';
import type {
  Vacancy,
  Candidate,
  CreateVacancyDto,
  CreateCandidateDto,
  CandidateStatus,
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

  async updateCandidateStatus(id: string, status: CandidateStatus): Promise<Candidate> {
    return this.repository.updateCandidateStatus(id, status);
  }
}
