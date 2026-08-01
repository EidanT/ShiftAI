import type { Request, Response, NextFunction } from 'express';
import type { HiringService } from './hiring.service';
import type {
  CreateApplicationDto,
  CreateCandidateDto,
  CreateInterviewDto,
  CreateVacancyDto,
  HireCandidateDto,
  UpdateApplicationStatusDto,
  UpdateCandidateDto,
} from './hiring.types';

interface MulterFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

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

  updateCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.updateCandidate(
        Number(req.params.id),
        req.body as UpdateCandidateDto,
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  getApplications = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getApplications();
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  createApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.createApplication(req.body as CreateApplicationDto);
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };

  updateApplicationStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { status } = req.body as UpdateApplicationStatusDto;
      const data = await this.service.updateApplicationStatus(Number(req.params.id), status);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  createInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.createInterview(
        Number(req.params.id),
        req.body as CreateInterviewDto,
      );
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };

  hireCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.hireCandidate(
        Number(req.params.id),
        req.body as HireCandidateDto,
      );
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };

  analyzeCV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = req.file as MulterFile | undefined;
      if (!file) {
        res.status(400).json({ error: 'Debe subir un archivo PDF' });
        return;
      }

      const { requirements } = req.body;
      if (!requirements) {
        res.status(400).json({ error: 'Debe proporcionar los requisitos de la vacante' });
        return;
      }

      const data = await this.service.analyzeCV(file.buffer, file.originalname, requirements);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };
}
