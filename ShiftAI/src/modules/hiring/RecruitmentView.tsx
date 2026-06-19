import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Plus, 
  Search, 
  RotateCw, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Briefcase,
  UserCheck2,
  Users,
  CheckCircle,
  FileBadge,
  UserPlus,
  Compass,
  FileText,
  BadgeAlert,
  Calendar,
  X
} from 'lucide-react';

interface Vacante {
  id: string;
  titulo: string;
  departamento: string;
  requisitos: string;
  responsabilidades: string;
  estado: 'Abierta' | 'En evaluacion' | 'Cerrada';
}

interface Candidato {
  id: string;
  nombre: string;
  vacanteId: string; // Relación con Vacante
  experiencia: string;
  estado: 'En evaluacion' | 'Aprobado' | 'Contratado' | 'Rechazado';
  resultadoEntrevista: string;
}

interface RecruitmentViewProps {
  onTriggerToast: (text: string, sub?: string, type?: 'success' | 'info' | 'error') => void;
}

export default function RecruitmentView({ onTriggerToast }: RecruitmentViewProps) {
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

  // 4. Modal state for creating a "Nueva Vacante" / "Registrar Vacante"
  const [showVacanteModal, setShowVacanteModal] = useState(false);
  const [vacTitulo, setVacTitulo] = useState('');
  const [vacDepto, setVacDepto] = useState('Gestion Humana');
  const [vacReqs, setVacReqs] = useState('');
  const [vacResps, setVacResps] = useState('');
  const [vacEstadoForm, setVacEstadoForm] = useState<'Abierta' | 'En evaluacion' | 'Cerrada'>('Abierta');

  // Spinning feedback for "Actualizar Datos"
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
      onTriggerToast('Nombre requerido', 'El nombre completo del candidato es obligatorio.', 'error');
      return;
    }

    const matchedVacante = vacantes.find(v => v.id === candVacanteId);
    const vacName = matchedVacante ? matchedVacante.titulo : 'Vacante Desconocida';

    const nuevo: Candidato = {
      id: `CAN-0${Math.floor(Math.random() * 900) + 100}`,
      nombre: candNombre,
      vacanteId: candVacanteId,
      experiencia: candExperiencia || 'Sin especificar',
      estado: 'En evaluacion',
      resultadoEntrevista: candObservaciones.trim() || 'Pendiente'
    };

    setCandidatos(prev => [nuevo, ...prev]);
    onTriggerToast(
      'Candidato Registrado',
      `Ficha cargada con éxito para la vacante "${vacName}".`,
      'success'
    );

    // Reset inputs
    setCandNombre('');
    setCandExperiencia('');
    setCandObservaciones('');
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
      onTriggerToast(
        'Estatus Actualizado',
        `${cand.nombre} cambió de "${oldState}" a "${nuevoEstado}".`,
        'success'
      );
    }
  };

  // Handle saving new Vacancy
  const handleGuardarVacante = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacTitulo.trim()) {
      onTriggerToast('Título requerido', 'Por favor complete el nombre de la posición.', 'error');
      return;
    }

    const nuevaVac: Vacante = {
      id: `VAC-${Math.floor(Math.random() * 900) + 100}`,
      titulo: vacTitulo,
      departamento: vacDepto,
      requisitos: vacReqs || 'Licenciatura o carrera técnica afín.',
      responsabilidades: vacResps || 'Tareas operativas y colaboración del puesto.',
      estado: vacEstadoForm
    };

    setVacantes(prev => [...prev, nuevaVac]);
    onTriggerToast('Nueva Vacante Publicada', `Se registró la posición "${vacTitulo}" correctamente.`, 'success');
    
    // Clear & Hide
    setVacTitulo('');
    setVacReqs('');
    setVacResps('');
    setShowVacanteModal(false);
  };

  // Refresh trigger action simulation
  const handleActualizarDatos = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      onTriggerToast('Planilla de Selección Sincronizada', 'Base de datos de reclutamiento refrescada correctamente.', 'info');
    }, 800);
  };

  // Pre-load form input with candidate to edit/interact
  const handleSeleccionarCandidato = (c: Candidato) => {
    setSelectedCandidateId(c.id);
    setCandNombre(c.nombre);
    setCandVacanteId(c.vacanteId);
    setCandExperiencia(c.experiencia);
    setCandObservaciones(c.resultadoEntrevista !== 'Pendiente' ? c.resultadoEntrevista : '');
    onTriggerToast('Candidato seleccionado', `Se cargó la información de ${c.nombre} en el formulario de registro.`, 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* SECTION HEADER IN IMAGE (Reclutamiento y Seleccion de Personal) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-[26px] font-bold text-[#0F172A] tracking-tight font-display flex items-center gap-2.5">
            Reclutamiento y Seleccion de Personal
          </h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            Pantalla principal para registrar vacantes, candidatos, entrevistas y el estado de cada candidatura.
          </p>
        </div>
        
        <button 
          onClick={() => {
            setShowVacanteModal(true);
          }}
          id="btn-nueva-vacante"
          className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs px-4.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-xs shrink-0 self-start sm:self-center"
        >
          <Plus className="w-3.5 h-3.5 text-slate-500" />
          <span>Nueva vacante</span>
        </button>
      </div>

      {/* 4 METRIC CARDS BAR FROM IMAGE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Vacantes Metric */}
        <div id="metric-vacantes" className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-450 text-slate-500 uppercase tracking-wider mb-1">Vacantes</p>
          <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">{totalVacantes}</span>
          <p className="text-[11px] text-slate-400 font-semibold mt-1.5">Registradas para seleccion</p>
        </div>

        {/* Candidatos Metric */}
        <div id="metric-candidatos" className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-450 text-slate-500 uppercase tracking-wider mb-1">Candidatos</p>
          <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">{totalCandidatos}</span>
          <p className="text-[11px] text-slate-400 font-semibold mt-1.5">Con informacion personal y profesional</p>
        </div>

        {/* Entrevistas Metric */}
        <div id="metric-entrevistas" className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-450 text-slate-500 uppercase tracking-wider mb-1">Entrevistas</p>
          <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">{totalEntrevistas}</span>
          <p className="text-[11px] text-slate-400 font-semibold mt-1.5">Con observaciones y resultados</p>
        </div>

        {/* Contratados Metric */}
        <div id="metric-contratados" className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-450 text-slate-500 uppercase tracking-wider mb-1">Contratados</p>
          <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">{totalContratados}</span>
          <p className="text-[11px] text-slate-400 font-semibold mt-1.5">Listos para pasar a empleados</p>
        </div>

      </div>

      {/* MIDDLE SECTION - 2 COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: VACANTES LABORALES */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Vacantes laborales</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Requisitos y responsabilidades definidos para cada posicion.</p>
            </div>
            <button 
              onClick={() => {
                setVacDepto('Gestion Humana');
                setShowVacanteModal(true);
              }}
              className="px-3.5 py-1.5 bg-[#F1F5F9] hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-all"
            >
              Registrar
            </button>
          </div>

          {/* Job Postings dynamic list */}
          <div className="space-y-4 max-h-[464px] overflow-y-auto pr-1">
            {vacantes.map((vac) => (
              <div 
                key={vac.id} 
                className="border border-slate-200/90 rounded-xl p-4 hover:border-slate-350 bg-slate-50/20 hover:bg-slate-50/50 transition-all text-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-slate-800">{vac.titulo}</h3>
                    <span className="text-[11px] text-slate-400 font-semibold inline-block mt-0.5">{vac.departamento}</span>
                  </div>
                  
                  {/* Styled states based on the image style */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider ${
                    vac.estado === 'Abierta' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                      : vac.estado === 'En evaluacion'
                      ? 'bg-cyan-50 text-cyan-600 border border-cyan-200'
                      : 'bg-slate-100 text-slate-400 border border-slate-250'
                  }`}>
                    {vac.estado === 'En evaluacion' ? 'En evaluacion' : vac.estado}
                  </span>
                </div>

                <div className="mt-3.5 space-y-2 text-left text-slate-700 border-t border-slate-100 pt-2.5">
                  <p className="leading-relaxed">
                    <strong className="text-slate-500 font-bold">Requisitos:</strong> {vac.requisitos}
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-slate-500 font-bold">Responsabilidades:</strong> {vac.responsabilidades}
                  </p>
                </div>
              </div>
            ))}

            {vacantes.length === 0 && (
              <div className="text-center py-8 text-slate-450 text-slate-400">
                <Briefcase className="w-8 h-8 mx-auto mb-1 opacity-40" />
                No hay vacantes registradas en el sistema.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: REGISTRO DE CANDIDATO FORM */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6">
          <div className="border-b border-slate-100 pb-3 mb-5">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Registro de candidato</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Formulario visual preparado para conectar con base de datos.</p>
          </div>

          <form onSubmit={handleGuardarCandidato} className="space-y-4">
            
            {/* Nombre completo */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-0.5">
                Nombre completo
              </label>
              <input 
                type="text" 
                placeholder="Ej. Maria Perez"
                value={candNombre}
                onChange={(e) => setCandNombre(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg p-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400"
                required
              />
            </div>

            {/* Vacante Dropdown selector */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-0.5">
                Vacante
              </label>
              <select
                value={candVacanteId}
                onChange={(e) => setCandVacanteId(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg p-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400"
              >
                <option value="" disabled>Seleccionar vacante</option>
                {vacantes.map(v => (
                  <option key={v.id} value={v.id}>{v.titulo}</option>
                ))}
              </select>
            </div>

            {/* Experiencia profesional */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-0.5">
                Experiencia profesional
              </label>
              <input 
                type="text" 
                placeholder="Ej. 2 anos en servicio al cliente"
                value={candExperiencia}
                onChange={(e) => setCandExperiencia(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg p-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#475569]"
              />
            </div>

            {/* Observaciones de entrevista */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-0.5">
                Observaciones de entrevista
              </label>
              <textarea 
                rows={4} 
                placeholder="Resultado, comentarios y siguientes pasos"
                value={candObservaciones}
                onChange={(e) => setCandObservaciones(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg p-2.5 text-xs font-semibold text-[#334155] focus:outline-none focus:border-[#475569] placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#113B7A] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-bold transition-all hover:shadow-md"
            >
              Guardar candidato
            </button>

          </form>
        </div>

      </div>

      {/* BOTTOM SECTION: CANDIDATOS REGISTRADOS TABLE */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
          <div className="text-left">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Candidatos registrados</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Listado para consultar, actualizar y seleccionar candidatos.</p>
          </div>
          
          <button 
            type="button"
            onClick={handleActualizarDatos}
            className="px-3.5 py-1.5 bg-[#F1F5F9] hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1.5"
          >
            <RotateCw className={`w-3.5 h-3.5 text-slate-500 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>Actualizar datos</span>
          </button>
        </div>

        {/* Scalable Candidate Status Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-450 text-slate-400 uppercase tracking-widest">
                <th className="py-3 px-4 pl-1">Candidato</th>
                <th className="py-3 px-4">Vacante</th>
                <th className="py-3 px-4">Experiencia</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Resultado Entrevista</th>
                <th className="py-3 px-4 text-right pr-6">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650 text-slate-600">
              {candidatos.map((c) => {
                const associatedVac = vacantes.find(v => v.id === c.vacanteId);
                const vacTitle = associatedVac ? associatedVac.titulo : 'Vacante de selección';
                
                return (
                  <tr 
                    key={c.id} 
                    className={`hover:bg-slate-50/50 transition-colors group ${
                      selectedCandidateId === c.id ? 'bg-[#EEF2F6]/50 border-l-4 border-[#113B7A]' : ''
                    }`}
                  >
                    {/* Name */}
                    <td className="py-3.5 px-4 pl-1">
                      <span className="font-bold text-slate-800 text-[13px]">{c.nombre}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 uppercase tracking-wider">{c.id}</span>
                    </td>
                    
                    {/* Vacancy Title */}
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {vacTitle}
                    </td>

                    {/* Years of Experience */}
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {c.experiencia}
                    </td>

                    {/* Recruitment Stage Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={c.estado}
                        onChange={(e) => handleCambiarEstado(c.id, e.target.value as any)}
                        className={`bg-white border border-[#CBD5E1] rounded-lg p-1.5 pr-6 text-xs font-bold text-slate-700 focus:outline-none text-[11px] select-style cursor-pointer ${
                          c.estado === 'Contratado' ? 'text-emerald-600 border-emerald-300 font-black bg-emerald-50/30' :
                          c.estado === 'Aprobado' ? 'text-[#113B7A] border-[#113B7A]/40 bg-indigo-50/20' :
                          c.estado === 'Rechazado' ? 'text-rose-500 border-rose-300 bg-rose-50/20' :
                          'text-amber-600 border-amber-300'
                        }`}
                      >
                        <option value="En evaluacion">En evaluacion</option>
                        <option value="Aprobado">Aprobado</option>
                        <option value="Contratado">Contratado</option>
                        <option value="Rechazado">Rechazado</option>
                      </select>
                    </td>

                    {/* Interview Feedback text */}
                    <td className="py-3.5 px-4 text-slate-500 italic max-w-[200px] truncate" title={c.resultadoEntrevista}>
                      {c.resultadoEntrevista}
                    </td>

                    {/* Action Select link */}
                    <td className="py-3.5 px-4 text-right pr-6">
                      <button 
                        onClick={() => handleSeleccionarCandidato(c)}
                        className="text-[#113B7A] hover:text-[#1E3A8A] font-bold text-xs hover:underline decoration-solid"
                      >
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                );
              })}

              {candidatos.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No hay candidatos postulados actualmente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>



      {/* MODAL DIALOG IN BACKGROUND TO REGISTER VACANCIES */}
      <AnimatePresence>
        {showVacanteModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ ease: 'easeInOut', duration: 0.2 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-left flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[#F8FAFC]">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest leading-none">Registrar Oferta Laboral</h2>
                <button 
                  onClick={() => setShowVacanteModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body info */}
              <form onSubmit={handleGuardarVacante} className="p-6 space-y-4">
                
                {/* Title */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Nombre del Puesto</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Líder de Desarrollo Técnico"
                    value={vacTitulo}
                    onChange={(e) => setVacTitulo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700"
                    required
                  />
                </div>

                {/* Depto */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Departamento o Área</label>
                  <select
                    value={vacDepto}
                    onChange={(e) => setVacDepto(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700"
                  >
                    <option value="Gestion Humana">Gestión Humana</option>
                    <option value="Tecnologia">Tecnología</option>
                    <option value="Ventas">Ventas</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finanzas">Finanzas</option>
                  </select>
                </div>

                {/* Requisitos */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Requisitos de la Vacante</label>
                  <textarea 
                    rows={2} 
                    placeholder="Ej. 2 años de experiencia, titulación superior, habilidades..."
                    value={vacReqs}
                    onChange={(e) => setVacReqs(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 resize-none font-sans"
                    required
                  />
                </div>

                {/* Responsabilidades */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Responsabilidades u Obligaciones</label>
                  <textarea 
                    rows={2} 
                    placeholder="Ej. Publicar ofertas, control de nómina, KPIs corporativos..."
                    value={vacResps}
                    onChange={(e) => setVacResps(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 resize-none font-sans"
                    required
                  />
                </div>

                {/* Estatus default */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Estado Inicial</label>
                  <div className="flex gap-4 mt-1">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-650 text-slate-700">
                      <input 
                        type="radio" 
                        name="vacStateRadio" 
                        checked={vacEstadoForm === 'Abierta'} 
                        onChange={() => setVacEstadoForm('Abierta')} 
                        className="text-[#113B7A] focus:ring-[#113B7A]"
                      />
                      <span>Abierta</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-650 text-slate-700">
                      <input 
                        type="radio" 
                        name="vacStateRadio" 
                        checked={vacEstadoForm === 'En evaluacion'} 
                        onChange={() => setVacEstadoForm('En evaluacion')} 
                        className="text-[#113B7A] focus:ring-[#113B7A]"
                      />
                      <span>En evaluacion</span>
                    </label>
                  </div>
                </div>

                {/* Actions group */}
                <div className="flex gap-3 pt-4 border-t border-slate-100 font-bold text-xs">
                  <button
                    type="button"
                    onClick={() => setShowVacanteModal(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-center"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#113B7A] hover:bg-[#1E3A8A] text-white rounded-xl text-center shadow-md"
                  >
                    Publicar Vacante
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
