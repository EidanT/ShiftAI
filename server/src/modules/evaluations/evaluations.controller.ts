import {
  Request,
  Response,
  NextFunction,
} from 'express';

import { EvaluationsService } from './evaluations.service';

export class EvaluationsController {
  constructor(
    private service: EvaluationsService
  ) {}

  getEvaluations = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data =
        await this.service.listarEvaluaciones();

      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  getEmployees = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data =
        await this.service.listarEmpleados();

      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  createEvaluation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data =
        await this.service.crearEvaluacion(req.body);

      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  };

  submitReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id_detalle =
        Number(req.params.id);

      const {
        score,
        comentarios,
      } = req.body;

      const data =
        await this.service.enviarCalificacion(
          id_detalle,
          score,
          comentarios
        );

      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  closeEvaluation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id_evaluacion =
        Number(req.params.id);

      const { finalScore } = req.body;

      const data =
        await this.service.cerrarEvaluacion(
          id_evaluacion,
          finalScore
        );

      res.json(data);
    } catch (error) {
      next(error);
    }
  };
}