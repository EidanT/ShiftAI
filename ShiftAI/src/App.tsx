import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { sileo } from 'sileo';

// Shared types and data
import { ModuloId, Empleado, RegistroAsistencia, VacacionLicencia, SolicitudPendiente } from './types';
import { EMPLEADOS, ASISTENCIAS, LICENCIAS, SOLICITUDES_PENDIENTES, RECIENTES, CAPACITACIONES_CURSOS } from './data';

// Auth
import { useAuth } from './context/useAuth';
import LoginView from './modules/auth/LoginView';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FutureModulesView from './components/FutureModulesView';

// Modules
import DashboardView from './modules/dashboard/DashboardView';
import AttendanceView from './modules/attendance/AttendanceView';
import HistoryQueriesView from './modules/history/HistoryQueriesView';
import RecruitmentView from './modules/hiring/RecruitmentView';
import PayrollView from './modules/payroll/PayrollView';
import TrainingView from './modules/training/TrainingView';
import LicensesModule from './modules/licenses/LicensesModule';
import PerformanceView from './components/PerformanceView';

export default function App() {
  const { user, loading } = useAuth();

  // Navigation & High-level State routing
  const [moduloActivo, setModuloActivo] = useState<ModuloId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [busquedaGlobal, setBusquedaGlobal] = useState('');

  // Entities state managers
  const [empleados, setEmpleados] = useState<Empleado[]>(EMPLEADOS);
  const [asistencias, setAsistencias] = useState<RegistroAsistencia[]>(ASISTENCIAS);
  const [licencias, setLicencias] = useState<VacacionLicencia[]>(LICENCIAS);
  const [solicitudes, setSolicitudes] = useState<SolicitudPendiente[]>(SOLICITUDES_PENDIENTES);

  // ACTIONS: Dashboard Quick Requests Approval
  const handleAprobarSolicitud = (id: string, tipo: string) => {
    setSolicitudes(prev => prev.filter(s => s.id !== id));
    sileo.success({
      title: '¡Solicitud aprobada con éxito!',
      description: `Se autorizó el trámite de "${tipo}" e impactará los reportes.`,
    });
  };

  const handleRechazarSolicitud = (id: string, tipo: string) => {
    setSolicitudes(prev => prev.filter(s => s.id !== id));
    sileo.info({
      title: 'Solicitud desestimada',
      description: `La petición de "${tipo}" ha sido rechazada y archivada.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-[#6366F1] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen font-sans bg-[#F8FAFC] overflow-hidden">
      {/* Collapsible Sidebar block */}
      <Sidebar 
        moduloActivo={moduloActivo} 
        setModulo={setModuloActivo} 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Structural Area block (respects Sidebar width offset) */}
      <div 
        className="flex flex-col min-h-screen relative pt-16 transition-all duration-300"
        style={{ paddingLeft: sidebarCollapsed ? '80px' : '260px' }}
      >
        {/* Navigation Action Header */}
        <Header 
          moduloActivo={moduloActivo} 
          collapsed={sidebarCollapsed}
          busqueda={busquedaGlobal}
          onBusquedaChange={setBusquedaGlobal}
        />

        {/* Scalable View Routing Area */}
        <main className="flex-1 p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={moduloActivo}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="h-full"
            >
              {moduloActivo === 'dashboard' && (
                <DashboardView 
                  solicitudes={solicitudes}
                  onAprobarSolicitud={handleAprobarSolicitud}
                  onRechazarSolicitud={handleRechazarSolicitud}
                />
              )}

              {moduloActivo === 'attendance' && (
                <AttendanceView />
              )}

              {moduloActivo === 'vacations' && (
                <LicensesModule />
              )}

              {moduloActivo === 'history' && (
                <HistoryQueriesView />
              )}

              {moduloActivo === 'recruitment' && (
                <RecruitmentView />
              )}

              {moduloActivo === 'payroll' && (
                <PayrollView />
              )}

              {moduloActivo === 'training' && (
                <TrainingView busqueda={busquedaGlobal} />
              )}

              {moduloActivo === 'evaluations' && (
                <PerformanceView />
              )}

              {/* Other modules are beautifully styled on FutureModulesView */}
              {!['dashboard', 'attendance', 'vacations', 'history', 'recruitment', 'payroll', 'training', 'evaluations'].includes(moduloActivo) && (
                <FutureModulesView 
                  moduloId={moduloActivo}
                  empleados={empleados}
                  busqueda={busquedaGlobal}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
