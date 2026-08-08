import type { NextFunction, Request, Response } from 'express';
import type { TrainingService } from './training.service';
import type {
  CreateTrainingAssignmentDto,
  CreateTrainingCourseDto,
  CreateTrainingProgramDto,
  UpdateTrainingAssignmentDto,
  UpdateTrainingCourseDto,
  UpdateTrainingProgramDto,
} from './training.types';

export class TrainingController {
  constructor(private readonly service: TrainingService) {}

  listEmployees = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json(await this.service.listEmployees());
    } catch (error) {
      next(error);
    }
  };

  listCourses = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json(await this.service.listCourses());
    } catch (error) {
      next(error);
    }
  };

  createCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(201).json(await this.service.createCourse(req.body as CreateTrainingCourseDto));
    } catch (error) {
      next(error);
    }
  };

  updateCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json(
        await this.service.updateCourse(Number(req.params.id), req.body as UpdateTrainingCourseDto),
      );
    } catch (error) {
      next(error);
    }
  };

  listPrograms = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json(await this.service.listPrograms());
    } catch (error) {
      next(error);
    }
  };

  createProgram = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(201).json(await this.service.createProgram(req.body as CreateTrainingProgramDto));
    } catch (error) {
      next(error);
    }
  };

  updateProgram = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json(
        await this.service.updateProgram(
          Number(req.params.id),
          req.body as UpdateTrainingProgramDto,
        ),
      );
    } catch (error) {
      next(error);
    }
  };

  listAssignments = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json(await this.service.listAssignments());
    } catch (error) {
      next(error);
    }
  };

  createAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res
        .status(201)
        .json(await this.service.createAssignment(req.body as CreateTrainingAssignmentDto));
    } catch (error) {
      next(error);
    }
  };

  updateAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json(
        await this.service.updateAssignment(
          Number(req.params.id),
          req.body as UpdateTrainingAssignmentDto,
        ),
      );
    } catch (error) {
      next(error);
    }
  };

  getEmployeeHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json(await this.service.getEmployeeHistory(Number(req.params.id)));
    } catch (error) {
      next(error);
    }
  };

  getSummary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json(await this.service.getSummary());
    } catch (error) {
      next(error);
    }
  };

  getReport = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json(await this.service.getReport());
    } catch (error) {
      next(error);
    }
  };
}
