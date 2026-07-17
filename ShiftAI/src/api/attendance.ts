import { supabase } from '../lib/supabase';
import type {
  AsistenciaDB,
  CrearAsistenciaInput,
  ActualizarAsistenciaInput,
  EmpleadoDB,
  AttendanceFilters,
} from './types';

//Empleados

//Trae todos los empleados activos con nombre de cargo y departamento
//resueltos via join (no solo los IDs numericos).

export async function getEmpleados(): Promise<EmpleadoDB[]> {
  const { data, error } = await supabase
    .from('empleados')
    .select(`
      id_empleado,
      nombre,
      apellido,
      email,
      estado,
      fecha_ingreso,
      salario_inicial,
      id_cargo,
      id_departamento,
      cargos ( nombre ),
      departamentos ( nombre )
    `)
    .eq('estado', 'Activo')
    .order('nombre', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as EmpleadoDB[];
}

//Asistencia 

//Trae registros de asistencia filtrados por fecha.

export async function getAsistencias(
  filtros?: AttendanceFilters
): Promise<AsistenciaDB[]> {

  let query = supabase
    .from('asistencia')
    .select(`
      *,
      empleados (
        id_empleado,
        nombre,
        apellido,
        email,
        estado,
        fecha_ingreso,
        salario_inicial,
        id_cargo,
        id_departamento,
        cargos (
          nombre
        ),
        departamentos (
          nombre
        )
      )
    `)
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false });

  if (filtros?.fecha) {
    query = query.eq('fecha', filtros.fecha);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AsistenciaDB[];
}

//Crea un nuevo registro de asistencia.

export async function crearAsistencia(
  input: CrearAsistenciaInput
): Promise<AsistenciaDB> {
  const { data, error } = await supabase
    .from('asistencia')
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

//Actualiza un registro de asistencia existente.

export async function actualizarAsistencia(
  id: number,
  input: ActualizarAsistenciaInput
): Promise<AsistenciaDB> {
  const { data, error } = await supabase
    .from('asistencia')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id_asistencia', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

//Elimina un registro de asistencia.

export async function eliminarAsistencia(id: number): Promise<void> {
  const { error } = await supabase
    .from('asistencia')
    .delete()
    .eq('id_asistencia', id);

  if (error) throw new Error(error.message);
}