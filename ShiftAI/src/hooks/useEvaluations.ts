import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { apiClient } from '../api/client';

// =====================================================
// QUERIES
// =====================================================

export function useEmpleadosEvaluacion() {
  return useQuery({
    queryKey: ['empleados_evaluacion'],

    queryFn: async () => {
      const { data } = await apiClient.get(
        '/evaluations/employees'
      );

      if (!Array.isArray(data)) {
        return [];
      }

      return data.filter((e: any) => {
        const estado = e.estado ?? e.status;

        return (
          estado === undefined ||
          estado === 'Activo' ||
          estado === 'active'
        );
      });
    },
  });
}

export function useEvaluaciones() {
  return useQuery({
    queryKey: ['evaluaciones_desempeno'],

    queryFn: async () => {
      const { data } = await apiClient.get(
        '/evaluations'
      );

      return Array.isArray(data) ? data : [];
    },
  });
}

// =====================================================
// CREAR EVALUACIÓN
// =====================================================

export function useCrearEvaluacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id_empleado: number;
      titulo: string;
      periodo: string;
      nombre_empleado: string;
    }) => {
      const { data } = await apiClient.post(
        '/evaluations',
        input
      );

      return data;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['evaluaciones_desempeno'],
      });
    },
  });
}

// =====================================================
// GUARDAR CALIFICACIÓN
// =====================================================

export function useEnviarCalificacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id_detalle,
      score,
      comentarios,
    }: {
      id_detalle: number;
      score: number;
      comentarios: string;
    }) => {
      const { data } = await apiClient.patch(
        `/evaluations/details/${id_detalle}`,
        {
          score,
          comentarios,
        }
      );

      return data;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['evaluaciones_desempeno'],
      });
    },
  });
}

// =====================================================
// CERRAR EVALUACIÓN
// =====================================================

export function useCerrarEvaluacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id_evaluacion,
      finalScore,
    }: {
      id_evaluacion: number;
      finalScore: number;
    }) => {
      const { data } = await apiClient.patch(
        `/evaluations/${id_evaluacion}/close`,
        {
          finalScore,
        }
      );

      return data;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['evaluaciones_desempeno'],
      });
    },
  });
}