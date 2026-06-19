/* ============================================================================
   ShiftAI — Gestión de Asistencia (vanilla JS)
   Migración de ShiftAI/src/modules/attendance/AttendanceView.tsx
   ========================================================================== */
(function () {
  'use strict';

  var ShiftAI = window.ShiftAI;
  var data = ShiftAI.data;

  /* Estado local de filtros (espejo del useState del TSX) */
  var selectedFecha = '2023-10-24';
  var selectedDepto = 'Todos los departamentos';
  var selectedEmpID = '';

  /* ------------------------------ Helpers -------------------------------- */
  function empleadoPorId(id) {
    return data.EMPLEADOS.find(function (e) { return e.id === id; });
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ------------------------------ Filtrado ------------------------------- */
  function filtrarAsistencias() {
    var query = (ShiftAI.busqueda || '').toLowerCase().trim();
    return data.ASISTENCIAS.filter(function (item) {
      var emp = empleadoPorId(item.empleadoId);
      if (!emp) return false;

      var globalMatch = !query ||
        emp.nombre.toLowerCase().indexOf(query) !== -1 ||
        emp.id.toLowerCase().indexOf(query) !== -1 ||
        emp.cargo.toLowerCase().indexOf(query) !== -1 ||
        emp.departamento.toLowerCase().indexOf(query) !== -1;

      var deptoMatch = selectedDepto === 'Todos los departamentos' || emp.departamento === selectedDepto;

      var empQuery = selectedEmpID.toLowerCase().trim();
      var empMatch = !empQuery ||
        emp.nombre.toLowerCase().indexOf(empQuery) !== -1 ||
        emp.id.toLowerCase().indexOf(empQuery) !== -1;

      // Mantén visibles los históricos mock (AST-H*) aunque la fecha no coincida
      var fechaMatch = !selectedFecha || item.fecha === selectedFecha || String(item.id).indexOf('AST-H') === 0;

      return globalMatch && deptoMatch && empMatch && fechaMatch;
    });
  }

  /* ----------------------------- Render tabla ---------------------------- */
  function badgeEstado(estado) {
    if (estado === 'Presente') {
      return '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#10B981] border border-emerald-100">' +
        '<i data-lucide="check-circle" class="w-3 h-3"></i><span>Presente</span></span>';
    }
    if (estado === 'Tardanza') {
      return '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-[#F59E0B] border border-amber-100">' +
        '<i data-lucide="alert-triangle" class="w-3 h-3"></i><span>Tardanza</span></span>';
    }
    return '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-[#E11D48] border border-rose-100">' +
      '<i data-lucide="minus-circle" class="w-3 h-3"></i><span>Ausente</span></span>';
  }

  function filaHtml(item) {
    var emp = empleadoPorId(item.empleadoId);
    if (!emp) return '';

    var isAusente = item.estado === 'Ausente';
    var entradaCls = isAusente ? 'p-4 text-center font-semibold font-mono text-slate-400 italic' : 'p-4 text-center font-semibold font-mono';
    var salidaCls = entradaCls;
    var horasCls = item.horas > 9 ? 'p-4 text-center font-bold font-mono text-indigo-600' : 'p-4 text-center font-bold font-mono';
    var horasTxt = item.horas > 0 ? (item.horas + ' Hrs') : '--';

    return '' +
      '<tr class="att-row hover:bg-slate-50/50 transition-colors group">' +
        '<td class="p-4 pl-6 text-center">' +
          '<input type="checkbox" class="att-check rounded border-slate-300 text-[#6366F1] focus:ring-[#6366F1]" />' +
        '</td>' +
        '<td class="p-4">' +
          '<div class="flex items-center gap-3">' +
            '<div class="w-8 h-8 rounded-full bg-slate-550/10 text-indigo-600 border border-slate-200 flex items-center justify-center font-bold text-[11px] shrink-0">' +
              escapeHtml(emp.iniciales) +
            '</div>' +
            '<div class="flex flex-col text-left">' +
              '<span class="font-bold text-[#0F172A] group-hover:text-[#6366F1] transition-colors truncate max-w-[150px]">' +
                escapeHtml(emp.nombre) +
              '</span>' +
              '<span class="text-[10px] text-slate-400 font-sans tracking-wide">' + escapeHtml(emp.id) + '</span>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td class="p-4">' +
          '<div class="flex flex-col text-left">' +
            '<span class="text-slate-700 font-bold">' + escapeHtml(emp.departamento) + '</span>' +
            '<span class="text-[10px] text-slate-400 mt-0.5">' + escapeHtml(emp.cargo) + '</span>' +
          '</div>' +
        '</td>' +
        '<td class="' + entradaCls + '">' + escapeHtml(item.entrada || '--:--') + '</td>' +
        '<td class="' + salidaCls + '">' + escapeHtml(item.salida || '--:--') + '</td>' +
        '<td class="' + horasCls + '">' + escapeHtml(horasTxt) + '</td>' +
        '<td class="p-4 text-center">' + badgeEstado(item.estado) + '</td>' +
        '<td class="p-4 text-right pr-6">' +
          '<div class="row-actions flex items-center justify-end gap-1.5">' +
            '<button class="p-1.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Ver Ficha">' +
              '<i data-lucide="eye" class="w-4 h-4"></i>' +
            '</button>' +
            '<button class="p-1.5 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Editar Tiempos">' +
              '<i data-lucide="edit-2" class="w-4 h-4"></i>' +
            '</button>' +
            '<button data-del="' + escapeHtml(item.id) + '" class="att-del p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Anular Registro">' +
              '<i data-lucide="trash-2" class="w-4 h-4"></i>' +
            '</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
  }

  function render() {
    var lista = filtrarAsistencias();
    var tbody = document.getElementById('attendance-tbody');
    var empty = document.getElementById('attendance-empty');
    var wrap = document.getElementById('attendance-table-wrap');
    var countEl = document.getElementById('attendance-count');
    var totalEl = document.getElementById('attendance-total');

    if (tbody) {
      tbody.innerHTML = lista.map(filaHtml).join('');
    }
    if (empty) { empty.classList.toggle('hidden', lista.length !== 0); }
    if (wrap) { wrap.style.display = lista.length === 0 ? 'none' : ''; }
    if (countEl) { countEl.textContent = String(lista.length); }
    if (totalEl) { totalEl.textContent = String(data.ASISTENCIAS.length); }

    // Re-bind botones eliminar
    var dels = document.querySelectorAll('.att-del');
    for (var i = 0; i < dels.length; i++) {
      dels[i].addEventListener('click', function (e) {
        var id = e.currentTarget.getAttribute('data-del');
        eliminarRegistro(id);
      });
    }

    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  /* ------------------------------- Acciones ------------------------------ */
  function eliminarRegistro(id) {
    data.ASISTENCIAS = data.ASISTENCIAS.filter(function (a) { return a.id !== id; });
    ShiftAI.toast('Registro de asistencia anulado', 'El horario acumulado ya no figura en nómina.', 'info');
    render();
  }

  /* ------------------------------- Bind UI ------------------------------- */
  function bindFiltros() {
    var fFecha = document.getElementById('filtro-fecha');
    var fDepto = document.getElementById('filtro-depto');
    var fEmp = document.getElementById('filtro-empleado');
    var btnManual = document.getElementById('btn-registro-manual');

    if (fFecha) fFecha.addEventListener('change', function (e) {
      selectedFecha = e.target.value; render();
    });
    if (fDepto) fDepto.addEventListener('change', function (e) {
      selectedDepto = e.target.value; render();
    });
    if (fEmp) fEmp.addEventListener('input', function (e) {
      selectedEmpID = e.target.value; render();
    });
    if (btnManual) btnManual.addEventListener('click', function () {
      ShiftAI.openManualModal('attendance');
    });
  }

  /* ------------------------------- Search -------------------------------- */
  ShiftAI.onSearch(function (q) {
    // ShiftAI.busqueda ya actualizado por shell.js; solo re-render
    render();
  });

  /* ----------------------------- Data changes ---------------------------- */
  ShiftAI.onDataChange(function () { render(); });

  /* --------------------------------- Boot -------------------------------- */
  document.addEventListener('DOMContentLoaded', function () { bindFiltros(); render(); });
  if (document.readyState !== 'loading') { bindFiltros(); render(); }
})();