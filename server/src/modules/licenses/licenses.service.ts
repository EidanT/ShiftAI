import type { ILicensesRepository } from './licenses.repository';
import type {
  CreateLicenseDto,
  License,
  UpdateLicenseDto,
  UpdateLicenseStatusDto,
} from './licenses.types';

export class LicensesService {
  constructor(private readonly repository: ILicensesRepository) {}

  async getLicenses(): Promise<License[]> {
    return this.repository.findAll();
  }

  async getLicenseById(id: number): Promise<License> {
    return this.repository.findById(id);
  }

  async createLicense(data: CreateLicenseDto): Promise<License> {
    return this.repository.insert(data);
  }

  async updateLicense(id: number, data: UpdateLicenseDto): Promise<License> {
    return this.repository.update(id, data);
  }

  async deleteLicense(id: number): Promise<void> {
    return this.repository.delete(id);
  }

  async updateLicenseStatus(id: number, data: UpdateLicenseStatusDto): Promise<License> {
    return this.repository.updateStatus(id, data.status, data.approved_by);
  }
}
