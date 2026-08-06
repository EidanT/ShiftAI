import { getReciboEmpleado } from '../api/payroll';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNominas,
  getNomina,
  generarNomina,
  actualizarEstadoNomina,
  getRecibosNomina,
} from '../api/payroll';
import type { GeneratePayrollInput, UpdatePayrollStatusInput } from '../api/types';

export const payrollKeys = {
  all: ['payroll'] as const,
  runs: () => [...payrollKeys.all, 'runs'] as const,
  run: (id: number) => [...payrollKeys.all, 'run', id] as const,
  receipts: (runId: number) => [...payrollKeys.all, 'receipts', runId] as const,
};

// Lista de corridas (sin detalle por empleado)
export function usePayrollRuns() {
  return useQuery({
    queryKey: payrollKeys.runs(),
    queryFn: getNominas,
  });
}

// Corrida específica, incluye details[] por empleado
export function usePayrollRun(id: number | null) {
  return useQuery({
    queryKey: payrollKeys.run(id ?? 0),
    queryFn: () => getNomina(id as number),
    enabled: id !== null,
  });
}

// Generar nueva corrida
export function useGeneratePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GeneratePayrollInput) => generarNomina(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.runs() });
    },
  });
}

// Cambiar estado (Generada -> Aprobada -> Pagada, o Anulada)
export function useUpdatePayrollStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdatePayrollStatusInput }) =>
      actualizarEstadoNomina(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.runs() });
      queryClient.invalidateQueries({ queryKey: payrollKeys.run(data.id) });
    },
  });
}

// Recibos de una corrida (todos los empleados)
export function usePayrollReceipts(runId: number | null) {
  return useQuery({
    queryKey: payrollKeys.receipts(runId ?? 0),
    queryFn: () => getRecibosNomina(runId as number),
    enabled: runId !== null,
  });
}

export function usePayrollReceipt(runId: number | null, employeeId: number | null) {
  return useQuery({
    queryKey: [...payrollKeys.receipts(runId ?? 0), 'employee', employeeId ?? 0],
    queryFn: () => getReciboEmpleado(runId as number, employeeId as number),
    enabled: runId !== null && employeeId !== null,
  });
}