import { getSupabase } from '../../config/supabase';

export interface IEvaluationsRepository {
  obtenerTodas(): Promise<any[]>;
  obtenerEmpleados(): Promise<any[]>;
  crearEvaluacion(input: any, detallesIniciales: any[]): Promise<any>;
  actualizarDetalle(
    id_detalle: number,
    data: {
      score: number;
      comentarios: string;
      estado: string;
    }
  ): Promise<any>;
  obtenerEvaluacionPorId(id_evaluacion: number): Promise<any>;
  cerrarEvaluacion(
    id_evaluacion: number,
    finalScore: number
  ): Promise<any>;
}

export class EvaluationsRepository implements IEvaluationsRepository {
  async obtenerTodas() {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('evaluaciones_desempeno')
      .select(`
        *,
        empleado:empleados(
          id_empleado,
          nombre,
          apellido,
          departamentos(nombre)
        ),
        detalles_evaluacion_360(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async obtenerEmpleados() {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('empleados')
      .select(`
        id_empleado,
        nombre,
        apellido,
        estado,
        departamentos(nombre)
      `)
      .order('nombre', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async crearEvaluacion(
    input: any,
    detallesIniciales: any[]
  ) {
    const supabase = getSupabase();

    const { data: evalData, error: evalError } = await supabase
      .from('evaluaciones_desempeno')
      .insert({
        id_empleado: input.id_empleado,
        titulo: input.titulo,
        periodo: input.periodo,
        estado: 'Pendiente',
      })
      .select()
      .single();

    if (evalError) {
      throw new Error(evalError.message);
    }

    const detallesConId = detallesIniciales.map((d) => ({
      ...d,
      id_evaluacion: evalData.id_evaluacion,
    }));

    const { error: detError } = await supabase
      .from('detalles_evaluacion_360')
      .insert(detallesConId);

    if (detError) {
      throw new Error(detError.message);
    }

    return this.obtenerEvaluacionPorId(
      evalData.id_evaluacion
    );
  }

  async obtenerEvaluacionPorId(id_evaluacion: number) {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('evaluaciones_desempeno')
      .select(`
        *,
        empleado:empleados(
          id_empleado,
          nombre,
          apellido,
          departamentos(nombre)
        ),
        detalles_evaluacion_360(*)
      `)
      .eq('id_evaluacion', id_evaluacion)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async actualizarDetalle(
    id_detalle: number,
    data: {
      score: number;
      comentarios: string;
      estado: string;
    }
  ) {
    const supabase = getSupabase();

    const { data: updatedDetail, error } = await supabase
      .from('detalles_evaluacion_360')
      .update({
        ...data,
        submitted_at: new Date().toISOString(),
      })
      .eq('id_detalle', id_detalle)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const id_evaluacion = updatedDetail.id_evaluacion;

    const { data: todosLosDetalles } = await supabase
      .from('detalles_evaluacion_360')
      .select('estado')
      .eq('id_evaluacion', id_evaluacion);

    if (todosLosDetalles) {
      const allCompleted = todosLosDetalles.every(
        (d: any) => d.estado === 'Completado'
      );

      await supabase
        .from('evaluaciones_desempeno')
        .update({
          estado: allCompleted
            ? 'En progreso'
            : 'Pendiente',
        })
        .eq('id_evaluacion', id_evaluacion);
    }

    return updatedDetail;
  }

  async cerrarEvaluacion(
    id_evaluacion: number,
    finalScore: number
  ) {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('evaluaciones_desempeno')
      .update({
        estado: 'Completado',
        score_final: finalScore,
      })
      .eq('id_evaluacion', id_evaluacion)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}