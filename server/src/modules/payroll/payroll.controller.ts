import type { Request, Response, NextFunction } from 'express';
import type { PayrollService } from './payroll.service';
import type { GeneratePayrollDto, UpdatePayrollStatusDto } from './payroll.types';

export class PayrollController {
  constructor(private readonly service: PayrollService) {}

  generatePayroll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.generatePayroll(req.body as GeneratePayrollDto);
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };

  getRuns = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getRuns();
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  getRun = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getRun(Number(req.params.id));
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.body as UpdatePayrollStatusDto;
      const data = await this.service.updateStatus(Number(req.params.id), status);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  getReceipts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getReceipts(Number(req.params.id));
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  getReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getReceipt(
        Number(req.params.id),
        Number(req.params.employeeId),
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  };
}
