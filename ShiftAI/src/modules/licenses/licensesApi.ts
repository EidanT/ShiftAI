export type LicenseType =
  | 'PERMISO'
  | 'LICENCIA'
  | 'VACACIONES';

export type LicenseStatus =
  | 'PENDIENTE'
  | 'APROBADO'
  | 'RECHAZADO';

export interface License {
  id: number;
  employee_id: number;
  employee_name: string;
  type: LicenseType;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: LicenseStatus;
  approved_by: string | null;
}

export interface EmployeeOption {
  id: number;
  name: string;
}

export interface CreateLicenseDto {
  employee_id: number;
  type: LicenseType;
  start_date: string;
  end_date: string;
  reason?: string | null;
}

export interface UpdateLicenseDto {
  employee_id?: number;
  type?: LicenseType;
  start_date?: string;
  end_date?: string;
  reason?: string | null;
  status?: LicenseStatus;
  approved_by?: string | null;
}

export interface UpdateLicenseStatusDto {
  status: LicenseStatus;
  approved_by: string;
}

const DEFAULT_API_BASE_URL =
  'http://localhost:3000/api/v1';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL
).replace(/\/$/, '');

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const rawBody = await response.text();

  let body: unknown = null;

  if (rawBody) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = rawBody;
    }
  }

  if (!response.ok) {
    const payload =
      body && typeof body === 'object'
        ? (body as Record<string, unknown>)
        : null;

    const message =
      (payload &&
        typeof payload.message === 'string' &&
        payload.message) ||
      (payload &&
        typeof payload.error === 'string' &&
        payload.error) ||
      rawBody ||
      `Solicitud fallida (${response.status})`;

    throw new Error(message);
  }

  return body as T;
}

export function getLicenses(): Promise<License[]> {
  return request<License[]>('/licenses');
}

export function getEmployees(): Promise<EmployeeOption[]> {
  return request<EmployeeOption[]>('/licenses/employees');
}

export function getLicenseById(
  id: number,
): Promise<License> {
  return request<License>(`/licenses/${id}`);
}

export function createLicense(
  data: CreateLicenseDto,
): Promise<License> {
  return request<License>('/licenses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateLicense(
  id: number,
  data: UpdateLicenseDto,
): Promise<License> {
  return request<License>(`/licenses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteLicense(id: number): Promise<void> {
  return request<void>(`/licenses/${id}`, {
    method: 'DELETE',
  });
}

export function updateLicenseStatus(
  id: number,
  data: UpdateLicenseStatusDto,
): Promise<License> {
  return request<License>(`/licenses/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
