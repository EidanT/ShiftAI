import { HttpError } from '../../utils/httpError';
import type { ITrainingRepository } from './training.repository';
import type {
  CreateTrainingAssignmentDto,
  CreateTrainingCourseDto,
  CreateTrainingProgramDto,
  TrainingAssignment,
  TrainingCourse,
  TrainingEmployee,
  TrainingProgram,
  TrainingReportRow,
  TrainingSummary,
  UpdateTrainingAssignmentDto,
  UpdateTrainingCourseDto,
  UpdateTrainingProgramDto,
} from './training.types';

export class TrainingService {
  constructor(private readonly repository: ITrainingRepository) {}

  listEmployees(): Promise<TrainingEmployee[]> {
    return this.repository.listEmployees();
  }

  listCourses(): Promise<TrainingCourse[]> {
    return this.repository.listCourses();
  }

  async createCourse(input: CreateTrainingCourseDto): Promise<TrainingCourse> {
    const courses = await this.repository.listCourses();
    const duplicate = courses.some(
      (course) => course.title.toLocaleLowerCase('es') === input.title.toLocaleLowerCase('es'),
    );
    if (duplicate) throw new HttpError(409, 'Ya existe un curso con este nombre');
    return this.repository.createCourse(input);
  }

  async updateCourse(id: number, input: UpdateTrainingCourseDto): Promise<TrainingCourse> {
    assertPositiveId(id);
    return this.repository.updateCourse(id, input);
  }

  listPrograms(): Promise<TrainingProgram[]> {
    return this.repository.listPrograms();
  }

  async createProgram(input: CreateTrainingProgramDto): Promise<TrainingProgram> {
    await this.validateCourseIds(input.course_ids);
    const programs = await this.repository.listPrograms();
    const duplicate = programs.some(
      (program) => program.name.toLocaleLowerCase('es') === input.name.toLocaleLowerCase('es'),
    );
    if (duplicate) throw new HttpError(409, 'Ya existe un programa con este nombre');
    return this.repository.createProgram(input);
  }

  async updateProgram(id: number, input: UpdateTrainingProgramDto): Promise<TrainingProgram> {
    assertPositiveId(id);
    if (input.course_ids) await this.validateCourseIds(input.course_ids);
    return this.repository.updateProgram(id, input);
  }

  async listAssignments(): Promise<TrainingAssignment[]> {
    return this.withCalculatedOverdue(await this.repository.listAssignments());
  }

  async createAssignment(input: CreateTrainingAssignmentDto): Promise<TrainingAssignment> {
    const [employee, course, program, assignments] = await Promise.all([
      this.repository.findEmployeeById(input.employee_id),
      this.repository.findCourseById(input.course_id),
      input.program_id ? this.repository.findProgramById(input.program_id) : Promise.resolve(null),
      this.repository.listAssignments(),
    ]);

    if (!employee) throw new HttpError(422, 'El empleado seleccionado no existe o no está activo');
    if (!course || !course.active)
      throw new HttpError(422, 'El curso seleccionado no está disponible');
    if (course.enrolled_count >= course.capacity)
      throw new HttpError(422, 'El curso alcanzó su cupo máximo');
    if (input.program_id && !program)
      throw new HttpError(422, 'El programa seleccionado no existe');
    if (program && !program.course_ids.includes(course.id)) {
      throw new HttpError(422, 'El curso no pertenece al programa seleccionado');
    }

    const duplicate = assignments.some(
      (assignment) =>
        assignment.employee_id === input.employee_id &&
        assignment.course_id === input.course_id &&
        assignment.status !== 'Completado',
    );
    if (duplicate) {
      throw new HttpError(409, 'El empleado ya tiene este curso pendiente o en progreso');
    }

    return this.repository.createAssignment(input);
  }

  async updateAssignment(
    id: number,
    input: UpdateTrainingAssignmentDto,
  ): Promise<TrainingAssignment> {
    assertPositiveId(id);
    const current = await this.repository.findAssignmentById(id);
    if (!current) throw new HttpError(404, 'Asignación de capacitación no encontrada');

    const normalized = { ...input };
    if (normalized.status === 'Completado') {
      normalized.progress = 100;
      normalized.completed_on ??= new Date().toISOString().slice(0, 10);
    } else if (normalized.status) {
      normalized.completed_on = null;
      normalized.score = null;
    }

    const resultingProgress = normalized.progress ?? current.progress;
    const resultingStatus = normalized.status ?? current.status;
    if (resultingStatus === 'Completado' && resultingProgress !== 100) {
      normalized.progress = 100;
    }
    if (resultingProgress > 0 && resultingStatus === 'Pendiente') {
      normalized.status = 'En progreso';
    }

    return this.repository.updateAssignment(id, normalized);
  }

  async getEmployeeHistory(employeeId: number): Promise<TrainingAssignment[]> {
    assertPositiveId(employeeId);
    const employee = await this.repository.findEmployeeById(employeeId);
    if (!employee) throw new HttpError(404, 'Empleado no encontrado');
    const assignments = await this.listAssignments();
    return assignments.filter((assignment) => assignment.employee_id === employeeId);
  }

  async getSummary(): Promise<TrainingSummary> {
    const [courses, programs, assignments] = await Promise.all([
      this.repository.listCourses(),
      this.repository.listPrograms(),
      this.listAssignments(),
    ]);
    const completed = assignments.filter((item) => item.status === 'Completado');
    const pending = assignments.filter((item) => item.status !== 'Completado');
    return {
      active_courses: courses.filter((item) => item.active).length,
      active_programs: programs.filter((item) => item.active).length,
      open_assignments: pending.length,
      completed_assignments: completed.length,
      completion_rate: assignments.length
        ? Math.round((completed.length / assignments.length) * 100)
        : 0,
      pending_employees: new Set(pending.map((item) => item.employee_id)).size,
      overdue_assignments: pending.filter((item) => item.status === 'Vencido').length,
    };
  }

  async getReport(): Promise<TrainingReportRow[]> {
    return (await this.listAssignments()).map((assignment) => ({
      assignment_code: assignment.code,
      employee_code: assignment.employee_code,
      employee_name: assignment.employee_name,
      department: assignment.employee_department,
      course: assignment.course_title,
      program: assignment.program_name,
      assigned_on: assignment.assigned_on,
      due_date: assignment.due_date,
      status: assignment.status,
      progress: assignment.progress,
      score: assignment.score,
      completed_on: assignment.completed_on,
      notes: assignment.notes,
    }));
  }

  private async validateCourseIds(courseIds: number[]): Promise<void> {
    const uniqueIds = new Set(courseIds);
    if (uniqueIds.size !== courseIds.length) {
      throw new HttpError(422, 'Un curso no puede repetirse dentro del programa');
    }
    const courses = await this.repository.listCourses();
    const availableIds = new Set(
      courses.filter((course) => course.active).map((course) => course.id),
    );
    if (courseIds.some((id) => !availableIds.has(id))) {
      throw new HttpError(422, 'Uno o más cursos no existen o están inactivos');
    }
  }

  private withCalculatedOverdue(assignments: TrainingAssignment[]): TrainingAssignment[] {
    const today = new Date().toISOString().slice(0, 10);
    return assignments.map((assignment) =>
      assignment.status !== 'Completado' && assignment.due_date < today
        ? { ...assignment, status: 'Vencido' }
        : assignment,
    );
  }
}

function assertPositiveId(id: number): void {
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Identificador inválido');
}
