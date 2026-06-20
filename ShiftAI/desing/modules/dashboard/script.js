/* ShiftAI — Dashboard (vanilla JS)
   Migración de ShiftAI/src/modules/dashboard/DashboardView.tsx
   + handlers handleAprobarSolicitud / handleRechazarSolicitud de App.tsx. */
(function () {
  'use strict';

  var ShiftAI = window.ShiftAI;
  var data = ShiftAI.data;

  /* ----------------------------- Datos derivados ----------------------------- */

  // Mock de "Próximas Vacaciones" (literal del TSX — no vive en data.js)
  var PROXIMAS_VACACIONES = [
    { iniciales: 'LM', nombre: 'Laura Mendoza', depto: 'Desarrollo IT', rango: '26 Oct - 05 Nov', dias: 10, bg: 'bg-teal-100 text-teal-800' },
    { iniciales: 'CR', nombre: 'Carlos Ruiz', depto: 'Ventas', rango: '01 Nov - 15 Nov', dias: 15, bg: 'bg-amber-100 text-amber-800' }
  ];

  // Días del calendario (mock literal del TSX — Octubre 2023)
  var CALENDAR_DAYS = [
    { day: 25, currentMonth: false }, { day: 26, currentMonth: false }, { day: 27, currentMonth: false },
    { day: 28, currentMonth: false }, { day: 29, currentMonth: false }, { day: 30, currentMonth: false },
    { day: 1, currentMonth: true }, { day: 2, currentMonth: true }, { day: 3, currentMonth: true },
    { day: 4, currentMonth: true }, { day: 5, currentMonth: true }, { day: 6, currentMonth: true },
    { day: 7, currentMonth: true }, { day: 8, currentMonth: true }, { day: 9, currentMonth: true },
    { day: 10, currentMonth: true }, { day: 11, currentMonth: true }, { day: 12, currentMonth: true },
    { day: 13, currentMonth: true }, { day: 14, currentMonth: true }, { day: 15, currentMonth: true },
    { day: 16, currentMonth: true }, { day: 17, currentMonth: true }, { day: 18, currentMonth: true },
    { day: 19, currentMonth: true }, { day: 20, currentMonth: true }, { day: 21, currentMonth: true },
    { day: 22, currentMonth: true }, { day: 23, currentMonth: true }, { day: 24, currentMonth: true, isToday: true },
    { day: 25, currentMonth: true }, { day: 26, currentMonth: true }, { day: 27, currentMonth: true },
    { day: 28, currentMonth: true }, { day: 29, currentMonth: true }, { day: 30, currentMonth: true },
    { day: 31, currentMonth: true }
  ];

  var selectedDay = 24;

  function empleadoPorId(id) {
    return data.EMPLEADOS.find(function (e) { return e.id === id; });
  }

  /* ------------------------------ Render: Calendario ------------------------------ */
  function renderCalendar() {
    var grid = document.getElementById('calendar-grid');
    if (!grid) return;

    grid.innerHTML = CALENDAR_DAYS.map(function (cell) {
      var isSelected = selectedDay === cell.day && cell.currentMonth;
      var classes;
      if (!cell.currentMonth) {
        classes = 'text-slate-200';
      } else if (isSelected) {
        classes = 'bg-[#0F172A] text-white shadow-md active:scale-95';
      } else {
        classes = 'text-slate-700 hover:bg-slate-100';
      }
      var todayDot = (cell.isToday && !isSelected)
        ? '<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#6366F1] rounded-full"></span>'
        : '';
      var disabled = !cell.currentMonth ? ' disabled' : '';
      var dataDay = cell.currentMonth ? ' data-day="' + cell.day + '"' : '';
      return '' +
        '<button' + dataDay + disabled +
          ' class="p-1.5 rounded-md transition-all relative font-semibold ' + classes + '">' +
          cell.day + todayDot +
        '</button>';
    }).join('');

    // Bind click en días del mes actual
    grid.querySelectorAll('button[data-day]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectedDay = Number(btn.dataset.day);
        renderCalendar();
      });
    });
  }

  /* --------------------------- Render: Próximas Vacaciones --------------------------- */
  function renderProximasVacaciones() {
    var container = document.getElementById('proximas-vacaciones');
    if (!container) return;

    container.innerHTML = PROXIMAS_VACACIONES.map(function (vac) {
      return '' +
        '<div class="p-4 hover:bg-slate-550/40 hover:bg-slate-50 transition-all flex items-center justify-between group">' +
          '<div class="flex items-center gap-3">' +
            '<div class="w-9 h-9 rounded-full bg-slate-50 text-[#6366F1] border border-slate-200 flex items-center justify-center font-bold text-xs">' +
              vac.iniciales +
            '</div>' +
            '<div class="flex flex-col text-left">' +
              '<span class="text-xs font-bold text-[#0F172A] group-hover:text-[#6366F1] transition-colors">' + vac.nombre + '</span>' +
              '<span class="text-[10px] text-slate-400">' + vac.depto + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="text-right flex flex-col items-end">' +
            '<span class="text-[11px] font-semibold text-slate-700 font-sans tracking-tight">' + vac.rango + '</span>' +
            '<span class="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ' + vac.bg + '">' + vac.dias + ' días</span>' +
          '</div>' +
        '</div>';
    }).join('');
  }

  /* ------------------------------ Render: Solicitudes ------------------------------ */
  function renderSolicitudes() {
    var panel = document.getElementById('solicitudes-panel');
    if (!panel) return;

    var solicitudes = data.SOLICITUDES_PENDIENTES;

    if (solicitudes.length === 0) {
      panel.innerHTML = '' +
        '<div class="p-8 text-center text-slate-400 bg-slate-50 flex flex-col items-center justify-center">' +
          '<i data-lucide="check" class="w-8 h-8 text-emerald-500 mb-2"></i>' +
          '<p class="text-xs font-bold">¡Todo al día!</p>' +
          '<p class="text-[11px] text-slate-500 mt-1">No hay solicitudes pendientes de aprobación por el momento.</p>' +
        '</div>';
      return;
    }

    var rows = solicitudes.map(function (req) {
      var emp = empleadoPorId(req.empleadoId);
      var iniciales = emp ? emp.iniciales : (req.empleadoId === 'EMP-989' ? 'JP' : 'SP');
      var nombre = emp ? emp.nombre : (req.empleadoId === 'EMP-989' ? 'Juan Pérez' : 'Esteban Paz');
      var cargo = emp ? emp.cargo : (req.empleadoId === 'EMP-989' ? 'Soporte Técnico' : 'QA Specialist');
      var estadoLabel = req.estado === 'Pendiente RRHH' ? 'Pendiente RRHH' : 'Pendiente Jefe';

      return '' +
        '<tr class="hover:bg-slate-50/50 transition-colors group">' +
          '<td class="p-4 pl-6">' +
            '<div class="flex items-center gap-3">' +
              '<div class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px]">' + iniciales + '</div>' +
              '<div class="flex flex-col text-left">' +
                '<span class="font-bold text-[#0F172A] group-hover:text-[#6366F1] transition-colors">' + nombre + '</span>' +
                '<span class="text-[10px] text-slate-400">' + cargo + '</span>' +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td class="p-4">' +
            '<span class="font-mono text-slate-850 font-bold bg-slate-100 px-2 py-0.5 rounded text-[11px]">' + req.tipoSolicitud + '</span>' +
          '</td>' +
          '<td class="p-4 font-sans text-slate-700 font-semibold">' + req.fechas + '</td>' +
          '<td class="p-4 text-center font-bold">' + req.dias + ' días</td>' +
          '<td class="p-4">' +
            '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-[#F59E0B] border border-amber-100">' +
              '<span class="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>' + estadoLabel +
            '</span>' +
          '</td>' +
          '<td class="p-4 text-right pr-6">' +
            '<div class="flex items-center justify-end gap-2">' +
              '<button data-action="aprobar" data-id="' + req.id + '" data-tipo="' + req.tipoSolicitud + '" ' +
                'class="p-1.5 rounded-md bg-emerald-500 hover:bg-emerald-650 text-white hover:scale-105 active:scale-95 shadow-sm transition-all" title="Aprobar Solicitud">' +
                '<i data-lucide="check" class="w-4 h-4"></i>' +
              '</button>' +
              '<button data-action="rechazar" data-id="' + req.id + '" data-tipo="' + req.tipoSolicitud + '" ' +
                'class="p-1.5 rounded-md bg-rose-500 hover:bg-rose-650 text-white hover:scale-105 active:scale-95 shadow-sm transition-all" title="Rechazar Solicitud">' +
                '<i data-lucide="x" class="w-4 h-4"></i>' +
              '</button>' +
              '<button class="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:bg-slate-150 hover:text-slate-650 transition-all font-semibold" title="Ver Expediente">' +
                '<i data-lucide="eye" class="w-4 h-4"></i>' +
              '</button>' +
            '</div>' +
          '</td>' +
        '</tr>';
    }).join('');

    panel.innerHTML = '' +
      '<div class="overflow-x-auto w-full">' +
        '<table class="w-full text-left border-collapse min-w-[700px]">' +
          '<thead>' +
            '<tr class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">' +
              '<th class="p-4 pl-6">Empleado</th>' +
              '<th class="p-4">Tipo de Solicitud</th>' +
              '<th class="p-4">Periodo de fechas</th>' +
              '<th class="p-4 text-center">Duración</th>' +
              '<th class="p-4">Estado de Envío</th>' +
              '<th class="p-4 text-right pr-6">Acciones Rápidas</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody class="divide-y divide-slate-100 text-xs font-medium text-slate-600">' + rows + '</tbody>' +
        '</table>' +
      '</div>';

    // Bind botones Aprobar / Rechazar
    panel.querySelectorAll('button[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.id;
        var tipo = btn.dataset.tipo;
        if (btn.dataset.action === 'aprobar') {
          aprobarSolicitud(id, tipo);
        } else {
          rechazarSolicitud(id, tipo);
        }
      });
    });
  }

  /* ------------------------------ Handlers (App.tsx) ------------------------------ */
  function aprobarSolicitud(id, tipo) {
    data.SOLICITUDES_PENDIENTES = data.SOLICITUDES_PENDIENTES.filter(function (s) { return s.id !== id; });
    ShiftAI.toast('¡Solicitud aprobada con éxito!', 'Se autorizó el trámite de "' + tipo + '" e impactará los reportes.', 'success');
    renderSolicitudes();
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  function rechazarSolicitud(id, tipo) {
    data.SOLICITUDES_PENDIENTES = data.SOLICITUDES_PENDIENTES.filter(function (s) { return s.id !== id; });
    ShiftAI.toast('Solicitud desestimada', 'La petición de "' + tipo + '" ha sido rechazada y archivada.', 'info');
    renderSolicitudes();
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  /* ----------------------------------- Render total ----------------------------------- */
  function render() {
    renderCalendar();
    renderProximasVacaciones();
    renderSolicitudes();
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  /* ----------------------------------- Bind global ----------------------------------- */
  function bindGlobals() {
    var btnExport = document.getElementById('btn-exportar-reporte');
    if (btnExport) {
      btnExport.addEventListener('click', function () {
        ShiftAI.openManualModal('leave');
      });
    }
  }

  // Re-render cuando el modal global muta datos (p.ej. nueva licencia → nueva solicitud)
  ShiftAI.onDataChange(function () { render(); });

  // El dashboard no filtra por búsqueda, pero nos registramos para mantener el contrato
  ShiftAI.onSearch(function () { /* sin filtrado en esta pantalla */ });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { bindGlobals(); render(); });
  } else {
    bindGlobals();
    render();
  }
})();