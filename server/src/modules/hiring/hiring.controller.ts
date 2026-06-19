import type { Request, Response, NextFunction } from 'express';
import type { HiringService } from './hiring.service';
import type {
  CreateVacancyDto,
  CreateCandidateDto,
  UpdateCandidateStatusDto,
} from './hiring.types';

export class HiringController {
  constructor(private readonly service: HiringService) {}

  getVacancies = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getVacancies();
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  createVacancy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.createVacancy(req.body as CreateVacancyDto);
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };

  getCandidates = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getCandidates();
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  createCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.createCandidate(req.body as CreateCandidateDto);
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };

  updateCandidateStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { status } = req.body as UpdateCandidateStatusDto;
      const data = await this.service.updateCandidateStatus(req.params.id, status);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };
}
