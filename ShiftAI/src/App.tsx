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

  // Modal display controllers
  const [showManualModal, setShowManualModal] = useState(false);
  const [modalType, setModalType] = useState<'attendance' | 'leave'>('attendance');

  // New registry form states
  const [formEmpId, setFormEmpId] = useState('EMP-2048');
  // Attendance Subform
  const [formFecha, setFormFecha] = useState('2023-10-24');
  const [formEntrada, setFormEntrada] = useState('09:00 AM');
  const [formSalida, setFormSalida] = useState('06:00 PM');
  const [formHoras, setFormHoras] = useState(8);
  const [formAsistenciaEstado, setFormAsistenciaEstado] = useState<'Presente' | 'Tardanza' | 'Ausente'>('Presente');
  // Leave Subform
  const [formLeaveTipo, setFormLeaveTipo] = useState<'Médica' | 'Vacaciones' | 'Maternidad/Paternidad' | 'Estudios' | 'Permiso Personal'>('Vacaciones');
  const [formLeaveInicio, setFormLeaveInicio] = useState('2023-11-01');
  const [formLeaveFin, setFormLeaveFin] = useState('2023-11-10');
  const [formLeaveDias, setFormLeaveDias] = useState(10);
  const [formLeaveJustif, setFormLeaveJustif] = useState('');

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
  const handleFormRegistrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = empleados.find(x => x.id === formEmpId);
    if (!emp) return;

    if (modalType === 'attendance') {
      // Create attendance element
      const nuevoReg: RegistroAsistencia = {
        id: `AST-M${Math.floor(Math.random() * 900) + 100}`,
        empleadoId: emp.id,
        fecha: formFecha,
        entrada: formEntrada,
        salida: formSalida,
        horas: Number(formHoras),
        estado: formAsistenciaEstado
      };

      setAsistencias(prev => [nuevoReg, ...prev]);
      sileo.success({
        title: 'Asistencia Registrada',
        description: `Jornada de ${emp.nombre} para el ${formFecha} guardada exitosamente.`,
      });
    } else {
      // Create leave license element
      const nuevaLic: VacacionLicencia = {
        id: `LIC-${Math.floor(Math.random() * 900) + 100}`,
        empleadoId: emp.id,
        tipo: formLeaveTipo,
        fechaInicio: formLeaveInicio,
        fechaFin: formLeaveFin,
        duracionDias: Number(formLeaveDias),
        estado: 'Pendiente',
        motivo_descripcion: formLeaveJustif || 'Carga manual de tiempos autorizada por administrador de personal.',
        historialEventos: [
          { evento: 'Solicitud Creada Manual', usuario: 'Laura Mendoza', fechaHora: 'Hoy, Hace un momento' }
        ]
      };

      setLicencias(prev => [nuevaLic, ...prev]);
      // Also inject into dashboard pending requests to inspect workflows!
      const nuevaSol: SolicitudPendiente = {
        id: `REQ-${Math.floor(Math.random() * 900) + 100}`,
        empleadoId: emp.id,
        tipoSolicitud: formLeaveTipo,
        fechas: `${formLeaveInicio} al ${formLeaveFin}`,
        dias: Number(formLeaveDias),
        estado: 'Pendiente RRHH'
      };
      setSolicitudes(prev => [nuevaSol, ...prev]);

      sileo.success({
        title: 'Solicitud de Tiempo Especial Creada',
        description: 'Expediente cargado con folio administrativo pendiente.',
      });
    }

    setShowManualModal(false);
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
                  onToggleManualModal={() => {
                    setModalType('leave');
                    setShowManualModal(true);
                  }}
                />
              )}

              {moduloActivo === 'attendance' && (
                <AttendanceView 
                  asistencias={asistencias}
                  empleados={empleados}
                  busqueda={busquedaGlobal}
                  onEliminarRegistro={handleEliminarAsistencia}
                  onToggleManualModal={() => {
                    setModalType('attendance');
                    setShowManualModal(true);
                  }}
                />
              )}

              {moduloActivo === 'vacations' && (
                <LicensesView 
                  licencias={licencias}
                  empleados={empleados}
                  busqueda={busquedaGlobal}
                  onAprobarLicencia={handleAprobarLicencia}
                  onRechazarLicencia={handleRechazarLicencia}
                  onToggleManualModal={() => {
                    setModalType('leave');
                    setShowManualModal(true);
                  }}
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

              {/* Other modules are beautifully styled on FutureModulesView */}
              {!['dashboard', 'attendance', 'vacations', 'history', 'recruitment'].includes(moduloActivo) && (
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

      {/* Manual registry modal popup dialog with form elements */}
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
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest leading-none">Registro Administrativo Especial</h2>
                <button 
                  onClick={() => setShowManualModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selector Tabs (Asistencia vs Licencias) */}
              <div className="flex border-b border-slate-100 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setModalType('attendance')}
                  className={`flex-1 py-3 text-xs font-bold border-b-2 text-center transition-all ${
                    modalType === 'attendance'
                      ? 'border-[#6366F1] text-[#6366F1] bg-white font-black'
                      : 'border-transparent text-slate-550 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Entrada de Asistencia
                </button>
                <button
                  type="button"
                  onClick={() => setModalType('leave')}
                  className={`flex-1 py-3 text-xs font-bold border-b-2 text-center transition-all ${
                    modalType === 'leave'
                      ? 'border-[#6366F1] text-[#6366F1] bg-white font-black'
                      : 'border-transparent text-slate-550 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Licencia o Vacación
                </button>
              </div>

              {/* Form Content body */}
              <form onSubmit={handleFormRegistrySubmit} className="p-6 space-y-4">
                {/* Employee Selector row */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Colaborador Titular</label>
                  <select
                    value={formEmpId}
                    onChange={(e) => setFormEmpId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                    required
                  >
                    {empleados.map(e => (
                      <option key={e.id} value={e.id}>{e.nombre} ({e.id})</option>
                    ))}
                  </select>
                </div>

                {/* Subform: ASISTENCIA */}
                {modalType === 'attendance' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Fecha</label>
                        <input 
                          type="date" 
                          value={formFecha} 
                          onChange={(e) => setFormFecha(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Estatus del Registro</label>
                        <select
                          value={formAsistenciaEstado}
                          onChange={(e) => setFormAsistenciaEstado(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700"
                        >
                          <option value="Presente">Presente</option>
                          <option value="Tardanza">Tardanza</option>
                          <option value="Ausente">Ausente</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Hora Entrada</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 09:00 AM"
                          value={formEntrada} 
                          onChange={(e) => setFormEntrada(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 text-center"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Hora Salida</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 06:05 PM"
                          value={formSalida} 
                          onChange={(e) => setFormSalida(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 text-center"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Horas Totales</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={formHoras} 
                          onChange={(e) => setFormHoras(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 text-center"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Subform: VACATION LEAVE
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Tipo de Solicitud</label>
                        <select
                          value={formLeaveTipo}
                          onChange={(e) => setFormLeaveTipo(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700"
                        >
                          <option value="Médica">Médica</option>
                          <option value="Vacaciones">Vacaciones</option>
                          <option value="Maternidad/Paternidad">Maternidad/Paternidad</option>
                          <option value="Estudios">Estudios</option>
                          <option value="Permiso Personal">Permiso Personal</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Duración (Dias)</label>
                        <input 
                          type="number" 
                          value={formLeaveDias} 
                          onChange={(e) => setFormLeaveDias(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Fecha de Inicio</label>
                        <input 
                          type="date" 
                          value={formLeaveInicio} 
                          onChange={(e) => setFormLeaveInicio(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-450 text-slate-400 uppercase tracking-widest pl-1">Fecha de Término</label>
                        <input 
                          type="date" 
                          value={formLeaveFin} 
                          onChange={(e) => setFormLeaveFin(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Justificación o Exposición de Motivos</label>
                      <textarea
                        rows={3}
                        placeholder="Describa el motivo de la licencia..."
                        value={formLeaveJustif}
                        onChange={(e) => setFormLeaveJustif(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder:text-slate-400"
                        maxLength={250}
                      />
                    </div>
                  </div>
                )}

                {/* Form Footer Action triggers */}
                <div className="flex gap-3 pt-4 border-t border-slate-100 select-none font-bold text-xs">
                  <button
                    type="button"
                    onClick={() => setShowManualModal(false)}
                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-center"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-center shadow-md hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Aplicar Registro
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
