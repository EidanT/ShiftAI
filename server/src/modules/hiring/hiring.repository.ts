import { getSupabase } from '../../config/supabase';
import type {
  Vacancy,
  Candidate,
  CreateVacancyDto,
  CreateCandidateDto,
  CandidateStatus,
} from './hiring.types';

export interface IHiringRepository {
  findAllVacancies(): Promise<Vacancy[]>;
  insertVacancy(data: CreateVacancyDto): Promise<Vacancy>;
  findAllCandidates(): Promise<Candidate[]>;
  insertCandidate(data: CreateCandidateDto): Promise<Candidate>;
  updateCandidateStatus(id: string, status: CandidateStatus): Promise<Candidate>;
}

export class SupabaseHiringRepository implements IHiringRepository {
  async findAllVacancies(): Promise<Vacancy[]> {
    const { data, error } = await getSupabase()
      .from('vacancies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Vacancy[];
  }

  async insertVacancy(dto: CreateVacancyDto): Promise<Vacancy> {
    const { data, error } = await getSupabase().from('vacancies').insert(dto).select().single();

    if (error) throw new Error(error.message);
    return data as Vacancy;
  }

  async findAllCandidates(): Promise<Candidate[]> {
    const { data, error } = await getSupabase()
      .from('candidates')
      .select('*, vacancies(title, area)')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Candidate[];
  }

  async insertCandidate(dto: CreateCandidateDto): Promise<Candidate> {
    const { data, error } = await getSupabase().from('candidates').insert(dto).select().single();

    if (error) throw new Error(error.message);
    return data as Candidate;
  }

  async updateCandidateStatus(id: string, status: CandidateStatus): Promise<Candidate> {
    const { data, error } = await getSupabase()
      .from('candidates')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Candidate;
  }
}
