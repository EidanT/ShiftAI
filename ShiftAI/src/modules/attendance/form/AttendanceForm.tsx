// src/modules/attendance/form/AttendanceForm.tsx

import { useState } from 'react';
import type { EmpleadoDB, CrearAsistenciaInput } from '../../../api/types';

interface AttendanceFormProps {
  empleados: EmpleadoDB[];
  isSubmitting?: boolean;
  onSubmit: (data: CrearAsistenciaInput) => void;
  onCancel: () => void;
}

export default function AttendanceForm({
  empleados,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: AttendanceFormProps) {
  const [idEmpleado, setIdEmpleado] = useState<number>(
    empleados[0]?.id_empleado ?? 0
  );
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [horaEntrada, setHoraEntrada] = useState('09:00');
  const [horaSalida, setHoraSalida] = useState('17:00');
  const [horasLaboradas, setHorasLaboradas] = useState(8);
  const [estado, setEstado] = useState<'Presente' | 'Tardanza' | 'Ausente'>('Presente');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      id_empleado: Number(idEmpleado),
      fecha,
      hora_entrada: estado === 'Ausente' ? null : horaEntrada,
      hora_salida: estado === 'Ausente' ? null : horaSalida,
      horas_laboradas: estado === 'Ausente' ? 0 : horasLaboradas,
      estado,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {/* Empleado */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
          Colaborador Titular
        </label>
        <select
          value={idEmpleado}
          onChange={(e) => setIdEmpleado(Number(e.target.value))}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
          required
          disabled={isSubmitting}
        >
          {empleados.map((e) => (
            <option key={e.id_empleado} value={e.id_empleado}>
              {e.nombre} {e.apellido} (#{e.id_empleado})
            </option>
          ))}
        </select>
      </div>

      {/* Fecha y Estado */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
            Fecha
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
            Estatus
          </label>
          <select
            value={estado}
            onChange={(e) =>
              setEstado(e.target.value as 'Presente' | 'Tardanza' | 'Ausente')
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            disabled={isSubmitting}
          >
            <option value="Presente">Presente</option>
            <option value="Tardanza">Tardanza</option>
            <option value="Ausente">Ausente</option>
          </select>
        </div>
      </div>

      {/* Horas (oculto si es Ausente) */}
      {estado !== 'Ausente' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
              Hora Entrada
            </label>
            <input
              type="time"
              value={horaEntrada}
              onChange={(e) => setHoraEntrada(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
              Hora Salida
            </label>
            <input
              type="time"
              value={horaSalida}
              onChange={(e) => setHoraSalida(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
              Horas Totales
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="24"
              value={horasLaboradas}
              onChange={(e) => setHorasLaboradas(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-4 border-t border-slate-100 select-none font-bold text-xs">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-center disabled:opacity-60"
        >
          Descartar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-center shadow-md hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:hover:scale-100"
        >
          {isSubmitting ? 'Guardando...' : 'Aplicar Registro'}
        </button>
      </div>
    </form>
  );
}