import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Briefcase,
  Calendar,
  Edit3,
  FileText,
  Plus,
  RotateCw,
  Search,
  UserCheck2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  type Application,
  type ApplicationStatus,
  type Candidate,
  type CreateApplicationDto,
  type CreateCandidateDto,
  type CreateInterviewDto,
  type CreateVacancyDto,
  type Interview,
  type InterviewResult,
  type Vacancy,
  type VacancyStatus,
  createApplication,
  createCandidate,
  createInterview,
  createVacancy,
  getApplications,
  getCandidates,
  getVacancies,
  hireCandidate,
  updateApplicationStatus,
  updateCandidate,
} from './hiringApi';

interface RecruitmentViewProps {
  onTriggerToast: (text: string, sub?: string, type?: 'success' | 'info' | 'error') => void;
}

interface VacancyFormState {
  title: string;
  description: string;
  department_id: string;
  status: VacancyStatus;
  requirements: string;
  responsibilities: string;
}

interface CandidateFormState {
  first_name: string;
  last_name: string;
  national_id: string;
  email: string;
  phone: string;
  address: string;
  birth_date: string;
  academic_level: string;
  work_experience: string;
  vacancy_id: string;
}

const applicationStatuses: ApplicationStatus[] = ['En evaluacion', 'Aprobado', 'Rechazado', 'Contratado'];
const interviewResults: InterviewResult[] = [
  'Pendiente',
  'Aprobado',
  'Rechazado',
  'Requiere segunda entrevista',
];

const today = () => new Date().toISOString().slice(0, 10);

const emptyVacancyForm: VacancyFormState = {
  title: '',
  description: '',
  department_id: '',
  status: 'Abierta',
  requirements: '',
  responsibilities: '',
};

const emptyCandidateForm: CandidateFormState = {
  first_name: '',
  last_name: '',
  national_id: '',
  email: '',
  phone: '',
  address: '',
  birth_date: '',
  academic_level: '',
  work_experience: '',
  vacancy_id: '',
};

const normalizeId = (value: string): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const splitEntries = (value: string): string[] =>
  value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);

const joinDescriptions = (items: Array<{ description: string }>): string =>
  items.map((item) => item.description).join(' ');

const getCandidateName = (candidate: Candidate): string =>
  `${candidate.first_name} ${candidate.last_name}`.trim();

const getCandidateSearchText = (candidate: Candidate, application?: Application): string =>
  [
    candidate.first_name,
    candidate.last_name,
    candidate.national_id,
    candidate.email,
    candidate.phone,
    candidate.address,
    candidate.academic_level,
    candidate.work_experience,
    application?.vacancy?.title ?? '',
    application?.status ?? '',
  ]
    .join(' ')
    .toLowerCase();

const getLatestInterview = (application?: Application): Interview | undefined => {
  const interviews = [...(application?.interviews ?? [])];
  interviews.sort((a, b) => {
    const byDate = new Date(b.interview_date).getTime() - new Date(a.interview_date).getTime();
    if (byDate !== 0) return byDate;
    return b.id - a.id;
  });

  return interviews[0];
};

const getVacancyLabel = (vacancy?: Vacancy): string =>
  vacancy ? `Departamento ${vacancy.department_id ?? 'sin asignar'}` : 'Sin vacante';

export default function RecruitmentView({ onTriggerToast }: RecruitmentViewProps) {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showVacancyModal, setShowVacancyModal] = useState(false);
  const [vacancyForm, setVacancyForm] = useState<VacancyFormState>(emptyVacancyForm);
  const [candidateForm, setCandidateForm] = useState<CandidateFormState>(emptyCandidateForm);
  const [editingCandidateId, setEditingCandidateId] = useState<number | null>(null);
  const [interviewCandidateId, setInterviewCandidateId] = useState<number | null>(null);
  const [interviewForm, setInterviewForm] = useState<CreateInterviewDto>({
    interview_date: today(),
    interviewer: 'Laura Mendoza',
    observations: '',
    result: 'Pendiente',
  });
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'Todos' | ApplicationStatus>('Todos');

  const [savingVacancy, setSavingVacancy] = useState(false);
  const [savingCandidate, setSavingCandidate] = useState(false);
  const [savingInterview, setSavingInterview] = useState(false);
  const [pendingHireId, setPendingHireId] = useState<number | null>(null);

  const loadData = async (silent = false): Promise<boolean> => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError(null);
      const [nextVacancies, nextCandidates, nextApplications] = await Promise.all([
        getVacancies(),
        getCandidates(),
        getApplications(),
      ]);

      setVacancies(nextVacancies);
      setCandidates(nextCandidates);
      setApplications(nextApplications);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No fue posible cargar el modulo de reclutamiento.';
      setError(message);
      onTriggerToast('No se pudo cargar el modulo', message, 'error');
      return false;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }

    return true;
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    setCandidateForm((current) => {
      if (current.vacancy_id || vacancies.length === 0) return current;
      return { ...current, vacancy_id: String(vacancies[0].id) };
    });
  }, [vacancies]);

  useEffect(() => {
    setInterviewCandidateId((current) => {
      if (current && candidates.some((candidate) => candidate.id === current)) return current;
      return candidates[0]?.id ?? null;
    });
  }, [candidates]);

  const applicationByCandidateId = useMemo(() => {
    const map = new Map<number, Application>();
    const sortedApplications = [...applications].sort((a, b) => {
      const byDate = new Date(b.application_date).getTime() - new Date(a.application_date).getTime();
      if (byDate !== 0) return byDate;
      return b.id - a.id;
    });

    for (const application of sortedApplications) {
      if (!map.has(application.candidate_id)) {
        map.set(application.candidate_id, application);
      }
    }

    return map;
  }, [applications]);

  const candidateRows = useMemo(
    () =>
      candidates
        .map((candidate) => ({
          candidate,
          application: applicationByCandidateId.get(candidate.id),
        }))
        .sort((left, right) => {
          const leftDate = left.application ? new Date(left.application.application_date).getTime() : 0;
          const rightDate = right.application ? new Date(right.application.application_date).getTime() : 0;
          if (leftDate !== rightDate) return rightDate - leftDate;
          return right.candidate.id - left.candidate.id;
        }),
    [applicationByCandidateId, candidates],
  );

  const interviewCandidate = useMemo(
    () => candidateRows.find((row) => row.candidate.id === interviewCandidateId) ?? null,
    [candidateRows, interviewCandidateId],
  );

  const filteredCandidateRows = useMemo(() => {
    const search = candidateSearchQuery.toLowerCase();

    return candidateRows.filter((row) => {
      const text = getCandidateSearchText(row.candidate, row.application);
      const status = row.application?.status ?? 'En evaluacion';
      const matchesSearch = text.includes(search);
      const matchesStatus = filterStatus === 'Todos' || status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [candidateRows, candidateSearchQuery, filterStatus]);

  const totalInterviews = applications.reduce((total, application) => total + (application.interviews?.length ?? 0), 0);
  const totalHired = applications.filter((application) => application.status === 'Contratado').length;
  const selectedContractCandidateId = pendingHireId ?? candidateRows.find((row) => row.application?.status === 'Contratado')?.candidate.id ?? null;

  const refreshData = async () => loadData(true);

  const resetCandidateForm = () => {
    setCandidateForm({
      ...emptyCandidateForm,
      vacancy_id: vacancies[0] ? String(vacancies[0].id) : '',
    });
    setEditingCandidateId(null);
  };

  const handleGuardarVacante = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingVacancy(true);

    try {
      const requirementItems = splitEntries(vacancyForm.requirements).map((description) => ({
        description,
        type: 'Requisito' as const,
      }));
      const responsibilityItems = splitEntries(vacancyForm.responsibilities).map((description) => ({
        description,
        type: 'Responsabilidad' as const,
      }));
      const departmentId = normalizeId(vacancyForm.department_id);

      const payload: CreateVacancyDto = {
        title: vacancyForm.title.trim(),
        description: vacancyForm.description.trim(),
        department_id: departmentId,
        publication_date: today(),
        status: vacancyForm.status,
        requirements: [...requirementItems, ...responsibilityItems],
      };

      if (payload.requirements.length === 0) {
        onTriggerToast('Faltan requisitos', 'Agregue al menos un requisito o responsabilidad para publicar la vacante.', 'error');
        return;
      }

      const createdVacancy = await createVacancy(payload);
      setVacancyForm(emptyVacancyForm);
      setShowVacancyModal(false);
      onTriggerToast('Vacante registrada', `Se publico "${createdVacancy.title}" correctamente.`, 'success');
      await refreshData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No fue posible guardar la vacante.';
      onTriggerToast('No se pudo guardar la vacante', message, 'error');
    } finally {
      setSavingVacancy(false);
    }
  };

  const handleGuardarCandidato = async (event: React.FormEvent) => {
    event.preventDefault();

    const vacancyId = normalizeId(candidateForm.vacancy_id);
    if (!vacancyId) {
      onTriggerToast('Vacante requerida', 'Seleccione una vacante antes de guardar el candidato.', 'error');
      return;
    }

    const payload: CreateCandidateDto = {
      first_name: candidateForm.first_name.trim(),
      last_name: candidateForm.last_name.trim(),
      national_id: candidateForm.national_id.trim(),
      email: candidateForm.email.trim(),
      phone: candidateForm.phone.trim(),
      address: candidateForm.address.trim(),
      birth_date: candidateForm.birth_date || null,
      academic_level: candidateForm.academic_level.trim(),
      work_experience: candidateForm.work_experience.trim(),
    };

    setSavingCandidate(true);

    try {
      if (editingCandidateId !== null) {
        await updateCandidate(editingCandidateId, payload);

        const currentApplication = applicationByCandidateId.get(editingCandidateId);
        const applicationExists = applications.some(
          (application) =>
            application.candidate_id === editingCandidateId && application.vacancy_id === vacancyId,
        );

        if (currentApplication && currentApplication.vacancy_id !== vacancyId && !applicationExists) {
          await createApplication({
            candidate_id: editingCandidateId,
            vacancy_id: vacancyId,
            status: currentApplication.status,
          });
        }

        onTriggerToast('Candidato actualizado', `${payload.first_name} fue actualizado correctamente.`, 'success');
      } else {
        const createdCandidate = await createCandidate(payload);
        await createApplication({
          candidate_id: createdCandidate.id,
          vacancy_id: vacancyId,
          status: 'En evaluacion',
        });
        onTriggerToast(
          'Candidato registrado',
          `${createdCandidate.first_name} ${createdCandidate.last_name} fue agregado a la vacante seleccionada.`,
          'success',
        );
      }

      resetCandidateForm();
      await refreshData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No fue posible guardar el candidato.';
      onTriggerToast('No se pudo guardar el candidato', message, 'error');
    } finally {
      setSavingCandidate(false);
    }
  };

  const handleEditarCandidato = (candidate: Candidate) => {
    const application = applicationByCandidateId.get(candidate.id);
    setEditingCandidateId(candidate.id);
    setCandidateForm({
      first_name: candidate.first_name,
      last_name: candidate.last_name,
      national_id: candidate.national_id,
      email: candidate.email,
      phone: candidate.phone,
      address: candidate.address,
      birth_date: candidate.birth_date ?? '',
      academic_level: candidate.academic_level,
      work_experience: candidate.work_experience,
      vacancy_id: String(application?.vacancy_id ?? vacancies[0]?.id ?? ''),
    });
    onTriggerToast('Ficha cargada', `Ahora puede actualizar la informacion de ${getCandidateName(candidate)}.`, 'info');
  };

  const handleCambiarEstado = async (candidateId: number, status: ApplicationStatus) => {
    const application = applicationByCandidateId.get(candidateId);
    if (!application) {
      onTriggerToast('Postulacion no encontrada', 'Ese candidato aun no tiene una postulacion registrada.', 'error');
      return;
    }

    try {
      if (status === 'Contratado') {
        setPendingHireId(candidateId);
        await hireCandidate(application.id, {
          hire_date: today(),
          status: 'Activo',
        });
        const candidate = application.candidate ?? candidates.find((item) => item.id === candidateId);
        if (!candidate) {
          throw new Error('No se pudo resolver el candidato seleccionado.');
        }

        onTriggerToast('Candidato contratado', `${getCandidateName(candidate)} paso a la plantilla activa.`, 'success');
      } else {
        await updateApplicationStatus(application.id, status);
        onTriggerToast('Estado actualizado', `La candidatura cambio a "${status}".`, 'success');
      }

      await refreshData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No fue posible actualizar el estado.';
      onTriggerToast('No se pudo actualizar el estado', message, 'error');
    }
  };

  const handleRegistrarEntrevista = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!interviewCandidate) {
      onTriggerToast('Candidato requerido', 'Seleccione un candidato con postulacion para registrar la entrevista.', 'error');
      return;
    }

    if (!interviewCandidate.application) {
      onTriggerToast('Postulacion requerida', 'Primero debe existir una postulacion para registrar la entrevista.', 'error');
      return;
    }

    setSavingInterview(true);

    try {
      await createInterview(interviewCandidate.application.id, {
        interview_date: interviewForm.interview_date,
        interviewer: interviewForm.interviewer.trim(),
        observations: interviewForm.observations.trim() || 'Sin observaciones adicionales.',
        result: interviewForm.result,
      });

      setInterviewForm({
        interview_date: today(),
        interviewer: interviewForm.interviewer,
        observations: '',
        result: 'Pendiente',
      });
      onTriggerToast(
        'Entrevista registrada',
        `Se guardaron las observaciones de ${getCandidateName(interviewCandidate.candidate)}.`,
        'success',
      );
      await refreshData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No fue posible registrar la entrevista.';
      onTriggerToast('No se pudo registrar la entrevista', message, 'error');
    } finally {
      setSavingInterview(false);
    }
  };

  const handleSeleccionarParaContratacion = async (candidate: Candidate) => {
    const application = applicationByCandidateId.get(candidate.id);
    if (!application) {
      onTriggerToast('Postulacion no encontrada', 'Ese candidato no tiene una postulacion asociada.', 'error');
      return;
    }

    try {
      setPendingHireId(candidate.id);
      await hireCandidate(application.id, {
        hire_date: today(),
        status: 'Activo',
      });
      onTriggerToast('Candidato contratado', `${getCandidateName(candidate)} quedo registrado como empleado.`, 'success');
      await refreshData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No fue posible contratar al candidato.';
      onTriggerToast('No se pudo contratar al candidato', message, 'error');
    }
  };

  const handleActualizarDatos = async () => {
    const success = await refreshData();
    if (success) {
      onTriggerToast('Datos actualizados', 'La informacion del modulo fue refrescada desde Supabase.', 'info');
    }
  };

  const vacancySelectOptions = vacancies.length > 0 ? vacancies : [];

  if (loading) {
    return (
      <div className="space-y-6 text-left">
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Cargando modulo de reclutamiento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display flex items-center gap-2 text-[26px] font-bold tracking-tight text-[#0F172A]">
            <Briefcase className="h-6 w-6 text-[#113B7A]" />
            Reclutamiento y Seleccion de Personal
          </h1>
          <p className="mt-1 text-[13px] font-medium text-slate-500">
            Flujo funcional para vacantes, candidatos, entrevistas, estados y seleccion para contratacion.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowVacancyModal(true)}
          className="flex items-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 lg:self-center"
        >
          <Plus className="h-4 w-4 text-slate-500" />
          Nueva vacante
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Vacantes', vacancies.length, 'Registradas con requisitos y responsabilidades', Briefcase],
          ['Candidatos', candidates.length, 'Con informacion personal y profesional', Users],
          ['Entrevistas', totalInterviews, 'Con observaciones y resultados', Calendar],
          ['Contratados', totalHired, 'Seleccionados para pasar a empleados', UserCheck2],
        ].map(([label, value, caption, Icon]) => {
          const SummaryIcon = Icon as typeof Briefcase;

          return (
            <article key={String(label)} className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label as string}</p>
                <SummaryIcon className="h-4 w-4 text-slate-400" />
              </div>
              <strong className="mt-2 block text-3xl font-extrabold tracking-tight text-[#0F172A]">
                {value as number}
              </strong>
              <p className="mt-1.5 text-[11px] font-semibold text-slate-400">{caption as string}</p>
            </article>
          );
        })}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <section className="space-y-4 rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-sm xl:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Vacantes laborales</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">Cada vacante conserva requisitos y responsabilidades.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowVacancyModal(true)}
              className="rounded-lg bg-[#F1F5F9] px-3.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-200"
            >
              Registrar
            </button>
          </div>

          <div className="max-h-[440px] space-y-4 overflow-y-auto pr-1">
            {vacancies.map((vacancy) => {
              const requirementList = vacancy.requirements.filter((item) => item.type === 'Requisito');
              const responsibilityList = vacancy.requirements.filter((item) => item.type === 'Responsabilidad');

              return (
                <article key={vacancy.id} className="rounded-lg border border-slate-200 bg-slate-50/30 p-4 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{vacancy.title}</h3>
                      <span className="mt-0.5 inline-block text-[11px] font-semibold text-slate-400">
                        {getVacancyLabel(vacancy)} - {vacancy.id}
                      </span>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        vacancy.status === 'Abierta'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                          : vacancy.status === 'En evaluacion'
                            ? 'border-cyan-200 bg-cyan-50 text-cyan-600'
                            : 'border-slate-200 bg-slate-100 text-slate-500'
                      }`}
                    >
                      {vacancy.status}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 leading-relaxed text-slate-700">
                    <p>
                      <strong className="text-slate-500">Descripcion:</strong> {vacancy.description}
                    </p>
                    <p>
                      <strong className="text-slate-500">Requisitos:</strong>{' '}
                      {requirementList.length > 0 ? joinDescriptions(requirementList) : 'Sin requisitos registrados.'}
                    </p>
                    <p>
                      <strong className="text-slate-500">Responsabilidades:</strong>{' '}
                      {responsibilityList.length > 0
                        ? joinDescriptions(responsibilityList)
                        : 'Sin responsabilidades registradas.'}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-sm xl:col-span-5">
          <div className="mb-5 flex items-start justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                {editingCandidateId ? 'Actualizar candidato' : 'Registro de candidato'}
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-400">Datos personales, profesionales y vacante asociada.</p>
            </div>
            {editingCandidateId !== null && (
              <button type="button" onClick={resetCandidateForm} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleGuardarCandidato} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nombre">
                <input
                  required
                  value={candidateForm.first_name}
                  onChange={(event) =>
                    setCandidateForm((current) => ({ ...current, first_name: event.target.value }))
                  }
                  placeholder="Ej. Maria"
                  className="form-input"
                />
              </Field>
              <Field label="Apellido">
                <input
                  required
                  value={candidateForm.last_name}
                  onChange={(event) =>
                    setCandidateForm((current) => ({ ...current, last_name: event.target.value }))
                  }
                  placeholder="Ej. Perez"
                  className="form-input"
                />
              </Field>
              <Field label="Cedula">
                <input
                  required
                  value={candidateForm.national_id}
                  onChange={(event) =>
                    setCandidateForm((current) => ({ ...current, national_id: event.target.value }))
                  }
                  placeholder="001-0000000-0"
                  className="form-input"
                />
              </Field>
              <Field label="Correo">
                <input
                  required
                  type="email"
                  value={candidateForm.email}
                  onChange={(event) => setCandidateForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="correo@email.com"
                  className="form-input"
                />
              </Field>
              <Field label="Telefono">
                <input
                  required
                  value={candidateForm.phone}
                  onChange={(event) => setCandidateForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="809-555-0000"
                  className="form-input"
                />
              </Field>
              <Field label="Direccion">
                <input
                  required
                  value={candidateForm.address}
                  onChange={(event) => setCandidateForm((current) => ({ ...current, address: event.target.value }))}
                  placeholder="Ciudad o sector"
                  className="form-input"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Fecha de nacimiento">
                <input
                  type="date"
                  value={candidateForm.birth_date}
                  onChange={(event) =>
                    setCandidateForm((current) => ({ ...current, birth_date: event.target.value }))
                  }
                  className="form-input"
                />
              </Field>
              <Field label="Vacante">
                <select
                  required
                  value={candidateForm.vacancy_id}
                  onChange={(event) =>
                    setCandidateForm((current) => ({ ...current, vacancy_id: event.target.value }))
                  }
                  className="form-input"
                >
                  {vacancySelectOptions.length === 0 ? (
                    <option value="">No hay vacantes disponibles</option>
                  ) : (
                    vacancySelectOptions.map((vacancy) => (
                      <option key={vacancy.id} value={vacancy.id}>
                        {vacancy.title}
                      </option>
                    ))
                  )}
                </select>
              </Field>
            </div>

            <Field label="Nivel academico">
              <input
                required
                value={candidateForm.academic_level}
                onChange={(event) =>
                  setCandidateForm((current) => ({ ...current, academic_level: event.target.value }))
                }
                placeholder="Ej. Licenciatura en Psicologia"
                className="form-input"
              />
            </Field>

            <Field label="Experiencia laboral">
              <textarea
                required
                rows={3}
                value={candidateForm.work_experience}
                onChange={(event) =>
                  setCandidateForm((current) => ({ ...current, work_experience: event.target.value }))
                }
                placeholder="Experiencia relevante para la vacante"
                className="form-input resize-none"
              />
            </Field>

            <button
              type="submit"
              disabled={savingCandidate}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#113B7A] py-3 text-xs font-bold text-white transition hover:bg-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {editingCandidateId ? <Edit3 className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {savingCandidate
                ? 'Guardando...'
                : editingCandidateId
                  ? 'Actualizar candidato'
                  : 'Guardar candidato'}
            </button>
          </form>
        </section>
      </div>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-sm xl:col-span-4">
          <div className="mb-5 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Entrevistas</h2>
            <p className="mt-0.5 text-[11px] text-slate-400">Registre fecha, observaciones y resultado.</p>
          </div>

          <form onSubmit={handleRegistrarEntrevista} className="space-y-4">
            <Field label="Candidato">
              <select
                required
                value={interviewCandidateId ?? ''}
                onChange={(event) => setInterviewCandidateId(normalizeId(event.target.value))}
                className="form-input"
              >
                {candidateRows.length === 0 ? (
                  <option value="">No hay candidatos</option>
                ) : (
                  candidateRows.map((row) => (
                    <option key={row.candidate.id} value={row.candidate.id}>
                      {getCandidateName(row.candidate)}
                    </option>
                  ))
                )}
              </select>
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Fecha">
                <input
                  required
                  type="date"
                  value={interviewForm.interview_date}
                  onChange={(event) =>
                    setInterviewForm((current) => ({ ...current, interview_date: event.target.value }))
                  }
                  className="form-input"
                />
              </Field>
              <Field label="Resultado">
                <select
                  value={interviewForm.result}
                  onChange={(event) =>
                    setInterviewForm((current) => ({
                      ...current,
                      result: event.target.value as InterviewResult,
                    }))
                  }
                  className="form-input"
                >
                  {interviewResults.map((result) => (
                    <option key={result}>{result}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Entrevistador">
              <input
                required
                value={interviewForm.interviewer}
                onChange={(event) =>
                  setInterviewForm((current) => ({ ...current, interviewer: event.target.value }))
                }
                className="form-input"
              />
            </Field>

            <Field label="Observaciones">
              <textarea
                rows={4}
                value={interviewForm.observations}
                onChange={(event) =>
                  setInterviewForm((current) => ({ ...current, observations: event.target.value }))
                }
                placeholder="Observaciones, hallazgos y siguientes pasos"
                className="form-input resize-none"
              />
            </Field>

            <button
              type="submit"
              disabled={savingInterview}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FileText className="h-4 w-4" />
              {savingInterview ? 'Guardando...' : 'Registrar entrevista'}
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-sm xl:col-span-8">
          <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Candidatos registrados</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">Consulta, actualizacion, estado y seleccion final.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={candidateSearchQuery}
                  onChange={(event) => setCandidateSearchQuery(event.target.value)}
                  placeholder="Buscar candidato"
                  className="form-input min-w-[210px] pl-9"
                />
              </label>
              <select
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value as typeof filterStatus)}
                className="form-input min-w-[160px]"
              >
                <option>Todos</option>
                {applicationStatuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleActualizarDatos}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#F1F5F9] px-3.5 py-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-200"
              >
                <RotateCw className={`h-3.5 w-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-3 py-3">Candidato</th>
                  <th className="px-3 py-3">Vacante</th>
                  <th className="px-3 py-3">Perfil profesional</th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="px-3 py-3">Ultima entrevista</th>
                  <th className="px-3 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                {filteredCandidateRows.map((row) => {
                  const latestInterview = getLatestInterview(row.application);
                  const isContracted = row.application?.status === 'Contratado';

                  return (
                    <tr
                      key={row.candidate.id}
                      className={
                        selectedContractCandidateId === row.candidate.id || isContracted
                          ? 'bg-emerald-50/40'
                          : 'hover:bg-slate-50/60'
                      }
                    >
                      <td className="px-3 py-4">
                        <span className="block text-[13px] font-bold text-slate-800">
                          {getCandidateName(row.candidate)}
                        </span>
                        <span className="mt-1 block text-[10px] uppercase tracking-wider text-slate-400">
                          CAN-{row.candidate.id} - {row.candidate.phone}
                        </span>
                        <span className="mt-1 block text-[11px] text-slate-500">{row.candidate.email}</span>
                      </td>
                      <td className="px-3 py-4 font-bold text-slate-700">
                        {row.application?.vacancy?.title ?? 'Sin vacante'}
                      </td>
                      <td className="max-w-[230px] px-3 py-4">
                        <span className="block font-bold text-slate-700">{row.candidate.academic_level}</span>
                        <span className="mt-1 block truncate font-medium text-slate-500" title={row.candidate.work_experience}>
                          {row.candidate.work_experience}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <select
                          value={row.application?.status ?? 'En evaluacion'}
                          onChange={(event) =>
                            void handleCambiarEstado(row.candidate.id, event.target.value as ApplicationStatus)
                          }
                          disabled={!row.application}
                          className={`rounded-lg border px-2.5 py-2 text-[11px] font-bold ${
                            (row.application?.status ?? 'En evaluacion') === 'Contratado'
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : (row.application?.status ?? 'En evaluacion') === 'Aprobado'
                                ? 'border-blue-300 bg-blue-50 text-blue-700'
                                : (row.application?.status ?? 'En evaluacion') === 'Rechazado'
                                  ? 'border-rose-300 bg-rose-50 text-rose-600'
                                  : 'border-amber-300 bg-amber-50 text-amber-700'
                          }`}
                        >
                          {applicationStatuses.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="max-w-[240px] px-3 py-4">
                        {latestInterview ? (
                          <>
                            <span className="block font-bold text-slate-700">
                              {latestInterview.result} - {latestInterview.interview_date}
                            </span>
                            <span
                              className="mt-1 block truncate font-medium italic text-slate-500"
                              title={latestInterview.observations}
                            >
                              {latestInterview.observations}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400">Sin entrevista registrada</span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditarCandidato(row.candidate)}
                            className="rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setInterviewCandidateId(row.candidate.id)}
                            className="rounded-lg bg-blue-50 px-3 py-2 text-[11px] font-bold text-[#113B7A] hover:bg-blue-100"
                          >
                            Entrevista
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleSeleccionarParaContratacion(row.candidate)}
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isContracted}
                          >
                            {isContracted ? 'Contratado' : 'Contratar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredCandidateRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-slate-400">
                      No hay candidatos con los filtros actuales.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showVacancyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ ease: 'easeInOut', duration: 0.2 }}
              className="flex w-full max-w-md flex-col overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-[#F8FAFC] px-6 py-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">Registrar vacante laboral</h2>
                <button
                  type="button"
                  onClick={() => setShowVacancyModal(false)}
                  className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleGuardarVacante} className="space-y-4 p-6">
                <Field label="Nombre del puesto">
                  <input
                    required
                    value={vacancyForm.title}
                    onChange={(event) => setVacancyForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Ej. Lider de Desarrollo Tecnico"
                    className="form-input"
                  />
                </Field>
                <Field label="Descripcion del puesto">
                  <textarea
                    required
                    rows={3}
                    value={vacancyForm.description}
                    onChange={(event) =>
                      setVacancyForm((current) => ({ ...current, description: event.target.value }))
                    }
                    placeholder="Resumen general del puesto"
                    className="form-input resize-none"
                  />
                </Field>
                <Field label="Departamento o area ID">
                  <input
                    type="number"
                    min="1"
                    value={vacancyForm.department_id}
                    onChange={(event) =>
                      setVacancyForm((current) => ({ ...current, department_id: event.target.value }))
                    }
                    placeholder="Opcional"
                    className="form-input"
                  />
                </Field>
                <Field label="Requisitos">
                  <textarea
                    required
                    rows={3}
                    value={vacancyForm.requirements}
                    onChange={(event) =>
                      setVacancyForm((current) => ({ ...current, requirements: event.target.value }))
                    }
                    placeholder="Un requisito por linea o en un solo texto"
                    className="form-input resize-none"
                  />
                </Field>
                <Field label="Responsabilidades">
                  <textarea
                    required
                    rows={3}
                    value={vacancyForm.responsibilities}
                    onChange={(event) =>
                      setVacancyForm((current) => ({ ...current, responsibilities: event.target.value }))
                    }
                    placeholder="Un texto o lista de funciones del puesto"
                    className="form-input resize-none"
                  />
                </Field>
                <Field label="Estado inicial">
                  <select
                    value={vacancyForm.status}
                    onChange={(event) =>
                      setVacancyForm((current) => ({ ...current, status: event.target.value as VacancyStatus }))
                    }
                    className="form-input"
                  >
                    <option>Abierta</option>
                    <option>En evaluacion</option>
                    <option>Cerrada</option>
                  </select>
                </Field>
                <div className="flex gap-3 border-t border-slate-100 pt-4 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setShowVacancyModal(false)}
                    className="flex-1 rounded-lg bg-slate-100 py-3 text-slate-600 hover:bg-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingVacancy}
                    className="flex-1 rounded-lg bg-[#113B7A] py-3 text-white shadow-md hover:bg-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingVacancy ? 'Publicando...' : 'Publicar vacante'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-left">
      <span className="pl-0.5 text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
      {children}
    </label>
  );
}
