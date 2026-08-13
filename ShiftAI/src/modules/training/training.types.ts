export type TrainingFormat = 'Virtual' | 'Presencial' | 'Híbrido';
export type TrainingStatus = 'Pendiente' | 'En progreso' | 'Completado' | 'Vencido';

export interface TrainingEmployee {
  id: number;
  code: string;
  name: string;
  department: string | null;
  position: string | null;
  initials: string;
}

export interface TrainingCourse {
  id: number;
  code: string;
  title: string;
  description: string;
  category: string;
  department: string;
  provider: string;
  duration_hours: number;
  format: TrainingFormat;
  capacity: number;
  active: boolean;
  enrolled_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface TrainingProgram {
  id: number;
  code: string;
  name: string;
  description: string;
  department: string;
  level: string;
  course_ids: number[];
  active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface TrainingAssignment {
  id: number;
  code: string;
  employee_id: number;
  employee_code: string;
  employee_name: string;
  employee_department: string | null;
  employee_position: string | null;
  course_id: number;
  course_title: string;
  course_category: string;
  program_id: number | null;
  program_name: string | null;
  assigned_on: string;
  due_date: string;
  progress: number;
  status: TrainingStatus;
  score: number | null;
  completed_on: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TrainingSummary {
  active_courses: number;
  active_programs: number;
  open_assignments: number;
  completed_assignments: number;
  completion_rate: number;
  pending_employees: number;
  overdue_assignments: number;
}

export interface TrainingReportRow {
  assignment_code: string;
  employee_code: string;
  employee_name: string;
  department: string | null;
  course: string;
  program: string | null;
  assigned_on: string;
  due_date: string;
  status: TrainingStatus;
  progress: number;
  score: number | null;
  completed_on: string | null;
  notes: string | null;
}

export type CreateTrainingCourseInput = Pick<
  TrainingCourse,
  | 'title'
  | 'description'
  | 'category'
  | 'department'
  | 'provider'
  | 'duration_hours'
  | 'format'
  | 'capacity'
>;

export type UpdateTrainingCourseInput = Partial<CreateTrainingCourseInput> & {
  active?: boolean;
};

export interface CreateTrainingProgramInput {
  name: string;
  description: string;
  department: string;
  level: string;
  course_ids: number[];
}

export type UpdateTrainingProgramInput = Partial<CreateTrainingProgramInput> & {
  active?: boolean;
};

export interface CreateTrainingAssignmentInput {
  employee_id: number;
  course_id: number;
  program_id?: number | null;
  due_date: string;
  notes?: string;
}

export interface UpdateTrainingAssignmentInput {
  status?: TrainingStatus;
  progress?: number;
  score?: number | null;
  completed_on?: string | null;
  notes?: string | null;
}