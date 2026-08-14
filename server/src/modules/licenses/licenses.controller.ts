import type { Request, Response, NextFunction } from 'express';
import type { LicensesService } from './licenses.service';
import type { CreateLicenseDto, UpdateLicenseDto, UpdateLicenseStatusDto } from './licenses.types';

export class LicensesController {
  constructor(private readonly service: LicensesService) {}

  getLicenses = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getLicenses();
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  getEmployees = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getEmployees();
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  getLicenseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getLicenseById(Number(req.params.id));

      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  createLicense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.createLicense(req.body as CreateLicenseDto);

      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };

  updateLicense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.updateLicense(
        Number(req.params.id),
        req.body as UpdateLicenseDto,
      );

      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  deleteLicense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteLicense(Number(req.params.id));

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  updateLicenseStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.updateLicenseStatus(
        Number(req.params.id),
        req.body as UpdateLicenseStatusDto,
      );

      res.json(data);
    } catch (err) {
      next(err);
    }
  };
}
