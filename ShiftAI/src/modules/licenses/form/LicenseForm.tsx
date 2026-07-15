import React, { useState } from 'react';
import { Empleado } from '../../../types';

interface LicenseFormProps {
  empleados: Empleado[];
  onSubmit: (data: {
    empleadoId: string;
    tipo: 'Médica' | 'Vacaciones' | 'Maternidad/Paternidad' | 'Estudios' | 'Permiso Personal';
    fechaInicio: string;
    fechaFin: string;
    duracionDias: number;
    motivo_descripcion: string;
  }) => void;
  onCancel: () => void;
}

export default function LicenseForm({ empleados, onSubmit, onCancel }: LicenseFormProps) {
  const [formEmpId, setFormEmpId] = useState('EMP-2048');
  const [formLeaveTipo, setFormLeaveTipo] = useState<'Médica' | 'Vacaciones' | 'Maternidad/Paternidad' | 'Estudios' | 'Permiso Personal'>('Vacaciones');
  const [formLeaveInicio, setFormLeaveInicio] = useState('2023-11-01');
  const [formLeaveFin, setFormLeaveFin] = useState('2023-11-10');
  const [formLeaveDias, setFormLeaveDias] = useState(10);
  const [formLeaveJustif, setFormLeaveJustif] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      empleadoId: formEmpId,
      tipo: formLeaveTipo,
      fechaInicio: formLeaveInicio,
      fechaFin: formLeaveFin,
      duracionDias: Number(formLeaveDias),
      motivo_descripcion: formLeaveJustif,
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
              Tipo de Solicitud
            </label>
            <select
              value={formLeaveTipo}
              onChange={(e) => setFormLeaveTipo(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700"
            >
              <option value="Médica">Médica</option>
              <option value="Vacaciones">Vacaciones</option>
              <option value="Maternidad/Paternidad">Maternidad/Paternidad</option>
              <option value="Estudios">Estudios</option>
              <option value="Permiso Personal">Permiso Personal</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
              Duración (Dias)
            </label>
            <input
              type="number"
              value={formLeaveDias}
              onChange={(e) => setFormLeaveDias(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={formLeaveInicio}
              onChange={(e) => setFormLeaveInicio(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
              Fecha de Término
            </label>
            <input
              type="date"
              value={formLeaveFin}
              onChange={(e) => setFormLeaveFin(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
            Justificación o Exposición de Motivos
          </label>
          <textarea
            rows={3}
            placeholder="Describa el motivo de la licencia..."
            value={formLeaveJustif}
            onChange={(e) => setFormLeaveJustif(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder:text-slate-400"
            maxLength={250}
          />
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
