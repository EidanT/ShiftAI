import React from 'react';
import { 
  Building2, 
  Sparkles, 
  CreditCard,
  Briefcase, 
  GraduationCap, 
  BarChart3, 
  Settings,
  Plus,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Users,
  Search,
  CheckCircle,
  Lock,
  Compass,
  FileBadge,
  Mail,
  UserCheck2,
  BookmarkCheck
} from 'lucide-react';
import { ModuloId, Empleado } from '../types';
import { 
  REQUISITOS_VACANTES, 
  CONTRATOS_RECIENTES, 
  PAGOS_NOMINA, 
  EVALUACIONES_CONSENSO 
} from '../data';

interface FutureModulesViewProps {
  moduloId: ModuloId;
  empleados: Empleado[];
  onAgregarEmpleado?: () => void;
  busqueda?: string;
}

export default function FutureModulesView({ 
  moduloId, 
  empleados, 
  busqueda = ''
}: FutureModulesViewProps) {
  
  // Render based on Module selection
  switch (moduloId) {
    case 'employees':
      const q = busqueda.toLowerCase().trim();
      const filteredEmps = empleados.filter(e => 
        !q || 
        e.nombre.toLowerCase().includes(q) || 
        e.id.toLowerCase().includes(q) || 
        e.cargo.toLowerCase().includes(q) || 
        e.departamento.toLowerCase().includes(q)
      );

      return (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Plantilla de Empleados</h1>
              <p className="text-sm text-[#45474c] mt-1">Gestión del padrón, contrataciones vigentes y fichas técnicas del personal.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                    <th className="p-4 pl-6">ID / Código</th>
                    <th className="p-4">Empleado</th>
                    <th className="p-4">Cargo / Puesto</th>
                    <th className="p-4">Departamento</th>
                    <th className="p-4">Ingreso</th>
                    <th className="p-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                  {filteredEmps.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4 pl-6 font-mono text-slate-500">{emp.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                            {emp.iniciales}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-[#0F172A] group-hover:text-[#6366F1] transition-all">{emp.nombre}</span>
                            <span className="text-[10px] text-slate-400 font-sans">{emp.correo}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-750">{emp.cargo}</td>
                      <td className="p-4 text-slate-500 font-bold">{emp.departamento}</td>
                      <td className="p-4 text-slate-500 font-sans font-semibold">{emp.fechaIngreso}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#10B981] border border-emerald-100 flex items-center gap-1 w-max">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                          {emp.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
              <span className="text-xs text-slate-400">Total de {filteredEmps.length} colaboradores activos registrados</span>
            </div>
          </div>
        </div>
      );

    case 'payroll':
      return (
        <div className="space-y-6 animate-fade-in text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Cálculo de Nómina y Pagos</h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-lg flex items-center gap-1.5 leading-none shadow-sm select-none">
                  <Sparkles className="w-3.5 h-3.5" /> Próxima versión
                </span>
              </div>
              <p className="text-sm text-[#45474c]">Estructura de compensaciones, incentivos por departamentos y deducciones fiscales.</p>
            </div>
            
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm border border-slate-200 transition-colors">
              <Download className="w-4 h-4 text-slate-400" />
              <span>Historial de Pagos</span>
            </button>
          </div>

          {/* KPI Mini Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Monto Dispensado (Mes)</p>
              <span className="text-3xl font-extrabold text-slate-800 tracking-tight">$848,500</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Colaboradores Contemplados</p>
              <span className="text-3xl font-extrabold text-slate-800 tracking-tight">42 Activos</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Impuesto Fiscal / Deducibles</p>
              <span className="text-3xl font-extrabold text-slate-800 tracking-tight">18.5% Global</span>
            </div>
          </div>

          {/* Blueprint Structure Content Container */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div className="xl:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <span className="text-xs font-bold text-slate-650 text-slate-800">Cierre de Plantillas Quincenales Registrado</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                      <th className="p-4">Periodo Quincena</th>
                      <th className="p-4 text-center">Fuerza de Plantilla</th>
                      <th className="p-4 text-center">Monto Total</th>
                      <th className="p-4 text-center">Estatus</th>
                      <th className="p-4 text-right pr-6">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                    {PAGOS_NOMINA.map((np, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-800">{np.periodo}</td>
                        <td className="p-4 text-center font-bold">{np.empleados} empleados</td>
                        <td className="p-4 text-center font-mono font-bold">${np.total.toLocaleString()}</td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#10B981] border border-emerald-100">
                            {np.estado}
                          </span>
                        </td>
                        <td className="p-4 text-right pr-6">
                          <button className="text-slate-400 hover:text-indigo-600 transition-colors font-bold text-xs">Detalle</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Side Configuration placeholder column */}
            <div className="xl:col-span-4 bg-white border-2 border-slate-200 border-dashed rounded-xl p-6 flex flex-col space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#6366F1]" />
                  <span>Configuración Nómina</span>
                </h3>
                <p className="text-[11px] text-slate-400">Estas variables actuarán como base reguladora al liberar el módulo completo.</p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  <span className="text-[11px] font-medium text-slate-500">APORTE DE LEY (TSS)</span>
                  <span className="text-xs font-bold text-slate-700">7.1%</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  <span className="text-[11px] font-medium text-slate-500">APORTE LABORAL (AFP)</span>
                  <span className="text-xs font-bold text-slate-700">2.87%</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  <span className="text-[11px] font-medium text-slate-500">LÍMITE ISR ANUAL</span>
                  <span className="text-xs font-bold text-slate-700">$416,220 RD</span>
                </div>
              </div>

              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6366F1] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Próximas Características
                </span>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Integración directa con el Sistema Dominicano de Seguridad Social para cálculo automatizado de TSS e Infotep.
                </p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'recruitment':
      return (
        <div className="space-y-6 animate-fade-in text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Reclutamiento y Selección</h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-lg flex items-center gap-1.5 leading-none shadow-sm select-none">
                  <Sparkles className="w-3.5 h-3.5" /> Próxima versión
                </span>
              </div>
              <p className="text-sm text-[#45474c]">Publicación de vacantes, embudos de selección de currículum y control de candidatos.</p>
            </div>
            
            <button className="bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all">
              <Plus className="w-4 h-4" />
              <span>Publicar Vacante</span>
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            {/* Vacancies table list */}
            <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <span className="text-xs font-bold text-slate-800">Vacantes Corporativas Publicadas</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                      <th className="p-4">Vacante</th>
                      <th className="p-4">Departamento</th>
                      <th className="p-4 text-center">Inscritos</th>
                      <th className="p-4 text-center">Estatus</th>
                      <th className="p-4 text-right pr-6">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                    {REQUISITOS_VACANTES.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-4 font-bold text-slate-800 group-hover:text-[#6366F1] transition-all">{v.titulo}</td>
                        <td className="p-4 font-bold text-slate-500">{v.depto}</td>
                        <td className="p-4 text-center font-bold font-mono text-slate-700">{v.solicitudes} aspirantes</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            v.estado === 'Activo' 
                              ? 'bg-emerald-50 text-[#10B981] border-emerald-100' 
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}>
                            {v.estado}
                          </span>
                        </td>
                        <td className="p-4 text-right pr-6">
                          <button className="text-slate-400 hover:text-indigo-600 transition-colors font-bold text-xs" disabled>Administrar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Side summary profile card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">Ingresos de la Semana</span>
              
              <div className="divide-y divide-slate-100">
                {CONTRATOS_RECIENTES.map((c, i) => (
                  <div key={i} className="py-3.5 flex items-center justify-between">
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-slate-800 text-xs">{c.empleado}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{c.cargo} • {c.estado}</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 font-bold px-2 py-0.5 rounded-full">Contratado</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'training':
      return (
        <div className="space-y-6 animate-fade-in text-left">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Capacitación y Desarrollo</h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-lg flex items-center gap-1.5 leading-none shadow-sm select-none">
              <Sparkles className="w-3.5 h-3.5" /> Próxima versión
            </span>
          </div>
          <p className="text-sm text-[#45474c]">Cursos corporativos, asignación de certificaciones y seguimiento de habilidades técnicas.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 p-5 rounded-xl text-left">
              <h3 className="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span>Asignar Cursos</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">Cree itinerarios de capacitación para nuevos ingresos o ascensos laborales.</p>
              <button className="text-xs text-[#6366F1] font-bold hover:underline" disabled>Planificar asignaciones »</button>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl text-left">
              <h3 className="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-2">
                <UserCheck2 className="w-4 h-4 text-[#6366F1]" />
                <span>Gestión de Mentores</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">Lleve el control de asesores y expertos sénior que guían a nuevos integrantes.</p>
              <button className="text-xs text-[#6366F1] font-bold hover:underline" disabled>Ver padrón de mentores »</button>
            </div>

            <div className="bg-white border-slate-200 border-2 border-dashed p-5 rounded-xl flex flex-col justify-between text-left">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6366F1]">Próximo Entrenamiento</span>
                <h4 className="text-sm font-extrabold text-slate-800 mt-1 leading-snug">Dominican Tax Regulations 2026</h4>
                <p className="text-[11px] text-slate-400 mt-1">Conferencista invitado de la DGII. Oct 28 - Obligatorio Administración.</p>
              </div>
              <button className="mt-4 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded text-center text-xs font-bold text-slate-600 cursor-not-allowed">Asistentes Inscritos (8)</button>
            </div>
          </div>
        </div>
      );

    case 'evaluations':
      return (
        <div className="space-y-6 animate-fade-in text-left">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Evaluaciones de Desempeño</h1>
          </div>
          <p className="text-sm text-[#45474c]">Definición de metas, KPI's técnicos y retroalimentación interactiva del personal.</p>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <span className="text-xs font-bold text-slate-850">Evaluaciones bajo Consenso Técnico</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                      <th className="p-4">Colaborador Evaluado</th>
                      <th className="p-4">Departamento</th>
                      <th className="p-4">Calificación de Desempeño</th>
                      <th className="p-4">Periodo de Análisis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                    {EVALUACIONES_CONSENSO.map((ev, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-800">{ev.empleado}</td>
                        <td className="p-4 text-slate-500">{ev.depto}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-indigo-50 text-[#6366F1] border border-indigo-100">
                            {ev.calificacion}
                          </span>
                        </td>
                        <td className="p-4 text-slate-450 text-slate-400 font-sans">{ev.periodo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-slate-250 p-5 rounded-xl space-y-4">
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6366F1] flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" /> Matriz de Calidad
                </span>
                <h4 className="text-sm font-bold text-slate-800">Criterio de Evaluación</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">Las evaluaciones se rigen bajo el algoritmo de evaluación 360% (Autoevaluación, Colegas, Jefe directo).</p>
              </div>
              <div className="space-y-2 font-semibold text-xs text-slate-700">
                <div className="bg-slate-55/40 bg-slate-50 p-2 border border-slate-150 rounded">90% - 100%: Sobresaliente Excepcional</div>
                <div className="bg-slate-55/40 bg-slate-50 p-2 border border-slate-150 rounded">80% - 89%: Favorable Esperado</div>
                <div className="bg-slate-55/40 bg-slate-50 p-2 border border-slate-150 rounded">Menos de 79%: Plan de Capacitación Requerido</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'settings':
      return (
        <div className="space-y-6 animate-fade-in text-left">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Configuración global del sistema</h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-lg flex items-center gap-1.5 leading-none shadow-sm select-none">
              <Sparkles className="w-3.5 h-3.5" /> Próxima versión
            </span>
          </div>
          <p className="text-sm text-[#45474c]">Configuraciones políticas del SIGRH, roles directivos de RRHH y respaldos.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-left space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Canales de Comunicación</span>
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3.5 cursor-pointer">
                  <input type="checkbox" defaultChecked disabled className="rounded border-slate-300 text-[#6366F1] focus:ring-[#6366F1]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">Notificar aprobaciones por Email</span>
                    <span className="text-[10px] text-slate-400">Envío instantáneo de folios firmados al colaborador.</span>
                  </div>
                </label>
                <label className="flex items-center gap-3.5 cursor-pointer">
                  <input type="checkbox" defaultChecked disabled className="rounded border-slate-300 text-[#6366F1] focus:ring-[#6366F1]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">Respaldos diarios en la nube</span>
                    <span className="text-[10px] text-slate-400">Exportación automática de bitácora de asistencia a las 11:59 PM.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 text-left space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span>Políticas de Asistencia</span>
              </h3>

              <div className="space-y-4 text-xs font-semibold text-slate-600">
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-150">
                  <span>Horario Laboral Estándar</span>
                  <span className="font-mono font-bold text-slate-700">09:00 AM - 06:00 PM</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-150">
                  <span>Tolerancia de retraso</span>
                  <span className="font-mono font-bold text-slate-700">15 Minutos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 animate-fade-in text-left">
          <Compass className="w-16 h-16 text-slate-300 animate-spin-slow" />
          <h2 className="text-base font-bold text-slate-800">Módulo en Desarrollo</h2>
          <p className="text-xs text-slate-400 max-w-sm">Este panel está configurado dentro del routing del SIGRH y listo para recibir futuras expansiones.</p>
        </div>
      );
  }
}
