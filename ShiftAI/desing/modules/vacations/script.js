/* ============================================================================
   ShiftAI — Módulo Licencias y Vacaciones (vanilla JS)
   Migración de ShiftAI/src/modules/licenses/LicensesView.tsx + handlers de App.tsx

   - Renderiza filas de la tabla desde ShiftAI.data.LICENCIAS cruzando con
     ShiftAI.data.EMPLEADOS.
   - Click en una fila/acción "Ver" → abre el drawer lateral con el detalle
     (motivo, documento adjunto, historial de eventos).
   - Aprobar / Rechazar: mutan el estado, añaden evento al historial, disparan
     toast y re-renderizan.
   - Buscador del header (ShiftAI.onSearch) + filtros locales.
   - Botón "Nueva Licencia" → ShiftAI.openManualModal('leave').
   - Tras inyectar HTML con iconos: window.lucide.createIcons().
   ========================================================================== */
(function () {
  'use strict';

  var ShiftAI = window.ShiftAI;
  var data = ShiftAI.data;

  /* ------------------------------- Estado -------------------------------- */
  var selectedLicenciaId = null;   // null = drawer cerrado
  var buscarNombreId = '';
  var tipoLicencia = 'Todos los tipos';
  var estadoFilter = 'Todos';

  /* ------------------------------- Helpers ------------------------------- */
  function empleadoPorId(id) {
    return data.EMPLEADOS.find(function (e) { return e.id === id; });
  }

  function statusColors(estado) {
    var map = {
      Pendiente:  'bg-amber-50 text-amber-500 border-amber-100',
      Aprobada:   'bg-emerald-50 text-[#10B981] border-emerald-100',
      Activa:     'bg-indigo-50 text-[#6366F1] border-indigo-100',
      Finalizada: 'bg-slate-100 text-slate-500 border-slate-200',
      Rechazada:  'bg-rose-50 text-rose-500 border-rose-100'
    };
    return map[estado] || 'bg-slate-100 text-slate-500 border-slate-200';
  }

  function statusDotColor(estado) {
    if (estado === 'Pendiente')  return 'bg-amber-500';
    if (estado === 'Aprobada')   return 'bg-[#10B981]';
    if (estado === 'Activa')     return 'bg-[#6366F1]';
    if (estado === 'Rechazada')  return 'bg-rose-500';
    return 'bg-slate-500';
  }

  function statusBannerClasses(estado) {
    if (estado === 'Pendiente') return 'bg-amber-50/40 border-amber-200 text-amber-700';
    if (estado === 'Aprobada')  return 'bg-emerald-50/40 border-emerald-200 text-[#10B981]';
    if (estado === 'Activa')    return 'bg-indigo-50/40 border-[#6366F1]/20 text-[#6366F1]';
    return 'bg-slate-100 border-slate-200 text-slate-500';
  }

  function estadoLabel(estado) {
    return estado === 'Pendiente' ? 'Pendiente de Aprobación' : 'Licencia ' + estado;
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ----------------------------- Filtrado -------------------------------- */
  function filteredLicencias() {
    var globalQ = (ShiftAI.busqueda || '').toLowerCase().trim();
    var inputQ = buscarNombreId.toLowerCase().trim();

    return data.LICENCIAS.filter(function (item) {
      var emp = empleadoPorId(item.empleadoId);
      if (!emp) return false;

      var globalMatch = !globalQ ||
        emp.nombre.toLowerCase().indexOf(globalQ) !== -1 ||
        emp.id.toLowerCase().indexOf(globalQ) !== -1 ||
        item.tipo.toLowerCase().indexOf(globalQ) !== -1;

      var inputMatch = !inputQ ||
        emp.nombre.toLowerCase().indexOf(inputQ) !== -1 ||
        emp.id.toLowerCase().indexOf(inputQ) !== -1;

      var tipoMatch = tipoLicencia === 'Todos los tipos' || item.tipo === tipoLicencia;
      var estadoMatch = estadoFilter === 'Todos' || item.estado === estadoFilter;

      return globalMatch && inputMatch && tipoMatch && estadoMatch;
    });
  }

  /* ------------------------------- Render -------------------------------- */
  function renderTable() {
    var lista = filteredLicencias();
    var tbody = document.getElementById('lic-tbody');
    if (!tbody) return;

    var rows = lista.map(function (item) {
      var emp = empleadoPorId(item.empleadoId);
      if (!emp) return '';
      var isSelected = item.id === selectedLicenciaId;

      var rowClass = 'hover:bg-slate-50/50 cursor-pointer transition-all relative' +
        (isSelected ? ' bg-indigo-50/20 border-l-4 border-l-[#6366F1]' : '');

      var acciones = '' +
        '<button data-act="ver" data-id="' + item.id + '" class="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors" title="Ver detalles">' +
          '<i data-lucide="eye" class="w-4 h-4"></i>' +
        '</button>';

      if (item.estado === 'Pendiente') {
        acciones += '' +
          '<button data-act="aprobar" data-id="' + item.id + '" class="p-1 rounded bg-[#10B981] text-white hover:scale-105 active:scale-95 shadow-sm transition-all" title="Aprobar">' +
            '<i data-lucide="check" class="w-3.5 h-3.5"></i>' +
          '</button>' +
          '<button data-act="rechazar" data-id="' + item.id + '" class="p-1 rounded bg-rose-500 text-white hover:scale-105 active:scale-95 shadow-sm transition-all" title="Rechazar">' +
            '<i data-lucide="x" class="w-3.5 h-3.5"></i>' +
          '</button>';
      }

      return '' +
        '<tr data-id="' + item.id + '" class="' + rowClass + '">' +
          '<td class="py-4.5 px-4 pr-1">' +
            '<div class="flex items-center gap-3">' +
              '<div class="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-[11px] shrink-0">' +
                emp.iniciales +
              '</div>' +
              '<div class="flex flex-col text-left">' +
                '<span class="font-bold text-[#0F172A] tracking-tight">' + escapeHtml(emp.nombre) + '</span>' +
                '<span class="text-[10px] text-slate-400 font-sans">' + emp.id + '</span>' +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td class="py-4.5 px-4 text-slate-700 font-bold">' + escapeHtml(item.tipo) + '</td>' +
          '<td class="py-4.5 px-4 font-mono font-bold">' + item.duracionDias + ' días</td>' +
          '<td class="py-4.5 px-4 text-slate-500 font-sans font-semibold">' + item.fechaInicio + ' al ' + item.fechaFin + '</td>' +
          '<td class="py-4.5 px-4">' +
            '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ' + statusColors(item.estado) + '">' +
              '<span class="w-1.5 h-1.5 rounded-full ' + statusDotColor(item.estado) + '"></span>' +
              item.estado +
            '</span>' +
          '</td>' +
          '<td class="py-4.5 px-4 text-right pr-6">' +
            '<div class="flex items-center justify-end gap-1.5">' + acciones + '</div>' +
          '</td>' +
        '</tr>';
    }).join('');

    tbody.innerHTML = rows || '' +
      '<tr><td colspan="6" class="py-10 px-4 text-center text-slate-400 text-xs font-semibold">' +
      'No hay expedientes que coincidan con los filtros.</td></tr>';

    // Footer
    var footer = document.getElementById('lic-footer');
    if (footer) {
      footer.innerHTML =
        '<span>Mostrando ' + lista.length + ' de ' + data.LICENCIAS.length + ' expedientes registrados</span>' +
        '<div class="flex gap-2">' +
          '<button class="px-3.5 py-1 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg" disabled>Anterior</button>' +
          '<button class="px-3.5 py-1 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg">Siguiente</button>' +
        '</div>';
    }

    // KPI pendientes (dinámico)
    var pendientes = data.LICENCIAS.filter(function (l) { return l.estado === 'Pendiente'; }).length;
    var kpi = document.getElementById('kpi-pendientes');
    if (kpi) kpi.textContent = pendientes;

    // Listeners de filas y botones de acción
    tbody.querySelectorAll('tr[data-id]').forEach(function (tr) {
      tr.addEventListener('click', function (e) {
        // Si el click viene de un botón de acción, no abrir el drawer aquí
        if (e.target.closest('button[data-act]')) return;
        selectLicencia(tr.dataset.id);
      });
    });
    tbody.querySelectorAll('button[data-act]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = btn.dataset.id;
        var act = btn.dataset.act;
        if (act === 'ver') selectLicencia(id);
        else if (act === 'aprobar') aprobarLicencia(id);
        else if (act === 'rechazar') rechazarLicencia(id);
      });
    });

    refreshIcons();
  }

  function renderDrawer() {
    var drawer = document.getElementById('lic-drawer');
    if (!drawer) return;

    if (!selectedLicenciaId) {
      drawer.classList.remove('drawer-open');
      drawer.classList.add('drawer-closed');
      drawer.innerHTML = '';
      refreshIcons();
      return;
    }

    var lic = data.LICENCIAS.find(function (l) { return l.id === selectedLicenciaId; });
    if (!lic) {
      drawer.classList.remove('drawer-open');
      drawer.classList.add('drawer-closed');
      drawer.innerHTML = '';
      refreshIcons();
      return;
    }

    var emp = empleadoPorId(lic.empleadoId);

    // Profile card
    var profileCard = '';
    if (emp) {
      profileCard = '' +
        '<div class="flex items-center gap-4 bg-slate-50 p-4 border border-slate-100 rounded-xl">' +
          '<div class="w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0">' +
            '<img src="' + (emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150') + '" ' +
              'alt="' + escapeHtml(emp.nombre) + '" class="w-full h-full object-cover" referrerpolicy="no-referrer">' +
          '</div>' +
          '<div class="flex flex-col text-left">' +
            '<h4 class="text-sm font-bold text-[#0F172A]">' + escapeHtml(emp.nombre) + '</h4>' +
            '<span class="text-[11px] text-[#45474c] mt-0.5 leading-none">' + escapeHtml(emp.cargo) + '</span>' +
            '<span class="text-[10px] text-slate-400 mt-1 font-mono font-bold leading-none">' + emp.id + '</span>' +
          '</div>' +
        '</div>';
    }

    // Status badge banner
    var banner = '' +
      '<div class="flex flex-col gap-1 text-left">' +
        '<span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Estatus del trámite</span>' +
        '<div class="p-4 rounded-xl border flex items-start gap-3 ' + statusBannerClasses(lic.estado) + '">' +
          '<i data-lucide="activity" class="w-5 h-5 shrink-0 mt-0.5"></i>' +
          '<div class="flex flex-col text-left">' +
            '<span class="text-xs font-bold leading-none uppercase">Estado Actual</span>' +
            '<span class="text-sm font-extrabold text-slate-850 truncate mt-1">' + estadoLabel(lic.estado) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';

    // Calendario / Periodo
    var calendario = '' +
      '<div class="flex flex-col gap-2 text-left">' +
        '<span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Calendario / Periodo</span>' +
        '<div class="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-150 p-4 rounded-xl">' +
          '<div>' +
            '<span class="text-[10px] font-bold text-slate-400 uppercase">Tipo Licencia</span>' +
            '<p class="text-xs font-bold text-slate-800 mt-1">' + escapeHtml(lic.tipo) + '</p>' +
          '</div>' +
          '<div>' +
            '<span class="text-[10px] font-bold text-slate-400 uppercase">Duración</span>' +
            '<p class="text-xs font-bold text-slate-800 mt-1">' + lic.duracionDias + ' días hables</p>' +
          '</div>' +
          '<div class="border-t border-slate-200/50 pt-2.5 col-span-2 grid grid-cols-2 gap-4">' +
            '<div>' +
              '<span class="text-[10px] font-bold text-slate-400 uppercase">Fecha Inicio</span>' +
              '<p class="text-xs font-bold text-slate-800 mt-1">' + lic.fechaInicio + '</p>' +
            '</div>' +
            '<div>' +
              '<span class="text-[10px] font-bold text-slate-400 uppercase">Fecha Fin</span>' +
              '<p class="text-xs font-bold text-slate-800 mt-1">' + lic.fechaFin + '</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // Justificación / Motivo
    var motivo = '' +
      '<div class="flex flex-col gap-1 text-left bg-[#F8FAFC] border border-slate-150 rounded-xl p-4">' +
        '<span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Justificación / Motivo</span>' +
        '<p class="text-xs font-semibold text-slate-700 italic mt-1 leading-relaxed">' +
          '"' + escapeHtml(lic.motivo_descripcion || 'No se ingresaron comentarios o motivos formales para esta solicitud.') + '"' +
        '</p>' +
      '</div>';

    // Documento adjunto
    var adjunto = '';
    if (lic.documentoAdjunto) {
      adjunto = '' +
        '<div class="flex flex-col gap-1.5 text-left">' +
          '<span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Documentación médica</span>' +
          '<div class="border border-[#E2E8F0] p-3 rounded-xl flex items-center justify-between hover:bg-slate-50 cursor-pointer bg-white group transition-colors">' +
            '<div class="flex items-center gap-3">' +
              '<div class="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center font-bold">PDF</div>' +
              '<div class="flex flex-col text-left">' +
                '<span class="text-xs font-bold text-slate-800 group-hover:text-[#6366F1] transition-all">' +
                  escapeHtml(lic.documentoAdjunto.nombre) +
                '</span>' +
                '<span class="text-[10px] text-slate-400">' + lic.documentoAdjunto.peso + ' • Subido el ' + lic.documentoAdjunto.fechaSubida + '</span>' +
              '</div>' +
            '</div>' +
            '<button class="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100" title="Ver adjunto">' +
              '<i data-lucide="external-link" class="w-4 h-4"></i>' +
            '</button>' +
          '</div>' +
        '</div>';
    }

    // Historial del flujo
    var eventosHtml = (lic.historialEventos || []).map(function (ev, idx) {
      var dot = idx === 0 ? 'bg-[#6366F1]' : 'bg-slate-300';
      return '' +
        '<div class="relative text-left">' +
          '<div class="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ' + dot + '"></div>' +
          '<p class="text-xs font-bold text-slate-700">' + escapeHtml(ev.evento) + '</p>' +
          '<p class="text-[10px] text-slate-400 mt-0.5">' + escapeHtml(ev.usuario || '') + ' • ' + escapeHtml(ev.fechaHora || '') + '</p>' +
          (ev.descripcion ? '<p class="text-[10px] text-slate-500 mt-0.5 italic">' + escapeHtml(ev.descripcion) + '</p>' : '') +
        '</div>';
    }).join('');

    var historial = '' +
      '<div class="flex flex-col gap-3 text-left pb-6">' +
        '<span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Historial del flujo</span>' +
        '<div class="relative pl-6 space-y-4 before:absolute before:inset-y-1 before:left-[7px] before:w-px before:bg-slate-200">' +
          eventosHtml +
        '</div>' +
      '</div>';

    // Footer de acciones
    var footer;
    if (lic.estado === 'Pendiente') {
      footer = '' +
        '<div class="p-4 border-t border-slate-100 bg-[#F8FAFC] flex gap-3 z-10 font-bold text-xs select-none shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">' +
          '<button id="btn-rechazar-drawer" class="flex-1 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-lg shadow-sm transition-all text-center">Rechazar</button>' +
          '<button id="btn-aprobar-drawer" class="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-665 text-white rounded-lg shadow-md hover:scale-[1.03] active:scale-95 transition-all text-center flex items-center justify-center gap-1.5">' +
            '<i data-lucide="check" class="w-4 h-4"></i><span>Aprobar</span>' +
          '</button>' +
        '</div>';
    } else {
      footer = '' +
        '<div class="p-6 border-t border-slate-100 bg-slate-50 text-center select-none">' +
          '<span class="text-xs font-bold text-slate-500 flex items-center justify-center gap-1.5">' +
            '<i data-lucide="check-circle" class="w-4 h-4 text-emerald-500"></i>' +
            'Trámite cerrado en estado: ' + lic.estado +
          '</span>' +
        '</div>';
    }

    drawer.innerHTML = '' +
      // Header
      '<div class="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-[#F8FAFC]">' +
        '<h3 class="text-sm font-bold text-[#0F172A] uppercase tracking-wider leading-none">Detalles de la Solicitud</h3>' +
        '<div class="flex items-center gap-2">' +
          '<span class="text-[10px] bg-[#6366F1]/10 text-[#6366F1] font-bold px-2 py-0.5 rounded-full">' + lic.id + '</span>' +
          '<button id="btn-cerrar-drawer" class="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors" title="Cerrar panel">' +
            '<i data-lucide="x" class="w-4 h-4"></i>' +
          '</button>' +
        '</div>' +
      '</div>' +
      // Scrollable body
      '<div class="flex-1 overflow-y-auto px-6 py-4 space-y-6">' +
        profileCard + banner + calendario + motivo + adjunto + historial +
      '</div>' +
      footer;

    drawer.classList.remove('drawer-closed');
    drawer.classList.add('drawer-open');

    // Listeners del drawer
    var btnCerrar = document.getElementById('btn-cerrar-drawer');
    if (btnCerrar) btnCerrar.addEventListener('click', closeDrawer);
    var btnAprob = document.getElementById('btn-aprobar-drawer');
    if (btnAprob) btnAprob.addEventListener('click', function () { aprobarLicencia(lic.id); });
    var btnRech = document.getElementById('btn-rechazar-drawer');
    if (btnRech) btnRech.addEventListener('click', function () { rechazarLicencia(lic.id); });

    refreshIcons();
  }

  function render() {
    renderTable();
    renderDrawer();
  }

  /* ----------------------------- Acciones -------------------------------- */
  function selectLicencia(id) {
    selectedLicenciaId = id;
    render();
  }

  function closeDrawer() {
    selectedLicenciaId = null;
    render();
  }

  function aprobarLicencia(id) {
    var lic = data.LICENCIAS.find(function (l) { return l.id === id; });
    if (!lic) return;
    var emp = empleadoPorId(lic.empleadoId);
    var empNombre = emp ? emp.nombre : '';

    lic.estado = 'Aprobada';
    lic.historialEventos = (lic.historialEventos || []).concat([{
      evento: 'Aprobado RRHH',
      usuario: 'Laura Mendoza',
      fechaHora: 'Hoy, Hace un momento',
      descripcion: 'Trámite autorizado firmal'
    }]);

    ShiftAI.toast(
      'Trámite de Licencia Aprobado',
      'Se firmó digitalmente el folio del titular ' + empNombre + '.',
      'success'
    );
    render();
  }

  function rechazarLicencia(id) {
    var lic = data.LICENCIAS.find(function (l) { return l.id === id; });
    if (!lic) return;
    var emp = empleadoPorId(lic.empleadoId);
    var empNombre = emp ? emp.nombre : '';

    lic.estado = 'Rechazada';
    lic.historialEventos = (lic.historialEventos || []).concat([{
      evento: 'Rechazado RRHH',
      usuario: 'Laura Mendoza',
      fechaHora: 'Hoy, Hace un momento',
      descripcion: 'No cumple con requisitos'
    }]);

    ShiftAI.toast(
      'Formulario Rechazado',
      'La requisición especial de ' + empNombre + ' fue revocada.',
      'error'
    );
    render();
  }

  /* ------------------------------- Utils --------------------------------- */
  function refreshIcons() {
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  /* ------------------------------- Eventos ------------------------------- */
  // Buscador del header (global)
  ShiftAI.onSearch(function () { render(); });

  // Cuando el modal global muta datos (nueva licencia cargada)
  ShiftAI.onDataChange(function () { render(); });

  // Filtros locales
  document.addEventListener('DOMContentLoaded', function () {
    var fBuscar = document.getElementById('f-buscar');
    var fTipo = document.getElementById('f-tipo');
    var fEstado = document.getElementById('f-estado');
    var btnLimpiar = document.getElementById('btn-limpiar');
    var btnNueva = document.getElementById('btn-nueva-licencia');

    if (fBuscar) fBuscar.addEventListener('input', function (e) {
      buscarNombreId = e.target.value;
      render();
    });
    if (fTipo) fTipo.addEventListener('change', function (e) {
      tipoLicencia = e.target.value;
      render();
    });
    if (fEstado) fEstado.addEventListener('change', function (e) {
      estadoFilter = e.target.value;
      render();
    });
    if (btnLimpiar) btnLimpiar.addEventListener('click', function () {
      buscarNombreId = '';
      tipoLicencia = 'Todos los tipos';
      estadoFilter = 'Todos';
      if (fBuscar) fBuscar.value = '';
      if (fTipo) fTipo.value = 'Todos los tipos';
      if (fEstado) fEstado.value = 'Todos';
      render();
    });
    if (btnNueva) btnNueva.addEventListener('click', function () {
      ShiftAI.openManualModal('leave');
    });

    render();
  });

  // Si el DOM ya está cargado (script al final del body)
  if (document.readyState !== 'loading') {
    var fBuscar = document.getElementById('f-buscar');
    var fTipo = document.getElementById('f-tipo');
    var fEstado = document.getElementById('f-estado');
    var btnLimpiar = document.getElementById('btn-limpiar');
    var btnNueva = document.getElementById('btn-nueva-licencia');

    if (fBuscar) fBuscar.addEventListener('input', function (e) {
      buscarNombreId = e.target.value; render();
    });
    if (fTipo) fTipo.addEventListener('change', function (e) {
      tipoLicencia = e.target.value; render();
    });
    if (fEstado) fEstado.addEventListener('change', function (e) {
      estadoFilter = e.target.value; render();
    });
    if (btnLimpiar) btnLimpiar.addEventListener('click', function () {
      buscarNombreId = '';
      tipoLicencia = 'Todos los tipos';
      estadoFilter = 'Todos';
      if (fBuscar) fBuscar.value = '';
      if (fTipo) fTipo.value = 'Todos los tipos';
      if (fEstado) fEstado.value = 'Todos';
      render();
    });
    if (btnNueva) btnNueva.addEventListener('click', function () {
      ShiftAI.openManualModal('leave');
    });
    render();
  }
})();