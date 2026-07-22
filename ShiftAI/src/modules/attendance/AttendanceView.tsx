// src/modules/attendance/AttendanceView.tsx
//
// Vista principal del modulo de Gestion de Asistencia.
// Autosuficiente: maneja sus propios datos via TanStack Query + Supabase.
// No necesita props desde App.tsx.

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import {
  Calendar,
  Building2,
  User,
  FileText,
  FileSpreadsheet,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  MinusCircle,
  Clock,
  X,
  RefreshCw,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import {
  getAsistencias,
  getEmpleados,
  crearAsistencia,
  eliminarAsistencia,
} from '../../api/attendance';
import type { AsistenciaDB, EmpleadoDB } from '../../api/types';
import AttendanceForm from './form/AttendanceForm';

export default function AttendanceView() {
  const queryClient = useQueryClient();

  // ─── Filtros locales ────────────────────────────────────────────────────────
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedFecha, setSelectedFecha] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedDepto, setSelectedDepto] = useState('Todos los departamentos');
  const [selectedEmpID, setSelectedEmpID] = useState('');

  // ─── Queries ────────────────────────────────────────────────────────────────
  const {
    data: empleados = [],
    isLoading: loadingEmpleados,
  } = useQuery<EmpleadoDB[]>({
    queryKey: ['empleados'],
    queryFn: getEmpleados,
  });

  const {
    data: asistencias = [],
    isLoading: loadingAsistencias,
    isError,
    refetch,
  } = useQuery<AsistenciaDB[]>({
    queryKey: ['asistencias', selectedFecha],
    queryFn: () => getAsistencias({ fecha: selectedFecha }),
  });

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const crearMutation = useMutation({
    mutationFn: crearAsistencia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] });
      sileo.success({
        title: 'Asistencia registrada',
        description: 'El registro fue guardado correctamente.',
      });
      setShowManualModal(false);
    },
    onError: (err: Error) => {
      sileo.error({
        title: 'Error al registrar',
        description: err.message,
      });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: eliminarAsistencia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] });
      sileo.info({
        title: 'Registro anulado',
        description: 'El horario acumulado ya no figura en nomina.',
      });
    },
    onError: (err: Error) => {
      sileo.error({
        title: 'Error al eliminar',
        description: err.message,
      });
    },
  });

  // ─── Helpers ────────────────────────────────────────────────────────────────
  function getEmpleado(id_empleado: number): EmpleadoDB | undefined {
    return empleados.find((e) => e.id_empleado === id_empleado);
  }

  function getNombreCompleto(emp: EmpleadoDB) {
    return `${emp.nombre} ${emp.apellido}`;
  }

  function getIniciales(emp: EmpleadoDB) {
    return `${emp.nombre[0]}${emp.apellido[0]}`.toUpperCase();
  }

 function getNombreCargo(emp: EmpleadoDB) {
  return emp.cargos?.[0]?.nombre ?? '—';
}

function getNombreDepto(emp: EmpleadoDB) {
  return emp.departamentos?.[0]?.nombre ?? '—';
}

  // ─── Lista de departamentos unicos para el filtro ────────────────────────────
  const deptos = Array.from(
  new Set(
    empleados
      .map((e) => e.departamentos?.[0]?.nombre)
      .filter(
        (nombre): nombre is string =>
          typeof nombre === 'string'
      )
  )
);

  // ─── Filtrado local ─────────────────────────────────────────────────────────
  const filtradas = asistencias.filter((item) => {
    const emp = getEmpleado(item.id_empleado);
    if (!emp) return false;

    const nombre = getNombreCompleto(emp).toLowerCase();
    const depto = getNombreDepto(emp);

    const empMatch =
      !selectedEmpID ||
      nombre.includes(selectedEmpID.toLowerCase()) ||
      String(emp.id_empleado).includes(selectedEmpID);

    const deptoMatch =
      selectedDepto === 'Todos los departamentos' ||
      depto === selectedDepto;

    return empMatch && deptoMatch;
  });

  const isLoading = loadingEmpleados || loadingAsistencias;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in text-left">

      {/* Titulo & Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Gestión de Asistencia
          </h1>
          <p className="text-sm text-[#45474c] mt-1">
            Monitoreo de entradas, salidas, horas acumuladas y estatus del personal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white border border-[#E2E8F0] rounded-lg overflow-hidden shadow-sm">
            <button className="px-3 py-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-200">
              <FileSpreadsheet className="w-4 h-4 text-[#E11D48]" />
              <span>PDF</span>
            </button>
            <button className="px-3 py-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              <FileText className="w-4 h-4 text-[#10B981]" />
              <span>Excel</span>
            </button>
          </div>

          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-white border border-[#E2E8F0] text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm"
            title="Recargar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Registro Manual</span>
          </button>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Fecha */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Fecha de consulta
            </label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:border-[#6366F1] focus-within:bg-white transition-all">
              <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="date"
                value={selectedFecha}
                onChange={(e) => setSelectedFecha(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-slate-800 focus:outline-none focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Departamento — dinamico desde la BD */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Departamento
            </label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:border-[#6366F1] focus-within:bg-white transition-all">
              <Building2 className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <select
                value={selectedDepto}
                onChange={(e) => setSelectedDepto(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-slate-800 focus:outline-none focus:ring-0 cursor-pointer appearance-none"
              >
                <option>Todos los departamentos</option>
                {deptos.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>

          {/* Buscar empleado */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Buscar por Empleado / ID
            </label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:border-[#6366F1] focus-within:bg-white transition-all">
              <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Nombre o ID..."
                value={selectedEmpID}
                onChange={(e) => setSelectedEmpID(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-slate-800 focus:outline-none focus:ring-0 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden flex flex-col">

        {/* Cargando */}
        {isLoading && (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-[#6366F1] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-semibold">Cargando registros...</p>
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 stroke-1 text-rose-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-rose-500">Error al cargar los registros</p>
            <p className="text-xs text-slate-500 mt-1">
              Verifica tu conexion o contacta al administrador.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 text-xs font-semibold text-indigo-600 hover:underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Sin resultados */}
        {!isLoading && !isError && filtradas.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <Clock className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold">No hay registros para esta fecha</p>
            <p className="text-xs text-slate-500 mt-1">
              Cambia la fecha o agrega un registro manual.
            </p>
          </div>
        )}

        {/* Tabla con datos */}
        {!isLoading && !isError && filtradas.length > 0 && (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                  <th className="p-4 pl-6 w-12 text-center">
                    <input type="checkbox" className="rounded border-slate-300 text-[#6366F1] focus:ring-[#6366F1]" />
                  </th>
                  <th className="p-4">Empleado</th>
                  <th className="p-4">Departamento / Cargo</th>
                  <th className="p-4 text-center">Entrada</th>
                  <th className="p-4 text-center">Salida</th>
                  <th className="p-4 text-center">Horas laboradas</th>
                  <th className="p-4 text-center">Estatus</th>
                  <th className="p-4 text-right pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                {filtradas.map((item) => {
                  const emp = getEmpleado(item.id_empleado);
                  if (!emp) return null;

                  const isPresente = item.estado === 'Presente';
                  const isTardanza = item.estado === 'Tardanza';
                  const isAusente = item.estado === 'Ausente';

                  return (
                    <tr
                      key={item.id_asistencia}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="p-4 pl-6 text-center">
                        <input type="checkbox" className="rounded border-slate-300 text-[#6366F1] focus:ring-[#6366F1]" />
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 border border-slate-200 flex items-center justify-center font-bold text-[11px] shrink-0">
                            {getIniciales(emp)}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-[#0F172A] group-hover:text-[#6366F1] transition-colors truncate max-w-[150px]">
                              {getNombreCompleto(emp)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-sans tracking-wide">
                              #{emp.id_empleado}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col text-left">
                          <span className="text-slate-700 font-bold">
                            {getNombreDepto(emp)}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            {getNombreCargo(emp)}
                          </span>
                        </div>
                      </td>

                      <td className={`p-4 text-center font-semibold font-mono ${isAusente ? 'text-slate-400 italic' : ''}`}>
                        {item.hora_entrada ?? '--:--'}
                      </td>

                      <td className={`p-4 text-center font-semibold font-mono ${isAusente ? 'text-slate-400 italic' : ''}`}>
                        {item.hora_salida ?? '--:--'}
                      </td>

                      <td className={`p-4 text-center font-bold font-mono ${Number(item.horas_laboradas) > 9 ? 'text-indigo-600' : ''}`}>
                        {Number(item.horas_laboradas) > 0
                          ? `${item.horas_laboradas} Hrs`
                          : '--'}
                      </td>

                      <td className="p-4 text-center">
                        {isPresente && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#10B981] border border-emerald-100">
                            <CheckCircle className="w-3 h-3" />
                            Presente
                          </span>
                        )}
                        {isTardanza && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-[#F59E0B] border border-amber-100">
                            <AlertTriangle className="w-3 h-3" />
                            Tardanza
                          </span>
                        )}
                        {isAusente && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-[#E11D48] border border-rose-100">
                            <MinusCircle className="w-3 h-3" />
                            Ausente
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <button
                            className="p-1.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Ver ficha"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Editar tiempos"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => eliminarMutation.mutate(item.id_asistencia)}
                            disabled={eliminarMutation.isPending}
                            className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
                            title="Anular registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-xs text-slate-500 font-medium select-none">
            Mostrando {filtradas.length} de {asistencias.length} registros
          </span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border border-slate-200 bg-white hover:bg-slate-50 rounded text-xs font-semibold text-slate-500 disabled:opacity-40 transition-colors"
              disabled
            >
              Anterior
            </button>
            <button className="px-3 py-1 border border-indigo-600 bg-indigo-50 text-[#6366F1] font-bold rounded text-xs shadow-sm">
              1
            </button>
            <button className="px-3 py-1 border border-slate-200 bg-white hover:bg-slate-50 rounded text-xs font-semibold text-slate-500 transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal de registro manual */}
      <AnimatePresence>
        {showManualModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ ease: 'easeInOut', duration: 0.2 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-left flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[#F8FAFC]">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest leading-none">
                  Registro Administrativo de Asistencia
                </h2>
                <button
                  onClick={() => setShowManualModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <AttendanceForm
                empleados={empleados}
                isSubmitting={crearMutation.isPending}
                onSubmit={(data) => crearMutation.mutate(data)}
                onCancel={() => setShowManualModal(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}