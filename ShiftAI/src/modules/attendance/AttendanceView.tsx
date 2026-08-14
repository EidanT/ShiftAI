// src/modules/attendance/AttendanceView.tsx

import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Calendar,
  Building2,
  User,
  FileSpreadsheet,
  Search,
  ChevronDown,
  Eye,
  Edit2,
  MoreHorizontal,
  Download,
} from 'lucide-react';

// =========================
// Tipos
// =========================

interface EmpleadoEstatico {
  id: string;
  iniciales: string;
  nombre: string;
  email: string;
  cargo: string;
  departamento: string;
  ingreso: string;
  estado: 'Activo' | 'Inactivo';
}

// =========================
// Datos estáticos de empleados
// =========================

const empleadosEstaticos: EmpleadoEstatico[] = [
  {
    id: 'EMP-001',
    iniciales: 'AM',
    nombre: 'Ana Martínez',
    email: 'ana.martinez@sigrh.com',
    cargo: 'Frontend Developer',
    departamento: 'Desarrollo IT',
    ingreso: '12-Oct-2022',
    estado: 'Activo',
  },
  {
    id: 'EMP-042',
    iniciales: 'CR',
    nombre: 'Carlos Ramírez',
    email: 'carlos.ramirez@sigrh.com',
    cargo: 'Ejecutivo de Cuentas',
    departamento: 'Ventas',
    ingreso: '05-Ene-2021',
    estado: 'Activo',
  },
  {
    id: 'EMP-112',
    iniciales: 'LM',
    nombre: 'Laura Mendoza',
    email: 'laura.mendoza@sigrh.com',
    cargo: 'Analista de UI/UX',
    departamento: 'Desarrollo IT',
    ingreso: '01-Mar-2023',
    estado: 'Activo',
  },
  {
    id: 'EMP-2048',
    iniciales: 'AG',
    nombre: 'Ana García',
    email: 'ana.garcia@sigrh.com',
    cargo: 'Desarrolladora Frontend Senior',
    departamento: 'Desarrollo IT',
    ingreso: '10-Ago-2019',
    estado: 'Activo',
  },
  {
    id: 'EMP-989',
    iniciales: 'JP',
    nombre: 'Juan Pérez',
    email: 'juan.perez@sigrh.com',
    cargo: 'Soporte Técnico',
    departamento: 'Desarrollo IT',
    ingreso: '15-May-2023',
    estado: 'Activo',
  },
  {
    id: 'EMP-512',
    iniciales: 'CR',
    nombre: 'Carlos Ruiz',
    email: 'carlos.ruiz@sigrh.com',
    cargo: 'Ingeniero Comercial',
    departamento: 'Ventas',
    ingreso: '11-Sep-2022',
    estado: 'Activo',
  },
  {
    id: 'EMP-304',
    iniciales: 'RS',
    nombre: 'Roberto Silva',
    email: 'roberto.silva@sigrh.com',
    cargo: 'Gerente Administrativo',
    departamento: 'Administración',
    ingreso: '22-Ago-2018',
    estado: 'Activo',
  },
  {
    id: 'EMP-899',
    iniciales: 'EP',
    nombre: 'Esteban Paz',
    email: 'esteban.paz@sigrh.com',
    cargo: 'QA Automation Specialist',
    departamento: 'Desarrollo IT',
    ingreso: '18-Jun-2026',
    estado: 'Activo',
  },
];

// =========================
// Componente
// =========================

export default function AttendanceView() {
  const [selectedDepto, setSelectedDepto] = useState(
    'Todos los departamentos'
  );

  const [searchTerm, setSearchTerm] = useState('');

  // =========================
  // Departamentos
  // =========================

  const departamentos = useMemo(() => {
    return Array.from(
      new Set(empleadosEstaticos.map((empleado) => empleado.departamento))
    );
  }, []);

  // =========================
  // Filtrado
  // =========================

  const empleadosFiltrados = useMemo(() => {
    return empleadosEstaticos.filter((empleado) => {
      const texto = searchTerm.toLowerCase().trim();

      const coincideBusqueda =
        !texto ||
        empleado.nombre.toLowerCase().includes(texto) ||
        empleado.id.toLowerCase().includes(texto) ||
        empleado.email.toLowerCase().includes(texto) ||
        empleado.cargo.toLowerCase().includes(texto);

      const coincideDepartamento =
        selectedDepto === 'Todos los departamentos' ||
        empleado.departamento === selectedDepto;

      return coincideBusqueda && coincideDepartamento;
    });
  }, [searchTerm, selectedDepto]);

  // =========================
  // Exportar Excel
  // =========================

  const exportarExcel = () => {
    const datosExcel = empleadosFiltrados.map((empleado) => ({
      'ID / Código': empleado.id,
      Empleado: empleado.nombre,
      Correo: empleado.email,
      'Cargo / Puesto': empleado.cargo,
      Departamento: empleado.departamento,
      Ingreso: empleado.ingreso,
      Estado: empleado.estado,
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExcel);

    const columnWidths = [
      { wch: 14 },
      { wch: 25 },
      { wch: 35 },
      { wch: 35 },
      { wch: 20 },
      { wch: 16 },
      { wch: 14 },
    ];

    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Empleados'
    );

    XLSX.writeFile(
      workbook,
      'empleados_gestion_asistencia.xlsx'
    );
  };

  // =========================
  // Render
  // =========================

  return (
    <div className="space-y-6 animate-fade-in text-left">

      {/* =========================================
          Encabezado
      ========================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Gestión de Asistencia
          </h1>

          <p className="text-sm text-[#45474c] mt-1">
            Monitoreo de entradas, salidas, horas acumuladas y estatus del personal.
          </p>
        </div>

        <div className="flex items-center gap-3">

          {/* Exportar Excel */}

          <button
            onClick={exportarExcel}
            className="bg-white border border-[#E2E8F0] hover:bg-emerald-50 hover:border-emerald-200 text-slate-600 hover:text-emerald-600 font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all"
            title="Exportar empleados a Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>

        </div>
      </div>

      {/* =========================================
          Información de empleados
      ========================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Total */}

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Total empleados
              </p>

              <p className="text-2xl font-bold text-[#0F172A] mt-1">
                {empleadosEstaticos.length}
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>

          </div>
        </div>

        {/* Activos */}

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Empleados activos
              </p>

              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {
                  empleadosEstaticos.filter(
                    (empleado) => empleado.estado === 'Activo'
                  ).length
                }
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>

          </div>
        </div>

        {/* Departamentos */}

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Departamentos
              </p>

              <p className="text-2xl font-bold text-[#0F172A] mt-1">
                {departamentos.length}
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>

          </div>
        </div>

      </div>

      {/* =========================================
          Filtros
      ========================================== */}

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Departamento */}

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

                <option>
                  Todos los departamentos
                </option>

                {departamentos.map((departamento) => (
                  <option
                    key={departamento}
                    value={departamento}
                  >
                    {departamento}
                  </option>
                ))}

              </select>

              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />

            </div>
          </div>

          {/* Buscar */}

          <div className="flex flex-col gap-1.5">

            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Buscar empleado
            </label>

            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:border-[#6366F1] focus-within:bg-white transition-all">

              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />

              <input
                type="text"
                placeholder="Nombre, ID, correo o cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-slate-800 focus:outline-none focus:ring-0 placeholder:text-slate-400"
              />

            </div>
          </div>

        </div>

      </div>

      {/* =========================================
          Tabla de empleados
      ========================================== */}

      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">

        {/* Cabecera de tabla */}

        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

          <div>
            <h2 className="text-sm font-bold text-[#0F172A]">
              Empleados registrados
            </h2>

            <p className="text-xs text-slate-400 mt-0.5">
              Información estática del personal para gestión de asistencia.
            </p>
          </div>

          <div className="flex items-center gap-2">

            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Mostrando
            </span>

            <span className="text-xs font-bold text-[#0F172A]">
              {empleadosFiltrados.length}
            </span>

            <span className="text-[10px] text-slate-400">
              empleados
            </span>

          </div>

        </div>

        {/* Tabla */}

        {empleadosFiltrados.length === 0 ? (

          <div className="p-12 text-center">

            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />

            <p className="text-sm font-bold text-slate-500">
              No se encontraron empleados
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Intenta cambiar los filtros de búsqueda.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left border-collapse min-w-[1100px]">

              <thead>

                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">

                  <th className="p-4 pl-6">
                    ID / Código
                  </th>

                  <th className="p-4">
                    Empleado
                  </th>

                  <th className="p-4">
                    Cargo / Puesto
                  </th>

                  <th className="p-4">
                    Departamento
                  </th>

                  <th className="p-4">
                    Ingreso
                  </th>

                  <th className="p-4 text-center">
                    Estado
                  </th>

                  <th className="p-4 text-right pr-6">
                    Acciones
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">

                {empleadosFiltrados.map((empleado) => (

                  <tr
                    key={empleado.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >

                    {/* ID */}

                    <td className="p-4 pl-6">

                      <span className="font-mono text-xs font-bold text-slate-500">
                        {empleado.id}
                      </span>

                    </td>

                    {/* Empleado */}

                    <td className="p-4">

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-[11px] shrink-0">
                          {empleado.iniciales}
                        </div>

                        <div className="flex flex-col">

                          <span className="font-bold text-[#0F172A] group-hover:text-[#6366F1] transition-colors">
                            {empleado.nombre}
                          </span>

                          <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                            {empleado.email}
                          </span>

                        </div>

                      </div>

                    </td>

                    {/* Cargo */}

                    <td className="p-4">

                      <span className="text-slate-700 font-bold">
                        {empleado.cargo}
                      </span>

                    </td>

                    {/* Departamento */}

                    <td className="p-4">

                      <div className="flex items-center gap-2">

                        <Building2 className="w-3.5 h-3.5 text-slate-400" />

                        <span className="text-slate-600">
                          {empleado.departamento}
                        </span>

                      </div>

                    </td>

                    {/* Ingreso */}

                    <td className="p-4">

                      <div className="flex items-center gap-2">

                        <Calendar className="w-3.5 h-3.5 text-slate-400" />

                        <span className="text-slate-600 font-medium">
                          {empleado.ingreso}
                        </span>

                      </div>

                    </td>

                    {/* Estado */}

                    <td className="p-4 text-center">

                      {empleado.estado === 'Activo' ? (

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">

                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

                          Activo

                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">

                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />

                          Inactivo

                        </span>

                      )}

                    </td>

                    {/* Acciones */}

                    <td className="p-4 text-right pr-6">

                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

                        <button
                          type="button"
                          className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Ver empleado"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Editar empleado"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Más opciones"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

        {/* =========================================
            Footer
        ========================================== */}

        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50">

          <span className="text-xs text-slate-500 font-medium">
            Mostrando {empleadosFiltrados.length} de {empleadosEstaticos.length} empleados
          </span>

          <button
            type="button"
            onClick={exportarExcel}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 text-slate-600 hover:text-emerald-600 rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar datos
          </button>

        </div>

      </div>

    </div>
  );
}