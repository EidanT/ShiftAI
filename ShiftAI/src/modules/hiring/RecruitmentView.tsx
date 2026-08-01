import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sileo } from 'sileo';
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

type VacancyStatus = 'Abierta' | 'En evaluacion' | 'Cerrada';
type CandidateStatus = 'En evaluacion' | 'Aprobado' | 'Rechazado' | 'Contratado';
type InterviewResult = 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Requiere segunda entrevista';

interface Vacante {
  id: string;
  titulo: string;
  departamento: string;
  requisitos: string;
  responsabilidades: string;
  estado: VacancyStatus;
  fechaCreacion: string;
}

interface Entrevista {
  id: string;
  fecha: string;
  entrevistador: string;
  observaciones: string;
  resultado: InterviewResult;
}

interface Candidato {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  ubicacion: string;
  profesion: string;
  educacion: string;
  experiencia: string;
  resumenProfesional: string;
  vacanteId: string;
  estado: CandidateStatus;
  entrevistas: Entrevista[];
  fechaRegistro: string;
  score?: number;
  experienciaExtraida?: string;
  especializacionExtraida?: string;
  recomendado?: boolean;
  justificacion?: string;
}

const estadosCandidato: CandidateStatus[] = ['En evaluacion', 'Aprobado', 'Rechazado', 'Contratado'];
const resultadosEntrevista: InterviewResult[] = ['Pendiente', 'Aprobado', 'Rechazado', 'Requiere segunda entrevista'];

const seedVacantes: Vacante[] = [
  {
    id: 'VAC-101',
    titulo: 'Analista de Recursos Humanos',
    departamento: 'Gestion Humana',
    requisitos: 'Licenciatura en Psicologia Industrial o Administracion de Empresas, experiencia minima de 2 anos en reclutamiento y seleccion de personal, conocimiento en pruebas psicometricas y legislacion laboral, manejo de Office y portales de empleo.',
    responsabilidades: 'Publicar vacantes en portales de empleo, preseleccionar curriculums segun perfil solicitado, coordinar y realizar entrevistas iniciales, aplicar pruebas psicometricas y tecnicas, dar seguimiento al proceso de contratacion y onboarding.',
    estado: 'Abierta',
    fechaCreacion: '2026-05-12',
  },
  {
    id: 'VAC-102',
    titulo: 'Soporte Tecnico Junior',
    departamento: 'Tecnologia',
    requisitos: 'Conocimientos basicos de redes, soporte a usuarios y documentacion.',
    responsabilidades: 'Atender tickets, registrar incidencias y escalar casos tecnicos.',
    estado: 'En evaluacion',
    fechaCreacion: '2026-05-20',
  },
];

const seedCandidatos: Candidato[] = [
  {
    id: 'CAN-001',
    nombre: 'Laura Mendez',
    correo: 'laura.mendez@email.com',
    telefono: '809-555-0101',
    ubicacion: 'Santo Domingo',
    profesion: 'Psicologa Organizacional',
    educacion: 'Licenciatura en Psicologia',
    experiencia: '3 anos en seleccion de personal',
    resumenProfesional: 'Especialista en procesos de reclutamiento y entrevistas por competencias.',
    vacanteId: 'VAC-101',
    estado: 'En evaluacion',
    entrevistas: [],
    fechaRegistro: '2026-06-02',
  },
  {
    id: 'CAN-002',
    nombre: 'Carlos Rivera',
    correo: 'carlos.rivera@email.com',
    telefono: '809-555-0102',
    ubicacion: 'Santiago',
    profesion: 'Tecnico en Soporte',
    educacion: 'Tecnico en Redes y Telecomunicaciones',
    experiencia: '1 ano en soporte tecnico a usuarios',
    resumenProfesional: 'Buen manejo de tickets y resolucion de incidencias de primer nivel.',
    vacanteId: 'VAC-102',
    estado: 'Aprobado',
    entrevistas: [
      {
        id: 'ENT-001',
        fecha: '2026-06-10',
        entrevistador: 'Laura Mendoza',
        observaciones: 'Buen dominio tecnico, se aprueba para siguiente fase.',
        resultado: 'Aprobado',
      },
    ],
    fechaRegistro: '2026-06-05',
  },
  {
    id: 'CAN-003',
    nombre: 'Ana Torres',
    correo: 'ana.torres@email.com',
    telefono: '809-555-0103',
    ubicacion: 'Santo Domingo',
    profesion: 'Analista de Recursos Humanos',
    educacion: 'Licenciatura en Administracion de Empresas',
    experiencia: '4 anos en gestion de talento humano',
    resumenProfesional: 'Experiencia liderando procesos de contratacion end-to-end.',
    vacanteId: 'VAC-101',
    estado: 'Contratado',
    entrevistas: [
      {
        id: 'ENT-002',
        fecha: '2026-06-08',
        entrevistador: 'Laura Mendoza',
        observaciones: 'Seleccionada para contratacion inmediata.',
        resultado: 'Aprobado',
      },
    ],
    fechaRegistro: '2026-05-28',
  },
];

const emptyCandidateForm = {
  nombre: '',
  correo: '',
  telefono: '',
  ubicacion: '',
  profesion: '',
  educacion: '',
  experiencia: '',
  resumenProfesional: '',
  vacanteId: seedVacantes[0]?.id ?? '',
};

const emptyVacancyForm = {
  titulo: '',
  departamento: 'Gestion Humana',
  requisitos: '',
  responsabilidades: '',
  estado: 'Abierta' as VacancyStatus,
};

function makeId(prefix: string): string {
  return `${prefix}-${Math.floor(Math.random() * 900) + 100}`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadInitialData(): { vacantes: Vacante[]; candidatos: Candidato[] } {
  return { vacantes: seedVacantes, candidatos: seedCandidatos };
}

function latestInterview(candidato: Candidato): Entrevista | undefined {
  return [...candidato.entrevistas].sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
}

async function analyzeCVWithAI(
  file: File,
  requirements: string,
  servicesUrl: string,
  setIsAnalyzing: (v: boolean) => void,
  onResult: (result: { score: number; experiencia: string; especializacion: string; recomendado: boolean; justificacion: string }) => void,
) {
  setIsAnalyzing(true);
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('requirements', requirements);

    const response = await fetch(`${servicesUrl}/candidates/analyze-cv`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();
    onResult(data);
  } catch (err) {
    sileo.error({
      title: 'Error al analizar CV',
      description: err instanceof Error ? err.message : 'Ocurrio un error inesperado',
    });
  } finally {
    setIsAnalyzing(false);
  }
}

export default function RecruitmentView() {
  const [initialData] = useState(loadInitialData);
  const [vacantes, setVacantes] = useState<Vacante[]>(initialData.vacantes);
  const [candidatos, setCandidatos] = useState<Candidato[]>(initialData.candidatos);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'Todos' | CandidateStatus>('Todos');
  const [showVacanteModal, setShowVacanteModal] = useState(false);
  const [vacanteForm, setVacanteForm] = useState(emptyVacancyForm);
  const [candidateForm, setCandidateForm] = useState(emptyCandidateForm);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [interviewCandidateId, setInterviewCandidateId] = useState(seedCandidatos[0]?.id ?? '');
  const [interviewForm, setInterviewForm] = useState({
    fecha: today(),
    entrevistador: 'Laura Mendoza',
    resultado: 'Pendiente' as InterviewResult,
    observaciones: '',
  });
  const [selectedHireId, setSelectedHireId] = useState<string | null>(
    initialData.candidatos.find((c) => c.estado === 'Contratado')?.id ?? null,
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<{
    score: number;
    experiencia: string;
    especializacion: string;
    recomendado: boolean;
    justificacion: string;
  } | null>(null);

  const SERVICES_URL = import.meta.env.VITE_SERVICES_URL ?? 'http://localhost:3000/api/v1/hiring';

  const totalEntrevistas = candidatos.reduce((acc, c) => acc + c.entrevistas.length, 0);
  const totalContratados = candidatos.filter((c) => c.estado === 'Contratado').length;

  const activeInterviewCandidateId = candidatos.some((c) => c.id === interviewCandidateId)
    ? interviewCandidateId
    : (candidatos[0]?.id ?? '');

  const candidatosFiltrados = candidatos.filter((candidato) => {
    const matchesEstado = filtroEstado === 'Todos' || candidato.estado === filtroEstado;
    const term = busqueda.trim().toLowerCase();
    const matchesBusqueda =
      term === '' || candidato.nombre.toLowerCase().includes(term) || candidato.profesion.toLowerCase().includes(term);
    return matchesEstado && matchesBusqueda;
  });

  const resetCandidateForm = () => {
    setEditingCandidateId(null);
    setCandidateForm(emptyCandidateForm);
    setCvFile(null);
    setCurrentAnalysis(null);
  };

  const handleGuardarCandidato = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateForm.nombre.trim()) {
      sileo.error({
        title: 'Nombre requerido',
        description: 'El nombre completo del candidato es obligatorio.',
      });
      return;
    }

    if (editingCandidateId) {
      setCandidatos((prev) =>
        prev.map((candidato) =>
          candidato.id === editingCandidateId ? { ...candidato, ...candidateForm } : candidato,
        ),
      );
      sileo.success({
        title: 'Candidato actualizado',
        description: `Se actualizo la ficha de ${candidateForm.nombre}.`,
      });
      resetCandidateForm();
      return;
    }

    const vacante = vacantes.find((v) => v.id === candidateForm.vacanteId);
    const nuevoCandidato: Candidato = {
      id: makeId('CAN'),
      ...candidateForm,
      estado: 'En evaluacion',
      entrevistas: [],
      fechaRegistro: today(),
      score: currentAnalysis?.score,
      experienciaExtraida: currentAnalysis?.experiencia,
      especializacionExtraida: currentAnalysis?.especializacion,
      recomendado: currentAnalysis?.recomendado,
      justificacion: currentAnalysis?.justificacion,
    };

    setCandidatos((prev) => [nuevoCandidato, ...prev]);
    sileo.success({
      title: 'Candidato registrado',
      description: `Ficha cargada con éxito para la vacante "${vacante?.titulo ?? 'seleccionada'}".`,
    });
    resetCandidateForm();
  };

  const handleEditarCandidato = (candidato: Candidato) => {
    setEditingCandidateId(candidato.id);
    setCandidateForm({
      nombre: candidato.nombre,
      correo: candidato.correo,
      telefono: candidato.telefono,
      ubicacion: candidato.ubicacion,
      profesion: candidato.profesion,
      educacion: candidato.educacion,
      experiencia: candidato.experiencia,
      resumenProfesional: candidato.resumenProfesional,
      vacanteId: candidato.vacanteId,
    });
    sileo.info({
      title: 'Ficha cargada',
      description: `Ahora puede actualizar la información de ${candidato.nombre}.`,
    });
  };

  const handleCambiarEstado = (id: string, nuevoEstado: CandidateStatus) => {
    const candidato = candidatos.find((c) => c.id === id);
    if (!candidato) return;

    const estadoAnterior = candidato.estado;
    setCandidatos((prev) => prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c)));
    sileo.success({
      title: 'Estatus actualizado',
      description: `${candidato.nombre} cambió de "${estadoAnterior}" a "${nuevoEstado}".`,
    });
  };

  const handleSeleccionarParaContratacion = (candidato: Candidato) => {
    setSelectedHireId(candidato.id);
    setCandidatos((prev) => prev.map((c) => (c.id === candidato.id ? { ...c, estado: 'Contratado' } : c)));
    sileo.success({
      title: 'Candidato seleccionado para contratación',
      description: `${candidato.nombre} quedó marcado como contratado.`,
    });
  };

  const handleGuardarVacante = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacanteForm.titulo.trim()) {
      sileo.error({
        title: 'Título requerido',
        description: 'Por favor complete el nombre de la posición.',
      });
      return;
    }

    const nuevaVacante: Vacante = {
      id: makeId('VAC'),
      ...vacanteForm,
      requisitos: vacanteForm.requisitos || 'Licenciatura o carrera técnica afín.',
      responsabilidades: vacanteForm.responsabilidades || 'Tareas operativas y colaboración del puesto.',
      fechaCreacion: today(),
    };

    setVacantes((prev) => [...prev, nuevaVacante]);
    sileo.success({
      title: 'Nueva vacante publicada',
      description: `Se registró la posición "${nuevaVacante.titulo}" correctamente.`,
    });

    setVacanteForm(emptyVacancyForm);
    setShowVacanteModal(false);
  };

  const handleActualizarDatos = () => {
    setIsUpdating(true);
    window.setTimeout(() => {
      setIsUpdating(false);
      sileo.info({
        title: 'Planilla de Selección Sincronizada',
        description: 'Base de datos de reclutamiento refrescada correctamente.',
      });
    }, 800);
  };

  const handleRegistrarEntrevista = (e: React.FormEvent) => {
    e.preventDefault();
    const candidato = candidatos.find((c) => c.id === activeInterviewCandidateId);
    if (!candidato) return;

    const entrevista: Entrevista = {
      id: makeId('ENT'),
      ...interviewForm,
      observaciones: interviewForm.observaciones || 'Sin observaciones adicionales.',
    };

    setCandidatos((prev) =>
      prev.map((c) => (c.id === candidato.id ? { ...c, entrevistas: [entrevista, ...c.entrevistas] } : c)),
    );

    sileo.success({
      title: 'Entrevista registrada',
      description: `Se guardó la entrevista de ${candidato.nombre}.`,
    });

    setInterviewForm({
      fecha: today(),
      entrevistador: interviewForm.entrevistador,
      resultado: 'Pendiente',
      observaciones: '',
    });
  };

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
          onClick={() => setShowVacanteModal(true)}
          className="flex items-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 lg:self-center"
        >
          <Plus className="h-4 w-4 text-slate-500" />
          Nueva vacante
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Vacantes', vacantes.length, 'Registradas con requisitos y responsabilidades', Briefcase],
          ['Candidatos', candidatos.length, 'Con informacion personal y profesional', Users],
          ['Entrevistas', totalEntrevistas, 'Con observaciones y resultados', Calendar],
          ['Contratados', totalContratados, 'Seleccionados para pasar a empleados', UserCheck2],
        ].map(([label, value, caption, Icon]) => (
          <article key={String(label)} className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label as string}</p>
              {React.createElement(Icon as typeof Briefcase, { className: 'h-4 w-4 text-slate-400' })}
            </div>
            <strong className="mt-2 block text-3xl font-extrabold tracking-tight text-[#0F172A]">{value as number}</strong>
            <p className="mt-1.5 text-[11px] font-semibold text-slate-400">{caption as string}</p>
          </article>
        ))}
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
              onClick={() => setShowVacanteModal(true)}
              className="rounded-lg bg-[#F1F5F9] px-3.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-200"
            >
              Registrar
            </button>
          </div>

          <div className="max-h-[440px] space-y-4 overflow-y-auto pr-1">
            {vacantes.map((vacante) => (
              <article key={vacante.id} className="rounded-lg border border-slate-200 bg-slate-50/30 p-4 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{vacante.titulo}</h3>
                    <span className="mt-0.5 inline-block text-[11px] font-semibold text-slate-400">
                      {vacante.departamento} - {vacante.id}
                    </span>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      vacante.estado === 'Abierta'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                        : vacante.estado === 'En evaluacion'
                          ? 'border-cyan-200 bg-cyan-50 text-cyan-600'
                          : 'border-slate-200 bg-slate-100 text-slate-500'
                    }`}
                  >
                    {vacante.estado}
                  </span>
                </div>
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 leading-relaxed text-slate-700">
                  <p>
                    <strong className="text-slate-500">Requisitos:</strong> {vacante.requisitos}
                  </p>
                  <p>
                    <strong className="text-slate-500">Responsabilidades:</strong> {vacante.responsabilidades}
                  </p>
                </div>
              </article>
            ))}
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
            {editingCandidateId && (
              <button type="button" onClick={resetCandidateForm} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleGuardarCandidato} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nombre completo">
                <input required value={candidateForm.nombre} onChange={(e) => setCandidateForm((p) => ({ ...p, nombre: e.target.value }))} placeholder="Ej. Maria Perez" className="form-input" />
              </Field>
              <Field label="Correo">
                <input required type="email" value={candidateForm.correo} onChange={(e) => setCandidateForm((p) => ({ ...p, correo: e.target.value }))} placeholder="correo@email.com" className="form-input" />
              </Field>
              <Field label="Telefono">
                <input required value={candidateForm.telefono} onChange={(e) => setCandidateForm((p) => ({ ...p, telefono: e.target.value }))} placeholder="809-555-0000" className="form-input" />
              </Field>
              <Field label="Ubicacion">
                <input value={candidateForm.ubicacion} onChange={(e) => setCandidateForm((p) => ({ ...p, ubicacion: e.target.value }))} placeholder="Ciudad o sector" className="form-input" />
              </Field>
            </div>

            <Field label="Vacante">
              <select required value={candidateForm.vacanteId} onChange={(e) => setCandidateForm((p) => ({ ...p, vacanteId: e.target.value }))} className="form-input">
                {vacantes.map((vacante) => (
                  <option key={vacante.id} value={vacante.id}>
                    {vacante.titulo}
                  </option>
                ))}
              </select>
            </Field>

            <div className="border-t border-slate-100 pt-3">
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">CV del candidato (PDF)</p>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                  className="form-input flex-1 text-[11px] file:mr-2 file:rounded file:border-0 file:bg-[#113B7A] file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-white"
                />
                <button
                  type="button"
                  disabled={!cvFile || !candidateForm.vacanteId || isAnalyzing}
                  onClick={() => {
                    if (!cvFile) return;
                    const vacante = vacantes.find((v) => v.id === candidateForm.vacanteId);
                    if (!vacante) return;
                    analyzeCVWithAI(cvFile, vacante.requisitos, SERVICES_URL, setIsAnalyzing, (result) => {
                      setCurrentAnalysis(result);
                      setCandidateForm((p) => ({
                        ...p,
                        profesion: result.especializacion || p.profesion,
                        experiencia: result.experiencia || p.experiencia,
                        resumenProfesional: result.resumen || p.resumenProfesional,
                      }));
                      sileo.info({
                        title: `Analisis completado - Score: ${result.score}%`,
                        description: result.recomendado
                          ? 'Candidato recomendado para contratacion.'
                          : 'Candidato NO recomendado (score menor a 70%).',
                      });
                    });
                  }}
                  className="whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold transition disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {isAnalyzing ? 'Analizando...' : 'Analizar CV con IA'}
                </button>
              </div>
            </div>

            {currentAnalysis && (
              <div className="rounded-lg border bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Score LLM:</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${
                      currentAnalysis.recomendado
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}
                  >
                    {currentAnalysis.score}%
                    {currentAnalysis.recomendado ? ' - Recomendado' : ' - No recomendado'}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Profesion">
                <input required value={candidateForm.profesion} onChange={(e) => setCandidateForm((p) => ({ ...p, profesion: e.target.value }))} placeholder="Ej. Analista RRHH" className="form-input" />
              </Field>
              <Field label="Educacion">
                <input value={candidateForm.educacion} onChange={(e) => setCandidateForm((p) => ({ ...p, educacion: e.target.value }))} placeholder="Grado o certificacion" className="form-input" />
              </Field>
            </div>

            <Field label="Experiencia profesional">
              <textarea required rows={3} value={candidateForm.experiencia} onChange={(e) => setCandidateForm((p) => ({ ...p, experiencia: e.target.value }))} placeholder="Experiencia relevante para la vacante" className="form-input resize-none" />
            </Field>

            <Field label="Resumen profesional">
              <textarea rows={3} value={candidateForm.resumenProfesional} onChange={(e) => setCandidateForm((p) => ({ ...p, resumenProfesional: e.target.value }))} placeholder="Fortalezas, logros y notas de perfil" className="form-input resize-none" />
            </Field>

            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#113B7A] py-3 text-xs font-bold text-white transition hover:bg-[#1E3A8A]">
              {editingCandidateId ? <Edit3 className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {editingCandidateId ? 'Actualizar candidato' : 'Guardar candidato'}
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
              <select required value={activeInterviewCandidateId} onChange={(e) => setInterviewCandidateId(e.target.value)} className="form-input">
                {candidatos.map((candidato) => (
                  <option key={candidato.id} value={candidato.id}>
                    {candidato.nombre}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Fecha">
                <input required type="date" value={interviewForm.fecha} onChange={(e) => setInterviewForm((p) => ({ ...p, fecha: e.target.value }))} className="form-input" />
              </Field>
              <Field label="Resultado">
                <select value={interviewForm.resultado} onChange={(e) => setInterviewForm((p) => ({ ...p, resultado: e.target.value as InterviewResult }))} className="form-input">
                  {resultadosEntrevista.map((resultado) => (
                    <option key={resultado}>{resultado}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Entrevistador">
              <input required value={interviewForm.entrevistador} onChange={(e) => setInterviewForm((p) => ({ ...p, entrevistador: e.target.value }))} className="form-input" />
            </Field>
            <Field label="Observaciones">
              <textarea rows={4} value={interviewForm.observaciones} onChange={(e) => setInterviewForm((p) => ({ ...p, observaciones: e.target.value }))} placeholder="Observaciones, hallazgos y siguientes pasos" className="form-input resize-none" />
            </Field>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-xs font-bold text-white transition hover:bg-slate-800">
              <FileText className="h-4 w-4" />
              Registrar entrevista
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
                <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar candidato" className="form-input min-w-[210px] pl-9" />
              </label>
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as typeof filtroEstado)} className="form-input min-w-[160px]">
                <option>Todos</option>
                {estadosCandidato.map((estado) => (
                  <option key={estado}>{estado}</option>
                ))}
              </select>
              <button type="button" onClick={handleActualizarDatos} className="flex items-center justify-center gap-2 rounded-lg bg-[#F1F5F9] px-3.5 py-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-200">
                <RotateCw className={`h-3.5 w-3.5 text-slate-500 ${isUpdating ? 'animate-spin' : ''}`} />
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
                  <th className="px-3 py-3">Score</th>
                  <th className="px-3 py-3">Experiencia (CV)</th>
                  <th className="px-3 py-3">Especializacion</th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="px-3 py-3">Ultima entrevista</th>
                  <th className="px-3 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                {candidatosFiltrados.map((candidato) => {
                  const vacante = vacantes.find((item) => item.id === candidato.vacanteId);
                  const entrevista = latestInterview(candidato);

                  return (
                    <tr key={candidato.id} className={selectedHireId === candidato.id ? 'bg-emerald-50/40' : 'hover:bg-slate-50/60'}>
                      <td className="px-3 py-4">
                        <span className="block text-[13px] font-bold text-slate-800">{candidato.nombre}</span>
                        <span className="mt-1 block text-[10px] uppercase tracking-wider text-slate-400">{candidato.id} - {candidato.telefono}</span>
                        <span className="mt-1 block text-[11px] text-slate-500">{candidato.correo}</span>
                      </td>
                      <td className="px-3 py-4 font-bold text-slate-700">{vacante?.titulo ?? 'Sin vacante'}</td>
                      <td className="max-w-[230px] px-3 py-4">
                        <span className="block font-bold text-slate-700">{candidato.profesion}</span>
                        <span className="mt-1 block truncate font-medium text-slate-500" title={candidato.experiencia}>
                          {candidato.experiencia}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        {candidato.score !== undefined ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              candidato.recomendado
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-600 border border-rose-200'
                            }`}
                          >
                            {candidato.score}%
                            {candidato.recomendado ? ' Recomendado' : ' No recomendado'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Sin analizar</span>
                        )}
                      </td>
                      <td className="max-w-[180px] px-3 py-4">
                        <span className="block text-[12px] font-medium text-slate-700">
                          {candidato.experienciaExtraida || candidato.experiencia}
                        </span>
                      </td>
                      <td className="max-w-[180px] px-3 py-4">
                        <span className="block text-[12px] font-medium text-slate-700">
                          {candidato.especializacionExtraida || candidato.profesion}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <select
                          value={candidato.estado}
                          onChange={(e) => handleCambiarEstado(candidato.id, e.target.value as CandidateStatus)}
                          className={`rounded-lg border px-2.5 py-2 text-[11px] font-bold ${
                            candidato.estado === 'Contratado'
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : candidato.estado === 'Aprobado'
                                ? 'border-blue-300 bg-blue-50 text-blue-700'
                                : candidato.estado === 'Rechazado'
                                  ? 'border-rose-300 bg-rose-50 text-rose-600'
                                  : 'border-amber-300 bg-amber-50 text-amber-700'
                          }`}
                        >
                          {estadosCandidato.map((estado) => (
                            <option key={estado}>{estado}</option>
                          ))}
                        </select>
                      </td>
                      <td className="max-w-[240px] px-3 py-4">
                        {entrevista ? (
                          <>
                            <span className="block font-bold text-slate-700">{entrevista.resultado} - {entrevista.fecha}</span>
                            <span className="mt-1 block truncate font-medium italic text-slate-500" title={entrevista.observaciones}>
                              {entrevista.observaciones}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400">Sin entrevista registrada</span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => handleEditarCandidato(candidato)} className="rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-200">
                            Editar
                          </button>
                          <button type="button" onClick={() => setInterviewCandidateId(candidato.id)} className="rounded-lg bg-blue-50 px-3 py-2 text-[11px] font-bold text-[#113B7A] hover:bg-blue-100">
                            Entrevista
                          </button>
                          <button type="button" onClick={() => handleSeleccionarParaContratacion(candidato)} className="rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-emerald-700">
                            Contratar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {candidatosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-10 text-center text-slate-400">
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
        {showVacanteModal && (
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
                <button type="button" onClick={() => setShowVacanteModal(false)} className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleGuardarVacante} className="space-y-4 p-6">
                <Field label="Nombre del puesto">
                  <input required value={vacanteForm.titulo} onChange={(e) => setVacanteForm((p) => ({ ...p, titulo: e.target.value }))} placeholder="Ej. Lider de Desarrollo Tecnico" className="form-input" />
                </Field>
                <Field label="Departamento o area">
                  <select value={vacanteForm.departamento} onChange={(e) => setVacanteForm((p) => ({ ...p, departamento: e.target.value }))} className="form-input">
                    <option>Gestion Humana</option>
                    <option>Tecnologia</option>
                    <option>Ventas</option>
                    <option>Marketing</option>
                    <option>Finanzas</option>
                  </select>
                </Field>
                <Field label="Requisitos">
                  <textarea required rows={3} value={vacanteForm.requisitos} onChange={(e) => setVacanteForm((p) => ({ ...p, requisitos: e.target.value }))} placeholder="Experiencia, estudios y competencias requeridas" className="form-input resize-none" />
                </Field>
                <Field label="Responsabilidades">
                  <textarea required rows={3} value={vacanteForm.responsabilidades} onChange={(e) => setVacanteForm((p) => ({ ...p, responsabilidades: e.target.value }))} placeholder="Funciones principales del puesto" className="form-input resize-none" />
                </Field>
                <Field label="Estado inicial">
                  <select value={vacanteForm.estado} onChange={(e) => setVacanteForm((p) => ({ ...p, estado: e.target.value as VacancyStatus }))} className="form-input">
                    <option>Abierta</option>
                    <option>En evaluacion</option>
                    <option>Cerrada</option>
                  </select>
                </Field>
                <div className="flex gap-3 border-t border-slate-100 pt-4 text-xs font-bold">
                  <button type="button" onClick={() => setShowVacanteModal(false)} className="flex-1 rounded-lg bg-slate-100 py-3 text-slate-600 hover:bg-slate-200">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 rounded-lg bg-[#113B7A] py-3 text-white shadow-md hover:bg-[#1E3A8A]">
                    Publicar vacante
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
