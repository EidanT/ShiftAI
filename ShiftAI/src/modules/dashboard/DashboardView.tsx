import React, { useState } from 'react';
import { 
  Users, 
  CalendarDays, 
  UserMinus, 
  Percent, 
  TrendingUp, 
  TrendingDown, 
  MoreVertical,
  Calendar as CalendarIcon,
  Download,
  SlidersHorizontal,
  Check,
  X,
  Eye
} from 'lucide-react';
import { SolicitudPendiente } from '../../types';
import { sileo } from 'sileo';

interface DashboardViewProps {
  solicitudes: SolicitudPendiente[];
  onAprobarSolicitud: (id: string, depto: string) => void;
  onRechazarSolicitud: (id: string, depto: string) => void;
}

export default function DashboardView({ 
  solicitudes, 
  onAprobarSolicitud, 
  onRechazarSolicitud
}: DashboardViewProps) {
  const [selectedDay, setSelectedDay] = useState<number>(24);

  // Mocks for upcoming vacations list
  const proximasVacaciones = [
    { iniciales: 'LM', nombre: 'Laura Mendoza', depto: 'Desarrollo IT', rango: '26 Oct - 05 Nov', dias: 10, bg: 'bg-teal-100 text-teal-800' },
    { iniciales: 'CR', nombre: 'Carlos Ruiz', depto: 'Ventas', rango: '01 Nov - 15 Nov', dias: 15, bg: 'bg-amber-100 text-amber-800' }
  ];

  // Calendar days generation mock
  const calendarDays = [
    // Pre-month
    { day: 25, currentMonth: false }, { day: 26, currentMonth: false }, { day: 27, currentMonth: false }, 
    { day: 28, currentMonth: false }, { day: 29, currentMonth: false }, { day: 30, currentMonth: false },
    // Oct 1st
    { day: 1, currentMonth: true }, { day: 2, currentMonth: true }, { day: 3, currentMonth: true }, 
    { day: 4, currentMonth: true }, { day: 5, currentMonth: true }, { day: 6, currentMonth: true }, 
    { day: 7, currentMonth: true }, { day: 8, currentMonth: true }, { day: 9, currentMonth: true }, 
    { day: 10, currentMonth: true }, { day: 11, currentMonth: true }, { day: 12, currentMonth: true }, 
    { day: 13, currentMonth: true }, { day: 14, currentMonth: true }, { day: 15, currentMonth: true }, 
    { day: 16, currentMonth: true }, { day: 17, currentMonth: true }, { day: 18, currentMonth: true }, 
    { day: 19, currentMonth: true }, { day: 20, currentMonth: true }, { day: 21, currentMonth: true }, 
    { day: 22, currentMonth: true }, { day: 23, currentMonth: true }, { day: 24, currentMonth: true, isToday: true }, 
    { day: 25, currentMonth: true }, { day: 26, currentMonth: true }, { day: 27, currentMonth: true }, 
    { day: 28, currentMonth: true }, { day: 29, currentMonth: true }, { day: 30, currentMonth: true },
    { day: 31, currentMonth: true }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Upper Context & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#45474c] mt-1">Resumen general de administración de personal y tendencias del mes.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] font-medium text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            <span>Hoy, 24 Oct 2023</span>
          </button>
          <button 
            onClick={() => sileo.success({
              title: 'Exportación Exitosa',
              description: 'El reporte consolidado del mes se ha descargado correctamente.'
            })}
            className="bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Reporte</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Empleados Activos</p>
            <span className="text-indigo-600 bg-indigo-50 p-2 rounded-lg shrink-0">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <h3 className="text-2xl font-bold text-[#0F172A] tracking-tight leading-none">1,245</h3>
            <span className="text-xs font-semibold text-[#10B981] flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-0.5" /> 2.4%
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Asistencias del Día</p>
            <span className="text-[#10B981] bg-emerald-50 p-2 rounded-lg shrink-0">
              <CalendarDays className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <h3 className="text-2xl font-bold text-[#0F172A] tracking-tight leading-none">1,180</h3>
            <span className="text-[11px] text-slate-500 font-medium">94.7% de nómina</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Empleados Ausentes</p>
            <span className="text-[#E11D48] bg-rose-50 p-2 rounded-lg shrink-0">
              <UserMinus className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <h3 className="text-2xl font-bold text-[#0F172A] tracking-tight leading-none">24</h3>
            <span className="text-xs font-semibold text-[#E11D48] flex items-center bg-rose-50 px-1.5 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-0.5" /> 1.2%
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Porcentaje Asistencia</p>
            <span className="text-[#F59E0B] bg-amber-50 p-2 rounded-lg shrink-0">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <h3 className="text-2xl font-bold text-[#0F172A] tracking-tight leading-none">96.8%</h3>
            <span className="text-xs font-semibold text-[#10B981] flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> Mensual
            </span>
          </div>
        </div>
      </div>

      {/* Main Bento Layout: Left = Charts (Columns 2), Right = Calendar + Vacations (Column 1) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (Charts) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Custom Bar Chart - Asistencia Mensual vs Expectativa */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col h-[340px] hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-[#0F172A] leading-snug">Asistencia Semanal vs Expectativa</h3>
                <span className="text-[11px] text-slate-400">Datos comparativos del promedio diario</span>
              </div>
              <button className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Interactive Bars container */}
            <div className="flex-1 relative w-full flex items-end justify-between px-2 pb-8 pt-4">
              {/* Y Axis line bounds */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] font-medium text-slate-400 pb-8 select-none">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              {/* Grid line guidelines */}
              <div className="absolute inset-0 left-8 border-b border-slate-200/60 pb-8 flex flex-col justify-between pointer-events-none">
                <div className="w-full border-t border-slate-100 border-dashed"></div>
                <div className="w-full border-t border-slate-100 border-dashed"></div>
                <div className="w-full border-t border-slate-100 border-dashed"></div>
                <div className="w-full border-t border-slate-100 border-dashed"></div>
                <div className="w-full h-px"></div>
              </div>

              {/* Bars representation */}
              {[
                { label: 'Lun', value: 90, expected: 92, height: 'h-[90%]', expectedColor: 'bg-indigo-300', actualColor: 'bg-[#6366F1]' },
                { label: 'Mar', value: 95, expected: 92, height: 'h-[95%]', expectedColor: 'bg-indigo-300', actualColor: 'bg-[#6366F1]' },
                { label: 'Mié', value: 88, expected: 92, height: 'h-[88%]', expectedColor: 'bg-indigo-300', actualColor: 'bg-[#6366F1]' },
                { label: 'Jue', value: 92, expected: 92, height: 'h-[92%]', expectedColor: 'bg-indigo-300', actualColor: 'bg-[#6366F1]' },
                { label: 'Vie', value: 85, expected: 92, height: 'h-[85%]', expectedColor: 'bg-indigo-300', actualColor: 'bg-[#6366F1]' },
              ].map((bar, i) => (
                <div key={i} className="flex flex-col items-center flex-1 ml-8 relative group cursor-pointer z-10">
                  <div className="w-full max-w-[40px] bg-slate-100 flex items-end h-[160px] rounded-lg overflow-hidden border border-slate-100 transition-transform duration-300 group-hover:scale-105">
                    <div 
                      style={{ height: `${bar.value}%` }} 
                      className={`w-full ${bar.actualColor} rounded-b-lg transition-all duration-500`}
                    />
                  </div>
                  <span className="absolute -bottom-6 text-[11px] font-semibold text-slate-500 font-sans tracking-tight">{bar.label}</span>
                  
                  {/* Tooltip detail hover overlay */}
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 -top-12 bg-slate-900 text-white rounded px-2.5 py-1 text-[10px] shadow-lg pointer-events-none z-30">
                    Asistencia: <span className="font-bold">{bar.value}%</span> (Meta: {bar.expected}%)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spline Path SVG Chart - Tendencia de Ausentismo */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col h-[300px] hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-[#0F172A] leading-snug">Tendencia de Ausentismo</h3>
                <span className="text-[11px] text-slate-400">Total de faltas mensuales clasificadas</span>
              </div>
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 font-sans tracking-wider uppercase">
                  <div className="w-2.5 h-2.5 bg-[#E11D48] rounded-full"></div> Injustificadas
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 font-sans tracking-wider uppercase">
                  <div className="w-2.5 h-2.5 bg-[#F59E0B] rounded-full"></div> Médicas
                </span>
              </div>
            </div>

            {/* Path SVG Visualizer */}
            <div className="flex-1 w-full bg-slate-50 rounded-xl border border-slate-200 border-dashed flex items-center justify-center relative overflow-hidden">
              <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradientRose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E11D48" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#E11D48" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="gradientAmber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                
                {/* Grid guidelines */}
                <line x1="0" y1="37" x2="500" y2="37" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3"/>
                <line x1="0" y1="75" x2="500" y2="75" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3"/>
                <line x1="0" y1="112" x2="500" y2="112" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3"/>

                {/* Spline area fills */}
                <path d="M 0 150 Q 125 40 250 85 T 500 120 L 500 150 L 0 150 Z" fill="url(#gradientAmber)" />
                <path d="M 0 150 Q 125 100 250 50 T 500 100 L 500 150 L 0 150 Z" fill="url(#gradientRose)" />

                {/* Lines */}
                <path d="M 0 150 Q 125 40 250 85 T 500 120" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                <path d="M 0 150 Q 125 100 250 50 T 500 100" fill="none" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" />

                {/* Hot dots on the spline */}
                <circle cx="250" cy="85" r="4" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="250" cy="50" r="4.5" fill="#E11D48" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="420" cy="110" r="4" fill="#E11D48" stroke="#FFFFFF" strokeWidth="1.5" />
              </svg>

              {/* Float textual guide overlays inside */}
              <div className="absolute top-4 left-6 text-[10px] font-semibold text-slate-500 font-sans">Semana 1</div>
              <div className="absolute top-4 left-1/3 text-[10px] font-semibold text-slate-500 font-sans">Semana 2</div>
              <div className="absolute top-4 left-2/3 text-[10px] font-semibold text-slate-500 font-sans">Semana 3</div>
              <div className="absolute top-4 right-6 text-[10px] font-semibold text-slate-500 font-sans">Semana 4</div>
            </div>
          </div>
        </div>

        {/* Right Column (Calendar + Vacations) */}
        <div className="flex flex-col gap-6">
          {/* Inline Compact Calendar Widget */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-[#0F172A]">Asistencia Octubre 2023</h3>
              <div className="flex items-center gap-1.5">
                <button className="p-1 hover:bg-slate-100 rounded text-slate-500 text-xs font-semibold">«</button>
                <span className="text-xs font-semibold text-slate-700">Oct 2023</span>
                <button className="p-1 hover:bg-slate-100 rounded text-slate-500 text-xs font-semibold">»</button>
              </div>
            </div>

            {/* Days letter markings */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 select-none">
              <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span>
              <span className="text-slate-300">S</span><span className="text-slate-300">D</span>
            </div>

            {/* Days grid generator Mock */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium font-sans">
              {calendarDays.map((cell, idx) => {
                const isSelected = selectedDay === cell.day && cell.currentMonth;
                return (
                  <button 
                    key={idx}
                    onClick={() => cell.currentMonth && setSelectedDay(cell.day)}
                    disabled={!cell.currentMonth}
                    className={`p-1.5 rounded-md transition-all relative font-semibold ${
                      !cell.currentMonth 
                        ? 'text-slate-200' 
                        : isSelected
                          ? 'bg-[#0F172A] text-white shadow-md active:scale-95'
                          : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cell.day}
                    {cell.isToday && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#6366F1] rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Vacations List panel */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col hover:shadow-md transition-shadow h-full min-h-[300px]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-550/50">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-[#0F172A] leading-snug">Próximas Vacaciones</h3>
                <span className="text-[10px] text-slate-400">Salidas programadas del personal</span>
              </div>
              <span className="text-[10px] bg-indigo-50 text-[#6366F1] font-bold px-2 py-0.5 rounded-full">Oct-Nov</span>
            </div>

            <div className="flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[340px]">
              {proximasVacaciones.map((vac, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-550/40 hover:bg-slate-50 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-50 text-[#6366F1] border border-slate-200 flex items-center justify-center font-bold text-xs">
                      {vac.iniciales}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-[#0F172A] group-hover:text-[#6366F1] transition-colors">{vac.nombre}</span>
                      <span className="text-[10px] text-slate-400">{vac.depto}</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[11px] font-semibold text-slate-700 font-sans tracking-tight">{vac.rango}</span>
                    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${vac.bg}`}>
                      {vac.dias} días
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-slate-100 text-center">
              <button className="text-xs font-semibold text-[#6366F1] hover:underline">Ver planificador completo</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel: Pending Requests needing Approval (Module 3) */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <div className="flex flex-col text-left">
            <h3 className="text-sm font-bold text-[#0F172A] leading-snug">Solicitudes de Permisos y Vacaciones Pendientes</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Gestión y control de licencias solicitadas por personal. Requieren acción rápida de Jefatura.</p>
          </div>
          <button className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-500 flex items-center gap-1 text-[11px] font-semibold">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtros avanzados</span>
          </button>
        </div>

        {solicitudes.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-50 flex flex-col items-center justify-center">
            <Check className="w-8 h-8 text-emerald-500 mb-2" />
            <p className="text-xs font-bold">¡Todo al día!</p>
            <p className="text-[11px] text-slate-500 mt-1">No hay solicitudes pendientes de aprobación por el momento.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                  <th className="p-4 pl-6">Empleado</th>
                  <th className="p-4">Tipo de Solicitud</th>
                  <th className="p-4">Periodo de fechas</th>
                  <th className="p-4 text-center">Duración</th>
                  <th className="p-4">Estado de Envío</th>
                  <th className="p-4 text-right pr-6">Acciones Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                {solicitudes.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                          {req.empleadoId === 'EMP-989' ? 'JP' : 'SP'}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-[#0F172A] group-hover:text-[#6366F1] transition-colors">
                            {req.empleadoId === 'EMP-989' ? 'Juan Pérez' : 'Esteban Paz'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {req.empleadoId === 'EMP-989' ? 'Soporte Técnico' : 'QA Specialist'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-slate-850 font-bold bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {req.tipoSolicitud}
                      </span>
                    </td>
                    <td className="p-4 font-sans text-slate-700 font-semibold">{req.fechas}</td>
                    <td className="p-4 text-center font-bold">{req.dias} días</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-[#F59E0B] border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
                        {req.estado === 'Pendiente RRHH' ? 'Pendiente RRHH' : 'Pendiente Jefe'}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onAprobarSolicitud(req.id, req.tipoSolicitud)}
                          className="p-1.5 rounded-md bg-emerald-500 hover:bg-emerald-650 text-white hover:scale-105 active:scale-95 shadow-sm transition-all"
                          title="Aprobar Solicitud"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onRechazarSolicitud(req.id, req.tipoSolicitud)}
                          className="p-1.5 rounded-md bg-rose-500 hover:bg-rose-650 text-white hover:scale-105 active:scale-95 shadow-sm transition-all"
                          title="Rechazar Solicitud"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:bg-slate-150 hover:text-slate-650 transition-all font-semibold"
                          title="Ver Expediente"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
