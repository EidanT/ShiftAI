import type {
  TrainingAssignment,
  TrainingCourse,
  TrainingEmployee,
  TrainingProgram,
} from './training.types';

export interface TrainingDataFile {
  next_course_id: number;
  next_program_id: number;
  next_assignment_id: number;
  employees: TrainingEmployee[];
  courses: TrainingCourse[];
  programs: TrainingProgram[];
  assignments: TrainingAssignment[];
}

const createdAt = '2026-07-01T12:00:00.000Z';

const employees: TrainingEmployee[] = [
  employee(1, 'EMP-001', 'Ana Martínez', 'Desarrollo IT', 'Frontend Developer'),
  employee(2, 'EMP-042', 'Carlos Ramírez', 'Ventas', 'Ejecutivo de Cuentas'),
  employee(3, 'EMP-112', 'Laura Mendoza', 'Desarrollo IT', 'Analista de UI/UX'),
  employee(4, 'EMP-2048', 'Ana García', 'Desarrollo IT', 'Frontend Senior'),
  employee(5, 'EMP-989', 'Juan Pérez', 'Desarrollo IT', 'Soporte Técnico'),
  employee(6, 'EMP-512', 'Carlos Ruiz', 'Ventas', 'Ingeniero Comercial'),
  employee(7, 'EMP-304', 'Roberto Silva', 'Administración', 'Gerente Administrativo'),
];

const courses: TrainingCourse[] = [
  course(
    1,
    'Fundamentos de React y TypeScript',
    'Bases prácticas para construir interfaces escalables y mantenibles.',
    'Tecnología',
    'Desarrollo IT',
    'ShiftAI Academy',
    24,
    'Virtual',
    20,
    2,
  ),
  course(
    2,
    'Servicio al cliente consultivo',
    'Técnicas de comunicación, seguimiento y resolución de necesidades.',
    'Habilidades comerciales',
    'Ventas',
    'HubSpot Academy',
    12,
    'Híbrido',
    18,
    1,
  ),
  course(
    3,
    'Seguridad de la información',
    'Buenas prácticas para proteger datos y recursos de la organización.',
    'Cumplimiento',
    'Todos los departamentos',
    'ShiftAI Academy',
    8,
    'Virtual',
    50,
    2,
  ),
  course(
    4,
    'Liderazgo de equipos',
    'Herramientas para desarrollar y medir equipos de alto desempeño.',
    'Liderazgo',
    'Administración',
    'INCAE Business School',
    16,
    'Presencial',
    12,
    1,
  ),
  course(
    5,
    'Excel para análisis operativo',
    'Tablas dinámicas, fórmulas y reportes para decisiones operativas.',
    'Productividad',
    'Todos los departamentos',
    'ShiftAI Academy',
    10,
    'Virtual',
    30,
    1,
  ),
];

const programs: TrainingProgram[] = [
  program(
    1,
    'Onboarding tecnológico',
    'Ruta inicial para las nuevas incorporaciones del equipo de tecnología.',
    'Desarrollo IT',
    'Inicial',
    [1, 3],
  ),
  program(
    2,
    'Excelencia comercial',
    'Actualización de competencias para el equipo de ventas.',
    'Ventas',
    'Intermedio',
    [2, 5],
  ),
  program(
    3,
    'Liderazgo para mandos medios',
    'Preparación para gestión de personas y mejora de procesos.',
    'Administración',
    'Avanzado',
    [4, 3],
  ),
];

const assignments: TrainingAssignment[] = [
  assignment(1, 1, 1, 1, '2026-07-01', '2026-09-15', 68, 'En progreso', null),
  assignment(2, 2, 2, 2, '2026-07-03', '2026-09-30', 35, 'En progreso', null),
  assignment(3, 3, 3, 1, '2026-06-15', '2026-07-25', 100, 'Completado', 94),
  assignment(4, 4, 1, 1, '2026-07-08', '2026-10-20', 0, 'Pendiente', null),
  assignment(5, 7, 4, 3, '2026-06-12', '2026-07-15', 100, 'Completado', 88),
  assignment(6, 5, 3, null, '2026-06-10', '2026-07-05', 20, 'Vencido', null),
  assignment(7, 6, 5, 2, '2026-07-10', '2026-10-10', 0, 'Pendiente', null),
];

export const seedTrainingData: TrainingDataFile = {
  next_course_id: 6,
  next_program_id: 4,
  next_assignment_id: 8,
  employees,
  courses,
  programs,
  assignments,
};

function employee(
  id: number,
  code: string,
  name: string,
  department: string,
  position: string,
): TrainingEmployee {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return { id, code, name, department, position, initials };
}

function course(
  id: number,
  title: string,
  description: string,
  category: string,
  department: string,
  provider: string,
  durationHours: number,
  format: TrainingCourse['format'],
  capacity: number,
  enrolledCount: number,
): TrainingCourse {
  return {
    id,
    code: `CUR-${String(id).padStart(3, '0')}`,
    title,
    description,
    category,
    department,
    provider,
    duration_hours: durationHours,
    format,
    capacity,
    active: true,
    enrolled_count: enrolledCount,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

function program(
  id: number,
  name: string,
  description: string,
  department: string,
  level: string,
  courseIds: number[],
): TrainingProgram {
  return {
    id,
    code: `PROG-${String(id).padStart(3, '0')}`,
    name,
    description,
    department,
    level,
    course_ids: courseIds,
    active: true,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

function assignment(
  id: number,
  employeeId: number,
  courseId: number,
  programId: number | null,
  assignedOn: string,
  dueDate: string,
  progress: number,
  status: TrainingAssignment['status'],
  score: number | null,
): TrainingAssignment {
  const selectedEmployee = employees.find((item) => item.id === employeeId);
  const selectedCourse = courses.find((item) => item.id === courseId);
  const selectedProgram = programs.find((item) => item.id === programId);
  if (!selectedEmployee || !selectedCourse) throw new Error('Datos semilla inconsistentes');

  return {
    id,
    code: `ASG-${String(id).padStart(3, '0')}`,
    employee_id: selectedEmployee.id,
    employee_code: selectedEmployee.code,
    employee_name: selectedEmployee.name,
    employee_department: selectedEmployee.department,
    employee_position: selectedEmployee.position,
    course_id: selectedCourse.id,
    course_title: selectedCourse.title,
    course_category: selectedCourse.category,
    program_id: selectedProgram?.id ?? null,
    program_name: selectedProgram?.name ?? null,
    assigned_on: assignedOn,
    due_date: dueDate,
    progress,
    status,
    score,
    completed_on: status === 'Completado' ? dueDate : null,
    notes: status === 'Completado' ? 'Resultado registrado por Recursos Humanos.' : null,
    created_at: createdAt,
    updated_at: createdAt,
  };
}
