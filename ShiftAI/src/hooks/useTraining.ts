import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTrainingAssignment,
  createTrainingCourse,
  createTrainingProgram,
  getEmployeeTrainingHistory,
  getTrainingAssignments,
  getTrainingCourses,
  getTrainingEmployees,
  getTrainingPrograms,
  getTrainingSummary,
  updateTrainingAssignment,
  updateTrainingCourse,
  updateTrainingProgram,
} from '../api/training';
import type {
  CreateTrainingAssignmentInput,
  UpdateTrainingAssignmentInput,
  UpdateTrainingCourseInput,
  UpdateTrainingProgramInput,
} from '../modules/training/training.types';

export const trainingKeys = {
  all: ['training'] as const,
  summary: () => [...trainingKeys.all, 'summary'] as const,
  employees: () => [...trainingKeys.all, 'employees'] as const,
  courses: () => [...trainingKeys.all, 'courses'] as const,
  programs: () => [...trainingKeys.all, 'programs'] as const,
  assignments: () => [...trainingKeys.all, 'assignments'] as const,
  history: (employeeId: number) => [...trainingKeys.all, 'history', employeeId] as const,
};

export function useTrainingSummary() {
  return useQuery({ queryKey: trainingKeys.summary(), queryFn: getTrainingSummary });
}

export function useTrainingEmployees() {
  return useQuery({ queryKey: trainingKeys.employees(), queryFn: getTrainingEmployees });
}

export function useTrainingCourses() {
  return useQuery({ queryKey: trainingKeys.courses(), queryFn: getTrainingCourses });
}

export function useTrainingPrograms() {
  return useQuery({ queryKey: trainingKeys.programs(), queryFn: getTrainingPrograms });
}

export function useTrainingAssignments() {
  return useQuery({ queryKey: trainingKeys.assignments(), queryFn: getTrainingAssignments });
}

export function useEmployeeTrainingHistory(employeeId: number | null) {
  return useQuery({
    queryKey: trainingKeys.history(employeeId ?? 0),
    queryFn: () => getEmployeeTrainingHistory(employeeId as number),
    enabled: employeeId !== null,
  });
}

function useInvalidateTraining() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: trainingKeys.all });
}

export function useCreateTrainingCourse() {
  const invalidate = useInvalidateTraining();
  return useMutation({ mutationFn: createTrainingCourse, onSuccess: invalidate });
}

export function useUpdateTrainingCourse() {
  const invalidate = useInvalidateTraining();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateTrainingCourseInput }) =>
      updateTrainingCourse(id, input),
    onSuccess: invalidate,
  });
}

export function useCreateTrainingProgram() {
  const invalidate = useInvalidateTraining();
  return useMutation({ mutationFn: createTrainingProgram, onSuccess: invalidate });
}

export function useUpdateTrainingProgram() {
  const invalidate = useInvalidateTraining();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateTrainingProgramInput }) =>
      updateTrainingProgram(id, input),
    onSuccess: invalidate,
  });
}

export function useCreateTrainingAssignment() {
  const invalidate = useInvalidateTraining();
  return useMutation({
    mutationFn: (input: CreateTrainingAssignmentInput) => createTrainingAssignment(input),
    onSuccess: invalidate,
  });
}

export function useUpdateTrainingAssignment() {
  const invalidate = useInvalidateTraining();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateTrainingAssignmentInput }) =>
      updateTrainingAssignment(id, input),
    onSuccess: invalidate,
  });
}
