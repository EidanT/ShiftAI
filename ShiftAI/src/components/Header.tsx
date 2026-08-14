import React, { useState } from 'react';
import { Search, Bell, ChevronDown, LogOut } from 'lucide-react';
import { ModuloId } from '../types';
import { useAuth } from '../context/useAuth';

interface HeaderProps {
  moduloActivo: ModuloId;
  collapsed: boolean;
  busqueda: string;
  onBusquedaChange: (val: string) => void;
}

export default function Header({ 
  moduloActivo, 
  collapsed, 
  busqueda, 
  onBusquedaChange
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth();

  // Get module Title in Spanish
  const moduloInfo: Record<ModuloId, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard Principal', subtitle: 'Resumen general de administración de personal.' },
    employees: { title: 'Plantilla de Empleados', subtitle: 'Directorio completo y expediente digital de recursos humanos.' },
    attendance: { title: 'Gestión de Asistencia', subtitle: 'Monitoreo y registro detallado de tiempos del personal.' },
    vacations: { title: 'Gestión de Licencias', subtitle: 'Administración y supervisión de solicitudes de tiempo libre.' },
    history: { title: 'Historiales y Consultas', subtitle: 'Consulta el historial completo de actividad del empleado.' },
    payroll: { title: 'Gestión de Nómina y Pagos', subtitle: 'Módulo de compensaciones de sueldos, descuentos e incentivos.' },
    recruitment: { title: 'Reclutamiento y Selección', subtitle: 'Control de vacantes laborales, candidatos y procesos de selección.' },
    training: { title: 'Capacitación y Desarrollo', subtitle: 'Registro y seguimiento de programas, cursos y resultados de personal.' },
    evaluations: { title: 'Evaluación del Desempeño', subtitle: 'Control de evaluaciones, criterios de negocio y sugerencias de mejora.' },
    settings: { title: 'Configuración del Sistema', subtitle: 'Ajustes globales de roles, políticas y respaldos del sistema.' }
  };

  const currentInfo = moduloInfo[moduloActivo] || { title: 'ShiftAI', subtitle: 'Sistema de Gestión de Recursos Humanos.' };

  const notificationsMock = [
    { id: 1, text: 'Nueva solicitud de licencia médica por Ana García', time: 'Hace 5 min', unread: true },
    { id: 2, text: 'Carlos Ramírez registró tardanza (09:30 AM)', time: 'Hace 45 min', unread: true },
    { id: 3, text: 'Expiración próxima de licencia de estudios (Laura M.)', time: 'Hace 2 horas', unread: false }
  ];

  return (
    <header 
      style={{ left: collapsed ? '80px' : '260px' }}
      className="bg-white border-b border-[#E2E8F0] fixed top-0 right-0 h-16 flex items-center justify-between px-6 z-40 shadow-sm transition-all duration-300"
    >
      {/* Title & Description Context (Left) */}
      <div className="flex flex-col select-none">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest font-sans leading-none">{currentInfo.title}</h2>
        <span className="text-[11px] text-[#8590a6] mt-1 font-medium hidden sm:block truncate max-w-[400px]">
          {currentInfo.subtitle}
        </span>
      </div>

      {/* Right Side Actions / Controls */}
      <div className="flex items-center gap-4">
        {/* Search Input widget */}
        <div className="relative hidden md:flex items-center w-64 bg-slate-50 border border-slate-200 focus-within:border-[#6366F1] focus-within:bg-white rounded-lg px-3 py-1.5 transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder="Buscar empleados, folios..."
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs w-full text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Notifications Alert Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-slate-500 hover:text-[#6366F1] hover:bg-slate-100 transition-colors relative"
            title="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E11D48] rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] shadow-lg rounded-xl py-2 z-50 animate-fade-in-down">
              <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                <span className="text-xs font-semibold text-slate-700">Notificaciones</span>
                <span className="text-[10px] bg-[#6366F1]/10 text-[#6366F1] font-semibold px-2 py-0.5 rounded-full">2 Nuevas</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {notificationsMock.map((notif) => (
                  <div key={notif.id} className={`p-3 text-xs hover:bg-slate-50 transition-colors cursor-pointer ${notif.unread ? 'bg-indigo-50/20' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-semibold ${notif.unread ? 'text-slate-800 font-bold' : 'text-slate-600'}`}>{notif.text}</span>
                      {notif.unread && <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full mt-1.5 shrink-0"></span>}
                    </div>
                    <span className="text-[10px] text-slate-400">{notif.time}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-1.5 border-t border-slate-100 text-center bg-slate-50 rounded-b-xl">
                <button className="text-[11px] text-[#6366F1] font-medium hover:underline">Marcar todas como leídas</button>
              </div>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {/* Admin Portrait and Profile */}
        <div className="relative">
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-slate-50 rounded-lg transition-colors select-none"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-sm shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop" 
                alt="Laura S. Mendoza" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="hidden lg:flex flex-col min-w-0 text-left">
              <span className="text-xs font-semibold text-slate-800 leading-none truncate">{user?.email ?? 'Laura Mendoza'}</span>
              <span className="text-[10px] text-slate-400 mt-0.5 leading-none font-medium">HR Manager</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E2E8F0] shadow-lg rounded-xl py-1.5 z-50 animate-fade-in-down">
              <div className="px-4 py-2 border-b border-slate-100 lg:hidden">
                <span className="text-xs font-semibold text-slate-800 block">{user?.email ?? 'Laura Mendoza'}</span>
                <span className="text-[10px] text-slate-400">HR Manager</span>
              </div>
              <button className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors">Mi Perfil</button>
              <button className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors">Mi Cuenta</button>
              <button className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors">Políticas de Empresa</button>
              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={() => logout()}
                className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
