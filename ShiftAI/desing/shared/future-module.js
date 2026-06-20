/* ============================================================================
   ShiftAI — Renderizador compartido de módulos futuros (vanilla JS)
   Migración de ShiftAI/src/components/FutureModulesView.tsx

   Expone:
     window.ShiftAI.renderFutureModule(moduleId, container)
       Genera el HTML correspondiente a cada variante (employees/payroll/
       training/evaluations/settings) según el TSX y lo inyecta en `container`.
       Tras inyectar, refresca iconos lucide y vincula eventos internos
       (p.ej. "Contratar Empleado" en employees).

   Cada página (modules/<id>/script.js) invoca esta función pasándole su
   body[data-module] y un contenedor dentro de <main>; se re-renderiza ante
   ShiftAI.onSearch / ShiftAI.onDataChange.
   ========================================================================== */
(function () {
  'use strict';

  var ShiftAI = window.ShiftAI = window.ShiftAI || {};
  var data = ShiftAI.data;

  /* ------------------------------ Helpers -------------------------------- */
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fmtMoney(n) { return '$' + Number(n).toLocaleString('en-US'); }
  function refreshIcons() { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons(); }

  /* =======================================================================
     EMPLOYEES — Plantilla de Empleados (directorio + Contratar Empleado)
     ======================================================================= */
  function renderEmployees(container) {
    var q = (ShiftAI.busqueda || '').toLowerCase().trim();
    var filtered = data.EMPLEADOS.filter(function (e) {
      return !q ||
        e.nombre.toLowerCase().indexOf(q) !== -1 ||
        e.id.toLowerCase().indexOf(q) !== -1 ||
        e.cargo.toLowerCase().indexOf(q) !== -1 ||
        e.departamento.toLowerCase().indexOf(q) !== -1;
    });

    var rows = filtered.map(function (emp) {
      return '' +
        '<tr class="hover:bg-slate-50/50 transition-colors group">' +
          '<td class="p-4 pl-6 font-mono text-slate-500">' + escapeHtml(emp.id) + '</td>' +
          '<td class="p-4">' +
            '<div class="flex items-center gap-3">' +
              '<div class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px]">' +
                escapeHtml(emp.iniciales) +
              '</div>' +
              '<div class="flex flex-col text-left">' +
                '<span class="font-bold text-[#0F172A] group-hover:text-[#6366F1] transition-all">' + escapeHtml(emp.nombre) + '</span>' +
                '<span class="text-[10px] text-slate-400 font-sans">' + escapeHtml(emp.correo) + '</span>' +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td class="p-4 font-bold text-slate-750">' + escapeHtml(emp.cargo) + '</td>' +
          '<td class="p-4 text-slate-500 font-bold">' + escapeHtml(emp.departamento) + '</td>' +
          '<td class="p-4 text-slate-500 font-sans font-semibold">' + escapeHtml(emp.fechaIngreso) + '</td>' +
          '<td class="p-4">' +
            '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#10B981] border border-emerald-100 flex items-center gap-1 w-max">' +
              '<span class="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>' +
              escapeHtml(emp.estado) +
            '</span>' +
          '</td>' +
          '<td class="p-4 text-right pr-6">' +
            '<button class="text-slate-400 hover:text-indigo-600 transition-colors" title="Ver Expediente Digital">' +
              '<i data-lucide="chevron-right" class="w-5 h-5 ml-auto"></i>' +
            '</button>' +
          '</td>' +
        '</tr>';
    }).join('');

    container.innerHTML =
      '<div class="space-y-6 animate-fade-in text-left">' +
        '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">' +
          '<div>' +
            '<h1 class="text-2xl font-bold text-[#0F172A] tracking-tight">Plantilla de Empleados</h1>' +
            '<p class="text-sm text-[#45474c] mt-1">Gestión del padrón, contrataciones vigentes y fichas técnicas del personal.</p>' +
          '</div>' +
          '<button id="btn-contratar" class="bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-xs px-4.5 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition-all uppercase tracking-wider">' +
            '<i data-lucide="plus" class="w-4 h-4"></i>' +
            '<span>Contratar Empleado</span>' +
          '</button>' +
        '</div>' +
        '<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">' +
          '<div class="overflow-x-auto">' +
            '<table class="w-full text-left border-collapse min-w-[700px]">' +
              '<thead>' +
                '<tr class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">' +
                  '<th class="p-4 pl-6">ID / Código</th>' +
                  '<th class="p-4">Empleado</th>' +
                  '<th class="p-4">Cargo / Puesto</th>' +
                  '<th class="p-4">Departamento</th>' +
                  '<th class="p-4">Ingreso</th>' +
                  '<th class="p-4">Estado</th>' +
                  '<th class="p-4 text-right pr-6">Acciones</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody class="divide-y divide-slate-100 text-xs font-semibold text-slate-600">' + rows + '</tbody>' +
            '</table>' +
          '</div>' +
          '<div class="p-4 border-t border-slate-100 bg-slate-50 text-center">' +
            '<span class="text-xs text-slate-400">Total de ' + filtered.length + ' colaboradores activos registrados</span>' +
          '</div>' +
        '</div>' +
      '</div>';

    var btn = document.getElementById('btn-contratar');
    if (btn) btn.addEventListener('click', function () { agregarColaborador(container); });
    refreshIcons();
  }

  /* ----- handleAgregarColaborador (réplica de App.tsx líneas 148-174) ----- */
  function agregarColaborador(container) {
    var ids = ['EMP-303', 'EMP-405', 'EMP-712', 'EMP-899'];
    var randomId = ids[Math.floor(Math.random() * ids.length)];

    var nuevo = {
      id: randomId,
      nombre: 'Esteban Paz',
      cargo: 'QA Automation Specialist',
      departamento: 'Desarrollo IT',
      iniciales: 'EP',
      correo: 'esteban.paz@sigrh.com',
      estado: 'Activo',
      resumenProfesional: 'Ingeniero de Calidad de Software con enfoque en pruebas automatizadas y pipelines de integración continua.',
      fechaIngreso: '18-Jun-2026',
      salario: 41000,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    };

    var existe = data.EMPLEADOS.some(function (e) { return e.id === randomId; });
    if (existe) {
      ShiftAI.toast('Colaborador ya contratado', 'El expediente de Esteban ya se encuentra activo.', 'info');
      return;
    }
    data.EMPLEADOS.push(nuevo);
    ShiftAI.toast('¡Colaborador ingresado!', 'Esteban Paz fue agregado a la plantilla activa.', 'success');
    renderEmployees(container);
  }

  /* =======================================================================
     PAYROLL — Cálculo de Nómina y Pagos (KPIs + PAGOS_NOMINA + config)
     ======================================================================= */
  function renderPayroll(container) {
    var pagoRows = data.PAGOS_NOMINA.map(function (np) {
      return '' +
        '<tr class="hover:bg-slate-50/50 transition-colors">' +
          '<td class="p-4 font-bold text-slate-800">' + escapeHtml(np.periodo) + '</td>' +
          '<td class="p-4 text-center font-bold">' + np.empleados + ' empleados</td>' +
          '<td class="p-4 text-center font-mono font-bold">' + fmtMoney(np.total) + '</td>' +
          '<td class="p-4 text-center">' +
            '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#10B981] border border-emerald-100">' +
              escapeHtml(np.estado) +
            '</span>' +
          '</td>' +
          '<td class="p-4 text-right pr-6">' +
            '<button class="text-slate-400 hover:text-indigo-600 transition-colors font-bold text-xs">Detalle</button>' +
          '</td>' +
        '</tr>';
    }).join('');

    container.innerHTML =
      '<div class="space-y-6 animate-fade-in text-left">' +
        '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">' +
          '<div>' +
            '<div class="flex items-center gap-2 mb-1">' +
              '<h1 class="text-2xl font-bold text-[#0F172A] tracking-tight">Cálculo de Nómina y Pagos</h1>' +
              '<span class="text-[10px] uppercase font-bold px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-lg flex items-center gap-1.5 leading-none shadow-sm select-none">' +
                '<i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Próxima versión' +
              '</span>' +
            '</div>' +
            '<p class="text-sm text-[#45474c]">Estructura de compensaciones, incentivos por departamentos y deducciones fiscales.</p>' +
          '</div>' +
          '<button class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm border border-slate-200 transition-colors">' +
            '<i data-lucide="download" class="w-4 h-4 text-slate-400"></i>' +
            '<span>Historial de Pagos</span>' +
          '</button>' +
        '</div>' +

        '<div class="grid grid-cols-1 sm:grid-cols-3 gap-6">' +
          '<div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">' +
            '<p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Monto Dispensado (Mes)</p>' +
            '<span class="text-3xl font-extrabold text-slate-800 tracking-tight">$848,500</span>' +
          '</div>' +
          '<div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">' +
            '<p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Colaboradores Contemplados</p>' +
            '<span class="text-3xl font-extrabold text-slate-800 tracking-tight">42 Activos</span>' +
          '</div>' +
          '<div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">' +
            '<p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Impuesto Fiscal / Deducibles</p>' +
            '<span class="text-3xl font-extrabold text-slate-800 tracking-tight">18.5% Global</span>' +
          '</div>' +
        '</div>' +

        '<div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">' +
          '<div class="xl:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">' +
            '<div class="p-4 border-b border-slate-100 bg-slate-50/50">' +
              '<span class="text-xs font-bold text-slate-650 text-slate-800">Cierre de Plantillas Quincenales Registrado</span>' +
            '</div>' +
            '<div class="overflow-x-auto">' +
              '<table class="w-full text-left border-collapse">' +
                '<thead>' +
                  '<tr class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">' +
                    '<th class="p-4">Periodo Quincena</th>' +
                    '<th class="p-4 text-center">Fuerza de Plantilla</th>' +
                    '<th class="p-4 text-center">Monto Total</th>' +
                    '<th class="p-4 text-center">Estatus</th>' +
                    '<th class="p-4 text-right pr-6">Acción</th>' +
                  '</tr>' +
                '</thead>' +
                '<tbody class="divide-y divide-slate-100 text-xs font-semibold text-slate-600">' + pagoRows + '</tbody>' +
              '</table>' +
            '</div>' +
          '</div>' +

          '<div class="xl:col-span-4 bg-white border-2 border-slate-200 border-dashed rounded-xl p-6 flex flex-col space-y-4">' +
            '<div class="space-y-1.5">' +
              '<h3 class="text-sm font-bold text-slate-700 flex items-center gap-2">' +
                '<i data-lucide="credit-card" class="w-4 h-4 text-[#6366F1]"></i>' +
                '<span>Configuración Nómina</span>' +
              '</h3>' +
              '<p class="text-[11px] text-slate-400">Estas variables actuarán como base reguladora al liberar el módulo completo.</p>' +
            '</div>' +
            '<div class="space-y-3.5 pt-2">' +
              '<div class="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-150">' +
                '<span class="text-[11px] font-medium text-slate-500">APORTE DE LEY (TSS)</span>' +
                '<span class="text-xs font-bold text-slate-700">7.1%</span>' +
              '</div>' +
              '<div class="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-150">' +
                '<span class="text-[11px] font-medium text-slate-500">APORTE LABORAL (AFP)</span>' +
                '<span class="text-xs font-bold text-slate-700">2.87%</span>' +
              '</div>' +
              '<div class="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-150">' +
                '<span class="text-[11px] font-medium text-slate-500">LÍMITE ISR ANUAL</span>' +
                '<span class="text-xs font-bold text-slate-700">$416,220 RD</span>' +
              '</div>' +
            '</div>' +
            '<div class="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-left">' +
              '<span class="text-[10px] font-bold uppercase tracking-widest text-[#6366F1] flex items-center gap-1">' +
                '<i data-lucide="sparkles" class="w-3.5 h-3.5 animate-pulse"></i> Próximas Características' +
              '</span>' +
              '<p class="text-[11px] text-slate-500 mt-1.5 leading-relaxed">Integración directa con el Sistema Dominicano de Seguridad Social para cálculo automatizado de TSS e Infotep.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    refreshIcons();
  }

  /* =======================================================================
     TRAINING — Capacitación y Desarrollo (3 tarjetas blueprint)
     Nota: el TSX NO consume CAPACITACIONES_CURSOS en esta variante; muestra
     tarjetas estáticas (Asignar Cursos / Gestión de Mentores / Próximo
     Entrenamiento). Se reproduce fielmente.
     ======================================================================= */
  function renderTraining(container) {
    container.innerHTML =
      '<div class="space-y-6 animate-fade-in text-left">' +
        '<div class="flex items-center gap-2 mb-1">' +
          '<h1 class="text-2xl font-bold text-[#0F172A] tracking-tight">Capacitación y Desarrollo</h1>' +
          '<span class="text-[10px] uppercase font-bold px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-lg flex items-center gap-1.5 leading-none shadow-sm select-none">' +
            '<i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Próxima versión' +
          '</span>' +
        '</div>' +
        '<p class="text-sm text-[#45474c]">Cursos corporativos, asignación de certificaciones y seguimiento de habilidades técnicas.</p>' +

        '<div class="grid grid-cols-1 md:grid-cols-3 gap-6">' +
          '<div class="bg-white border border-slate-200 p-5 rounded-xl text-left">' +
            '<h3 class="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-2">' +
              '<i data-lucide="bookmark-check" class="w-4 h-4 text-emerald-500 animate-pulse"></i>' +
              '<span>Asignar Cursos</span>' +
            '</h3>' +
            '<p class="text-xs text-slate-400 leading-relaxed mb-4">Cree itinerarios de capacitación para nuevos ingresos o ascensos laborales.</p>' +
            '<button class="text-xs text-[#6366F1] font-bold hover:underline" disabled>Planificar asignaciones »</button>' +
          '</div>' +

          '<div class="bg-white border border-slate-200 p-5 rounded-xl text-left">' +
            '<h3 class="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-2">' +
              '<i data-lucide="user-check-2" class="w-4 h-4 text-[#6366F1]"></i>' +
              '<span>Gestión de Mentores</span>' +
            '</h3>' +
            '<p class="text-xs text-slate-400 leading-relaxed mb-4">Lleve el control de asesores y expertos sénior que guían a nuevos integrantes.</p>' +
            '<button class="text-xs text-[#6366F1] font-bold hover:underline" disabled>Ver padrón de mentores »</button>' +
          '</div>' +

          '<div class="bg-white border-slate-200 border-2 border-dashed p-5 rounded-xl flex flex-col justify-between text-left">' +
            '<div>' +
              '<span class="text-[10px] font-bold uppercase tracking-widest text-[#6366F1]">Próximo Entrenamiento</span>' +
              '<h4 class="text-sm font-extrabold text-slate-800 mt-1 leading-snug">Dominican Tax Regulations 2026</h4>' +
              '<p class="text-[11px] text-slate-400 mt-1">Conferencista invitado de la DGII. Oct 28 - Obligatorio Administración.</p>' +
            '</div>' +
            '<button class="mt-4 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded text-center text-xs font-bold text-slate-600 cursor-not-allowed">Asistentes Inscritos (8)</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    refreshIcons();
  }

  /* =======================================================================
     EVALUATIONS — Evaluaciones de Desempeño (EVALUACIONES_CONSENSO + matriz)
     ======================================================================= */
  function renderEvaluations(container) {
    var evalRows = data.EVALUACIONES_CONSENSO.map(function (ev) {
      return '' +
        '<tr class="hover:bg-slate-50/50 transition-colors">' +
          '<td class="p-4 font-bold text-slate-800">' + escapeHtml(ev.empleado) + '</td>' +
          '<td class="p-4 text-slate-500">' + escapeHtml(ev.depto) + '</td>' +
          '<td class="p-4">' +
            '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-indigo-50 text-[#6366F1] border border-indigo-100">' +
              escapeHtml(ev.calificacion) +
            '</span>' +
          '</td>' +
          '<td class="p-4 text-slate-450 text-slate-400 font-sans">' + escapeHtml(ev.periodo) + '</td>' +
        '</tr>';
    }).join('');

    container.innerHTML =
      '<div class="space-y-6 animate-fade-in text-left">' +
        '<div class="flex items-center gap-2 mb-1">' +
          '<h1 class="text-2xl font-bold text-[#0F172A] tracking-tight">Evaluaciones de Desempeño</h1>' +
          '<span class="text-[10px] uppercase font-bold px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-lg flex items-center gap-1.5 leading-none shadow-sm select-none">' +
            '<i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Próxima versión' +
          '</span>' +
        '</div>' +
        '<p class="text-sm text-[#45474c]">Definición de metas, KPI\'s técnicos y retroalimentación interactiva del personal.</p>' +

        '<div class="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">' +
          '<div class="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">' +
            '<div class="p-4 border-b border-slate-100 bg-slate-50/50">' +
              '<span class="text-xs font-bold text-slate-850">Evaluaciones bajo Consenso Técnico</span>' +
            '</div>' +
            '<div class="overflow-x-auto">' +
              '<table class="w-full text-left border-collapse">' +
                '<thead>' +
                  '<tr class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">' +
                    '<th class="p-4">Colaborador Evaluado</th>' +
                    '<th class="p-4">Departamento</th>' +
                    '<th class="p-4">Calificación de Desempeño</th>' +
                    '<th class="p-4">Periodo de Análisis</th>' +
                  '</tr>' +
                '</thead>' +
                '<tbody class="divide-y divide-slate-100 text-xs font-semibold text-slate-600">' + evalRows + '</tbody>' +
              '</table>' +
            '</div>' +
          '</div>' +

          '<div class="bg-white border border-slate-250 p-5 rounded-xl space-y-4">' +
            '<div class="space-y-1 text-left">' +
              '<span class="text-[10px] font-bold uppercase tracking-widest text-[#6366F1] flex items-center gap-1">' +
                '<i data-lucide="bar-chart-3" class="w-4 h-4"></i> Matriz de Calidad' +
              '</span>' +
              '<h4 class="text-sm font-bold text-slate-800">Criterio de Evaluación</h4>' +
              '<p class="text-[11px] text-slate-400 leading-relaxed">Las evaluaciones se rigen bajo el algoritmo de evaluación 360% (Autoevaluación, Colegas, Jefe directo).</p>' +
            '</div>' +
            '<div class="space-y-2 font-semibold text-xs text-slate-700">' +
              '<div class="bg-slate-55/40 bg-slate-50 p-2 border border-slate-150 rounded">90% - 100%: Sobresaliente Excepcional</div>' +
              '<div class="bg-slate-55/40 bg-slate-50 p-2 border border-slate-150 rounded">80% - 89%: Favorable Esperado</div>' +
              '<div class="bg-slate-55/40 bg-slate-50 p-2 border border-slate-150 rounded">Menos de 79%: Plan de Capacitación Requerido</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    refreshIcons();
  }

  /* =======================================================================
     SETTINGS — Configuración global del sistema
     ======================================================================= */
  function renderSettings(container) {
    container.innerHTML =
      '<div class="space-y-6 animate-fade-in text-left">' +
        '<div class="flex items-center gap-2 mb-1">' +
          '<h1 class="text-2xl font-bold text-[#0F172A] tracking-tight">Configuración global del sistema</h1>' +
          '<span class="text-[10px] uppercase font-bold px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-lg flex items-center gap-1.5 leading-none shadow-sm select-none">' +
            '<i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Próxima versión' +
          '</span>' +
        '</div>' +
        '<p class="text-sm text-[#45474c]">Configuraciones políticas del SIGRH, roles directivos de RRHH y respaldos.</p>' +

        '<div class="grid grid-cols-1 md:grid-cols-2 gap-6">' +
          '<div class="bg-white p-6 rounded-xl border border-slate-200 text-left space-y-4">' +
            '<h3 class="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">' +
              '<i data-lucide="settings" class="w-4 h-4 text-slate-500"></i>' +
              '<span>Canales de Comunicación</span>' +
            '</h3>' +
            '<div class="space-y-3">' +
              '<label class="flex items-center gap-3.5 cursor-pointer">' +
                '<input type="checkbox" checked disabled class="rounded border-slate-300 text-[#6366F1] focus:ring-[#6366F1]" />' +
                '<div class="flex flex-col">' +
                  '<span class="text-xs font-bold text-slate-700">Notificar aprobaciones por Email</span>' +
                  '<span class="text-[10px] text-slate-400">Envío instantáneo de folios firmados al colaborador.</span>' +
                '</div>' +
              '</label>' +
              '<label class="flex items-center gap-3.5 cursor-pointer">' +
                '<input type="checkbox" checked disabled class="rounded border-slate-300 text-[#6366F1] focus:ring-[#6366F1]" />' +
                '<div class="flex flex-col">' +
                  '<span class="text-xs font-bold text-slate-700">Respaldos diarios en la nube</span>' +
                  '<span class="text-[10px] text-slate-400">Exportación automática de bitácora de asistencia a las 11:59 PM.</span>' +
                '</div>' +
              '</label>' +
            '</div>' +
          '</div>' +

          '<div class="bg-white p-6 rounded-xl border border-slate-200 text-left space-y-4">' +
            '<h3 class="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">' +
              '<i data-lucide="users" class="w-4 h-4 text-slate-500"></i>' +
              '<span>Políticas de Asistencia</span>' +
            '</h3>' +
            '<div class="space-y-4 text-xs font-semibold text-slate-600">' +
              '<div class="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-150">' +
                '<span>Horario Laboral Estándar</span>' +
                '<span class="font-mono font-bold text-slate-700">09:00 AM - 06:00 PM</span>' +
              '</div>' +
              '<div class="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-150">' +
                '<span>Tolerancia de retraso</span>' +
                '<span class="font-mono font-bold text-slate-700">15 Minutos</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    refreshIcons();
  }

  /* ------------------------------ Dispatcher ----------------------------- */
  ShiftAI.renderFutureModule = function (moduleId, container) {
    if (!container) return;
    switch (moduleId) {
      case 'employees':   return renderEmployees(container);
      case 'payroll':     return renderPayroll(container);
      case 'training':    return renderTraining(container);
      case 'evaluations': return renderEvaluations(container);
      case 'settings':    return renderSettings(container);
      default:
        container.innerHTML =
          '<div class="py-20 text-center flex flex-col items-center justify-center space-y-4 animate-fade-in text-left">' +
            '<i data-lucide="compass" class="w-16 h-16 text-slate-300 animate-spin-slow"></i>' +
            '<h2 class="text-base font-bold text-slate-800">Módulo en Desarrollo</h2>' +
            '<p class="text-xs text-slate-400 max-w-sm">Este panel está configurado dentro del routing del SIGRH y listo para recibir futuras expansiones.</p>' +
          '</div>';
        refreshIcons();
    }
  };
})();