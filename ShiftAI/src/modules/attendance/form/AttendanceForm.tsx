import React, { useState } from 'react';
import { Empleado } from '../../../types';

interface AttendanceFormProps {
  empleados: Empleado[];
  onSubmit: (data: {
    empleadoId: string;
    fecha: string;
    entrada: string;
    salida: string;
    horas: number;
    estado: 'Presente' | 'Tardanza' | 'Ausente';
  }) => void;
  onCancel: () => void;
}

export default function AttendanceForm({ empleados, onSubmit, onCancel }: AttendanceFormProps) {
  const [formEmpId, setFormEmpId] = useState('EMP-2048');
  const [formFecha, setFormFecha] = useState('2023-10-24');
  const [formEntrada, setFormEntrada] = useState('09:00 AM');
  const [formSalida, setFormSalida] = useState('06:00 PM');
  const [formHoras, setFormHoras] = useState(8);
  const [formAsistenciaEstado, setFormAsistenciaEstado] = useState<'Presente' | 'Tardanza' | 'Ausente'>('Presente');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      empleadoId: formEmpId,
      fecha: formFecha,
      entrada: formEntrada,
      salida: formSalida,
      horas: Number(formHoras),
      estado: formAsistenciaEstado,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {/* Employee Selector row */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
          Colaborador Titular
        </label>
        <select
          value={formEmpId}
          onChange={(e) => setFormEmpId(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
          required
        >
          {empleados.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre} ({e.id})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
              Fecha
            </label>
            <input
              type="date"
              value={formFecha}
              onChange={(e) => setFormFecha(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
              Estatus del Registro
            </label>
            <select
              value={formAsistenciaEstado}
              onChange={(e) => setFormAsistenciaEstado(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700"
            >
              <option value="Presente">Presente</option>
              <option value="Tardanza">Tardanza</option>
              <option value="Ausente">Ausente</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
              Hora Entrada
            </label>
            <input
              type="text"
              placeholder="e.g. 09:00 AM"
              value={formEntrada}
              onChange={(e) => setFormEntrada(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 text-center"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
              Hora Salida
            </label>
            <input
              type="text"
              placeholder="e.g. 06:05 PM"
              value={formSalida}
              onChange={(e) => setFormSalida(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 text-center"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
              Horas Totales
            </label>
            <input
              type="number"
              step="0.1"
              value={formHoras}
              onChange={(e) => setFormHoras(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 text-center"
              required
            />
          </div>
        </div>
      </div>

      {/* Form Footer Action triggers */}
      <div className="flex gap-3 pt-4 border-t border-slate-100 select-none font-bold text-xs">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-center"
        >
          Descartar
        </button>
        <button
          type="submit"
          className="flex-1 py-3.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-center shadow-md hover:scale-[1.02] active:scale-95 transition-all"
        >
          Aplicar Registro
        </button>
      </div>
    </form>
  );
}
