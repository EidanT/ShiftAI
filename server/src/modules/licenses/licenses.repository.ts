import { getSupabase } from '../../config/supabase';
import type { CreateLicenseDto, License, UpdateLicenseDto, LicenseStatus } from './licenses.types';

export interface ILicensesRepository {
  findAll(): Promise<License[]>;
  findById(id: number): Promise<License>;
  insert(data: CreateLicenseDto): Promise<License>;
  update(id: number, data: UpdateLicenseDto): Promise<License>;
  delete(id: number): Promise<void>;
  updateStatus(id: number, status: LicenseStatus, approvedBy: string): Promise<License>;
}

export class SupabaseLicensesRepository implements ILicensesRepository {
  async findAll(): Promise<License[]> {
    const { data, error } = await getSupabase()
      .from('solicitudes_personal')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(mapLicenseFromDb);
  }

  async findById(id: number): Promise<License> {
    const { data, error } = await getSupabase()
      .from('solicitudes_personal')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Solicitud no encontrada');
      }

      throw new Error(error.message);
    }

    return mapLicenseFromDb(data);
  }

  async insert(data: CreateLicenseDto): Promise<License> {
    const { data: inserted, error } = await getSupabase()
      .from('solicitudes_personal')
      .insert({
        id_empleado: data.employee_id,
        tipo: data.type,
        fecha_inicio: data.start_date,
        fecha_final: data.end_date,
        motivo: data.reason ?? null,
        estado: 'PENDIENTE',
        aprobado_por: null,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapLicenseFromDb(inserted);
  }

  async update(id: number, data: UpdateLicenseDto): Promise<License> {
    const updateData: Record<string, unknown> = {};

    if (data.employee_id !== undefined) {
      updateData.id_empleado = data.employee_id;
    }

    if (data.type !== undefined) {
      updateData.tipo = data.type;
    }

    if (data.start_date !== undefined) {
      updateData.fecha_inicio = data.start_date;
    }

    if (data.end_date !== undefined) {
      updateData.fecha_final = data.end_date;
    }

    if (data.reason !== undefined) {
      updateData.motivo = data.reason;
    }

    if (data.status !== undefined) {
      updateData.estado = data.status;
    }

    if (data.approved_by !== undefined) {
      updateData.aprobado_por = data.approved_by;
    }

    const { data: updated, error } = await getSupabase()
      .from('solicitudes_personal')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Solicitud no encontrada');
      }

      throw new Error(error.message);
    }

    return mapLicenseFromDb(updated);
  }

  async delete(id: number): Promise<void> {
    const { data, error } = await getSupabase()
      .from('solicitudes_personal')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error('Solicitud no encontrada');
    }
  }

  async updateStatus(id: number, status: LicenseStatus, approvedBy: string): Promise<License> {
    const { data, error } = await getSupabase()
      .from('solicitudes_personal')
      .update({
        estado: status,
        aprobado_por: approvedBy,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Solicitud no encontrada');
      }

      throw new Error(error.message);
    }

    return mapLicenseFromDb(data);
  }
}

function mapLicenseFromDb(row: Record<string, unknown>): License {
  return {
    id: Number(row.id),
    employee_id: Number(row.id_empleado),
    type: row.tipo as License['type'],
    start_date: String(row.fecha_inicio),
    end_date: String(row.fecha_final),
    reason: row.motivo === null || row.motivo === undefined ? null : String(row.motivo),
    status: row.estado as License['status'],
    approved_by:
      row.aprobado_por === null || row.aprobado_por === undefined ? null : String(row.aprobado_por),
  };
}
