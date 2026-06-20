/* ============================================================================
   ShiftAI — Historiales y Consultas (vanilla JS)
   Migración de ShiftAI/src/modules/history/HistoryQueriesView.tsx
   ========================================================================== */
(function () {
  'use strict';

  var data = window.ShiftAI.data;

  var SUB_TABS = [
    { id: 'asistencia',    label: 'Asistencia' },
    { id: 'permisos',      label: 'Permisos' },
    { id: 'licencias',     label: 'Licencias' },
    { id: 'vacaciones',    label: 'Vacaciones' },
    { id: 'ausencias',     label: 'Ausencias' },
    { id: 'curriculum',    label: 'Currículum' },
    { id: 'capacitaciones', label: 'Capacitaciones' }
  ];

  var SKILLS = ['React JS', 'TypeScript', 'Tailwind CSS', 'Arquitectura UI', 'Sistemas de Calidad', 'Colaboración Ágil'];
  var PLACEHOLDER_TABS = ['permisos', 'licencias', 'vacaciones', 'ausencias'];

  var state = {
    selectedEmpId: 'EMP-2048',
    activeTab: 'asistencia',
    busqueda: ''
  };

  /* ----------------------------- Utils ------------------------------------ */
  function empleadoPorId(id) {
    return data.EMPLEADOS.find(function (e) { return e.id === id; });
  }

  function selectedEmployee() {
    return empleadoPorId(state.selectedEmpId) || data.EMPLEADOS[0];
  }

  function employeeAttendance(empId) {
    return data.ASISTENCIAS.filter(function (a) { return a.empleadoId === empId; });
  }

  function employeeActivities(empId) {
    return data.RECIENTES.filter(function (a) {
      return a.empleadoId === empId || a.empleadoId === 'EMP-2048';
    });
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function refreshIcons() {
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  /* --------------------------- Render perfil ------------------------------ */
  function renderProfile() {
    var emp = selectedEmployee();
    var avatar = document.getElementById('emp-avatar');
    if (avatar) { avatar.src = emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'; avatar.alt = emp.nombre; }
    setText('emp-nombre', emp.nombre);
    setText('emp-cargo-depto', emp.cargo + ' • ');
    var depto = document.getElementById('emp-cargo-depto');
    if (depto) {
      depto.innerHTML = escapeHtml(emp.cargo) + ' • <span class="text-[#6366F1] font-bold">' + escapeHtml(emp.departamento) + '</span>';
    }
    setText('emp-id', emp.id);
    setText('emp-correo', emp.correo);
    setText('resultados-auditados', 'Resultados auditados para ' + emp.nombre);
  }

  function setText(id, txt) {
    var el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  /* --------------------------- Render selector ---------------------------- */
  function renderSelector() {
    var sel = document.getElementById('emp-selector');
    if (!sel) return;
    var q = (state.busqueda || '').toLowerCase().trim();
    var lista = data.EMPLEADOS.filter(function (e) {
      if (!q) return true;
      return (e.nombre + ' ' + e.id + ' ' + e.cargo + ' ' + e.departamento).toLowerCase().indexOf(q) !== -1;
    });
    sel.innerHTML = lista.map(function (e) {
      return '<option value="' + e.id + '"' + (e.id === state.selectedEmpId ? ' selected' : '') + '>' + escapeHtml(e.nombre) + '</option>';
    }).join('');
  }

  /* --------------------------- Render subtabs ----------------------------- */
  function renderSubTabs() {
    var bar = document.getElementById('subtabs-bar');
    if (!bar) return;
    bar.innerHTML = SUB_TABS.map(function (t) {
      var isAct = state.activeTab === t.id;
      return '' +
        '<button data-tab="' + t.id + '" class="subtab-btn px-5 py-3 border-b-2 font-bold text-xs rounded-t-lg transition-all whitespace-nowrap ' +
          (isAct
            ? 'border-[#6366F1] text-[#6366F1] bg-white shadow-sm'
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100') +
        '">' + t.label + '</button>';
    }).join('');
    bar.querySelectorAll('.subtab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.activeTab = btn.dataset.tab;
        renderSubTabs();
        renderTabContent();
      });
    });
  }

  /* --------------------------- Render tab content ------------------------- */
  function renderTabContent() {
    var c = document.getElementById('tab-content');
    if (!c) return;
    var emp = selectedEmployee();
    var html = '';
    if (state.activeTab === 'asistencia') {
      html = renderAsistencia(emp);
    } else if (PLACEHOLDER_TABS.indexOf(state.activeTab) !== -1) {
      html = renderPlaceholder(state.activeTab, emp);
    } else if (state.activeTab === 'curriculum') {
      html = renderCurriculum(emp);
    } else if (state.activeTab === 'capacitaciones') {
      html = renderCapacitaciones();
    }
    c.innerHTML = html;
    refreshIcons();
  }

  /* TAB: Asistencia */
  function renderAsistencia(emp) {
    var rows = employeeAttendance(emp.id);
    var body = '';
    if (rows.length === 0) {
      body = '' +
        '<tr><td colspan="6" class="py-8 text-center text-slate-400 font-sans">' +
          '<i data-lucide="clock" class="w-8 h-8 text-slate-300 mx-auto mb-2"></i><br>' +
          'No se registraron jornadas este mes.' +
        '</td></tr>';
    } else {
      body = rows.map(function (row) {
        var badge = estadoAsistenciaBadge(row.estado);
        return '' +
          '<tr class="hover:bg-slate-50/50">' +
            '<td class="py-3 px-4 text-slate-850 font-sans font-bold">' + escapeHtml(row.fecha) + '</td>' +
            '<td class="py-3 px-4 text-center text-slate-600">' + escapeHtml(row.entrada || '--:--') + '</td>' +
            '<td class="py-3 px-4 text-center text-slate-600">' + escapeHtml(row.salida || '--:--') + '</td>' +
            '<td class="py-3 px-4 text-center text-[#6366F1]">' + (row.horas > 0 ? row.horas + 'h' : '--') + '</td>' +
            '<td class="py-3 px-4 text-center">' + badge + '</td>' +
            '<td class="py-3 px-4 text-right pr-6"><button class="text-slate-400 hover:text-slate-700 transition-colors">•••</button></td>' +
          '</tr>';
      }).join('');
    }
    return '' +
      '<div class="space-y-4">' +
        '<div class="overflow-x-auto">' +
          '<table class="w-full text-left border-collapse">' +
            '<thead>' +
              '<tr class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">' +
                '<th class="py-3 px-4">Fecha</th>' +
                '<th class="py-3 px-4 text-center">Hora Entrada</th>' +
                '<th class="py-3 px-4 text-center">Hora Salida</th>' +
                '<th class="py-3 px-4 text-center">Total Horas</th>' +
                '<th class="py-3 px-4 text-center">Estatus</th>' +
                '<th class="py-3 px-4 text-right pr-6">Acción</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody class="divide-y divide-slate-100 font-mono text-xs font-bold text-slate-700">' + body + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>';
  }

  function estadoAsistenciaBadge(estado) {
    var cls = estado === 'Presente' ? 'bg-emerald-50 text-[#10B981]'
            : estado === 'Tardanza' ? 'bg-amber-50 text-[#F59E0B]'
            : 'bg-rose-50 text-rose-500';
    var dot = estado === 'Presente' ? 'bg-[#10B981]'
            : estado === 'Tardanza' ? 'bg-[#F59E0B]'
            : 'bg-rose-500';
    return '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] ' + cls + '">' +
      '<span class="w-1 h-1 rounded-full ' + dot + '"></span>' + escapeHtml(estado) + '</span>';
  }

  /* TAB: Placeholders (permisos / licencias / vacaciones / ausencias) */
  function renderPlaceholder(tabId, emp) {
    return '' +
      '<div class="py-10 text-center flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">' +
        '<i data-lucide="file-badge" class="w-16 h-16 stroke-1 text-[#6366F1] animate-bounce-soft"></i>' +
        '<div class="text-center">' +
          '<h4 class="text-sm font-bold text-slate-800 capitalize leading-snug">Consulta histórica de ' + escapeHtml(tabId) + '</h4>' +
          '<p class="text-[11px] text-slate-400 mt-1.5">Se muestran registros formalizados por RRHH correspondientes al año en curso para el carnet ' + escapeHtml(emp.id) + '. Todos los folios están auditados y respaldados digitalmente.</p>' +
        '</div>' +
        '<div class="border border-[#E2E8F0] p-3 rounded-xl flex items-center justify-between hover:bg-slate-50 cursor-pointer w-full bg-white transition-colors">' +
          '<span class="text-xs font-bold text-slate-700">Reporte Consolidado ' + escapeHtml(tabId) + '.pdf</span>' +
          '<i data-lucide="arrow-down-to-line" class="w-4 h-4 text-[#6366F1]"></i>' +
        '</div>' +
      '</div>';
  }

  /* TAB: Currículum */
  function renderCurriculum(emp) {
    var skills = SKILLS.map(function (sk) {
      return '<span class="px-3 py-1 bg-indigo-50/60 text-[#6366F1] rounded-full border border-indigo-100">' + escapeHtml(sk) + '</span>';
    }).join('');

    return '' +
      '<div class="space-y-6 text-left">' +
        '<div class="space-y-2">' +
          '<h4 class="text-sm font-bold text-[#0F172A] border-b border-slate-100 pb-1.5 font-sans leading-none">Resumen Profesional</h4>' +
          '<p class="text-xs font-medium text-slate-600 leading-relaxed">' + escapeHtml(emp.resumenProfesional || 'Profesional altamente capacitado con excelente trayectoria laboral, orientado al cumplimiento de metas organizacionales y desarrollo continuo.') + '</p>' +
        '</div>' +
        '<div class="space-y-4">' +
          '<h4 class="text-sm font-bold text-[#0F172A] border-b border-slate-100 pb-1.5 font-sans leading-none">Trayectoria Laboral Reciente</h4>' +
          '<div class="relative pl-6 space-y-5 cv-timeline">' +
            '<div class="relative select-none text-left">' +
              '<div class="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-[#6366F1] border-2 border-white shadow-sm"></div>' +
              '<h5 class="text-xs font-bold text-[#0F172A]">Senior ' + escapeHtml(emp.cargo) + '</h5>' +
              '<p class="text-[10px] text-[#6366F1] font-bold mt-1">Socio Corporativo Integral • 2021 - Presente</p>' +
              '<p class="text-[11px] text-slate-500 mt-1 leading-normal">Liderazgo en optimización de infraestructuras corporativas, flujos de desarrollo y mentoría de nuevos talentos de plantilla.</p>' +
            '</div>' +
            '<div class="relative select-none text-left">' +
              '<div class="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-slate-300 border-2 border-white shadow-sm"></div>' +
              '<h5 class="text-xs font-bold text-slate-500">Especialista Junior</h5>' +
              '<p class="text-[10px] text-slate-400 mt-1 font-bold">Inicios e Incorporación de plantilla • 2019 - 2021</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="space-y-2">' +
          '<h4 class="text-sm font-bold text-[#0F172A] border-b border-slate-100 pb-1.5 font-sans leading-none">Habilidades de Plantilla</h4>' +
          '<div class="flex flex-wrap gap-2 pt-1 font-bold text-xs select-none">' + skills + '</div>' +
        '</div>' +
      '</div>';
  }

  /* TAB: Capacitaciones */
  function renderCapacitaciones() {
    var rows = data.CAPACITACIONES_CURSOS.map(function (row) {
      var badge = estadoCursoBadge(row.estado);
      var cert = row.estado === 'Completado'
        ? '<button class="p-1 text-indigo-600 hover:bg-indigo-50 rounded" title="Descargar diploma"><i data-lucide="arrow-down-to-line" class="w-4 h-4"></i></button>'
        : '<span class="text-slate-400">-</span>';
      return '' +
        '<tr class="hover:bg-slate-50/50">' +
          '<td class="py-3.5 px-4 font-bold text-slate-800">' + escapeHtml(row.titulo) + '</td>' +
          '<td class="py-3.5 px-4 text-slate-500">' + escapeHtml(row.institucion) + '</td>' +
          '<td class="py-3.5 px-4 text-center font-mono font-bold">' + row.horas + 'h</td>' +
          '<td class="py-3.5 px-4 text-center">' + badge + '</td>' +
          '<td class="py-3.5 px-4 text-right pr-6">' + cert + '</td>' +
        '</tr>';
    }).join('');

    return '' +
      '<div class="space-y-4">' +
        '<div class="overflow-x-auto">' +
          '<table class="w-full text-left border-collapse">' +
            '<thead>' +
              '<tr class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">' +
                '<th class="py-3 px-4">Curso / Certificación</th>' +
                '<th class="py-3 px-4">Institución</th>' +
                '<th class="py-3 px-4 text-center">Horas</th>' +
                '<th class="py-3 px-4 text-center">Estatus</th>' +
                '<th class="py-3 px-4 text-right pr-6">Certificado</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody class="divide-y divide-slate-100 text-xs font-semibold text-slate-600">' + rows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>';
  }

  function estadoCursoBadge(estado) {
    var on = estado === 'Completado';
    var cls = on ? 'bg-emerald-50 text-[#10B981] border-emerald-100' : 'bg-amber-50 text-[#F59E0B] border-amber-100';
    var dot = on ? 'bg-[#10B981]' : 'bg-[#F59E0B]';
    return '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ' + cls + '">' +
      '<span class="w-1 h-1 rounded-full ' + dot + '"></span>' + escapeHtml(estado) + '</span>';
  }

  /* --------------------------- Render actividad --------------------------- */
  function renderActivity() {
    var box = document.getElementById('activity-timeline');
    if (!box) return;
    var emp = selectedEmployee();
    var acts = employeeActivities(emp.id);

    var items = acts.map(function (act) {
      var cls = act.tipo === 'vacacion'    ? 'bg-emerald-50 text-[#10B981]'
              : act.tipo === 'asistencia' ? 'bg-indigo-50 text-[#6366F1]'
              : act.tipo === 'tardanza'   ? 'bg-amber-50 text-[#F59E0B]'
              : 'bg-slate-100 text-slate-500';
      return '' +
        '<div class="relative pl-9 mb-6 group text-left">' +
          '<div class="absolute left-0 top-1 w-8 h-8 rounded-full border border-white flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-105 duration-200 ' + cls + '">' +
            '<i data-lucide="clock" class="w-3.5 h-3.5"></i>' +
          '</div>' +
          '<div class="bg-slate-50 border border-slate-100 p-3.5 rounded-xl hover:border-slate-200 transition-all">' +
            '<p class="text-xs font-bold text-slate-800 leading-snug">' + escapeHtml(act.titulo) + '</p>' +
            '<p class="text-[10.5px] text-slate-400 mt-1 font-semibold">' + escapeHtml(act.descripcion) + '</p>' +
            '<span class="text-[9.5px] text-[#8590a6] mt-2 block font-extrabold select-none">' + escapeHtml(act.tiempo) + '</span>' +
          '</div>' +
        '</div>';
    }).join('');

    var endDot = '<div class="relative pl-10"><div class="absolute left-[11px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-200 border-2 border-white shadow-sm z-10"></div></div>';
    box.innerHTML = items + endDot;
    refreshIcons();
  }

  /* ------------------------------- Render --------------------------------- */
  function render() {
    renderProfile();
    renderSelector();
    renderSubTabs();
    renderTabContent();
    renderActivity();
    refreshIcons();
  }

  /* ----------------------------- Eventos ---------------------------------- */
  function bindSelector() {
    var sel = document.getElementById('emp-selector');
    if (!sel) return;
    sel.addEventListener('change', function (e) {
      state.selectedEmpId = e.target.value;
      render();
    });
  }

  /* ------------------------------- Boot ----------------------------------- */
  window.ShiftAI.onSearch(function (q) {
    state.busqueda = q || '';
    renderSelector();
    // re-selecciona si el empleado actual quedó fuera del filtro
    var sel = document.getElementById('emp-selector');
    if (sel && sel.value !== state.selectedEmpId) {
      // mantener el estado interno aunque el <select> muestre otro
      sel.value = state.selectedEmpId;
    }
  });

  window.ShiftAI.onDataChange(function () { render(); });

  function boot() {
    bindSelector();
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();