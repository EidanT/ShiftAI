import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sileo } from 'sileo';
import {
  Building2, 
  Plus, 
  Search, 
  RotateCw, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
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
}

export default function RecruitmentView() {
  // 1. Core States for Job Openings (Vacantes)
  const [vacantes, setVacantes] = useState<Vacante[]>([
    {
      id: 'VAC-101',
      titulo: 'Analista de Recursos Humanos',
      departamento: 'Gestion Humana',
      requisitos: 'Licenciatura en Psicologia, 2 anos de experiencia, manejo de entrevistas.',
      responsabilidades: 'Publicar vacantes, filtrar candidatos y coordinar entrevistas.',
      estado: 'Abierta'
    },
    {
      id: 'VAC-102',
      titulo: 'Soporte Tecnico Junior',
      departamento: 'Tecnologia',
      requisitos: 'Conocimientos basicos de redes, soporte a usuarios y documentacion.',
      responsabilidades: 'Atender tickets, registrar incidencias y escalar casos tecnicos.',
      estado: 'En evaluacion'
    }
  ]);

  // 2. Core States for Candidates (Candidatos)
  const [candidatos, setCandidatos] = useState<Candidato[]>([
    {
      id: 'CAN-001',
      nombre: 'Laura Mendez',
      vacanteId: 'VAC-101', // Analista de Recursos Humanos
      experiencia: '3 anos',
      estado: 'En evaluacion',
      resultadoEntrevista: 'Pendiente'
    },
    {
      id: 'CAN-002',
      nombre: 'Carlos Rivera',
      vacanteId: 'VAC-102', // Soporte Tecnico Junior
      experiencia: '1 ano',
      estado: 'Aprobado',
      resultadoEntrevista: 'Entrevista tecnica aprobada'
    },
    {
      id: 'CAN-003',
      nombre: 'Ana Torres',
      vacanteId: 'VAC-101', // Analista de Recursos Humanos
      experiencia: '4 anos',
      estado: 'Contratado',
      resultadoEntrevista: 'Seleccionada para contratacion'
    }
  ]);

  // 3. Form input states for Candidate Registration
  const [candNombre, setCandNombre] = useState('');
  const [candVacanteId, setCandVacanteId] = useState('VAC-101');
  const [candExperiencia, setCandExperiencia] = useState('');
  const [candObservaciones, setCandObservaciones] = useState('');

export default function RecruitmentView({ onTriggerToast }: RecruitmentViewProps) {
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

  // Selected candidate highlights (e.g. for selection helper feedback)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  // Calculated Metrics
  const totalVacantes = vacantes.length;
  const totalCandidatos = candidatos.length;
  // Entrevistas are defined in picture as "2" (let's calculate based on candidates in "En evaluacion" or "Aprobado" with interview observations, or simply state-based)
  const totalEntrevistas = candidatos.filter(c => c.estado === 'En evaluacion' || c.estado === 'Aprobado').length;
  const totalContratados = candidatos.filter(c => c.estado === 'Contratado').length;

  // Handle saving a candidate
  const handleGuardarCandidato = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candNombre.trim()) {
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
      onTriggerToast('Candidato actualizado', `Se actualizo la ficha de ${candidateForm.nombre}.`, 'success');
      resetCandidateForm();
      return;
    }

    const nuevoCandidato: Candidato = {
      id: makeId('CAN'),
      ...candidateForm,
      estado: 'En evaluacion',
      entrevistas: [],
      fechaRegistro: today(),
    };

    setCandidatos(prev => [nuevo, ...prev]);
    sileo.success({
      title: 'Candidato Registrado',
      description: `Ficha cargada con éxito para la vacante "${vacName}".`,
    });

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
    onTriggerToast('Ficha cargada', `Ahora puede actualizar la informacion de ${candidato.nombre}.`, 'info');
  };

  // Handle changing candidate recruitment status
  const handleCambiarEstado = (id: string, nuevoEstado: Candidato['estado']) => {
    let oldState: string = '';
    setCandidatos(prev => prev.map(c => {
      if (c.id === id) {
        oldState = c.estado;
        let result = c.resultadoEntrevista;
        if (nuevoEstado === 'Contratado') {
          result = 'Seleccionada para contratacion';
        } else if (nuevoEstado === 'Aprobado') {
          result = 'Entrevista aprobada';
        } else if (nuevoEstado === 'Rechazado') {
          result = 'No califica para la posicion';
        } else {
          result = 'Pendiente evaluacion posterior';
        }
        return { ...c, estado: nuevoEstado, resultadoEntrevista: result };
      }
      return c;
    }));

    const cand = candidatos.find(c => c.id === id);
    if (cand) {
      sileo.success({
        title: 'Estatus Actualizado',
        description: `${cand.nombre} cambió de "${oldState}" a "${nuevoEstado}".`,
      });
    }
  };

  // Handle saving new Vacancy
  const handleGuardarVacante = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacTitulo.trim()) {
      sileo.error({
        title: 'Título requerido',
        description: 'Por favor complete el nombre de la posición.',
      });
      return;
    }

    const entrevista: Entrevista = {
      id: makeId('ENT'),
      ...interviewForm,
      observaciones: interviewForm.observaciones || 'Sin observaciones adicionales.',
    };

    setVacantes(prev => [...prev, nuevaVac]);
    sileo.success({
      title: 'Nueva Vacante Publicada',
      description: `Se registró la posición "${vacTitulo}" correctamente.`,
    });

    // Clear & Hide
    setVacTitulo('');
    setVacReqs('');
    setVacResps('');
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

  // Pre-load form input with candidate to edit/interact
  const handleSeleccionarCandidato = (c: Candidato) => {
    setSelectedCandidateId(c.id);
    setCandNombre(c.nombre);
    setCandVacanteId(c.vacanteId);
    setCandExperiencia(c.experiencia);
    setCandObservaciones(c.resultadoEntrevista !== 'Pendiente' ? c.resultadoEntrevista : '');
    sileo.info({
      title: 'Candidato seleccionado',
      description: `Se cargó la información de ${c.nombre} en el formulario de registro.`,
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
