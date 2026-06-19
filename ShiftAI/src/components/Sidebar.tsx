import React from 'react';
import { ModuloId } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  CreditCard, 
  Palmtree, 
  History, 
  FolderGit2, 
  GraduationCap, 
  BarChart3, 
  Settings,
  Menu,
  ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  moduloActivo: ModuloId;
  setModulo: (id: ModuloId) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ moduloActivo, setModulo, collapsed, setCollapsed }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Resumen General', icon: LayoutDashboard, category: 'Principal' },
    { id: 'employees', label: 'Plantilla de Empleados', icon: Users, category: 'Personal' },
    { id: 'attendance', label: 'Gestión de Asistencia', icon: Clock, category: 'Control' },
    { id: 'vacations', label: 'Licencias y Vacaciones', icon: Palmtree, category: 'Control' },
    { id: 'history', label: 'Historiales y Consultas', icon: History, category: 'Consultas' },
    { id: 'payroll', label: 'Nómina y Pagos', icon: CreditCard, category: 'Operaciones' },
    { id: 'recruitment', label: 'Reclutamiento', icon: FolderGit2, category: 'Operaciones' },
    { id: 'training', label: 'Capacitaciones', icon: GraduationCap, category: 'Desarrollo' },
    { id: 'evaluations', label: 'Evaluación Desempeño', icon: BarChart3, category: 'Desarrollo' },
    { id: 'settings', label: 'Configuración', icon: Settings, category: 'Sistema' }
  ] as const;

  // Group items by category
  const categories = ['Principal', 'Personal', 'Control', 'Consultas', 'Operaciones', 'Desarrollo', 'Sistema'];

  return (
    <aside 
      className={`bg-[#0F172A] border-r border-[#E2E8F0]/10 flex flex-col h-screen fixed left-0 top-0 text-white z-50 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-6 flex items-center justify-between border-b border-[#E2E8F0]/10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-[#6366F1] flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
            S
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-base tracking-tight leading-none text-white whitespace-nowrap">ShiftAI</span>
              <span className="text-[10px] text-[#8590a6] mt-1 leading-none font-medium uppercase tracking-wider">Gestión Inteligente</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors"
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation Links Scrollable Area */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
        {categories.map(cat => {
          const itemsInCat = menuItems.filter(item => item.category === cat);
          if (itemsInCat.length === 0) return null;

          return (
            <div key={cat} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 mt-2 select-none">
                  {cat}
                </p>
              )}
              {itemsInCat.map(item => {
                const isActivo = moduloActivo === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => setModulo(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                      isActivo
                        ? 'bg-[#10B981]/15 text-[#10B981] border-l-4 border-[#10B981] pl-2 font-semibold shadow-sm'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 duration-200 ${
                      isActivo ? 'text-[#10B981]' : 'text-slate-400 group-hover:text-slate-200'
                    }`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[#E2E8F0]/10 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-700">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop" 
              alt="Administrador" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-200 truncate leading-tight">Laura S. Mendoza</span>
              <span className="text-[10px] text-[#8590a6] truncate mt-0.5 font-medium">HR Manager • Admin</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
