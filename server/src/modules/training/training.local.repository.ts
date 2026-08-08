import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { HttpError } from '../../utils/httpError';
import type { ITrainingRepository } from './training.repository';
import { seedTrainingData, type TrainingDataFile } from './training.seed';
import type {
  CreateTrainingAssignmentDto,
  CreateTrainingCourseDto,
  CreateTrainingProgramDto,
  TrainingAssignment,
  TrainingCourse,
  TrainingEmployee,
  TrainingProgram,
  UpdateTrainingAssignmentDto,
  UpdateTrainingCourseDto,
  UpdateTrainingProgramDto,
} from './training.types';

export class JsonTrainingRepository implements ITrainingRepository {
  private readonly filePath: string;
  private writeQueue: Promise<void> = Promise.resolve();
  private initialization: Promise<void> | null = null;

  constructor(filePath: string) {
    this.filePath = resolve(process.cwd(), filePath);
  }

  async listEmployees(): Promise<TrainingEmployee[]> {
    const data = await this.readData();
    return structuredClone(data.employees).sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }

  async findEmployeeById(id: number): Promise<TrainingEmployee | null> {
    const data = await this.readData();
    return structuredClone(data.employees.find((item) => item.id === id) ?? null);
  }

  async listCourses(): Promise<TrainingCourse[]> {
    const data = await this.readData();
    return structuredClone(data.courses).sort((a, b) => b.id - a.id);
  }

  async findCourseById(id: number): Promise<TrainingCourse | null> {
    const data = await this.readData();
    return structuredClone(data.courses.find((item) => item.id === id) ?? null);
  }

  createCourse(input: CreateTrainingCourseDto): Promise<TrainingCourse> {
    return this.mutate((data) => {
      const id = data.next_course_id++;
      const now = new Date().toISOString();
      const course: TrainingCourse = {
        id,
        code: `CUR-${String(id).padStart(3, '0')}`,
        ...input,
        active: true,
        enrolled_count: 0,
        created_at: now,
        updated_at: now,
      };
      data.courses.unshift(course);
      return course;
    });
  }

  updateCourse(id: number, input: UpdateTrainingCourseDto): Promise<TrainingCourse> {
    return this.mutate((data) => {
      const index = data.courses.findIndex((item) => item.id === id);
      if (index === -1) throw new HttpError(404, 'Curso de capacitación no encontrado');

      const updated = { ...data.courses[index], ...input, updated_at: new Date().toISOString() };
      data.courses[index] = updated;
      data.assignments = data.assignments.map((assignment) =>
        assignment.course_id === id
          ? {
              ...assignment,
              course_title: updated.title,
              course_category: updated.category,
              updated_at: updated.updated_at,
            }
          : assignment,
      );
      return updated;
    });
  }

  async listPrograms(): Promise<TrainingProgram[]> {
    const data = await this.readData();
    return structuredClone(data.programs).sort((a, b) => b.id - a.id);
  }

  async findProgramById(id: number): Promise<TrainingProgram | null> {
    const data = await this.readData();
    return structuredClone(data.programs.find((item) => item.id === id) ?? null);
  }

  createProgram(input: CreateTrainingProgramDto): Promise<TrainingProgram> {
    return this.mutate((data) => {
      const id = data.next_program_id++;
      const now = new Date().toISOString();
      const program: TrainingProgram = {
        id,
        code: `PROG-${String(id).padStart(3, '0')}`,
        ...input,
        active: true,
        created_at: now,
        updated_at: now,
      };
      data.programs.unshift(program);
      return program;
    });
  }

  updateProgram(id: number, input: UpdateTrainingProgramDto): Promise<TrainingProgram> {
    return this.mutate((data) => {
      const index = data.programs.findIndex((item) => item.id === id);
      if (index === -1) throw new HttpError(404, 'Programa de capacitación no encontrado');

      const updated = { ...data.programs[index], ...input, updated_at: new Date().toISOString() };
      data.programs[index] = updated;
      data.assignments = data.assignments.map((assignment) =>
        assignment.program_id === id
          ? { ...assignment, program_name: updated.name, updated_at: updated.updated_at }
          : assignment,
      );
      return updated;
    });
  }

  async listAssignments(): Promise<TrainingAssignment[]> {
    const data = await this.readData();
    return structuredClone(data.assignments).sort((a, b) => b.id - a.id);
  }

  async findAssignmentById(id: number): Promise<TrainingAssignment | null> {
    const data = await this.readData();
    return structuredClone(data.assignments.find((item) => item.id === id) ?? null);
  }

  createAssignment(input: CreateTrainingAssignmentDto): Promise<TrainingAssignment> {
    return this.mutate((data) => {
      const employee = data.employees.find((item) => item.id === input.employee_id);
      const course = data.courses.find((item) => item.id === input.course_id);
      const program = data.programs.find((item) => item.id === input.program_id);
      if (!employee || !course) throw new HttpError(422, 'Empleado o curso no disponible');

      const id = data.next_assignment_id++;
      const now = new Date().toISOString();
      const assignment: TrainingAssignment = {
        id,
        code: `ASG-${String(id).padStart(3, '0')}`,
        employee_id: employee.id,
        employee_code: employee.code,
        employee_name: employee.name,
        employee_department: employee.department,
        employee_position: employee.position,
        course_id: course.id,
        course_title: course.title,
        course_category: course.category,
        program_id: program?.id ?? null,
        program_name: program?.name ?? null,
        assigned_on: now.slice(0, 10),
        due_date: input.due_date,
        progress: 0,
        status: 'Pendiente',
        score: null,
        completed_on: null,
        notes: input.notes ?? null,
        created_at: now,
        updated_at: now,
      };
      data.assignments.unshift(assignment);
      course.enrolled_count += 1;
      course.updated_at = now;
      return assignment;
    });
  }

  updateAssignment(id: number, input: UpdateTrainingAssignmentDto): Promise<TrainingAssignment> {
    return this.mutate((data) => {
      const index = data.assignments.findIndex((item) => item.id === id);
      if (index === -1) throw new HttpError(404, 'Asignación de capacitación no encontrada');

      const updated = {
        ...data.assignments[index],
        ...input,
        updated_at: new Date().toISOString(),
      };
      data.assignments[index] = updated;
      return updated;
    });
  }

  private async readData(): Promise<TrainingDataFile> {
    await this.writeQueue;
    await this.ensureInitialized();
    return JSON.parse(await readFile(this.filePath, 'utf8')) as TrainingDataFile;
  }

  private mutate<T>(operation: (data: TrainingDataFile) => T): Promise<T> {
    const queued = this.writeQueue.then(async () => {
      const data = await this.readDataWithoutQueue();
      const result = operation(data);
      await this.writeData(data);
      return structuredClone(result);
    });
    this.writeQueue = queued.then(
      () => undefined,
      () => undefined,
    );
    return queued;
  }

  private async readDataWithoutQueue(): Promise<TrainingDataFile> {
    await this.ensureInitialized();
    return JSON.parse(await readFile(this.filePath, 'utf8')) as TrainingDataFile;
  }

  private ensureInitialized(): Promise<void> {
    if (this.initialization) return this.initialization;

    this.initialization = (async (): Promise<void> => {
      try {
        await readFile(this.filePath, 'utf8');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        await this.writeData(structuredClone(seedTrainingData));
      }
    })();
    return this.initialization;
  }

  private async writeData(data: TrainingDataFile): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    await rename(temporaryPath, this.filePath);
  }
}
