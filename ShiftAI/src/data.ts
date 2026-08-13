import { Empleado, RegistroAsistencia, VacacionLicencia, SolicitudPendiente, RecienteActividad, ProgramaCapacitacion } from './types';

export const EMPLEADOS: Empleado[] = [
  {
    id: 'EMP-001',
    nombre: 'Ana Martínez',
    cargo: 'Frontend Developer',
    departamento: 'Desarrollo IT',
    iniciales: 'AM',
    correo: 'ana.martinez@sigrh.com',
    estado: 'Activo',
    resumenProfesional: 'Desarrolladora Frontend con más de 8 años de experiencia construyendo interfaces de usuario accesibles y escalables. Especialista en React y Tailwind CSS.',
    fechaIngreso: '12-Oct-2022',
    salario: 45000,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  {
    id: 'EMP-042',
    nombre: 'Carlos Ramírez',
    cargo: 'Ejecutivo de Cuentas',
    departamento: 'Ventas',
    iniciales: 'CR',
    correo: 'carlos.ramirez@sigrh.com',
    estado: 'Activo',
    resumenProfesional: 'Profesional de ventas con excelentes habilidades interpersonales y enfoque en soluciones para el cliente.',
    fechaIngreso: '05-Ene-2021',
    salario: 35000,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 'EMP-112',
    nombre: 'Laura Mendoza',
    cargo: 'Analista de UI/UX',
    departamento: 'Desarrollo IT',
    iniciales: 'LM',
    correo: 'laura.mendoza@sigrh.com',
    estado: 'Activo',
    resumenProfesional: 'Diseñadora UI/UX apasionada por crear interfaces elegantes que optimizan el flujo y experiencia del usuario.',
    fechaIngreso: '01-Mar-2023',
    salario: 42000,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
  },
  {
    id: 'EMP-2048',
    nombre: 'Ana García',
    cargo: 'Desarrolladora Frontend Senior',
    departamento: 'Desarrollo IT',
    iniciales: 'AG',
    correo: 'ana.garcia@sigrh.com',
    estado: 'Activo',
    resumenProfesional: 'Ingeniera Senior en Desarrollo de Software especializado en arquitectura de componentes interactivos y optimización Web.',
    fechaIngreso: '10-Ago-2019',
    salario: 65000,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    id: 'EMP-989',
    nombre: 'Juan Pérez',
    cargo: 'Soporte Técnico',
    departamento: 'Desarrollo IT',
    iniciales: 'JP',
    correo: 'juan.perez@sigrh.com',
    estado: 'Activo',
    resumenProfesional: 'Especialista en administración de redes y soporte corporativo de sistemas.',
    fechaIngreso: '15-May-2023',
    salario: 28000,
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150'
  },
  {
    id: 'EMP-512',
    nombre: 'Carlos Ruiz',
    cargo: 'Ingeniero Comercial',
    departamento: 'Ventas',
    iniciales: 'CR',
    correo: 'carlos.ruiz@sigrh.com',
    estado: 'Activo',
    resumenProfesional: 'Desarrollador de relaciones estratégicas de negocios para cuentas de nivel empresarial.',
    fechaIngreso: '11-Sep-2022',
    salario: 48000,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    id: 'EMP-304',
    nombre: 'Roberto Silva',
    cargo: 'Gerente Administrativo',
    departamento: 'Administración',
    iniciales: 'RS',
    correo: 'roberto.silva@sigrh.com',
    estado: 'Activo',
    resumenProfesional: 'Administrador experimentado con enfoque en la eficiencia operativa interna y gestión óptima de recursos financieros.',
    fechaIngreso: '22-Ago-2018',
    salario: 75000,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  }
];

export const ASISTENCIAS: RegistroAsistencia[] = [
  { id: 'AST-001', empleadoId: 'EMP-001', fecha: '2023-10-24', entrada: '08:55 AM', salida: '06:05 PM', horas: 9.1, estado: 'Presente' },
  { id: 'AST-002', empleadoId: 'EMP-042', fecha: '2023-10-24', entrada: '09:30 AM', salida: '06:00 PM', horas: 8.5, estado: 'Tardanza' },
  { id: 'AST-003', empleadoId: 'EMP-112', fecha: '2023-10-24', entrada: '08:48 AM', salida: '05:58 PM', horas: 9.1, estado: 'Presente' },
  { id: 'AST-004', empleadoId: 'EMP-2048', fecha: '2023-10-24', entrada: '08:55 AM', salida: '06:05 PM', horas: 8.1, estado: 'Presente' },
  { id: 'AST-005', empleadoId: 'EMP-989', fecha: '2023-10-24', entrada: '--:--', salida: '--:--', horas: 0, estado: 'Ausente' },
  
  // Historical data for Ana García (EMP-2048)
  { id: 'AST-H01', empleadoId: 'EMP-2048', fecha: '2023-10-31', entrada: '08:55 AM', salida: '06:05 PM', horas: 9.1, estado: 'Presente' },
  { id: 'AST-H02', empleadoId: 'EMP-2048', fecha: '2023-10-30', entrada: '09:15 AM', salida: '06:00 PM', horas: 8.8, estado: 'Tardanza' },
  { id: 'AST-H03', empleadoId: 'EMP-2048', fecha: '2023-10-27', entrada: '--:--', salida: '--:--', horas: 0, estado: 'Ausente' },
  { id: 'AST-H04', empleadoId: 'EMP-2048', fecha: '2023-10-26', entrada: '08:58 AM', salida: '06:10 PM', horas: 9.2, estado: 'Presente' },
  { id: 'AST-H05', empleadoId: 'EMP-2048', fecha: '2023-10-25', entrada: '09:00 AM', salida: '06:00 PM', horas: 9.0, estado: 'Presente' }
];

export const LICENCIAS: VacacionLicencia[] = [
  {
    id: 'LIC-001',
    empleadoId: 'EMP-2048',
    tipo: 'Médica',
    fechaInicio: '2023-10-12',
    fechaFin: '2023-10-26',
    duracionDias: 15,
    estado: 'Pendiente',
    motivo_descripcion: 'Cirugía menor programada y periodo de reposo post-operatorio recomendado por el médico tratante.',
    documentoAdjunto: {
      nombre: 'certificado_medico.pdf',
      peso: '1.2 MB',
      fechaSubida: '10-Oct-2023'
    },
    historialEventos: [
      { evento: 'Solicitud Enviada', usuario: 'Ana García', fechaHora: '10-Oct-2023, 09:30 AM', descripcion: 'Envía certificado' },
      { evento: 'Revisión de RRHH', usuario: 'HR Manager', fechaHora: 'Pendiente', descripcion: 'Pendiente de acción' }
    ]
  },
  {
    id: 'LIC-002',
    empleadoId: 'EMP-042',
    tipo: 'Vacaciones',
    fechaInicio: '2023-11-01',
    fechaFin: '2023-11-10',
    duracionDias: 10,
    estado: 'Aprobada',
    motivo_descripcion: 'Solicitud de vacaciones reglamentarias acumuladas.',
    historialEventos: [
      { evento: 'Solicitud Enviada', usuario: 'Carlos Ramírez', fechaHora: '02-Oct-2023, 10:15 AM' },
      { evento: 'Aprobado por Jefe', usuario: 'Dir. Ventas', fechaHora: '03-Oct-2023, 04:30 PM' }
    ]
  },
  {
    id: 'LIC-003',
    empleadoId: 'EMP-304',
    tipo: 'Maternidad/Paternidad',
    fechaInicio: '2023-09-15',
    fechaFin: '2023-12-15',
    duracionDias: 90,
    estado: 'Activa',
    motivo_descripcion: 'Licencia por paternidad autorizada administrativa.',
    historialEventos: [
      { evento: 'Solicitud Enviada', usuario: 'Roberto Silva', fechaHora: '15-Ago-2023, 08:30 AM' },
      { evento: 'Aprobado', usuario: 'CEO', fechaHora: '18-Ago-2023, 11:20 AM' }
    ]
  },
  {
    id: 'LIC-04',
    empleadoId: 'EMP-112',
    tipo: 'Estudios',
    fechaInicio: '2023-08-05',
    fechaFin: '2023-08-08',
    duracionDias: 3,
    estado: 'Finalizada',
    motivo_descripcion: 'Examen de certificación técnica e internacional.',
    historialEventos: [
      { evento: 'Solicitud Enviada', usuario: 'Laura Mendoza', fechaHora: '01-Ago-2023, 02:00 PM' },
      { evento: 'Aprobado', usuario: 'Líder Técnico', fechaHora: '02-Ago-2023, 09:00 AM' }
    ]
  }
];

export const SOLICITUDES_PENDIENTES: SolicitudPendiente[] = [
  {
    id: 'REQ-01',
    empleadoId: 'EMP-989',
    tipoSolicitud: 'Permiso Personal',
    fechas: '27 Oct - 28 Oct',
    dias: 2,
    estado: 'Pendiente Jefe'
  },
  {
    id: 'REQ-02',
    empleadoId: 'EMP-512',
    tipoSolicitud: 'Vacaciones Anuales',
    fechas: '10 Nov - 24 Nov',
    dias: 15,
    estado: 'Pendiente RRHH'
  }
];

export const RECIENTES: RecienteActividad[] = [
  {
    id: 'RC-01',
    empleadoId: 'EMP-112',
    tipo: 'vacacion',
    titulo: 'Solicitud de Vacaciones aprobada',
    descripcion: 'Periodo: 15 Dic - 30 Dic',
    tiempo: 'Hace 2 días'
  },
  {
    id: 'RC-02',
    empleadoId: 'EMP-2048',
    tipo: 'asistencia',
    titulo: 'Registro de Asistencia completo',
    descripcion: 'Semana de asistencia revisada.',
    tiempo: 'Ayer'
  },
  {
    id: 'RC-03',
    empleadoId: 'EMP-042',
    tipo: 'tardanza',
    titulo: 'Llegada tarde registrada',
    descripcion: '30 Oct - 15 minutos de retraso.',
    tiempo: '30 Oct, 09:15 AM'
  },
  {
    id: 'RC-04',
    empleadoId: 'EMP-2048',
    tipo: 'perfil',
    titulo: 'Actualización de Perfil',
    descripcion: 'Contacto de emergencia actualizado por empleado.',
    tiempo: '15 Oct, 2023'
  }
];

export const CAPACITACIONES_CURSOS: ProgramaCapacitacion[] = [
  { id: 'CAP-001', titulo: 'Advanced React Architecture', institucion: 'Frontend Masters', fecha: '15-Sep-2023', horas: 24, estado: 'Completado' },
  { id: 'CAP-002', titulo: 'Lead Management & Sales Funnel', institucion: 'HubSpot Academy', fecha: '22-Oct-2023', horas: 12, estado: 'Completado' },
  { id: 'CAP-003', titulo: 'Cloud Foundations & AWS Architect', institucion: 'Coursera', fecha: 'En curso', horas: 40, estado: 'En Progreso' }
];

export const REQUISITOS_VACANTES = [
  { id: 'VAC-01', titulo: 'Diseñador UI Senior', depto: 'Desarrollo IT', solicitudes: 12, estado: 'Activo', fecha: '10-Jun-2026' },
  { id: 'VAC-02', titulo: 'Especialista de Marketing', depto: 'Marketing', solicitudes: 28, estado: 'Cerrado', fecha: '01-Jun-2026' },
  { id: 'VAC-03', titulo: 'QA Automation Engineer', depto: 'Desarrollo IT', solicitudes: 9, estado: 'Activo', fecha: '14-Jun-2026' }
];

export const CONTRATOS_RECIENTES = [
  { empleado: 'Esteban Paz', cargo: 'DevOps Cloud', fecha: '18-Jun-2026', salario: 55000, estado: 'Indefinido' },
  { empleado: 'Diana Ross', cargo: 'Copywriter', fecha: '15-Jun-2026', salario: 30000, estado: 'Temporal' },
  { empleado: 'Matías Cano', cargo: 'Data Scientist', fecha: '10-Jun-2026', salario: 62000, estado: 'Indefinido' }
];

export const PAGOS_NOMINA = [
  { periodo: 'Primera Quincena de Junio 2026', total: 425000, empleados: 42, estado: 'Pagado', fecha: '15-Jun-2026' },
  { periodo: 'Segunda Quincena de Mayo 2026', total: 423500, empleados: 41, estado: 'Pagado', fecha: '30-May-2026' },
  { periodo: 'Primera Quincena de Mayo 2026', total: 418000, empleados: 41, estado: 'Pagado', fecha: '15-May-2026' }
];

export const EVALUACIONES_CONSENSO = [
  { empleado: 'Ana Martínez', depto: 'Desarrollo IT', calificacion: 'Excepcional (4.9/5)', periodo: 'Evaluación Anual 2025' },
  { empleado: 'Carlos Ramírez', depto: 'Ventas', calificacion: 'Favorable (4.1/5)', periodo: 'Evaluación Trimestral Q1' },
  { empleado: 'Laura Mendoza', depto: 'Desarrollo IT', calificacion: 'Sobresaliente (4.6/5)', periodo: 'Evaluación Anual 2025' },
  { empleado: 'Miguel Ortega', depto: 'Operaciones', calificacion: 'Favorable (4.2/5)', periodo: 'Evaluación Semestral 2026' },
  { empleado: 'Sofía Castillo', depto: 'Recursos Humanos', calificacion: 'Sobresaliente (4.7/5)', periodo: 'Evaluación Trimestral Q2' },
  { empleado: 'Javier Núñez', depto: 'Finanzas', calificacion: 'Plan de Mejora (3.4/5)', periodo: 'Evaluación Semestral 2026' }
];
