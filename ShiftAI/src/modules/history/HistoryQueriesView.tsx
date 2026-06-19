import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  FileText, 
  FileSpreadsheet, 
  BadgeCheck, 
  Mail, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  MapPin, 
  Calendar,
  Briefcase,
  Award,
  BookOpen,
  ArrowDownToLine,
  AlertOctagon,
  HelpCircle,
  FileBadge
} from 'lucide-react';
import { Empleado, RegistroAsistencia, RecienteActividad, ProgramaCapacitacion } from '../../types';

interface HistoryQueriesViewProps {
  empleados: Empleado[];
  asistencias: RegistroAsistencia[];
  recentActividades: RecienteActividad[];
  cursos: ProgramaCapacitacion[];
}

type TabSubId = 'asistencia' | 'permisos' | 'licencias' | 'vacaciones' | 'ausencias' | 'curriculum' | 'capacitaciones';

export default function HistoryQueriesView({ 
  empleados, 
  asistencias, 
  recentActividades,
  cursos
}: HistoryQueriesViewProps) {
  // Navigation states
  const [selectedEmpId, setSelectedEmpId] = useState<string>('EMP-2048'); // Default Ana García
  const [activeTab, setActiveTab] = useState<TabSubId>('asistencia');

  const selectedEmployee = empleados.find(e => e.id === selectedEmpId) || empleados[0];

  // Specific attendance for active selected Employee
  const employeeAttendance = asistencias.filter(item => item.empleadoId === selectedEmployee.id);
  const employeeActivities = recentActividades.filter(item => item.empleadoId === selectedEmployee.id || item.empleadoId === 'EMP-2048'); // Share for mock demonstration

  const subTabs: { id: TabSubId; label: string }[] = [
    { id: 'asistencia', label: 'Asistencia' },
    { id: 'permisos', label: 'Permisos' },
    { id: 'licencias', label: 'Licencias' },
    { id: 'vacaciones', label: 'Vacaciones' },
    { id: 'ausencias', label: 'Ausencias' },
    { id: 'curriculum', label: 'Currículum' },
    { id: 'capacitaciones', label: 'Capacitaciones' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-left">
      {/* Main Left Columns (Summary Card, Tabs, Data Table) */}
      <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
        
        {/* Bento Glassmorphism inspired Employee Profile Summary Box */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50/40 to-transparent rounded-bl-full pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
            {/* Avatar / Portrait with online indicator status */}
            <div className="relative shrink-0 select-none">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-100 shadow-md">
                <img 
                  src={selectedEmployee.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                  alt={selectedEmployee.nombre} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute bottom-1 right-1 w-4.5 h-4.5 bg-[#10B981] border-2 border-white rounded-full" title="Activo Online"></span>
            </div>

            {/* Employee Info Header */}
            <div className="flex-1 text-left min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-xl font-extrabold text-[#0F172A] tracking-tight truncate max-w-[200px]">
                  {selectedEmployee.nombre}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#10B981] border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                  Activo
                </span>
              </div>
              
              <p className="text-xs font-semibold text-slate-700 font-sans tracking-wide">
                {selectedEmployee.cargo} • <span className="text-[#6366F1] font-bold">{selectedEmployee.departamento}</span>
              </p>
              
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span className="font-mono font-bold">{selectedEmployee.id}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150">
                  <Mail className="w-4 h-4 text-slate-400 animate-pulse" />
                  <span>{selectedEmployee.correo}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Controls / Employee Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Dropdown Employee Selector */}
            <div className="relative w-full sm:w-60">
              <select 
                value={selectedEmpId} 
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-10 py-2 border border-slate-200 bg-slate-50 text-slate-800 font-semibold rounded-lg text-xs focus:ring-[#6366F1] focus:border-[#6366F1] outline-none cursor-pointer"
              >
                {empleados.map(e => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter range label mock */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Oct 01, 2023 - Oct 31, 2023</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto font-bold text-xs select-none">
            <button className="flex-1 sm:flex-none py-2 px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>PDF</span>
            </button>
            <button className="flex-1 sm:flex-none py-2 px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1">
              <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Tabbed Navigation Interface area */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col h-full min-h-[460px]">
          {/* Tabs Bar Header block */}
          <div className="border-b border-slate-100 bg-slate-50/50 pt-2 px-2 flex overflow-x-auto select-none scrollbar-none">
            {subTabs.map(tab => {
              const isAct = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 border-b-2 font-bold text-xs rounded-t-lg transition-all whitespace-nowrap ${
                    isAct 
                      ? 'border-[#6366F1] text-[#6366F1] bg-white shadow-sm'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active Tab Content renders */}
          <div className="flex-1 p-6">
            
            {/* TAB: ASISTENCIA */}
            {activeTab === 'asistencia' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-4 text-center">Hora Entrada</th>
                        <th className="py-3 px-4 text-center">Hora Salida</th>
                        <th className="py-3 px-4 text-center">Total Horas</th>
                        <th className="py-3 px-4 text-center">Estatus</th>
                        <th className="py-3 px-4 text-right pr-6">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-xs font-bold text-slate-700">
                      {employeeAttendance.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            No se registraron jornadas este mes.
                          </td>
                        </tr>
                      ) : (
                        employeeAttendance.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 text-slate-850 font-sans font-bold">{row.fecha}</td>
                            <td className="py-3 px-4 text-center text-slate-600">{row.entrada || '--:--'}</td>
                            <td className="py-3 px-4 text-center text-slate-600">{row.salida || '--:--'}</td>
                            <td className="py-3 px-4 text-center text-[#6366F1]">{row.horas > 0 ? `${row.horas}h` : '--'}</td>
                            <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] ${
                                row.estado === 'Presente' ? 'bg-emerald-50 text-[#10B981]' :
                                row.estado === 'Tardanza' ? 'bg-amber-50 text-[#F59E0B]' : 'bg-rose-50 text-rose-500'
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${
                                  row.estado === 'Presente' ? 'bg-[#10B981]' :
                                  row.estado === 'Tardanza' ? 'bg-[#F59E0B]' : 'bg-rose-500'
                                }`}></span>
                                {row.estado}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right pr-6">
                              <button className="text-slate-400 hover:text-slate-700 transition-colors">•••</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: PERMISOS / LICENCIAS / VACACIONES / AUSENCIAS PLACES HOLDERS */}
            {['permisos', 'licencias', 'vacaciones', 'ausencias'].includes(activeTab) && (
              <div className="py-10 text-center flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
                <FileBadge className="w-16 h-16 stroke-1 text-[#6366F1] animate-bounce" />
                <div className="text-center">
                  <h4 className="text-sm font-bold text-slate-800 capitalize leading-snug">
                    Consulta histórica de {activeTab}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Se muestran registros formalizados por RRHH correspondientes al año en curso para el carnet {selectedEmployee.id}. Todos los folios están auditados y respaldados digitalmente.
                  </p>
                </div>
                <div className="border border-[#E2E8F0] p-3 rounded-xl flex items-center justify-between hover:bg-slate-50 cursor-pointer w-full bg-white transition-colors">
                  <span className="text-xs font-bold text-slate-700">Reporte Consolidado {activeTab}.pdf</span>
                  <ArrowDownToLine className="w-4 h-4 text-[#6366F1]" />
                </div>
              </div>
            )}

            {/* TAB: CURRÍCULUM (Stunning professional resume profile) */}
            {activeTab === 'curriculum' && (
              <div className="space-y-6 text-left">
                {/* Profesional Summary */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-[#0F172A] border-b border-slate-100 pb-1.5 font-sans leading-none">Resumen Profesional</h4>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    {selectedEmployee.resumenProfesional || 'Profesional altamente capacitado con excelente trayectoria laboral, orientado al cumplimiento de metas organizacionales y desarrollo continuo.'}
                  </p>
                </div>

                {/* Vertical Timeline Job Experience Mock */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#0F172A] border-b border-slate-100 pb-1.5 font-sans leading-none">Trayectoria Laboral Reciente</h4>
                  <div className="relative pl-6 space-y-5 before:absolute before:inset-y-1 before:left-[7px] before:w-px before:bg-slate-200">
                    <div className="relative select-none text-left">
                      <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-[#6366F1] border-2 border-white shadow-sm" />
                      <h5 className="text-xs font-bold text-[#0F172A]">Senior {selectedEmployee.cargo}</h5>
                      <p className="text-[10px] text-[#6366F1] font-bold mt-1">Socio Corporativo Integral • 2021 - Presente</p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                        Liderazgo en optimización de infraestructuras corporativas, flujos de desarrollo y mentoría de nuevos talentos de plantilla.
                      </p>
                    </div>

                    <div className="relative select-none text-left">
                      <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-slate-300 border-2 border-white shadow-sm" />
                      <h5 className="text-xs font-bold text-slate-500">Especialista Junior</h5>
                      <p className="text-[10px] text-slate-400 mt-1 font-bold">Inicios e Incorporación de plantilla • 2019 - 2021</p>
                    </div>
                  </div>
                </div>

                {/* Skills tags badges */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-[#0F172A] border-b border-slate-100 pb-1.5 font-sans leading-none">Habilidades de Plantilla</h4>
                  <div className="flex flex-wrap gap-2 pt-1 font-bold text-xs select-none">
                    {['React JS', 'TypeScript', 'Tailwind CSS', 'Arquitectura UI', 'Sistemas de Calidad', 'Colaboración Ágil'].map((sk, i) => (
                      <span key={i} className="px-3 py-1 bg-indigo-50/60 text-[#6366F1] rounded-full border border-indigo-100">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CAPACITACIONES (Interactive list of complete/ongoing certifications) */}
            {activeTab === 'capacitaciones' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                        <th className="py-3 px-4">Curso / Certificación</th>
                        <th className="py-3 px-4">Institución</th>
                        <th className="py-3 px-4 text-center">Horas</th>
                        <th className="py-3 px-4 text-center">Estatus</th>
                        <th className="py-3 px-4 text-right pr-6">Certificado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                      {cursos.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-bold text-slate-800">{row.titulo}</td>
                          <td className="py-3.5 px-4 text-slate-500">{row.institucion}</td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold">{row.horas}h</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                              row.estado === 'Completado'
                                ? 'bg-emerald-50 text-[#10B981] border-emerald-100'
                                : 'bg-amber-50 text-[#F59E0B] border-amber-100'
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${row.estado === 'Completado' ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`}></span>
                              {row.estado}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right pr-6">
                            {row.estado === 'Completado' ? (
                              <button className="p-1 text-indigo-600 hover:bg-indigo-50 rounded" title="Descargar diploma">
                                <ArrowDownToLine className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-slate-350 text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

          {/* Table pagination footer markup */}
          <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 text-xs text-[#8590a6] select-none font-semibold">
            <span>Resultados auditados para {selectedEmployee.nombre}</span>
            <div className="flex gap-2">
              <button className="px-2.5 py-0.5 border border-slate-200 bg-white rounded-md text-[11px] font-bold text-slate-450 text-slate-500 disabled:opacity-40">Anterior</button>
              <button className="px-2.5 py-0.5 border border-slate-200 bg-white rounded-md text-[11px] font-bold text-slate-450 text-slate-500 disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column Timeline Side Panel (Unified Activity timelines) */}
      <div className="lg:col-span-4 xl:col-span-3">
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 h-full min-h-[500px] flex flex-col select-none">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold tracking-tight text-[#0F172A] uppercase">Actividad Reciente</h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded">Log</span>
          </div>

          {/* Vertical Milestone Progress Loop list */}
          <div className="flex-1 overflow-y-auto pr-2 relative before:absolute before:inset-y-0 before:left-[15px] before:w-px before:bg-slate-150">
            {employeeActivities.map((act) => (
              <div key={act.id} className="relative pl-9 mb-6 group text-left">
                <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border border-white flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-105 duration-200 ${
                  act.tipo === 'vacacion' ? 'bg-emerald-50 text-[#10B981]' :
                  act.tipo === 'asistencia' ? 'bg-indigo-50 text-[#6366F1]' :
                  act.tipo === 'tardanza' ? 'bg-amber-50 text-[#F59E0B]' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl hover:border-slate-200 transition-all">
                  <p className="text-xs font-bold text-slate-800 leading-snug">{act.titulo}</p>
                  <p className="text-[10.5px] text-slate-400 mt-1 font-semibold">{act.descripcion}</p>
                  <span className="text-[9.5px] text-[#8590a6] mt-2 block font-extrabold select-none">{act.tiempo}</span>
                </div>
              </div>
            ))}
            
            {/* Timeline End circle indicator bar */}
            <div className="relative pl-10">
              <div className="absolute left-[11px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-200 border-2 border-white shadow-sm z-10"></div>
            </div>
          </div>
          
          <button className="mt-4 w-full py-2 text-center text-xs font-semibold text-[#6366F1] bg-slate-50 border border-slate-150 rounded-lg hover:bg-slate-100 transition-colors">
            Ver registro completo de auditoría
          </button>
        </div>
      </div>
    </div>
  );
}
