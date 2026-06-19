export interface Empleado {
  id: string;
  nombre: string;
  cargo: string;
  departamento: string;
  avatarUrl?: string;
  iniciales: string;
  correo: string;
  estado: 'Activo' | 'Inactivo';
  resumenProfesional?: string;
  fechaIngreso: string;
  salario: number;
}

export interface RegistroAsistencia {
  id: string;
  empleadoId: string;
  fecha: string;
  entrada?: string;
  salida?: string;
  horas: number;
  estado: 'Presente' | 'Tardanza' | 'Ausente';
}

export interface VacacionLicencia {
  id: string;
  empleadoId: string;
  tipo: 'Médica' | 'Vacaciones' | 'Maternidad/Paternidad' | 'Estudios' | 'Permiso Personal';
  fechaInicio: string;
  fechaFin: string;
  duracionDias: number;
  estado: 'Aprobada' | 'Pendiente' | 'Activa' | 'Finalizada' | 'Rechazada';
  motivo_descripcion: string;
  documentoAdjunto?: {
    nombre: string;
    peso: string;
    fechaSubida: string;
  };
  historialEventos: {
    evento: string;
    usuario: string;
    fechaHora: string;
    descripcion?: string;
  }[];
}

export interface SolicitudPendiente {
  id: string;
  empleadoId: string;
  tipoSolicitud: string;
  fechas: string;
  dias: number;
  estado: 'Pendiente Jefe' | 'Pendiente RRHH';
}

export interface RecienteActividad {
  id: string;
  empleadoId: string;
  tipo: 'vacacion' | 'asistencia' | 'tardanza' | 'perfil' | 'capacitacion';
  titulo: string;
  descripcion: string;
  tiempo: string;
}

export interface ProgramaCapacitacion {
  id: string;
  titulo: string;
  institucion: string;
  fecha: string;
  horas: number;
  estado: 'Completado' | 'En Progreso';
}

export type ModuloId = 'dashboard' | 'employees' | 'attendance' | 'payroll' | 'vacations' | 'history' | 'recruitment' | 'training' | 'evaluations' | 'settings';
