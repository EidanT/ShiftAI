import { IEvaluationsRepository } from './evaluations.repository';

export class EvaluationsService {
  constructor(
    private repository: IEvaluationsRepository
  ) {}

  async listarEvaluaciones() {
    return this.repository.obtenerTodas();
  }

  async listarEmpleados() {
    return this.repository.obtenerEmpleados();
  }

  async crearEvaluacion(input: {
    id_empleado: number;
    titulo: string;
    periodo: string;
    nombre_empleado?: string;
  }) {
    if (!input.id_empleado) {
      throw new Error('El empleado es obligatorio');
    }

    if (!input.titulo?.trim()) {
      throw new Error('El título de la evaluación es obligatorio');
    }

    if (!input.periodo?.trim()) {
      throw new Error('El período de la evaluación es obligatorio');
    }

    const detallesIniciales = [
      {
        rol_evaluador: 'Autoevaluación',
        score: null,
        comentarios: null,
        estado: 'Pendiente',
      },
      {
        rol_evaluador: 'Colega',
        score: null,
        comentarios: null,
        estado: 'Pendiente',
      },
      {
        rol_evaluador: 'Jefe Directo',
        score: null,
        comentarios: null,
        estado: 'Pendiente',
      },
    ];

    return this.repository.crearEvaluacion(
      input,
      detallesIniciales
    );
  }

  async enviarCalificacion(
    id_detalle: number,
    score: number,
    comentarios: string
  ) {
    if (!id_detalle || Number.isNaN(id_detalle)) {
      throw new Error('El ID del detalle de evaluación no es válido');
    }

    if (score === undefined || score === null || Number.isNaN(score)) {
      throw new Error('La calificación es obligatoria');
    }

    if (score < 0 || score > 100) {
      throw new Error('La calificación debe estar entre 0 y 100');
    }

    if (!comentarios?.trim()) {
      throw new Error('Los comentarios son obligatorios');
    }

    return this.repository.actualizarDetalle(
      id_detalle,
      {
        score,
        comentarios: comentarios.trim(),
        estado: 'Completado',
      }
    );
  }

  async cerrarEvaluacion(
    id_evaluacion: number,
    finalScore: number
  ) {
    if (!id_evaluacion || Number.isNaN(id_evaluacion)) {
      throw new Error(
        'El ID de la evaluación no es válido'
      );
    }

    if (
      finalScore === undefined ||
      finalScore === null ||
      Number.isNaN(finalScore)
    ) {
      throw new Error(
        'La calificación final es obligatoria'
      );
    }

    if (finalScore < 0 || finalScore > 100) {
      throw new Error(
        'La calificación final debe estar entre 0 y 100'
      );
    }

    const evaluacion =
      await this.repository.obtenerEvaluacionPorId(
        id_evaluacion
      );

    if (!evaluacion) {
      throw new Error(
        'La evaluación no existe'
      );
    }

    const detalles =
      evaluacion.detalles_evaluacion_360 || [];

    if (detalles.length === 0) {
      throw new Error(
        'La evaluación no tiene detalles para cerrar'
      );
    }

    const todosCompletados = detalles.every(
      (detalle: any) =>
        detalle.estado === 'Completado'
    );

    if (!todosCompletados) {
      throw new Error(
        'No se puede cerrar la evaluación porque existen perspectivas pendientes'
      );
    }

    return this.repository.cerrarEvaluacion(
      id_evaluacion,
      finalScore
    );
  }
}