import { getSupabase } from '../../config/supabase';
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
  UpdateTrainingAssignmentDto,
  UpdateTrainingCourseDto,
  UpdateTrainingProgramDto,
} from './training.types';

const EMPLOYEE_SELECT =
  'id_empleado, nombre, apellido, cargo:cargos(nombre), departamento:departamentos(nombre)';

export class SupabaseTrainingRepository implements ITrainingRepository {
  async listEmployees(): Promise<TrainingEmployee[]> {
    const { data, error } = await getSupabase()
      .from('empleados')
      .select(EMPLOYEE_SELECT)
      .eq('estado', 'Activo')
      .order('nombre');
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapEmployeeFromDb);
  }

  async findEmployeeById(id: number): Promise<TrainingEmployee | null> {
    const { data, error } = await getSupabase()
      .from('empleados')
      .select(EMPLOYEE_SELECT)
      .eq('id_empleado', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapEmployeeFromDb(data) : null;
  }

  async listCourses(): Promise<TrainingCourse[]> {
    const [{ data, error }, assignmentResult] = await Promise.all([
      getSupabase().from('cursos_capacitacion').select('*').order('id_curso', { ascending: false }),
      getSupabase().from('capacitaciones_empleados').select('id_curso'),
    ]);
    if (error) throw new Error(error.message);
    if (assignmentResult.error) throw new Error(assignmentResult.error.message);

    const counts = new Map<number, number>();
    for (const row of assignmentResult.data ?? []) {
      const courseId = Number(row.id_curso);
      counts.set(courseId, (counts.get(courseId) ?? 0) + 1);
    }
    return (data ?? []).map((row) => mapCourseFromDb(row, counts.get(Number(row.id_curso)) ?? 0));
  }

  async findCourseById(id: number): Promise<TrainingCourse | null> {
    const { data, error } = await getSupabase()
      .from('cursos_capacitacion')
      .select('*')
      .eq('id_curso', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;

    const { count, error: countError } = await getSupabase()
      .from('capacitaciones_empleados')
      .select('*', { count: 'exact', head: true })
      .eq('id_curso', id);
    if (countError) throw new Error(countError.message);
    return mapCourseFromDb(data, count ?? 0);
  }

  async createCourse(input: CreateTrainingCourseDto): Promise<TrainingCourse> {
    const { data, error } = await getSupabase()
      .from('cursos_capacitacion')
      .insert(courseToDb(input))
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapCourseFromDb(data, 0);
  }

  async updateCourse(id: number, input: UpdateTrainingCourseDto): Promise<TrainingCourse> {
    const { data, error } = await getSupabase()
      .from('cursos_capacitacion')
      .update({ ...courseToDb(input), updated_at: new Date().toISOString() })
      .eq('id_curso', id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new HttpError(404, 'Curso de capacitación no encontrado');
    return (await this.findCourseById(id)) as TrainingCourse;
  }

  async listPrograms(): Promise<TrainingProgram[]> {
    const [{ data, error }, relationResult] = await Promise.all([
      getSupabase()
        .from('programas_capacitacion')
        .select('*')
        .order('id_programa', { ascending: false }),
      getSupabase().from('programa_cursos').select('id_programa, id_curso'),
    ]);
    if (error) throw new Error(error.message);
    if (relationResult.error) throw new Error(relationResult.error.message);

    const coursesByProgram = new Map<number, number[]>();
    for (const row of relationResult.data ?? []) {
      const programId = Number(row.id_programa);
      const courseIds = coursesByProgram.get(programId) ?? [];
      courseIds.push(Number(row.id_curso));
      coursesByProgram.set(programId, courseIds);
    }
    return (data ?? []).map((row) =>
      mapProgramFromDb(row, coursesByProgram.get(Number(row.id_programa)) ?? []),
    );
  }

  async findProgramById(id: number): Promise<TrainingProgram | null> {
    const { data, error } = await getSupabase()
      .from('programas_capacitacion')
      .select('*')
      .eq('id_programa', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;

    const { data: relations, error: relationError } = await getSupabase()
      .from('programa_cursos')
      .select('id_curso')
      .eq('id_programa', id);
    if (relationError) throw new Error(relationError.message);
    return mapProgramFromDb(
      data,
      (relations ?? []).map((row) => Number(row.id_curso)),
    );
  }

  async createProgram(input: CreateTrainingProgramDto): Promise<TrainingProgram> {
    const { course_ids: courseIds, ...programInput } = input;
    const { data, error } = await getSupabase()
      .from('programas_capacitacion')
      .insert(programToDb(programInput))
      .select()
      .single();
    if (error) throw new Error(error.message);

    const programId = Number(data.id_programa);
    const { error: relationError } = await getSupabase()
      .from('programa_cursos')
      .insert(courseIds.map((courseId) => ({ id_programa: programId, id_curso: courseId })));
    if (relationError) {
      await getSupabase().from('programas_capacitacion').delete().eq('id_programa', programId);
      throw new Error(relationError.message);
    }
    return mapProgramFromDb(data, courseIds);
  }

  async updateProgram(id: number, input: UpdateTrainingProgramDto): Promise<TrainingProgram> {
    const { course_ids: courseIds, ...programInput } = input;
    if (Object.keys(programInput).length > 0) {
      const { data, error } = await getSupabase()
        .from('programas_capacitacion')
        .update({ ...programToDb(programInput), updated_at: new Date().toISOString() })
        .eq('id_programa', id)
        .select('id_programa')
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) throw new HttpError(404, 'Programa de capacitación no encontrado');
    }

    if (courseIds) {
      const { error: deleteError } = await getSupabase()
        .from('programa_cursos')
        .delete()
        .eq('id_programa', id);
      if (deleteError) throw new Error(deleteError.message);
      const { error: insertError } = await getSupabase()
        .from('programa_cursos')
        .insert(courseIds.map((courseId) => ({ id_programa: id, id_curso: courseId })));
      if (insertError) throw new Error(insertError.message);
    }

    const program = await this.findProgramById(id);
    if (!program) throw new HttpError(404, 'Programa de capacitación no encontrado');
    return program;
  }

  async listAssignments(): Promise<TrainingAssignment[]> {
    const { data, error } = await getSupabase()
      .from('capacitaciones_empleados')
      .select(
        `*, employee:empleados(${EMPLOYEE_SELECT}), course:cursos_capacitacion(*), program:programas_capacitacion(*)`,
      )
      .order('id_asignacion', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapAssignmentFromDb);
  }

  async findAssignmentById(id: number): Promise<TrainingAssignment | null> {
    const { data, error } = await getSupabase()
      .from('capacitaciones_empleados')
      .select(
        `*, employee:empleados(${EMPLOYEE_SELECT}), course:cursos_capacitacion(*), program:programas_capacitacion(*)`,
      )
      .eq('id_asignacion', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapAssignmentFromDb(data) : null;
  }

  async createAssignment(input: CreateTrainingAssignmentDto): Promise<TrainingAssignment> {
    const { data, error } = await getSupabase()
      .from('capacitaciones_empleados')
      .insert({
        id_empleado: input.employee_id,
        id_curso: input.course_id,
        id_programa: input.program_id ?? null,
        fecha_asignacion: new Date().toISOString().slice(0, 10),
        fecha_limite: input.due_date,
        progreso: 0,
        estado: 'Pendiente',
        observaciones: input.notes ?? null,
      })
      .select('id_asignacion')
      .single();
    if (error) throw new Error(error.message);
    return (await this.findAssignmentById(Number(data.id_asignacion))) as TrainingAssignment;
  }

  async updateAssignment(
    id: number,
    input: UpdateTrainingAssignmentDto,
  ): Promise<TrainingAssignment> {
    const { data, error } = await getSupabase()
      .from('capacitaciones_empleados')
      .update({
        ...(input.status !== undefined && { estado: input.status }),
        ...(input.progress !== undefined && { progreso: input.progress }),
        ...(input.score !== undefined && { resultado: input.score }),
        ...(input.completed_on !== undefined && { fecha_finalizacion: input.completed_on }),
        ...(input.notes !== undefined && { observaciones: input.notes }),
        updated_at: new Date().toISOString(),
      })
      .eq('id_asignacion', id)
      .select('id_asignacion')
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new HttpError(404, 'Asignación de capacitación no encontrada');
    return (await this.findAssignmentById(id)) as TrainingAssignment;
  }
}

function courseToDb(input: Partial<CreateTrainingCourseDto>): Record<string, unknown> {
  return {
    ...(input.title !== undefined && { nombre: input.title }),
    ...(input.description !== undefined && { descripcion: input.description }),
    ...(input.category !== undefined && { categoria: input.category }),
    ...(input.department !== undefined && { departamento_objetivo: input.department }),
    ...(input.provider !== undefined && { proveedor: input.provider }),
    ...(input.duration_hours !== undefined && { duracion_horas: input.duration_hours }),
    ...(input.format !== undefined && { modalidad: input.format }),
    ...(input.capacity !== undefined && { cupo_maximo: input.capacity }),
    ...('active' in input && { activo: (input as UpdateTrainingCourseDto).active }),
  };
}

function programToDb(
  input: Partial<Omit<CreateTrainingProgramDto, 'course_ids'>> & { active?: boolean },
): Record<string, unknown> {
  return {
    ...(input.name !== undefined && { nombre: input.name }),
    ...(input.description !== undefined && { descripcion: input.description }),
    ...(input.department !== undefined && { departamento_objetivo: input.department }),
    ...(input.level !== undefined && { nivel: input.level }),
    ...(input.active !== undefined && { activo: input.active }),
  };
}

function mapEmployeeFromDb(row: Record<string, unknown>): TrainingEmployee {
  const name = `${row.nombre ?? ''} ${row.apellido ?? ''}`.trim();
  return {
    id: Number(row.id_empleado),
    code: `EMP-${String(row.id_empleado).padStart(3, '0')}`,
    name,
    department: relationName(row.departamento),
    position: relationName(row.cargo),
    initials: initials(name),
  };
}

function mapCourseFromDb(row: Record<string, unknown>, enrolledCount: number): TrainingCourse {
  return {
    id: Number(row.id_curso),
    code: String(row.codigo),
    title: String(row.nombre),
    description: String(row.descripcion ?? ''),
    category: String(row.categoria),
    department: String(row.departamento_objetivo),
    provider: String(row.proveedor),
    duration_hours: Number(row.duracion_horas),
    format: row.modalidad as TrainingCourse['format'],
    capacity: Number(row.cupo_maximo),
    active: Boolean(row.activo),
    enrolled_count: enrolledCount,
    created_at: row.created_at ? String(row.created_at) : null,
    updated_at: row.updated_at ? String(row.updated_at) : null,
  };
}

function mapProgramFromDb(row: Record<string, unknown>, courseIds: number[]): TrainingProgram {
  return {
    id: Number(row.id_programa),
    code: String(row.codigo),
    name: String(row.nombre),
    description: String(row.descripcion ?? ''),
    department: String(row.departamento_objetivo),
    level: String(row.nivel),
    course_ids: courseIds,
    active: Boolean(row.activo),
    created_at: row.created_at ? String(row.created_at) : null,
    updated_at: row.updated_at ? String(row.updated_at) : null,
  };
}

function mapAssignmentFromDb(row: Record<string, unknown>): TrainingAssignment {
  const employee = relationRecord(row.employee);
  const course = relationRecord(row.course);
  const program = relationRecord(row.program);
  const mappedEmployee = mapEmployeeFromDb(employee);

  return {
    id: Number(row.id_asignacion),
    code: String(row.codigo),
    employee_id: mappedEmployee.id,
    employee_code: mappedEmployee.code,
    employee_name: mappedEmployee.name,
    employee_department: mappedEmployee.department,
    employee_position: mappedEmployee.position,
    course_id: Number(row.id_curso),
    course_title: String(course.nombre ?? ''),
    course_category: String(course.categoria ?? ''),
    program_id: row.id_programa === null ? null : Number(row.id_programa),
    program_name: program.nombre ? String(program.nombre) : null,
    assigned_on: String(row.fecha_asignacion),
    due_date: String(row.fecha_limite),
    progress: Number(row.progreso),
    status: row.estado as TrainingAssignment['status'],
    score: row.resultado === null ? null : Number(row.resultado),
    completed_on: row.fecha_finalizacion ? String(row.fecha_finalizacion) : null,
    notes: row.observaciones ? String(row.observaciones) : null,
    created_at: row.created_at ? String(row.created_at) : null,
    updated_at: row.updated_at ? String(row.updated_at) : null,
  };
}

function relationRecord(value: unknown): Record<string, unknown> {
  return ((Array.isArray(value) ? value[0] : value) ?? {}) as Record<string, unknown>;
}

function relationName(value: unknown): string | null {
  const relation = relationRecord(value);
  return relation.nombre ? String(relation.nombre) : null;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
