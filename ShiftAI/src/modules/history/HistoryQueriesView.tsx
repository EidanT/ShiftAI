import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  Clock,
  Calendar,
  Briefcase,
  BookOpen,
  AlertOctagon,
  FileBadge,
  User,
  Printer,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EmpleadoRow {
  id_empleado: number;
  nombre: string;
  apellido: string;
  cedula: string;
  email: string | null;
  telefono: string | null;
  fecha_ingreso: string;
  estado: string;
  id_candidato: number | null;
  cargos: { nombre: string } | null;
  departamentos: { nombre: string } | null;
  candidatos: {
    educacion: string | null;
    experiencia_profesional: string | null;
    resumen_profesional: string | null;
  } | null;
}

interface AsistenciaRow {
  id_asistencia: number;
  id_empleado: number;
  fecha: string;
  hora_entrada: string | null;
  hora_salida: string | null;
  horas_laboradas: number | null;
  estado: 'Presente' | 'Tardanza' | 'Ausente';
}

interface SolicitudRow {
  id: number;
  id_empleado: number;
  tipo: 'PERMISO' | 'LICENCIA' | 'VACACIONES';
  fecha_inicio: string;
  fecha_final: string;
  motivo: string | null;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  aprobado_por: string | null;
}

interface CapacitacionRow {
  id: number;
  estado: 'Inscrito' | 'En progreso' | 'Completado' | 'Cancelado';
  fecha_inscripcion: string;
  fecha_completado: string | null;
  capacitaciones: {
    id_capacitacion: number;
    titulo: string;
    categoria: string | null;
    duracion_horas: number;
    modalidad: string;
  } | null;
}

type TabSubId = 'asistencia' | 'permisos' | 'licencias' | 'vacaciones' | 'ausencias' | 'curriculum' | 'capacitaciones';

const TIPO_LABEL: Record<SolicitudRow['tipo'], string> = {
  PERMISO: 'Permiso',
  LICENCIA: 'Licencia Médica',
  VACACIONES: 'Vacaciones'
};

const ESTADO_SOLICITUD_LABEL: Record<SolicitudRow['estado'], string> = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado'
};

function diasEntre(inicio: string, fin: string): number {
  const a = new Date(inicio);
  const b = new Date(fin);
  const ms = b.getTime() - a.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
}

export default function HistoryQueriesView() {
  const [empleados, setEmpleados] = useState<EmpleadoRow[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabSubId>('asistencia');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  const [asistencias, setAsistencias] = useState<AsistenciaRow[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudRow[]>([]);
  const [capacitaciones, setCapacitaciones] = useState<CapacitacionRow[]>([]);

  const [loadingEmpleados, setLoadingEmpleados] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoadingEmpleados(true);
      setErrorMsg(null);
      const { data, error } = await supabase
        .from('empleados')
        .select(
          `id_empleado, nombre, apellido, cedula, email, telefono, fecha_ingreso, estado, id_candidato,
           cargos ( nombre ),
           departamentos ( nombre ),
           candidatos ( educacion, experiencia_profesional, resumen_profesional )`
        )
        .order('nombre', { ascending: true });

      if (!isMounted) return;

      if (error) {
        setErrorMsg(`No se pudo cargar la lista de empleados: ${error.message}`);
        setLoadingEmpleados(false);
        return;
      }

      const rows = (data || []) as unknown as EmpleadoRow[];
      setEmpleados(rows);
      if (rows.length > 0) setSelectedEmpId(rows[0].id_empleado);
      setLoadingEmpleados(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchDetalle = useCallback(async (idEmpleado: number) => {
    setLoadingDetalle(true);
    setErrorMsg(null);

    const [asistenciaRes, solicitudesRes, capacitacionesRes] = await Promise.all([
      supabase
        .from('asistencia')
        .select('id_asistencia, id_empleado, fecha, hora_entrada, hora_salida, horas_laboradas, estado')
        .eq('id_empleado', idEmpleado)
        .order('fecha', { ascending: false }),
      supabase
        .from('solicitudes_personal')
        .select('id, id_empleado, tipo, fecha_inicio, fecha_final, motivo, estado, aprobado_por')
        .eq('id_empleado', idEmpleado)
        .order('fecha_inicio', { ascending: false }),
      supabase
        .from('empleado_capacitacion')
        .select(
          `id, estado, fecha_inscripcion, fecha_completado,
           capacitaciones ( id_capacitacion, titulo, categoria, duracion_horas, modalidad )`
        )
        .eq('id_empleado', idEmpleado)
        .order('fecha_inscripcion', { ascending: false })
    ]);

    const errors = [asistenciaRes.error, solicitudesRes.error, capacitacionesRes.error].filter(Boolean);
    if (errors.length > 0) {
      setErrorMsg(`Error cargando el expediente: ${errors.map(e => e!.message).join(' | ')}`);
    }

    setAsistencias((asistenciaRes.data || []) as unknown as AsistenciaRow[]);
    setSolicitudes((solicitudesRes.data || []) as unknown as SolicitudRow[]);
    setCapacitaciones((capacitacionesRes.data || []) as unknown as CapacitacionRow[]);
    setLoadingDetalle(false);
  }, []);

  useEffect(() => {
    if (selectedEmpId != null) {
      fetchDetalle(selectedEmpId);
    }
  }, [selectedEmpId, fetchDetalle]);

  const selectedEmployee = useMemo(
    () => empleados.find(e => e.id_empleado === selectedEmpId) || null,
    [empleados, selectedEmpId]
  );

  const filteredAsistencias = useMemo(() => {
    return asistencias.filter(a => {
      const matchSearch =
        !searchTerm ||
        a.fecha?.includes(searchTerm) ||
        a.estado?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'todos' || a.estado?.toLowerCase() === filterStatus.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [asistencias, searchTerm, filterStatus]);

  const ausencias = useMemo(() => asistencias.filter(a => a.estado === 'Ausente'), [asistencias]);
  const filteredAusencias = useMemo(() => {
    return ausencias.filter(
      a => !searchTerm || a.fecha?.includes(searchTerm)
    );
  }, [ausencias, searchTerm]);

  const solicitudesPorTipo = useCallback(
    (tipo: SolicitudRow['tipo']) =>
      solicitudes.filter(
        s =>
          s.tipo === tipo &&
          (!searchTerm ||
            (s.motivo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(s.id).includes(searchTerm))
      ),
    [solicitudes, searchTerm]
  );

  const permisos = useMemo(() => solicitudesPorTipo('PERMISO'), [solicitudesPorTipo]);
  const licencias = useMemo(() => solicitudesPorTipo('LICENCIA'), [solicitudesPorTipo]);
  const vacaciones = useMemo(() => solicitudesPorTipo('VACACIONES'), [solicitudesPorTipo]);

  const diasVacacionesAprobados = useMemo(() => {
    return solicitudes
      .filter(s => s.tipo === 'VACACIONES' && s.estado === 'APROBADO')
      .reduce((acc, s) => acc + diasEntre(s.fecha_inicio, s.fecha_final), 0);
  }, [solicitudes]);

  const filteredCapacitaciones = useMemo(() => {
    return capacitaciones.filter(c => {
      const t = c.capacitaciones;
      if (!t) return false;
      return (
        !searchTerm ||
        t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.categoria || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [capacitaciones, searchTerm]);

  const currentTabRecords = useMemo(() => {
    if (activeTab === 'permisos') return permisos;
    if (activeTab === 'licencias') return licencias;
    if (activeTab === 'vacaciones') return vacaciones;
    if (activeTab === 'ausencias') return filteredAusencias;
    return [];
  }, [activeTab, permisos, licencias, vacaciones, filteredAusencias]);

  const handleExportExcel = () => {
    if (!selectedEmployee) return;
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    const fileName = `Historial_${selectedEmployee.nombre.replace(/\s+/g, '_')}_${activeTab.toUpperCase()}_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    if (activeTab === 'asistencia') {
      headers = ['ID Empleado', 'Empleado', 'Fecha', 'Hora Entrada', 'Hora Salida', 'Horas Laboradas', 'Estado'];
      rows = filteredAsistencias.map(a => [
        selectedEmployee.id_empleado,
        `${selectedEmployee.nombre} ${selectedEmployee.apellido}`,
        a.fecha,
        a.hora_entrada || '--',
        a.hora_salida || '--',
        a.horas_laboradas ?? 0,
        a.estado
      ]);
    } else if (['permisos', 'licencias', 'vacaciones', 'ausencias'].includes(activeTab)) {
      if (activeTab === 'ausencias') {
        headers = ['Fecha', 'Empleado', 'Estado'];
        rows = filteredAusencias.map(a => [a.fecha, `${selectedEmployee.nombre} ${selectedEmployee.apellido}`, a.estado]);
      } else {
        headers = ['ID Solicitud', 'Empleado', 'Tipo', 'Fecha Inicio', 'Fecha Fin', 'Días', 'Motivo', 'Estado', 'Aprobado Por'];
        rows = currentTabRecords.map((r: any) => [
          r.id,
          `${selectedEmployee.nombre} ${selectedEmployee.apellido}`,
          TIPO_LABEL[r.tipo as SolicitudRow['tipo']],
          r.fecha_inicio,
          r.fecha_final,
          diasEntre(r.fecha_inicio, r.fecha_final),
          `"${(r.motivo || '').replace(/"/g, '""')}"`,
          ESTADO_SOLICITUD_LABEL[r.estado as SolicitudRow['estado']],
          r.aprobado_por || '--'
        ]);
      }
    } else if (activeTab === 'capacitaciones') {
      headers = ['Curso / Programa', 'Categoría', 'Horas', 'Modalidad', 'Estado'];
      rows = filteredCapacitaciones.map(c => [
        `"${c.capacitaciones?.titulo || ''}"`,
        c.capacitaciones?.categoria || '--',
        c.capacitaciones?.duracion_horas ?? 0,
        c.capacitaciones?.modalidad || 'Virtual',
        c.estado
      ]);
    } else {
      headers = ['Campo', 'Detalle'];
      rows = [
        ['ID Colaborador', selectedEmployee.id_empleado],
        ['Nombre Completo', `${selectedEmployee.nombre} ${selectedEmployee.apellido}`],
        ['Cargo', selectedEmployee.cargos?.nombre || '--'],
        ['Departamento', selectedEmployee.departamentos?.nombre || '--'],
        ['Fecha de Ingreso', selectedEmployee.fecha_ingreso],
        ['Estado Laboral', selectedEmployee.estado],
        ['Correo Electrónico', selectedEmployee.email || '--']
      ];
    }

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!selectedEmployee) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor habilite las ventanas emergentes para generar el reporte PDF.');
      return;
    }

    const reportDate = new Date().toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let recordsHtml = '';

    if (activeTab === 'asistencia') {
      recordsHtml = `
        <table class="report-table">
          <thead><tr><th>Fecha</th><th>Entrada</th><th>Salida</th><th>Horas</th><th>Estado</th></tr></thead>
          <tbody>
            ${filteredAsistencias
              .map(
                a => `
              <tr>
                <td>${a.fecha}</td>
                <td>${a.hora_entrada || '--'}</td>
                <td>${a.hora_salida || '--'}</td>
                <td>${a.horas_laboradas ?? 0} hrs</td>
                <td><span class="badge ${a.estado?.toLowerCase()}">${a.estado}</span></td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>`;
    } else if (activeTab === 'ausencias') {
      recordsHtml = `
        <table class="report-table">
          <thead><tr><th>Fecha</th><th>Estado</th></tr></thead>
          <tbody>
            ${filteredAusencias.map(a => `<tr><td>${a.fecha}</td><td><span class="badge ausente">${a.estado}</span></td></tr>`).join('')}
          </tbody>
        </table>`;
    } else if (['permisos', 'licencias', 'vacaciones'].includes(activeTab)) {
      recordsHtml = `
        <table class="report-table">
          <thead><tr><th>ID</th><th>Tipo</th><th>Periodo</th><th>Días</th><th>Motivo</th><th>Estado</th></tr></thead>
          <tbody>
            ${currentTabRecords
              .map(
                (r: any) => `
              <tr>
                <td><strong>${r.id}</strong></td>
                <td>${TIPO_LABEL[r.tipo as SolicitudRow['tipo']]}</td>
                <td>${r.fecha_inicio} al ${r.fecha_final}</td>
                <td>${diasEntre(r.fecha_inicio, r.fecha_final)} d</td>
                <td>${r.motivo || '--'}</td>
                <td><span class="badge ${r.estado.toLowerCase()}">${ESTADO_SOLICITUD_LABEL[r.estado as SolicitudRow['estado']]}</span></td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>`;
    } else if (activeTab === 'capacitaciones') {
      recordsHtml = `
        <table class="report-table">
          <thead><tr><th>Programa</th><th>Categoría</th><th>Horas</th><th>Modalidad</th><th>Estado</th></tr></thead>
          <tbody>
            ${filteredCapacitaciones
              .map(
                c => `
              <tr>
                <td><strong>${c.capacitaciones?.titulo}</strong></td>
                <td>${c.capacitaciones?.categoria || '--'}</td>
                <td>${c.capacitaciones?.duracion_horas ?? 0} hrs</td>
                <td>${c.capacitaciones?.modalidad || 'Virtual'}</td>
                <td><span class="badge aprobado">${c.estado}</span></td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>`;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Auditoría de Empleado - ${selectedEmployee.nombre}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #6366f1; padding-bottom: 15px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: 800; color: #4f46e5; letter-spacing: -0.5px; }
            .logo span { color: #06b6d4; }
            .subtitle { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .emp-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 25px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
            .emp-field { font-size: 12px; }
            .emp-field label { display: block; color: #64748b; font-size: 10px; font-weight: 700; text-transform: uppercase; }
            .emp-field span { font-weight: 700; color: #0f172a; font-size: 13px; }
            .report-title { font-size: 16px; font-weight: 700; margin-bottom: 15px; color: #334155; display: flex; justify-content: space-between; align-items: center; }
            .report-table { width: 100%; border-collapse: collapse; font-size: 12px; }
            .report-table th { background: #f1f5f9; text-align: left; padding: 10px; font-weight: 700; color: #475569; border-bottom: 2px solid #cbd5e1; }
            .report-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .badge { padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
            .badge.presente, .badge.aprobado { background: #dcfce7; color: #15803d; }
            .badge.tardanza, .badge.pendiente { background: #fef3c7; color: #b45309; }
            .badge.ausente, .badge.rechazado { background: #fee2e2; color: #b91c1c; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 10px; color: #94a3b8; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">Shift<span>AI</span></div>
              <div class="subtitle">Sistema Inteligente de Gestión de Recursos Humanos</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; font-weight: bold; color: #475569;">REPORTE DE AUDITORÍA Y CONSULTAS</div>
              <div style="font-size: 10px; color: #94a3b8;">Generado: ${reportDate}</div>
            </div>
          </div>
          <div class="emp-card">
            <div class="emp-field"><label>Colaborador</label><span>${selectedEmployee.nombre} ${selectedEmployee.apellido}</span></div>
            <div class="emp-field"><label>Código / ID</label><span>${selectedEmployee.id_empleado}</span></div>
            <div class="emp-field"><label>Cargo</label><span>${selectedEmployee.cargos?.nombre || '--'}</span></div>
            <div class="emp-field"><label>Departamento</label><span>${selectedEmployee.departamentos?.nombre || '--'}</span></div>
            <div class="emp-field"><label>Fecha de Ingreso</label><span>${selectedEmployee.fecha_ingreso}</span></div>
            <div class="emp-field"><label>Estado Laboral</label><span>${selectedEmployee.estado}</span></div>
          </div>
          <div class="report-title">
            <span>Módulo Consultado: ${activeTab.toUpperCase()}</span>
            <span style="font-size: 11px; font-weight: normal; color: #64748b;">Total Registros: ${
              activeTab === 'asistencia'
                ? filteredAsistencias.length
                : activeTab === 'capacitaciones'
                ? filteredCapacitaciones.length
                : currentTabRecords.length
            }</span>
          </div>
          ${recordsHtml}
          <div class="footer">
            <p>Documento oficial emitido por la plataforma SIGRH - ShiftAI. Válido para auditorías internas y expediente laboral.</p>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loadingEmpleados) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        <p className="text-sm font-semibold">Cargando expedientes de personal…</p>
      </div>
    );
  }

  if (errorMsg && empleados.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-rose-600 bg-rose-50 rounded-2xl border border-rose-200 mx-4">
        <AlertTriangle className="w-6 h-6" />
        <p className="text-sm font-semibold text-center px-6">{errorMsg}</p>
      </div>
    );
  }

  if (!selectedEmployee) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
        <User className="w-6 h-6" />
        <p className="text-sm font-semibold">No hay empleados registrados en la base de datos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header del Módulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Historial y Consultas de Personal</h1>
              <p className="text-xs text-slate-500 font-medium">Expediente digital, registros de asistencia y auditoría unificada</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-xs shadow-sm"
          >
            <Printer className="w-4 h-4 text-rose-500" />
            Exportar PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all font-semibold text-xs shadow-sm shadow-emerald-200"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar Excel
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-4 py-3 rounded-xl">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Selector de Empleado y Barra de Búsqueda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Seleccionar Colaborador</label>
          <div className="relative">
            <select
              value={selectedEmpId ?? ''}
              onChange={e => setSelectedEmpId(Number(e.target.value))}
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              {empleados.map(emp => (
                <option key={emp.id_empleado} value={emp.id_empleado}>
                  {emp.nombre} {emp.apellido} — {emp.cargos?.nombre || 'Sin cargo'} (#{emp.id_empleado})
                </option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-xl space-y-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center font-bold text-lg text-indigo-200">
                {(selectedEmployee.nombre[0] || '') + (selectedEmployee.apellido[0] || '')}
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight text-white">
                  {selectedEmployee.nombre} {selectedEmployee.apellido}
                </h3>
                <p className="text-xs text-indigo-300 font-medium">{selectedEmployee.cargos?.nombre || 'Sin cargo asignado'}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Código</span>
                <span className="font-mono text-slate-200 font-semibold">#{selectedEmployee.id_empleado}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Departamento</span>
                <span className="text-slate-200 font-semibold truncate block">{selectedEmployee.departamentos?.nombre || '--'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Ingreso</span>
                <span className="text-slate-200 font-semibold">{selectedEmployee.fecha_ingreso}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Estado</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {selectedEmployee.estado}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Filtro y Búsqueda en Expediente</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Buscar por fecha, motivo, estado o palabra clave..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {activeTab === 'asistencia' && (
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="presente">Presente</option>
                  <option value="tardanza">Tardanza</option>
                  <option value="ausente">Ausente</option>
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-indigo-50/60 border border-indigo-100 p-3.5 rounded-xl">
              <span className="text-[10px] font-extrabold uppercase text-indigo-500 tracking-wider">Asistencias</span>
              <p className="text-lg font-black text-indigo-900 mt-0.5">{asistencias.length}</p>
            </div>
            <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-xl">
              <span className="text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider">Días Vacaciones</span>
              <p className="text-lg font-black text-emerald-900 mt-0.5">{diasVacacionesAprobados} Días</p>
            </div>
            <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-xl">
              <span className="text-[10px] font-extrabold uppercase text-amber-600 tracking-wider">Licencias/Permisos</span>
              <p className="text-lg font-black text-amber-900 mt-0.5">{permisos.length + licencias.length}</p>
            </div>
            <div className="bg-slate-100/70 border border-slate-200 p-3.5 rounded-xl">
              <span className="text-[10px] font-extrabold uppercase text-slate-600 tracking-wider">Capacitaciones</span>
              <p className="text-lg font-black text-slate-800 mt-0.5">{capacitaciones.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: 'asistencia', label: 'Asistencia', icon: Clock },
            { id: 'permisos', label: 'Permisos', icon: FileText },
            { id: 'licencias', label: 'Licencias Médicas', icon: FileBadge },
            { id: 'vacaciones', label: 'Vacaciones', icon: Calendar },
            { id: 'ausencias', label: 'Ausencias', icon: AlertOctagon },
            { id: 'curriculum', label: 'Expediente / CV', icon: User },
            { id: 'capacitaciones', label: 'Capacitaciones', icon: BookOpen }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabSubId)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                  isActive ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-800 capitalize">Registros Históricos — {activeTab}</h2>
          <span className="text-xs font-semibold text-slate-400">
            {loadingDetalle
              ? 'Cargando…'
              : `Mostrando ${
                  activeTab === 'asistencia'
                    ? filteredAsistencias.length
                    : activeTab === 'curriculum'
                    ? 1
                    : activeTab === 'capacitaciones'
                    ? filteredCapacitaciones.length
                    : currentTabRecords.length
                } registro(s)`}
          </span>
        </div>

        {loadingDetalle ? (
          <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-semibold">Cargando expediente del colaborador…</span>
          </div>
        ) : (
          <>
            {/* ASISTENCIA */}
            {activeTab === 'asistencia' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-3 px-3">Fecha</th>
                      <th className="py-3 px-3">Entrada</th>
                      <th className="py-3 px-3">Salida</th>
                      <th className="py-3 px-3">Horas</th>
                      <th className="py-3 px-3 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredAsistencias.length > 0 ? (
                      filteredAsistencias.map(ast => (
                        <tr key={ast.id_asistencia} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-800">{ast.fecha}</td>
                          <td className="py-3 px-3 text-slate-600">{ast.hora_entrada || '--'}</td>
                          <td className="py-3 px-3 text-slate-600">{ast.hora_salida || '--'}</td>
                          <td className="py-3 px-3 font-semibold text-slate-700">{ast.horas_laboradas ?? 0} hrs</td>
                          <td className="py-3 px-3 text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                ast.estado === 'Presente'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : ast.estado === 'Tardanza'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {ast.estado}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                          No se encontraron registros de asistencia para los criterios seleccionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* PERMISOS / LICENCIAS / VACACIONES */}
            {['permisos', 'licencias', 'vacaciones'].includes(activeTab) && (
              <div className="space-y-3">
                {currentTabRecords.length > 0 ? (
                  (currentTabRecords as SolicitudRow[]).map(rec => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-600">SOL-{rec.id}</span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold text-[10px]">
                            {TIPO_LABEL[rec.tipo]}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.estado === 'APROBADO'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.estado === 'PENDIENTE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {ESTADO_SOLICITUD_LABEL[rec.estado]}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-700">{rec.motivo || 'Sin motivo especificado.'}</p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {rec.fecha_inicio} al {rec.fecha_final} ({diasEntre(rec.fecha_inicio, rec.fecha_final)} días)
                        </span>
                        {rec.aprobado_por && (
                          <span>
                            Aprobado por: <strong className="text-slate-700">{rec.aprobado_por}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 font-medium text-xs">
                    Sin registros cargados para esta categoría en el expediente.
                  </div>
                )}
              </div>
            )}

            {/* AUSENCIAS (derivadas de asistencia) */}
            {activeTab === 'ausencias' && (
              <div className="space-y-3">
                {filteredAusencias.length > 0 ? (
                  filteredAusencias.map(a => (
                    <div
                      key={a.id_asistencia}
                      className="p-4 rounded-xl border border-rose-200/80 bg-rose-50/40 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-700">
                        <AlertOctagon className="w-4 h-4" />
                        Ausencia registrada por biométrico/asistencia
                      </div>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {a.fecha}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 font-medium text-xs">
                    Sin ausencias registradas para este colaborador.
                  </div>
                )}
              </div>
            )}

            {/* CURRICULUM / EXPEDIENTE */}
            {activeTab === 'curriculum' && (
              <div className="space-y-5 text-xs text-slate-700">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                      Resumen Profesional y Formación
                    </h3>
                    <span className="bg-indigo-100 text-indigo-700 font-bold text-[10px] px-2.5 py-1 rounded-full">
                      Verificado por RRHH
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {selectedEmployee.candidatos?.resumen_profesional ||
                      `Colaborador activo dentro de la dirección de ${selectedEmployee.departamentos?.nombre || 'la empresa'}.`}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Correo Institucional</span>
                    <p className="font-semibold text-slate-800">{selectedEmployee.email || '--'}</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Contacto Directo</span>
                    <p className="font-semibold text-slate-800">{selectedEmployee.telefono || '--'}</p>
                  </div>
                </div>

                {selectedEmployee.candidatos?.educacion && (
                  <div>
                    <h4 className="font-bold text-slate-800 mb-2">Educación</h4>
                    <p className="text-slate-600 font-medium leading-relaxed">{selectedEmployee.candidatos.educacion}</p>
                  </div>
                )}

                {selectedEmployee.candidatos?.experiencia_profesional && (
                  <div>
                    <h4 className="font-bold text-slate-800 mb-2">Experiencia Profesional</h4>
                    <p className="text-slate-600 font-medium leading-relaxed">
                      {selectedEmployee.candidatos.experiencia_profesional}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CAPACITACIONES */}
            {activeTab === 'capacitaciones' && (
              <div className="space-y-3">
                {filteredCapacitaciones.length > 0 ? (
                  filteredCapacitaciones.map(c => (
                    <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                          {c.capacitaciones?.categoria || 'General'}
                        </span>
                        <h4 className="font-bold text-slate-800 text-xs">{c.capacitaciones?.titulo}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Duración: {c.capacitaciones?.duracion_horas ?? 0} hrs | Modalidad: {c.capacitaciones?.modalidad || 'Virtual'}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        {c.estado}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 font-medium text-xs">
                    Sin capacitaciones registradas para este colaborador.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}