import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { sileo } from 'sileo';
import {
  X,
  Trash2,
  CalendarDays,
  Briefcase,
  Clock,
  AlertCircle,
  FileBadge,
  UserCheck2,
  Lock
} from 'lucide-react';

// Shared types and data
import { ModuloId, Empleado, RegistroAsistencia, VacacionLicencia, SolicitudPendiente, RecienteActividad } from './types';
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
import LicensesView from './modules/licenses/LicensesView';
import HistoryQueriesView from './modules/history/HistoryQueriesView';
import RecruitmentView from './modules/hiring/RecruitmentView';
import PayrollView from './modules/payroll/PayrollView';



export default function App() {
  const { user, loading } = useAuth();

  // Navigation & High-level State routing
  const [moduloActivo, setModuloActivo] = useState<ModuloId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [busquedaGlobal, setBusquedaGlobal] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Entities state managers
  const [empleados, setEmpleados] = useState<Empleado[]>(EMPLEADOS);
  const [asistencias, setAsistencias] = useState<RegistroAsistencia[]>(ASISTENCIAS);
  const [licencias, setLicencias] = useState<VacacionLicencia[]>(LICENCIAS);
  const [solicitudes, setSolicitudes] = useState<SolicitudPendiente[]>(SOLICITUDES_PENDIENTES);



  // Form states are managed locally in their respective component forms

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

  // ACTIONS: Leaves Approval / rejection (Side Drawer)
  const handleAprobarLicencia = (id: string, empNombre: string) => {
    setLicencias(prev => prev.map(lic => {
      if (lic.id === id) {
        return {
          ...lic,
          estado: 'Aprobada',
          historialEventos: [
            ...lic.historialEventos,
            { evento: 'Aprobado RRHH', usuario: 'Laura Mendoza', fechaHora: 'Hoy, Hace un momento', descripcion: 'Trámite autorizado firmal' }
          ]
        };
      }
      return lic;
    }));
    sileo.success({
      title: 'Trámite de Licencia Aprobado',
      description: `Se firmó digitalmente el folio del titular ${empNombre}.`,
    });
  };

  const handleRechazarLicencia = (id: string, empNombre: string) => {
    setLicencias(prev => prev.map(lic => {
      if (lic.id === id) {
        return {
          ...lic,
          estado: 'Rechazada',
          historialEventos: [
            ...lic.historialEventos,
            { evento: 'Rechazado RRHH', usuario: 'Laura Mendoza', fechaHora: 'Hoy, Hace un momento', descripcion: 'No cumple con requisitos' }
          ]
        };
      }
      return lic;
    }));
    sileo.error({
      title: 'Formulario Rechazado',
      description: `La requisición especial de ${empNombre} fue revocada.`,
    });
  };

  // ACTIONS: Delete attendance log
  const handleEliminarAsistencia = (id: string) => {
    setAsistencias(prev => prev.filter(a => a.id !== id));
    sileo.info({
      title: 'Registro de asistencia anulado',
      description: 'El horario acumulado ya no figura en nómina.',
    });
  };

  // ACTIONS: Add New Employee Trigger
  const handleAgregarColaborador = () => {
    const ids = ['EMP-303', 'EMP-405', 'EMP-712', 'EMP-899'];
    const randomId = ids[Math.floor(Math.random() * ids.length)];
    
    const nuevo: Empleado = {
      id: randomId,
      nombre: 'Esteban Paz',
      cargo: 'QA Automation Specialist',
      departamento: 'Desarrollo IT',
      iniciales: 'EP',
      correo: 'esteban.paz@sigrh.com',
      estado: 'Activo',
      resumenProfesional: 'Ingeniero de Calidad de Software con enfoque en pruebas automatizadas y pipelines de integración continua.',
      fechaIngreso: '18-Jun-2026',
      salario: 41000,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    };

    if (empleados.some(e => e.id === randomId)) {
      sileo.info({
        title: 'Colaborador ya contratado',
        description: 'El expediente de Esteban ya se encuentra activo.',
      });
      return;
    }

    setEmpleados(p => [...p, nuevo]);
    sileo.success({
      title: '¡Colaborador ingresado!',
      description: 'Esteban Paz fue agregado a la plantilla activa.',
    });
  };

  // ACTIONS: Submit Modal Form (Attendance vs Licencias)
  const handleAttendanceSubmit = (data: {
    empleadoId: string;
    fecha: string;
    entrada: string;
    salida: string;
    horas: number;
    estado: 'Presente' | 'Tardanza' | 'Ausente';
  }) => {
    const emp = empleados.find(x => x.id === data.empleadoId);
    if (!emp) return;

    const nuevoReg: RegistroAsistencia = {
      id: `AST-M${Math.floor(Math.random() * 900) + 100}`,
      empleadoId: emp.id,
      fecha: data.fecha,
      entrada: data.entrada,
      salida: data.salida,
      horas: data.horas,
      estado: data.estado
    };

    setAsistencias(prev => [nuevoReg, ...prev]);
    sileo.success({
      title: 'Asistencia Registrada',
      description: `Jornada de ${emp.nombre} para el ${data.fecha} guardada exitosamente.`,
    });
  };

  const handleLicenseSubmit = (data: {
    empleadoId: string;
    tipo: 'Médica' | 'Vacaciones' | 'Maternidad/Paternidad' | 'Estudios' | 'Permiso Personal';
    fechaInicio: string;
    fechaFin: string;
    duracionDias: number;
    motivo_descripcion: string;
  }) => {
    const emp = empleados.find(x => x.id === data.empleadoId);
    if (!emp) return;

    const nuevaLic: VacacionLicencia = {
      id: `LIC-${Math.floor(Math.random() * 900) + 100}`,
      empleadoId: emp.id,
      tipo: data.tipo,
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
      duracionDias: data.duracionDias,
      estado: 'Pendiente',
      motivo_descripcion: data.motivo_descripcion || 'Carga manual de tiempos autorizada por administrador de personal.',
      historialEventos: [
        { evento: 'Solicitud Creada Manual', usuario: 'Laura Mendoza', fechaHora: 'Hoy, Hace un momento' }
      ]
    };

    setLicencias(prev => [nuevaLic, ...prev]);

    const nuevaSol: SolicitudPendiente = {
      id: `REQ-${Math.floor(Math.random() * 900) + 100}`,
      empleadoId: emp.id,
      tipoSolicitud: data.tipo,
      fechas: `${data.fechaInicio} al ${data.fechaFin}`,
      dias: data.duracionDias,
      estado: 'Pendiente RRHH'
    };
    setSolicitudes(prev => [nuevaSol, ...prev]);

    sileo.success({
      title: 'Solicitud de Tiempo Especial Creada',
      description: 'Expediente cargado con folio administrativo pendiente.',
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
    <div className={`min-h-screen font-sans bg-[#F8FAFC] overflow-hidden ${darkMode ? 'dark' : ''}`}>
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
          darkMode={darkMode}
          setDarkMode={setDarkMode}
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
                <LicensesView 
                  licencias={licencias}
                  empleados={empleados}
                  busqueda={busquedaGlobal}
                  onAprobarLicencia={handleAprobarLicencia}
                  onRechazarLicencia={handleRechazarLicencia}
                  onSubmitManualLicense={handleLicenseSubmit}
                />
              )}

              {moduloActivo === 'history' && (
                <HistoryQueriesView 
                  empleados={empleados}
                  asistencias={asistencias}
                  recentActividades={RECIENTES}
                  cursos={CAPACITACIONES_CURSOS}
                />
              )}

              {moduloActivo === 'recruitment' && (
                <RecruitmentView />
              )}

              {moduloActivo === 'payroll' && (
                <PayrollView />
              )}

              {/* Other modules are beautifully styled on FutureModulesView */}
              {!['dashboard', 'attendance', 'vacations', 'history', 'recruitment', 'payroll'].includes(moduloActivo) && (
                <FutureModulesView 
                  moduloId={moduloActivo}
                  empleados={empleados}
                  busqueda={busquedaGlobal}
                  onAgregarEmpleado={handleAgregarColaborador}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>


    </div>
  );
}
