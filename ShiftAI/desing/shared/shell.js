/* ============================================================================
   ShiftAI — Shell compartido (vanilla JS)
   Migración de ShiftAI/src/App.tsx + components/Sidebar.tsx + components/Header.tsx

   Cada pantalla (modules/<id>/index.html) declara en <body data-module="<id>">
   el módulo activo y monta dos placeholders:
     <div id="sidebar-mount"></div>
     <div id="header-mount"></div>
   Este script inyecta sidebar + header + el modal global de registro + el
   sistema de toasts, y expone window.ShiftAI con la API que consumen las
   pantallas:

     ShiftAI.toast(text, sub?, type?)        → notificación flotante
     ShiftAI.openManualModal('attendance'|'leave')
     ShiftAI.onSearch(fn)                    → fn(busqueda) al cambiar el input
     ShiftAI.onDataChange(fn)                → fn() cuando el modal muta datos
     ShiftAI.busqueda                        → string de búsqueda actual
     ShiftAI.data                            → datos compartidos (mutable)
   ========================================================================== */
(function () {
  'use strict';

  var ShiftAI = window.ShiftAI = window.ShiftAI || {};
  var data = ShiftAI.data;

  /* ----------------------------- Configuración ---------------------------- */
  var MODULES = [
    { id: 'dashboard',   label: 'Resumen General',         icon: 'layout-dashboard', category: 'Principal' },
    { id: 'employees',   label: 'Plantilla de Empleados',  icon: 'users',            category: 'Personal' },
    { id: 'attendance',  label: 'Gestión de Asistencia',   icon: 'clock',            category: 'Control' },
    { id: 'vacations',   label: 'Licencias y Vacaciones',  icon: 'palmtree',         category: 'Control' },
    { id: 'history',     label: 'Historiales y Consultas', icon: 'history',          category: 'Consultas' },
    { id: 'payroll',     label: 'Nómina y Pagos',          icon: 'credit-card',      category: 'Operaciones' },
    { id: 'recruitment', label: 'Reclutamiento',           icon: 'folder-git-2',     category: 'Operaciones' },
    { id: 'training',    label: 'Capacitaciones',          icon: 'graduation-cap',   category: 'Desarrollo' },
    { id: 'evaluations', label: 'Evaluación Desempeño',    icon: 'bar-chart-3',      category: 'Desarrollo' },
    { id: 'settings',    label: 'Configuración',           icon: 'settings',         category: 'Sistema' }
  ];

  var CATEGORIES = ['Principal', 'Personal', 'Control', 'Consultas', 'Operaciones', 'Desarrollo', 'Sistema'];

  var MODULE_INFO = {
    dashboard:   { title: 'Dashboard Principal',          subtitle: 'Resumen general de administración de personal.' },
    employees:   { title: 'Plantilla de Empleados',       subtitle: 'Directorio completo y expediente digital de recursos humanos.' },
    attendance:  { title: 'Gestión de Asistencia',        subtitle: 'Monitoreo y registro detallado de tiempos del personal.' },
    vacations:   { title: 'Gestión de Licencias',         subtitle: 'Administración y supervisión de solicitudes de tiempo libre.' },
    history:     { title: 'Historiales y Consultas',      subtitle: 'Consulta el historial completo de actividad del empleado.' },
    payroll:     { title: 'Gestión de Nómina y Pagos',    subtitle: 'Módulo de compensaciones de sueldos, descuentos e incentivos.' },
    recruitment: { title: 'Reclutamiento y Selección',    subtitle: 'Control de vacantes laborales, candidatos y procesos de selección.' },
    training:    { title: 'Capacitación y Desarrollo',    subtitle: 'Registro y seguimiento de programas, cursos y resultados de personal.' },
    evaluations: { title: 'Evaluación del Desempeño',     subtitle: 'Control de evaluaciones, criterios de negocio y sugerencias de mejora.' },
    settings:    { title: 'Configuración del Sistema',    subtitle: 'Ajustes globales de roles, políticas y respaldos del sistema.' }
  };

  var NOTIFICATIONS = [
    { id: 1, text: 'Nueva solicitud de licencia médica por Ana García', time: 'Hace 5 min', unread: true },
    { id: 2, text: 'Carlos Ramírez registró tardanza (09:30 AM)', time: 'Hace 45 min', unread: true },
    { id: 3, text: 'Expiración próxima de licencia de estudios (Laura M.)', time: 'Hace 2 horas', unread: false }
  ];

  /* ------------------------------- Estado --------------------------------- */
  var activeModule = document.body.dataset.module || 'dashboard';
  var collapsed = false;
  var darkMode = false;
  var busqueda = '';
  var searchListeners = [];
  var dataListeners = [];

  ShiftAI.busqueda = '';
  ShiftAI.onSearch = function (fn) { searchListeners.push(fn); };
  ShiftAI.onDataChange = function (fn) { dataListeners.push(fn); };
  function emitSearch() { searchListeners.forEach(function (fn) { try { fn(busqueda); } catch (e) {} }); }
  function emitDataChange() { dataListeners.forEach(function (fn) { try { fn(); } catch (e) {} }); }

  /* --------------------------------- Utils -------------------------------- */
  function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function refreshIcons() { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons(); }

  /* ------------------------------- Sidebar -------------------------------- */
  function renderSidebar() {
    var mount = document.getElementById('sidebar-mount');
    if (!mount) return;

    var items = CATEGORIES.map(function (cat) {
      var inCat = MODULES.filter(function (m) { return m.category === cat; });
      if (!inCat.length) return '';
      var label = '<p class="cat-label px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 mt-2 select-none">' + cat + '</p>';
      var buttons = inCat.map(function (item) {
        var activo = item.id === activeModule;
        return '' +
          '<a href="../' + item.id + '/index.html" ' +
            'class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ' + (activo ? 'bg-[#10B981]/15 text-[#10B981] border-l-4 border-[#10B981] pl-2 font-semibold shadow-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent') + '">' +
            '<i data-lucide="' + item.icon + '" class="w-5 h-5 shrink-0 transition-transform group-hover:scale-105 duration-200 ' + (activo ? 'text-[#10B981]' : 'text-slate-400 group-hover:text-slate-200') + '"></i>' +
            '<span class="label truncate">' + item.label + '</span>' +
          '</a>';
      }).join('');
      return '<div class="space-y-1">' + label + buttons + '</div>';
    }).join('');

    var aside = el('' +
      '<aside id="sidebar" class="bg-[#0F172A] border-r border-[#E2E8F0]/10 flex flex-col h-screen fixed left-0 top-0 text-white">' +
        '<div class="p-6 flex items-center justify-between border-b border-[#E2E8F0]/10">' +
          '<div class="flex items-center gap-3 overflow-hidden">' +
            '<div class="w-9 h-9 rounded-lg bg-[#6366F1] flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">S</div>' +
            '<div class="label flex flex-col">' +
              '<span class="font-semibold text-base tracking-tight leading-none text-white whitespace-nowrap">ShiftAI</span>' +
              '<span class="text-[10px] text-[#8590a6] mt-1 leading-none font-medium uppercase tracking-wider">Gestión Inteligente</span>' +
            '</div>' +
          '</div>' +
          '<button id="collapse-btn" class="p-1 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors" title="Colapsar menú">' +
            '<i data-lucide="chevron-left" id="collapse-icon" class="w-5 h-5 transition-transform duration-300"></i>' +
          '</button>' +
        '</div>' +
        '<nav class="flex-1 overflow-y-auto py-4 px-3 space-y-4 scrollbar-thin">' + items + '</nav>' +
        '<div class="p-4 border-t border-[#E2E8F0]/10 bg-slate-950/40">' +
          '<div class="flex items-center gap-3">' +
            '<div class="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-700">' +
              '<img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop" alt="Administrador" class="w-full h-full object-cover" referrerpolicy="no-referrer">' +
            '</div>' +
            '<div class="label flex flex-col min-w-0">' +
              '<span class="text-xs font-semibold text-slate-200 truncate leading-tight">Laura S. Mendoza</span>' +
              '<span class="text-[10px] text-[#8590a6] truncate mt-0.5 font-medium">HR Manager • Admin</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</aside>');
    mount.replaceWith(aside);

    document.getElementById('collapse-btn').addEventListener('click', function () {
      collapsed = !collapsed;
      document.body.classList.toggle('sidebar-collapsed', collapsed);
      var ic = document.getElementById('collapse-icon');
      if (ic) ic.style.transform = collapsed ? 'rotate(180deg)' : '';
    });
    refreshIcons();
  }

  /* -------------------------------- Header -------------------------------- */
  function renderHeader() {
    var mount = document.getElementById('header-mount');
    if (!mount) return;
    var info = MODULE_INFO[activeModule] || { title: 'ShiftAI', subtitle: 'Sistema de Gestión de Recursos Humanos.' };

    var notifList = NOTIFICATIONS.map(function (n) {
      return '<div class="p-3 text-xs hover:bg-slate-50 transition-colors cursor-pointer ' + (n.unread ? 'bg-indigo-50/20' : '') + '">' +
        '<div class="flex justify-between items-start mb-1">' +
          '<span class="font-semibold ' + (n.unread ? 'text-slate-800 font-bold' : 'text-slate-600') + '">' + n.text + '</span>' +
          (n.unread ? '<span class="w-1.5 h-1.5 bg-[#6366F1] rounded-full mt-1.5 shrink-0"></span>' : '') +
        '</div><span class="text-[10px] text-slate-400">' + n.time + '</span></div>';
    }).join('');

    var header = el('' +
      '<header id="header" class="bg-white border-b border-[#E2E8F0] fixed top-0 right-0 h-16 flex items-center justify-between px-6 shadow-sm">' +
        '<div class="flex flex-col select-none">' +
          '<h2 class="text-sm font-semibold text-slate-400 uppercase tracking-widest leading-none">' + info.title + '</h2>' +
          '<span class="text-[11px] text-[#8590a6] mt-1 font-medium hidden sm:block truncate max-w-[400px]">' + info.subtitle + '</span>' +
        '</div>' +
        '<div class="flex items-center gap-4">' +
          '<div class="relative hidden md:flex items-center w-64 bg-slate-50 border border-slate-200 focus-within:border-[#6366F1] focus-within:bg-white rounded-lg px-3 py-1.5 transition-all">' +
            '<i data-lucide="search" class="w-4 h-4 text-slate-400 mr-2 shrink-0"></i>' +
            '<input id="global-search" type="text" placeholder="Buscar empleados, folios..." class="bg-transparent border-none focus:outline-none focus:ring-0 text-xs w-full text-slate-800 placeholder:text-slate-400">' +
          '</div>' +
          '<div class="relative">' +
            '<button id="notif-btn" class="p-2 rounded-full text-slate-500 hover:text-[#6366F1] hover:bg-slate-100 transition-colors relative" title="Notificaciones">' +
              '<i data-lucide="bell" class="w-5 h-5"></i>' +
              '<span class="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E11D48] rounded-full ring-2 ring-white"></span>' +
            '</button>' +
            '<div id="notif-panel" class="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] shadow-lg rounded-xl py-2 z-50 animate-fade-in-down hidden">' +
              '<div class="px-4 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">' +
                '<span class="text-xs font-semibold text-slate-700">Notificaciones</span>' +
                '<span class="text-[10px] bg-[#6366F1]/10 text-[#6366F1] font-semibold px-2 py-0.5 rounded-full">2 Nuevas</span>' +
              '</div>' +
              '<div class="divide-y divide-slate-100 max-h-60 overflow-y-auto">' + notifList + '</div>' +
              '<div class="px-4 py-1.5 border-t border-slate-100 text-center bg-slate-50 rounded-b-xl">' +
                '<button class="text-[11px] text-[#6366F1] font-medium hover:underline">Marcar todas como leídas</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<button id="dark-btn" class="p-2 rounded-full text-slate-500 hover:text-[#6366F1] hover:bg-slate-100 transition-colors hidden sm:block" title="Modo Oscuro"><i data-lucide="moon" class="w-5 h-5"></i></button>' +
          '<button class="p-2 rounded-full text-slate-500 hover:text-[#6366F1] hover:bg-slate-100 transition-colors hidden sm:block"><i data-lucide="help-circle" class="w-5 h-5"></i></button>' +
          '<div class="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>' +
          '<div class="relative">' +
            '<div id="profile-btn" class="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-slate-50 rounded-lg transition-colors select-none">' +
              '<div class="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-sm shrink-0">' +
                '<img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop" alt="Laura S. Mendoza" class="w-full h-full object-cover" referrerpolicy="no-referrer">' +
              '</div>' +
              '<div class="hidden lg:flex flex-col min-w-0 text-left">' +
                '<span class="text-xs font-semibold text-slate-800 leading-none truncate">Laura Mendoza</span>' +
                '<span class="text-[10px] text-slate-400 mt-0.5 leading-none font-medium">HR Manager</span>' +
              '</div>' +
              '<i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 shrink-0"></i>' +
            '</div>' +
            '<div id="profile-panel" class="absolute right-0 mt-2 w-48 bg-white border border-[#E2E8F0] shadow-lg rounded-xl py-1.5 z-50 animate-fade-in-down hidden">' +
              '<div class="px-4 py-2 border-b border-slate-100 lg:hidden"><span class="text-xs font-semibold text-slate-800 block">Laura Mendoza</span><span class="text-[10px] text-slate-400">HR Manager</span></div>' +
              '<button class="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors">Mi Perfil</button>' +
              '<button class="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors">Mi Cuenta</button>' +
              '<button class="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors">Políticas de Empresa</button>' +
              '<div class="border-t border-slate-100 my-1"></div>' +
              '<button class="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium">Cerrar Sesión</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</header>');
    mount.replaceWith(header);

    var search = document.getElementById('global-search');
    if (search) search.addEventListener('input', function (e) { busqueda = e.target.value; ShiftAI.busqueda = busqueda; emitSearch(); });

    togglePanel('notif-btn', 'notif-panel');
    togglePanel('profile-btn', 'profile-panel');

    var darkBtn = document.getElementById('dark-btn');
    if (darkBtn) darkBtn.addEventListener('click', function () {
      darkMode = !darkMode;
      document.documentElement.classList.toggle('dark', darkMode);
      darkBtn.innerHTML = '<i data-lucide="' + (darkMode ? 'sun' : 'moon') + '" class="w-5 h-5' + (darkMode ? ' text-amber-500' : '') + '"></i>';
      refreshIcons();
    });
    refreshIcons();
  }

  function togglePanel(btnId, panelId) {
    var btn = document.getElementById(btnId);
    var panel = document.getElementById(panelId);
    if (!btn || !panel) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.classList.toggle('hidden');
    });
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== btn) panel.classList.add('hidden');
    });
  }

  /* --------------------------------- Toast -------------------------------- */
  var toastEl = null, toastTimer = null;
  ShiftAI.toast = function (text, sub, type) {
    type = type || 'success';
    if (toastEl) { toastEl.remove(); toastEl = null; if (toastTimer) clearTimeout(toastTimer); }
    var color = type === 'success' ? 'bg-[#0F172A] text-white border-slate-800'
              : type === 'error'   ? 'bg-rose-900 border-rose-800 text-white'
              :                       'bg-slate-900 text-white border-slate-700';
    var iconColor = type === 'success' ? 'text-emerald-400' : 'text-rose-400';
    toastEl = el('' +
      '<div class="fixed bottom-6 right-6 p-4 rounded-xl shadow-xl flex items-start gap-3.5 border z-[60] max-w-sm select-none animate-fade-in ' + color + '">' +
        '<i data-lucide="check-circle" class="w-5 h-5 shrink-0 mt-0.5 ' + iconColor + '"></i>' +
        '<div class="flex-1 text-left">' +
          '<p class="text-xs font-bold leading-normal">' + text + '</p>' +
          (sub ? '<p class="text-[10.5px] opacity-80 mt-1 leading-normal font-semibold">' + sub + '</p>' : '') +
        '</div>' +
        '<button class="toast-close p-1 hover:bg-white/10 rounded-md transition-colors"><i data-lucide="x" class="w-4 h-4 text-slate-400 hover:text-white"></i></button>' +
      '</div>');
    document.body.appendChild(toastEl);
    refreshIcons();
    toastEl.querySelector('.toast-close').addEventListener('click', function () { toastEl.remove(); toastEl = null; });
    toastTimer = setTimeout(function () { if (toastEl) { toastEl.remove(); toastEl = null; } }, 4500);
  };

  /* --------------------------- Modal registro global ---------------------- */
  var modalState = {
    open: false,
    type: 'attendance',
    formEmpId: 'EMP-2048',
    formFecha: '2023-10-24',
    formEntrada: '09:00 AM',
    formSalida: '06:00 PM',
    formHoras: 8,
    formAsistenciaEstado: 'Presente',
    formLeaveTipo: 'Vacaciones',
    formLeaveInicio: '2023-11-01',
    formLeaveFin: '2023-11-10',
    formLeaveDias: 10,
    formLeaveJustif: ''
  };

  function empOptions() {
    return data.EMPLEADOS.map(function (e) {
      return '<option value="' + e.id + '"' + (e.id === modalState.formEmpId ? ' selected' : '') + '>' + e.nombre + ' (' + e.id + ')</option>';
    }).join('');
  }

  function attendanceSubform() {
    return '' +
      '<div class="space-y-4">' +
        '<div class="grid grid-cols-2 gap-4">' +
          '<div class="flex flex-col gap-1.5"><label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Fecha</label>' +
            '<input id="m-fecha" type="date" value="' + modalState.formFecha + '" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700" required></div>' +
          '<div class="flex flex-col gap-1.5"><label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Estatus del Registro</label>' +
            '<select id="m-asis-estado" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700">' +
              ['Presente', 'Tardanza', 'Ausente'].map(function (o) { return '<option' + (o === modalState.formAsistenciaEstado ? ' selected' : '') + '>' + o + '</option>'; }).join('') +
            '</select></div>' +
        '</div>' +
        '<div class="grid grid-cols-3 gap-4">' +
          '<div class="flex flex-col gap-1.5"><label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Hora Entrada</label><input id="m-entrada" type="text" placeholder="e.g. 09:00 AM" value="' + modalState.formEntrada + '" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 text-center" required></div>' +
          '<div class="flex flex-col gap-1.5"><label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Hora Salida</label><input id="m-salida" type="text" placeholder="e.g. 06:05 PM" value="' + modalState.formSalida + '" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 text-center" required></div>' +
          '<div class="flex flex-col gap-1.5"><label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Horas Totales</label><input id="m-horas" type="number" step="0.1" value="' + modalState.formHoras + '" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 text-center" required></div>' +
        '</div>' +
      '</div>';
  }

  function leaveSubform() {
    var tipos = ['Médica', 'Vacaciones', 'Maternidad/Paternidad', 'Estudios', 'Permiso Personal'];
    return '' +
      '<div class="space-y-4">' +
        '<div class="grid grid-cols-2 gap-4">' +
          '<div class="flex flex-col gap-1.5"><label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Tipo de Solicitud</label>' +
            '<select id="m-leave-tipo" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700">' +
              tipos.map(function (t) { return '<option' + (t === modalState.formLeaveTipo ? ' selected' : '') + '>' + t + '</option>'; }).join('') +
            '</select></div>' +
          '<div class="flex flex-col gap-1.5"><label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Duración (Dias)</label><input id="m-leave-dias" type="number" value="' + modalState.formLeaveDias + '" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700" required></div>' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-4">' +
          '<div class="flex flex-col gap-1.5"><label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Fecha de Inicio</label><input id="m-leave-inicio" type="date" value="' + modalState.formLeaveInicio + '" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700" required></div>' +
          '<div class="flex flex-col gap-1.5"><label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Fecha de Término</label><input id="m-leave-fin" type="date" value="' + modalState.formLeaveFin + '" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700" required></div>' +
        '</div>' +
        '<div class="flex flex-col gap-1.5"><label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Justificación o Exposición de Motivos</label>' +
          '<textarea id="m-leave-justif" rows="3" placeholder="Describa el motivo de la licencia..." maxlength="250" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder:text-slate-400">' + modalState.formLeaveJustif + '</textarea></div>' +
      '</div>';
  }

  function renderModalBody() {
    var body = document.getElementById('m-subform');
    if (body) body.innerHTML = modalState.type === 'attendance' ? attendanceSubform() : leaveSubform();
    var tabs = document.querySelectorAll('.m-tab');
    tabs.forEach(function (t) {
      var on = t.dataset.type === modalState.type;
      t.className = 'm-tab flex-1 py-3 text-xs font-bold border-b-2 text-center transition-all ' + (on ? 'border-[#6366F1] text-[#6366F1] bg-white font-black' : 'border-transparent text-slate-500 hover:bg-slate-100');
    });
    refreshIcons();
  }

  function openModal(type) {
    modalState.open = true;
    if (type) modalState.type = type;
    var overlay = el('' +
      '<div id="manual-modal" class="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-[55] p-4">' +
        '<div class="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-left flex flex-col animate-fade-in">' +
          '<div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[#F8FAFC]">' +
            '<h2 class="text-sm font-bold text-slate-800 uppercase tracking-widest leading-none">Registro Administrativo Especial</h2>' +
            '<button id="m-close" class="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>' +
          '</div>' +
          '<div class="flex border-b border-slate-100 bg-slate-50">' +
            '<button class="m-tab" data-type="attendance">Entrada de Asistencia</button>' +
            '<button class="m-tab" data-type="leave">Licencia o Vacación</button>' +
          '</div>' +
          '<form id="m-form" class="p-6 space-y-4">' +
            '<div class="flex flex-col gap-1.5"><label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Colaborador Titular</label>' +
              '<select id="m-emp" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 focus:outline-none" required>' + empOptions() + '</select></div>' +
            '<div id="m-subform"></div>' +
            '<div class="flex gap-3 pt-4 border-t border-slate-100 select-none font-bold text-xs">' +
              '<button type="button" id="m-cancel" class="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-center">Descartar</button>' +
              '<button type="submit" class="flex-1 py-3.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-center shadow-md hover:scale-[1.02] active:scale-95 transition-all">Aplicar Registro</button>' +
            '</div>' +
          '</form>' +
        '</div>' +
      '</div>');
    document.body.appendChild(overlay);
    renderModalBody();
    refreshIcons();

    overlay.querySelector('#m-close').addEventListener('click', closeModal);
    overlay.querySelector('#m-cancel').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    overlay.querySelectorAll('.m-tab').forEach(function (t) {
      t.addEventListener('click', function () { modalState.type = t.dataset.type; renderModalBody(); });
    });
    overlay.querySelector('#m-form').addEventListener('submit', submitModal);
  }

  function closeModal() {
    var m = document.getElementById('manual-modal');
    if (m) m.remove();
    modalState.open = false;
  }

  function submitModal(e) {
    e.preventDefault();
    var empId = document.getElementById('m-emp').value;
    var emp = data.EMPLEADOS.find(function (x) { return x.id === empId; });
    if (!emp) return;

    if (modalState.type === 'attendance') {
      var nuevoReg = {
        id: 'AST-M' + (Math.floor(Math.random() * 900) + 100),
        empleadoId: emp.id,
        fecha: document.getElementById('m-fecha').value,
        entrada: document.getElementById('m-entrada').value,
        salida: document.getElementById('m-salida').value,
        horas: Number(document.getElementById('m-horas').value),
        estado: document.getElementById('m-asis-estado').value
      };
      data.ASISTENCIAS.unshift(nuevoReg);
      ShiftAI.toast('Asistencia Registrada', 'Jornada de ' + emp.nombre + ' para el ' + nuevoReg.fecha + ' guardada exitosamente.', 'success');
    } else {
      var nuevaLic = {
        id: 'LIC-' + (Math.floor(Math.random() * 900) + 100),
        empleadoId: emp.id,
        tipo: document.getElementById('m-leave-tipo').value,
        fechaInicio: document.getElementById('m-leave-inicio').value,
        fechaFin: document.getElementById('m-leave-fin').value,
        duracionDias: Number(document.getElementById('m-leave-dias').value),
        estado: 'Pendiente',
        motivo_descripcion: (document.getElementById('m-leave-justif').value || 'Carga manual de tiempos autorizada por administrador de personal.'),
        historialEventos: [ { evento: 'Solicitud Creada Manual', usuario: 'Laura Mendoza', fechaHora: 'Hoy, Hace un momento' } ]
      };
      data.LICENCIAS.unshift(nuevaLic);
      data.SOLICITUDES_PENDIENTES.unshift({
        id: 'REQ-' + (Math.floor(Math.random() * 900) + 100),
        empleadoId: emp.id,
        tipoSolicitud: nuevaLic.tipo,
        fechas: nuevaLic.fechaInicio + ' al ' + nuevaLic.fechaFin,
        dias: nuevaLic.duracionDias,
        estado: 'Pendiente RRHH'
      });
      ShiftAI.toast('Solicitud de Tiempo Especial Creada', 'Expediente cargado con folio administrativo pendiente.', 'success');
    }
    closeModal();
    emitDataChange();
  }

  ShiftAI.openManualModal = openModal;

  /* --------------------------------- Boot --------------------------------- */
  function boot() {
    renderSidebar();
    renderHeader();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();