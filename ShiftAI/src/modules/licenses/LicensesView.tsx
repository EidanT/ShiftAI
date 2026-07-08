import React, { useState } from 'react';
import { 
  Plus, 
  Download, 
  SlidersHorizontal, 
  Search, 
  Calendar,
  Eye, 
  Check, 
  X, 
  FileText,
  BadgeAlert,
  Clock,
  CheckCircle,
  HelpCircle,
  User,
  ExternalLink,
  Lock,
  ChevronDown,
  Activity
} from 'lucide-react';
import { VacacionLicencia, Empleado } from '../../types';
import { AnimatePresence, motion } from 'motion/react';
import LicenseForm from './form/LicenseForm';

interface LicensesViewProps {
  licencias: VacacionLicencia[];
  empleados: Empleado[];
  busqueda: string;
  onAprobarLicencia: (id: string, empNombre: string) => void;
  onRechazarLicencia: (id: string, empNombre: string) => void;
  onSubmitManualLicense: (data: {
    empleadoId: string;
    tipo: 'Médica' | 'Vacaciones' | 'Maternidad/Paternidad' | 'Estudios' | 'Permiso Personal';
    fechaInicio: string;
    fechaFin: string;
    duracionDias: number;
    motivo_descripcion: string;
  }) => void;
}

export default function LicensesView({ 
  licencias, 
  empleados, 
  busqueda,
  onAprobarLicencia,
  onRechazarLicencia,
  onSubmitManualLicense
}: LicensesViewProps) {
  const [showManualModal, setShowManualModal] = useState(false);
  // Navigation & Detail panel trigger states
  const [selectedLicenciaId, setSelectedLicenciaId] = useState<string>(licencias[0]?.id || '');
  const [buscarNombreId, setBuscarNombreId] = useState('');
  const [tipoLicencia, setTipoLicencia] = useState('Todos los tipos');
  const [estadoFilter, setEstadoFilter] = useState('Todos');

  // Find active selected license
  const selectedLicencia = licencias.find(l => l.id === selectedLicenciaId) || licencias[0];
  const selectedEmpleado = selectedLicencia ? empleados.find(e => e.id === selectedLicencia.empleadoId) : null;

  // Filter Logic
  const filteredLicencias = licencias.filter(item => {
    const emp = empleados.find(e => e.id === item.empleadoId);
    if (!emp) return false;

    const query = busqueda.toLowerCase().trim();
    const globalMatch = !query || 
      emp.nombre.toLowerCase().includes(query) || 
      emp.id.toLowerCase().includes(query) ||
      item.tipo.toLowerCase().includes(query);

    const inputMatch = !buscarNombreId || 
      emp.nombre.toLowerCase().includes(buscarNombreId.toLowerCase()) || 
      emp.id.toLowerCase().includes(buscarNombreId.toLowerCase());

    const tipoMatch = tipoLicencia === 'Todos los tipos' || item.tipo === tipoLicencia;
    const estadoMatch = estadoFilter === 'Todos' || item.estado === estadoFilter;

    return globalMatch && inputMatch && tipoMatch && estadoMatch;
  });

  return (
    <div className="flex bg-[#F8FAFC] h-full min-h-[calc(100vh-4rem)] relative select-none text-left">
      {/* Left scrollable data section */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-20 pr-[420px]">
        {/* Top visual Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Gestión de Licencias y Vacaciones (En proceso)</h1>
            <p className="text-sm text-[#45474c] mt-1">Supervisión e historial de permisos especiales, ausencias y períodos aprobados.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="px-3.5 py-2 bg-white border border-[#E2E8F0] text-[#0F172A] rounded-lg hover:bg-slate-50 transition-all font-semibold text-xs flex items-center gap-2 shadow-sm">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span>Filtros avanzados</span>
            </button>
            <button className="px-3.5 py-2 bg-white border border-[#E2E8F0] text-[#0F172A] rounded-lg hover:bg-slate-50 transition-all font-semibold text-xs flex items-center gap-2 shadow-sm">
              <Download className="w-4 h-4 text-slate-400" />
              <span>Exportar</span>
            </button>
            <button 
              onClick={() => setShowManualModal(true)}
              className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg hover:scale-105 active:scale-95 shadow-md transition-all font-semibold text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Licencia</span>
            </button>
          </div>
        </div>

        {/* Filters Bar with standard form properties */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[180px] flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Buscar empleado</span>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-[#6366F1] focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Nombre o ID..."
                value={buscarNombreId}
                onChange={(e) => setBuscarNombreId(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-slate-800 focus:outline-none focus:ring-0 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="w-44 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Tipo de licencia</span>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg pr-8 pl-3 py-1.5 focus-within:border-[#6366F1] focus-within:bg-white transition-all">
              <select 
                value={tipoLicencia}
                onChange={(e) => setTipoLicencia(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-slate-800 focus:outline-none focus:ring-0 cursor-pointer appearance-none"
              >
                <option>Todos los tipos</option>
                <option>Médica</option>
                <option>Vacaciones</option>
                <option>Maternidad/Paternidad</option>
                <option>Estudios</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 pointer-events-none" />
            </div>
          </div>

          <div className="w-36 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Estado</span>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg pr-8 pl-3 py-1.5 focus-within:border-[#6366F1] focus-within:bg-white transition-all">
              <select 
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-slate-800 focus:outline-none focus:ring-0 cursor-pointer appearance-none"
              >
                <option>Todos</option>
                <option>Pendiente</option>
                <option>Aprobada</option>
                <option>Activa</option>
                <option>Finalizada</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 pointer-events-none" />
            </div>
          </div>

          <button 
            onClick={() => {
              setBuscarNombreId('');
              setTipoLicencia('Todos los tipos');
              setEstadoFilter('Todos');
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-lg transition-all"
          >
            Limpiar filtros
          </button>
        </div>

        {/* Compact KPI Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm hover:border-indigo-100 transition-colors flex flex-col justify-between h-full">
            <p className="text-[10px] font-bold text-[#8590a6] uppercase tracking-widest mb-1.5 leading-none">Licencias Activas</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight leading-none">42</span>
              <span className="text-[10px] font-bold text-[#10B981] bg-emerald-50 px-1.5 py-0.5 rounded-full">+5%</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm hover:border-indigo-100 transition-colors flex flex-col justify-between h-full">
            <p className="text-[10px] font-bold text-[#8590a6] uppercase tracking-widest mb-1.5 leading-none">Solicitudes Pendientes</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight leading-none">
                {licencias.filter(l => l.estado === 'Pendiente').length}
              </span>
              <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full">Alerta</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm hover:border-indigo-100 transition-colors flex flex-col justify-between h-full">
            <p className="text-[10px] font-bold text-[#8590a6] uppercase tracking-widest mb-1.5 leading-none">Licencias Finalizadas</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight leading-none">156</span>
              <span className="text-[10px] font-bold text-[#10B981] bg-emerald-50 px-1.5 py-0.5 rounded-full">-2%</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm hover:border-indigo-100 transition-colors flex flex-col justify-between h-full">
            <p className="text-[10px] font-bold text-[#8590a6] uppercase tracking-widest mb-1.5 leading-none">Días Totales Acumulados</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight leading-none">1,240</span>
              <span className="text-[10px] text-slate-500 font-semibold ml-1 font-sans">YTD</span>
            </div>
          </div>
        </div>

        {/* Data list view table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                  <th className="py-3 px-4">Empleado</th>
                  <th className="py-3 px-4">Clasificación</th>
                  <th className="py-3 px-4">Duración</th>
                  <th className="py-3 px-4">Rango de Fechas</th>
                  <th className="py-3 px-4">Estatus</th>
                  <th className="py-3 px-4 text-right pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                {filteredLicencias.map((item) => {
                  const emp = empleados.find(e => e.id === item.empleadoId);
                  if (!emp) return null;

                  const isSelected = item.id === selectedLicenciaId;

                  const statusColors: any = {
                    Pendiente: 'bg-amber-50 text-amber-500 border-amber-100',
                    Aprobada: 'bg-emerald-50 text-[#10B981] border-emerald-100',
                    Activa: 'bg-indigo-50 text-[#6366F1] border-indigo-100',
                    Finalizada: 'bg-slate-100 text-slate-500 border-slate-200',
                    Rechazada: 'bg-rose-50 text-rose-500 border-rose-100'
                  };

                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => setSelectedLicenciaId(item.id)}
                      className={`hover:bg-slate-50/50 cursor-pointer transition-all relative ${
                        isSelected ? 'bg-indigo-50/20 border-l-4 border-l-[#6366F1]' : ''
                      }`}
                    >
                      <td className="py-4.5 px-4 pr-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-[11px] shrink-0">
                            {emp.iniciales}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-[#0F172A] tracking-tight">{emp.nombre}</span>
                            <span className="text-[10px] text-slate-400 font-sans">{emp.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4.5 px-4 text-slate-700 font-bold">{item.tipo}</td>
                      <td className="py-4.5 px-4 font-mono font-bold">{item.duracionDias} días</td>
                      <td className="py-4.5 px-4 text-slate-500 font-sans font-semibold">
                        {item.fechaInicio} al {item.fechaFin}
                      </td>
                      <td className="py-4.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[item.estado]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            item.estado === 'Pendiente' ? 'bg-amber-500' :
                            item.estado === 'Aprobada' ? 'bg-[#10B981]' :
                            item.estado === 'Activa' ? 'bg-[#6366F1]' :
                            item.estado === 'Rechazada' ? 'bg-rose-500' : 'bg-slate-500'
                          }`}></span>
                          {item.estado}
                        </span>
                      </td>
                      <td className="py-4.5 px-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => setSelectedLicenciaId(item.id)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {item.estado === 'Pendiente' && (
                            <>
                              <button 
                                onClick={() => onAprobarLicencia(item.id, emp.nombre)}
                                className="p-1 rounded bg-[#10B981] text-white hover:scale-105 active:scale-95 shadow-sm transition-all"
                                title="Aprobar"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => onRechazarLicencia(item.id, emp.nombre)}
                                className="p-1 rounded bg-rose-500 text-white hover:scale-105 active:scale-95 shadow-sm transition-all"
                                title="Rechazar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex justify-between bg-slate-50 text-xs font-semibold text-slate-500">
            <span>Mostrando {filteredLicencias.length} de {licencias.length} expedientes registrados</span>
            <div className="flex gap-2">
              <button className="px-3.5 py-1 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg" disabled>Anterior</button>
              <button className="px-3.5 py-1 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg">Siguiente</button>
            </div>
          </div>
        </div>

        {/* Dynamic Analytics (Bento Grid) inside scrollable content bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Circular Chart - Licencias por tipo */}
          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
            <h3 className="text-sm font-bold text-[#0F172A] mb-4">Licencias por Clasificación</h3>
            <div className="flex items-center justify-center p-3 relative h-48">
              {/* Outer Custom styled donut circle mockup SVG */}
              <svg className="w-32 h-32 transform -rotate-90 shrink-0">
                <circle cx="64" cy="64" r="48" fill="transparent" stroke="#E2E8F0" strokeWidth="14" />
                {/* Médica 45% */}
                <circle cx="64" cy="64" r="48" fill="transparent" stroke="#6366F1" strokeWidth="14" strokeDasharray="301" strokeDashoffset="135" />
                {/* Vacaciones 30% */}
                <circle cx="64" cy="64" r="48" fill="transparent" stroke="#10B981" strokeWidth="14" strokeDasharray="301" strokeDashoffset="225" strokeDashoffset-style="margin-left: 20px" className="opacity-80" />
              </svg>
              
              {/* Inner details side legends */}
              <div className="ml-8 space-y-2 flex flex-col text-left">
                <span className="flex items-center text-xs font-semibold text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-[#6366F1] mr-2 block"></span>Médica (45%)
                </span>
                <span className="flex items-center text-xs font-semibold text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-[#10B981] mr-2 block"></span>Vacaciones (30%)
                </span>
                <span className="flex items-center text-xs font-semibold text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B] mr-2 block"></span>Maternidad (15%)
                </span>
                <span className="flex items-center text-xs font-semibold text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-slate-400 mr-2 block"></span>Estudios (10%)
                </span>
              </div>
            </div>
          </div>

          {/* Bar Chart - Monthly distribution bar counts */}
          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
            <h3 className="text-sm font-bold text-[#0F172A] mb-4">Registro Histórico de Licencias (Últimos 6 meses)</h3>
            <div className="h-44 flex items-end justify-between px-4 pb-2 border-b border-[#E2E8F0]/80 relative z-10">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-2 z-0">
                <div className="border-t border-slate-100 w-full h-0"></div>
                <div className="border-t border-slate-100 w-full h-0"></div>
                <div className="border-t border-slate-100 w-full h-0"></div>
              </div>

              {[
                { label: 'May', count: 12, h: 'h-[40%]' },
                { label: 'Jun', count: 18, h: 'h-[60%]' },
                { label: 'Jul', count: 10, h: 'h-[35%]' },
                { label: 'Ago', count: 24, h: 'h-[80%]' },
                { label: 'Sep', count: 15, h: 'h-[50%]' },
                { label: 'Oct', count: 28, h: 'h-[90%]', active: true }
              ].map((m, idx) => (
                <div key={idx} className="w-10 flex flex-col items-center group relative cursor-pointer z-10">
                  <div className={`w-6 rounded-t-md transition-all duration-300 ${m.h} ${
                    m.active 
                      ? 'bg-[#6366F1] shadow-[0_0_8px_rgba(99,102,241,0.4)]' 
                      : 'bg-[#6366F1]/40 hover:bg-[#6366F1]/70'
                  }`} />
                  <span className={`text-[10px] font-bold mt-1.5 ${m.active ? 'text-[#6366F1]' : 'text-slate-400'}`}>
                    {m.label}
                  </span>
                  {/* Tooltip */}
                  <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity -top-8 bg-slate-900 text-white rounded text-[10px] font-bold px-1.5 py-0.5 pointer-events-none select-none shadow">
                    {m.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Slide-out Sidebar Panel (Fixed on very right) */}
      <aside className="w-[400px] bg-white border-l border-slate-200 shadow-[-4px_0_15px_rgba(0,0,0,0.03)] h-full flex flex-col z-20 fixed right-0 top-16">
        {selectedLicencia ? (
          <>
            {/* Header section with selected employee details card */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-[#F8FAFC]">
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider leading-none">Detalles de la Solicitud</h3>
              <span className="text-[10px] bg-[#6366F1]/10 text-[#6366F1] font-bold px-2 py-0.5 rounded-full">{selectedLicencia.id}</span>
            </div>

            {/* Scrollable layout elements */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Profile Card details */}
              {selectedEmpleado && (
                <div className="flex items-center gap-4 bg-slate-50 p-4 border border-slate-100 rounded-xl">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0">
                    <img 
                      src={selectedEmpleado.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                      alt={selectedEmpleado.nombre} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <h4 className="text-sm font-bold text-[#0F172A]">{selectedEmpleado.nombre}</h4>
                    <span className="text-[11px] text-[#45474c] mt-0.5 leading-none">{selectedEmpleado.cargo}</span>
                    <span className="text-[10px] text-slate-400 mt-1 font-mono font-bold leading-none">{selectedEmpleado.id}</span>
                  </div>
                </div>
              )}

              {/* Status Badge banner */}
              <div className="flex flex-col gap-1 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Estatus del trámite</span>
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  selectedLicencia.estado === 'Pendiente' ? 'bg-amber-50/40 border-amber-200 text-amber-700' :
                  selectedLicencia.estado === 'Aprobada' ? 'bg-emerald-50/40 border-emerald-200 text-[#10B981]' :
                  selectedLicencia.estado === 'Activa' ? 'bg-indigo-50/40 border-[#6366F1]/20 text-[#6366F1]' :
                  'bg-slate-100 border-slate-200 text-slate-500'
                }`}>
                  <Activity className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold leading-none uppercase">Estado Actual</span>
                    <span className="text-sm font-extrabold text-slate-850 truncate mt-1">
                      {selectedLicencia.estado === 'Pendiente' ? 'Pendiente de Aprobación' : `Licencia ${selectedLicencia.estado}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid timeline schedule details */}
              <div className="flex flex-col gap-2 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Calendario / Periodo</span>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-150 p-4 rounded-xl">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tipo Licencia</span>
                    <p className="text-xs font-bold text-slate-800 mt-1">{selectedLicencia.tipo}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Duración</span>
                    <p className="text-xs font-bold text-slate-800 mt-1">{selectedLicencia.duracionDias} días hables</p>
                  </div>
                  <div className="border-t border-slate-200/50 pt-2.5 col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Fecha Inicio</span>
                      <p className="text-xs font-bold text-slate-800 mt-1">{selectedLicencia.fechaInicio}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Fecha Fin</span>
                      <p className="text-xs font-bold text-slate-800 mt-1">{selectedLicencia.fechaFin}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivation comment quote banner */}
              <div className="flex flex-col gap-1 text-left bg-[#F8FAFC] border border-slate-150 rounded-xl p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Justificación / Motivo</span>
                <p className="text-xs font-semibold text-slate-700 italic mt-1 leading-relaxed">
                  "{selectedLicencia.motivo_descripcion || 'No se ingresaron comentarios o motivos formales para esta solicitud.'}"
                </p>
              </div>

              {/* Attachment card widget pdf */}
              {selectedLicencia.documentoAdjunto && (
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Documentación médica</span>
                  <div className="border border-[#E2E8F0] p-3 rounded-xl flex items-center justify-between hover:bg-slate-50 cursor-pointer bg-white group transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center font-bold">
                        PDF
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-[#6366F1] transition-all">
                          {selectedLicencia.documentoAdjunto.nombre}
                        </span>
                        <span className="text-[10px] text-slate-400">{selectedLicencia.documentoAdjunto.peso} • Subido el {selectedLicencia.documentoAdjunto.fechaSubida}</span>
                      </div>
                    </div>
                    <button className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100" title="Ver adjunto">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Approval status milestones check timeline */}
              <div className="flex flex-col gap-3 text-left pb-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Historial del flujo</span>
                <div className="relative pl-6 space-y-4 before:absolute before:inset-y-1 before:left-[7px] before:w-px before:bg-slate-200">
                  {selectedLicencia.historialEventos.map((ev, idx) => (
                    <div key={idx} className="relative text-left">
                      <div className={`absolute -left-[23px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${
                        idx === 0 ? 'bg-[#6366F1]' : 'bg-slate-300'
                      }`} />
                      <p className="text-xs font-bold text-slate-700">{ev.evento}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{ev.usuario} • {ev.fechaHora}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Workflow interactive actions layout footer */}
            {selectedLicencia.estado === 'Pendiente' ? (
              <div className="p-4 border-t border-slate-100 bg-[#F8FAFC] flex gap-3 z-10 font-bold text-xs select-none shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
                <button 
                  onClick={() => onRechazarLicencia(selectedLicencia.id, selectedEmpleado?.nombre || '')}
                  className="flex-1 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-lg shadow-sm transition-all text-center"
                >
                  Rechazar
                </button>
                <button 
                  onClick={() => onAprobarLicencia(selectedLicencia.id, selectedEmpleado?.nombre || '')}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-665 text-white rounded-lg shadow-md hover:scale-[1.03] active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Aprobar</span>
                </button>
              </div>
            ) : (
              <div className="p-6 border-t border-slate-100 bg-slate-50 text-center select-none">
                <span className="text-xs font-bold text-slate-500 flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Trámite cerrado en estado: {selectedLicencia.estado}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="m-auto p-4 text-center text-slate-400">
            <BadgeAlert className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold">Sin elementos seleccionados</p>
          </div>
        )}
      </aside>

      {/* Manual registry modal popup dialog */}
      <AnimatePresence>
        {showManualModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ ease: 'easeInOut', duration: 0.2 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-left flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[#F8FAFC]">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest leading-none">Registro de Licencia o Vacación</h2>
                <button 
                  onClick={() => setShowManualModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <LicenseForm
                empleados={empleados}
                onSubmit={(data) => {
                  onSubmitManualLicense(data);
                  setShowManualModal(false);
                }}
                onCancel={() => setShowManualModal(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
