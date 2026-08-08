import { apiClient } from './client';
import type {
  CreateTrainingAssignmentInput,
  CreateTrainingCourseInput,
  CreateTrainingProgramInput,
  TrainingAssignment,
  TrainingCourse,
  TrainingEmployee,
  TrainingProgram,
  TrainingReportRow,
  TrainingSummary,
  UpdateTrainingAssignmentInput,
  UpdateTrainingCourseInput,
  UpdateTrainingProgramInput,
} from '../modules/training/training.types';

export async function getTrainingSummary(): Promise<TrainingSummary> {
  const { data } = await apiClient.get<TrainingSummary>('/training/summary');
  return data;
}

export async function getTrainingEmployees(): Promise<TrainingEmployee[]> {
  const { data } = await apiClient.get<TrainingEmployee[]>('/training/employees');
  return data;
}

export async function getTrainingCourses(): Promise<TrainingCourse[]> {
  const { data } = await apiClient.get<TrainingCourse[]>('/training/courses');
  return data;
}

export async function createTrainingCourse(
  input: CreateTrainingCourseInput,
): Promise<TrainingCourse> {
  const { data } = await apiClient.post<TrainingCourse>('/training/courses', input);
  return data;
}

export async function updateTrainingCourse(
  id: number,
  input: UpdateTrainingCourseInput,
): Promise<TrainingCourse> {
  const { data } = await apiClient.patch<TrainingCourse>(`/training/courses/${id}`, input);
  return data;
}

export async function getTrainingPrograms(): Promise<TrainingProgram[]> {
  const { data } = await apiClient.get<TrainingProgram[]>('/training/programs');
  return data;
}

export async function createTrainingProgram(
  input: CreateTrainingProgramInput,
): Promise<TrainingProgram> {
  const { data } = await apiClient.post<TrainingProgram>('/training/programs', input);
  return data;
}

export async function updateTrainingProgram(
  id: number,
  input: UpdateTrainingProgramInput,
): Promise<TrainingProgram> {
  const { data } = await apiClient.patch<TrainingProgram>(`/training/programs/${id}`, input);
  return data;
}

export async function getTrainingAssignments(): Promise<TrainingAssignment[]> {
  const { data } = await apiClient.get<TrainingAssignment[]>('/training/assignments');
  return data;
}

export async function createTrainingAssignment(
  input: CreateTrainingAssignmentInput,
): Promise<TrainingAssignment> {
  const { data } = await apiClient.post<TrainingAssignment>('/training/assignments', input);
  return data;
}

export async function updateTrainingAssignment(
  id: number,
  input: UpdateTrainingAssignmentInput,
): Promise<TrainingAssignment> {
  const { data } = await apiClient.patch<TrainingAssignment>(
    `/training/assignments/${id}`,
    input,
  );
  return data;
}

export async function getEmployeeTrainingHistory(employeeId: number): Promise<TrainingAssignment[]> {
  const { data } = await apiClient.get<TrainingAssignment[]>(
    `/training/employees/${employeeId}/history`,
  );
  return data;
}

export async function getTrainingReport(): Promise<TrainingReportRow[]> {
  const { data } = await apiClient.get<TrainingReportRow[]>('/training/report');
  return data;
}