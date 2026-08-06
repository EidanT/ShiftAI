import { apiClient } from './client';
import type {
  PayrollRunDB,
  PayReceiptDB,
  GeneratePayrollInput,
  UpdatePayrollStatusInput,
} from './types';

// Nómina (Payroll)
// Rutas montadas en el backend bajo /payroll -> ver router.use('/payroll', createPayrollRouter())

// Genera una nueva corrida de nómina para un periodo.
// Lanza error si ya existe una nómina para ese periodo (409) o si no hay
// empleados activos con salario asignado (422) - manejar en el componente.
export async function generarNomina(input: GeneratePayrollInput): Promise<PayrollRunDB> {
  const { data } = await apiClient.post<PayrollRunDB>('/payroll/runs', input);
  return data;
}

// Lista todas las corridas de nómina (sin detalle por empleado).
export async function getNominas(): Promise<PayrollRunDB[]> {
  const { data } = await apiClient.get<PayrollRunDB[]>('/payroll/runs');
  return data;
}

// Trae una corrida específica, incluyendo el detalle por empleado.
export async function getNomina(id: number): Promise<PayrollRunDB> {
  const { data } = await apiClient.get<PayrollRunDB>(`/payroll/runs/${id}`);
  return data;
}

// Actualiza el estado de una corrida: Generada -> Aprobada -> Pagada (o Anulada).
export async function actualizarEstadoNomina(
  id: number,
  input: UpdatePayrollStatusInput,
): Promise<PayrollRunDB> {
  const { data } = await apiClient.patch<PayrollRunDB>(`/payroll/runs/${id}/status`, input);
  return data;
}

// Trae todos los comprobantes de pago (recibos) de una corrida.
export async function getRecibosNomina(runId: number): Promise<PayReceiptDB[]> {
  const { data } = await apiClient.get<PayReceiptDB[]>(`/payroll/runs/${runId}/receipts`);
  return data;
}

// Trae el comprobante de un empleado específico dentro de una corrida.
export async function getReciboEmpleado(
  runId: number,
  employeeId: number,
): Promise<PayReceiptDB> {
  const { data } = await apiClient.get<PayReceiptDB>(
    `/payroll/runs/${runId}/receipts/${employeeId}`,
  );
  return data;
}