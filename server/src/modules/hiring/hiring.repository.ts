import { getSupabase } from '../../config/supabase';
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
  VacancyRequirement,
} from './hiring.types';

export interface IHiringRepository {
  findAllVacancies(): Promise<Vacancy[]>;
  insertVacancy(data: CreateVacancyDto): Promise<Vacancy>;
  findAllCandidates(): Promise<Candidate[]>;
  insertCandidate(data: CreateCandidateDto): Promise<Candidate>;
  updateCandidate(id: number, data: UpdateCandidateDto): Promise<Candidate>;
  findAllApplications(): Promise<Application[]>;
  insertApplication(data: CreateApplicationDto): Promise<Application>;
  updateApplicationStatus(id: number, status: ApplicationStatus): Promise<Application>;
  insertInterview(applicationId: number, data: CreateInterviewDto): Promise<Interview>;
  hireCandidate(applicationId: number, data: HireCandidateDto): Promise<EmployeeHire>;
}

const today = (): string => new Date().toISOString().slice(0, 10);

const seedVacancies: Vacancy[] = [
  {
    id: 1,
    title: 'Analista de Recursos Humanos',
    description: 'Gestion de reclutamiento, entrevistas y seguimiento de candidatos.',
    department_id: 1,
    publication_date: '2026-06-12',
    status: 'Abierta',
    requirements: [
      {
        id: 1,
        vacancy_id: 1,
        description: 'Licenciatura en Psicologia o Gestion Humana.',
        type: 'Requisito',
      },
      {
        id: 2,
        vacancy_id: 1,
        description: 'Coordinar entrevistas y depurar perfiles.',
        type: 'Responsabilidad',
      },
    ],
  },
  {
    id: 2,
    title: 'Soporte Tecnico Junior',
    description: 'Atencion de tickets, soporte a usuarios y documentacion.',
    department_id: 2,
    publication_date: '2026-06-18',
    status: 'En evaluacion',
    requirements: [
      {
        id: 3,
        vacancy_id: 2,
        description: 'Conocimientos basicos de redes y soporte de escritorio.',
        type: 'Requisito',
      },
      {
        id: 4,
        vacancy_id: 2,
        description: 'Registrar incidencias y escalar casos tecnicos.',
        type: 'Responsabilidad',
      },
    ],
  },
];

const seedCandidates: Candidate[] = [
  {
    id: 1,
    first_name: 'Laura',
    last_name: 'Mendez',
    national_id: '001-0000001-1',
    email: 'laura.mendez@email.com',
    phone: '809-555-0142',
    address: 'Santo Domingo',
    birth_date: '1993-04-12',
    academic_level: 'Licenciatura en Psicologia Industrial',
    work_experience: '3 anos en reclutamiento masivo y entrevistas por competencias.',
    score_ia: null,
    experiencia_ia: null,
    especializacion_ia: null,
    recomendado_ia: null,
    resumen_ia: null,
  },
  {
    id: 2,
    first_name: 'Carlos',
    last_name: 'Rivera',
    national_id: '001-0000002-2',
    email: 'carlos.rivera@email.com',
    phone: '809-555-0188',
    address: 'Santiago',
    birth_date: '1998-09-20',
    academic_level: 'Tecnologo en Redes',
    work_experience: '1 ano dando soporte a usuarios internos.',
    score_ia: null,
    experiencia_ia: null,
    especializacion_ia: null,
    recomendado_ia: null,
    resumen_ia: null,
  },
];

const seedInterviews: Interview[] = [
  {
    id: 1,
    application_id: 1,
    interview_date: '2026-06-20',
    interviewer: 'Laura Mendoza',
    observations: 'Buen dominio de entrevistas y comunicacion clara.',
    result: 'Requiere segunda entrevista',
  },
  {
    id: 2,
    application_id: 2,
    interview_date: '2026-06-22',
    interviewer: 'Rafael Ortiz',
    observations: 'Aprobo prueba tecnica y muestra buena actitud de servicio.',
    result: 'Aprobado',
  },
];

const seedApplications: Application[] = [
  {
    id: 1,
    candidate_id: 1,
    vacancy_id: 1,
    application_date: '2026-06-19',
    status: 'En evaluacion',
  },
  {
    id: 2,
    candidate_id: 2,
    vacancy_id: 2,
    application_date: '2026-06-18',
    status: 'Aprobado',
  },
];

export class InMemoryHiringRepository implements IHiringRepository {
  private vacancies = structuredClone(seedVacancies);
  private candidates = structuredClone(seedCandidates);
  private applications = structuredClone(seedApplications);
  private interviews = structuredClone(seedInterviews);
  private hires: EmployeeHire[] = [];

  async findAllVacancies(): Promise<Vacancy[]> {
    return this.vacancies.map((vacancy) => structuredClone(vacancy));
  }

  async insertVacancy(dto: CreateVacancyDto): Promise<Vacancy> {
    const vacancyId = this.nextId(this.vacancies);
    const requirements: VacancyRequirement[] = dto.requirements.map((requirement) => ({
      id: this.nextId(this.vacancies.flatMap((vacancy) => vacancy.requirements)),
      vacancy_id: vacancyId,
      description: requirement.description,
      type: requirement.type,
    }));

    const vacancy: Vacancy = {
      id: vacancyId,
      title: dto.title,
      description: dto.description,
      department_id: dto.department_id,
      publication_date: dto.publication_date ?? today(),
      status: dto.status,
      requirements,
    };

    this.vacancies.unshift(vacancy);
    return structuredClone(vacancy);
  }

  async findAllCandidates(): Promise<Candidate[]> {
    return this.candidates.map((candidate) => structuredClone(candidate));
  }

  async insertCandidate(dto: CreateCandidateDto): Promise<Candidate> {
    const candidate: Candidate = {
      id: this.nextId(this.candidates),
      ...dto,
    };

    this.candidates.unshift(candidate);
    return structuredClone(candidate);
  }

  async updateCandidate(id: number, dto: UpdateCandidateDto): Promise<Candidate> {
    const candidate = this.candidates.find((item) => item.id === id);
    if (!candidate) throw new Error('Candidato no encontrado');

    Object.assign(candidate, dto);
    return structuredClone(candidate);
  }

  async findAllApplications(): Promise<Application[]> {
    return this.applications.map((application) => this.hydrateApplication(application));
  }

  async insertApplication(dto: CreateApplicationDto): Promise<Application> {
    this.ensureCandidate(dto.candidate_id);
    this.ensureVacancy(dto.vacancy_id);

    const application: Application = {
      id: this.nextId(this.applications),
      candidate_id: dto.candidate_id,
      vacancy_id: dto.vacancy_id,
      application_date: dto.application_date ?? today(),
      status: dto.status,
    };

    this.applications.unshift(application);
    return this.hydrateApplication(application);
  }

  async updateApplicationStatus(id: number, status: ApplicationStatus): Promise<Application> {
    const application = this.applications.find((item) => item.id === id);
    if (!application) throw new Error('Postulacion no encontrada');

    application.status = status;
    return this.hydrateApplication(application);
  }

  async insertInterview(applicationId: number, dto: CreateInterviewDto): Promise<Interview> {
    this.ensureApplication(applicationId);

    const interview: Interview = {
      id: this.nextId(this.interviews),
      application_id: applicationId,
      interview_date: dto.interview_date,
      interviewer: dto.interviewer,
      observations: dto.observations,
      result: dto.result,
    };

    this.interviews.unshift(interview);

    if (dto.result === 'Aprobado') await this.updateApplicationStatus(applicationId, 'Aprobado');
    if (dto.result === 'Rechazado') await this.updateApplicationStatus(applicationId, 'Rechazado');

    return structuredClone(interview);
  }

  async hireCandidate(applicationId: number, dto: HireCandidateDto): Promise<EmployeeHire> {
    const application = this.ensureApplication(applicationId);
    const candidate = this.ensureCandidate(application.candidate_id);

    application.status = 'Contratado';

    const existingHire = this.hires.find((hire) => hire.candidate_id === candidate.id);
    if (existingHire) return structuredClone(existingHire);

    const hire: EmployeeHire = {
      id: this.nextId(this.hires),
      candidate_id: candidate.id,
      first_name: candidate.first_name,
      last_name: candidate.last_name,
      national_id: candidate.national_id,
      hire_date: dto.hire_date ?? today(),
      status: dto.status,
    };

    this.hires.unshift(hire);
    return structuredClone(hire);
  }

  private hydrateApplication(application: Application): Application {
    return structuredClone({
      ...application,
      candidate: this.candidates.find((candidate) => candidate.id === application.candidate_id),
      vacancy: this.vacancies.find((vacancy) => vacancy.id === application.vacancy_id),
      interviews: this.interviews.filter(
        (interview) => interview.application_id === application.id,
      ),
    });
  }

  private ensureCandidate(id: number): Candidate {
    const candidate = this.candidates.find((item) => item.id === id);
    if (!candidate) throw new Error('Candidato no encontrado');
    return candidate;
  }

  private ensureVacancy(id: number): Vacancy {
    const vacancy = this.vacancies.find((item) => item.id === id);
    if (!vacancy) throw new Error('Vacante no encontrada');
    return vacancy;
  }

  private ensureApplication(id: number): Application {
    const application = this.applications.find((item) => item.id === id);
    if (!application) throw new Error('Postulacion no encontrada');
    return application;
  }

  private nextId(collection: { id: number }[]): number {
    return Math.max(0, ...collection.map((item) => item.id)) + 1;
  }
}

export class SupabaseHiringRepository implements IHiringRepository {
  async findAllVacancies(): Promise<Vacancy[]> {
    const { data, error } = await getSupabase()
      .from('vacantes')
      .select('*, requirements:requisito_vacante(*)')
      .order('fecha_publicacion', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapVacancyFromDb);
  }

  async insertVacancy(dto: CreateVacancyDto): Promise<Vacancy> {
    const { data: vacancy, error } = await getSupabase()
      .from('vacantes')
      .insert({
        titulo: dto.title,
        descripcion: dto.description,
        id_departamento: dto.department_id,
        fecha_publicacion: dto.publication_date ?? today(),
        estado: dto.status,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const requirements = dto.requirements.map((requirement) => ({
      id_vacante: vacancy.id_vacante,
      descripcion: requirement.description,
      tipo: requirement.type,
    }));

    const { data: insertedRequirements, error: requirementError } = await getSupabase()
      .from('requisito_vacante')
      .insert(requirements)
      .select();

    if (requirementError) throw new Error(requirementError.message);

    return mapVacancyFromDb({ ...vacancy, requirements: insertedRequirements ?? [] });
  }

  async findAllCandidates(): Promise<Candidate[]> {
    const { data, error } = await getSupabase()
      .from('candidatos')
      .select('*')
      .order('id_candidato', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapCandidateFromDb);
  }

  async insertCandidate(dto: CreateCandidateDto): Promise<Candidate> {
    const { data, error } = await getSupabase()
      .from('candidatos')
      .insert(mapCandidateToDb(dto))
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapCandidateFromDb(data);
  }

  async updateCandidate(id: number, dto: UpdateCandidateDto): Promise<Candidate> {
    const { data, error } = await getSupabase()
      .from('candidatos')
      .update(mapCandidateToDb(dto))
      .eq('id_candidato', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapCandidateFromDb(data);
  }

  async findAllApplications(): Promise<Application[]> {
    const { data, error } = await getSupabase()
      .from('postulaciones')
      .select('*, candidate:candidatos(*), vacancy:vacantes(*), interviews:entrevistas(*)')
      .order('fecha_postulacion', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapApplicationFromDb);
  }

  async insertApplication(dto: CreateApplicationDto): Promise<Application> {
    const { data, error } = await getSupabase()
      .from('postulaciones')
      .insert({
        id_candidato: dto.candidate_id,
        id_vacante: dto.vacancy_id,
        fecha_postulacion: dto.application_date ?? today(),
        estado: dto.status,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapApplicationFromDb(data);
  }

  async updateApplicationStatus(id: number, status: ApplicationStatus): Promise<Application> {
    const { data, error } = await getSupabase()
      .from('postulaciones')
      .update({ estado: status })
      .eq('id_postulacion', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapApplicationFromDb(data);
  }

  async insertInterview(applicationId: number, dto: CreateInterviewDto): Promise<Interview> {
    const { data, error } = await getSupabase()
      .from('entrevistas')
      .insert({
        id_postulacion: applicationId,
        fecha_entrevista: dto.interview_date,
        entrevistador: dto.interviewer,
        observaciones: dto.observations,
        resultado: dto.result,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (dto.result === 'Aprobado') await this.updateApplicationStatus(applicationId, 'Aprobado');
    if (dto.result === 'Rechazado') await this.updateApplicationStatus(applicationId, 'Rechazado');

    return mapInterviewFromDb(data);
  }

  async hireCandidate(applicationId: number, dto: HireCandidateDto): Promise<EmployeeHire> {
    const applications = await this.findAllApplications();
    const application = applications.find((item) => item.id === applicationId);
    if (!application?.candidate) throw new Error('Postulacion no encontrada');

    const { data: existingEmployee, error: existingEmployeeError } = await getSupabase()
      .from('empleados')
      .select('*')
      .eq('id_candidato', application.candidate.id)
      .maybeSingle();

    if (existingEmployeeError) throw new Error(existingEmployeeError.message);

    await this.updateApplicationStatus(applicationId, 'Contratado');

    if (existingEmployee) {
      return {
        id: existingEmployee.id_empleado,
        candidate_id: existingEmployee.id_candidato,
        first_name: existingEmployee.nombre,
        last_name: existingEmployee.apellido,
        national_id: existingEmployee.cedula,
        hire_date: existingEmployee.fecha_ingreso,
        status: existingEmployee.estado,
      };
    }

    const { data, error } = await getSupabase()
      .from('empleados')
      .insert({
        id_candidato: application.candidate.id,
        nombre: application.candidate.first_name,
        apellido: application.candidate.last_name,
        cedula: application.candidate.national_id,
        fecha_nacimiento: application.candidate.birth_date,
        direccion: application.candidate.address,
        telefono: application.candidate.phone,
        email: application.candidate.email,
        fecha_ingreso: dto.hire_date ?? today(),
        estado: dto.status,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id_empleado,
      candidate_id: data.id_candidato,
      first_name: data.nombre,
      last_name: data.apellido,
      national_id: data.cedula,
      hire_date: data.fecha_ingreso,
      status: data.estado,
    };
  }
}

function mapVacancyFromDb(row: Record<string, unknown>): Vacancy {
  return {
    id: Number(row.id_vacante),
    title: String(row.titulo),
    description: String(row.descripcion),
    department_id: row.id_departamento === null ? null : Number(row.id_departamento),
    publication_date: String(row.fecha_publicacion),
    status: row.estado as Vacancy['status'],
    requirements: ((row.requirements as Record<string, unknown>[] | undefined) ?? []).map(
      (requirement) => ({
        id: Number(requirement.id_requisito),
        vacancy_id: Number(requirement.id_vacante),
        description: String(requirement.descripcion),
        type: requirement.tipo as VacancyRequirement['type'],
      }),
    ),
  };
}

function mapCandidateFromDb(row: Record<string, unknown>): Candidate {
  return {
    id: Number(row.id_candidato),
    first_name: String(row.nombre),
    last_name: row.apellido ? String(row.apellido) : '',
    national_id: String(row.cedula),
    email: String(row.correo),
    phone: String(row.telefono),
    address: String(row.ubicacion),
    birth_date: row.fecha_nacimiento ? String(row.fecha_nacimiento) : null,
    academic_level: String(row.educacion),
    work_experience: String(row.experiencia_profesional),
    score_ia: row.score_ia === null || row.score_ia === undefined ? null : Number(row.score_ia),
    experiencia_ia:
      row.experiencia_ia === null || row.experiencia_ia === undefined
        ? null
        : String(row.experiencia_ia),
    especializacion_ia:
      row.especializacion_ia === null || row.especializacion_ia === undefined
        ? null
        : String(row.especializacion_ia),
    recomendado_ia:
      row.recomendado_ia === null || row.recomendado_ia === undefined
        ? null
        : Boolean(row.recomendado_ia),
    resumen_ia:
      row.resumen_profesional === null || row.resumen_profesional === undefined
        ? null
        : String(row.resumen_profesional),
  };
}

function mapApplicationFromDb(row: Record<string, unknown>): Application {
  return {
    id: Number(row.id_postulacion),
    candidate_id: Number(row.id_candidato),
    vacancy_id: Number(row.id_vacante),
    application_date: String(row.fecha_postulacion),
    status: row.estado as ApplicationStatus,
    candidate: row.candidate
      ? mapCandidateFromDb(row.candidate as Record<string, unknown>)
      : undefined,
    vacancy: row.vacancy ? mapVacancyFromDb(row.vacancy as Record<string, unknown>) : undefined,
    interviews: ((row.interviews as Record<string, unknown>[] | undefined) ?? []).map(
      mapInterviewFromDb,
    ),
  };
}

function mapInterviewFromDb(row: Record<string, unknown>): Interview {
  return {
    id: Number(row.id_entrevista),
    application_id: Number(row.id_postulacion),
    interview_date: String(row.fecha_entrevista),
    interviewer: String(row.entrevistador),
    observations: String(row.observaciones),
    result: row.resultado as Interview['result'],
  };
}

function mapCandidateToDb(dto: Partial<CreateCandidateDto>): Record<string, unknown> {
  return {
    ...(dto.first_name !== undefined && { nombre: dto.first_name }),
    ...(dto.last_name !== undefined && { apellido: dto.last_name }),
    ...(dto.national_id !== undefined && { cedula: dto.national_id }),
    ...(dto.email !== undefined && { correo: dto.email }),
    ...(dto.phone !== undefined && { telefono: dto.phone }),
    ...(dto.address !== undefined && { ubicacion: dto.address }),
    ...(dto.birth_date !== undefined && { fecha_nacimiento: dto.birth_date }),
    ...(dto.academic_level !== undefined && { educacion: dto.academic_level }),
    ...(dto.work_experience !== undefined && {
      experiencia_profesional: dto.work_experience,
    }),
    ...(dto.score_ia !== undefined && { score_ia: dto.score_ia }),
    ...(dto.experiencia_ia !== undefined && { experiencia_ia: dto.experiencia_ia }),
    ...(dto.especializacion_ia !== undefined && { especializacion_ia: dto.especializacion_ia }),
    ...(dto.recomendado_ia !== undefined && { recomendado_ia: dto.recomendado_ia }),
    ...(dto.resumen_ia !== undefined && { resumen_profesional: dto.resumen_ia }),
  };
}
