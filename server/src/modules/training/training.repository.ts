import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { JsonTrainingRepository } from './training.local.repository';
import { SupabaseTrainingRepository } from './training.supabase.repository';
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

export interface ITrainingRepository {
  listEmployees(): Promise<TrainingEmployee[]>;
  findEmployeeById(id: number): Promise<TrainingEmployee | null>;
  listCourses(): Promise<TrainingCourse[]>;
  findCourseById(id: number): Promise<TrainingCourse | null>;
  createCourse(input: CreateTrainingCourseDto): Promise<TrainingCourse>;
  updateCourse(id: number, input: UpdateTrainingCourseDto): Promise<TrainingCourse>;
  listPrograms(): Promise<TrainingProgram[]>;
  findProgramById(id: number): Promise<TrainingProgram | null>;
  createProgram(input: CreateTrainingProgramDto): Promise<TrainingProgram>;
  updateProgram(id: number, input: UpdateTrainingProgramDto): Promise<TrainingProgram>;
  listAssignments(): Promise<TrainingAssignment[]>;
  findAssignmentById(id: number): Promise<TrainingAssignment | null>;
  createAssignment(input: CreateTrainingAssignmentDto): Promise<TrainingAssignment>;
  updateAssignment(id: number, input: UpdateTrainingAssignmentDto): Promise<TrainingAssignment>;
}

export function createTrainingRepository(): ITrainingRepository {
  if (env.TRAINING_STORAGE === 'supabase') {
    logger.info('Training module using Supabase storage');
    return new SupabaseTrainingRepository();
  }

  logger.info({ path: env.TRAINING_DATA_PATH }, 'Training module using local JSON storage');
  return new JsonTrainingRepository(env.TRAINING_DATA_PATH);
}
