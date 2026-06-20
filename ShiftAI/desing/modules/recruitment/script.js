/* ============================================================================
   ShiftAI — Reclutamiento y Selección (vanilla JS)
   Migración de ShiftAI/src/modules/hiring/RecruitmentView.tsx
   Estado interno propio (vacantes, candidatos, entrevistas) como variables.
   ========================================================================== */
(function () {
  'use strict';

  var ShiftAI = window.ShiftAI;
  var toast = ShiftAI.toast.bind(ShiftAI);

  /* ----------------------------- Estado interno ----------------------------- */
  // Datos semilla del componente TSX (no usan REQUISITOS_VACANTES ni
  // CONTRATOS_RECIENTES de data.js — el componente gestiona su propio estado).
  var vacantes = [
    {
      id: 'VAC-101',
      titulo: 'Analista de Recursos Humanos',
      departamento: 'Gestion Humana',
      requisitos: 'Licenciatura en Psicologia, 2 anos de experiencia, manejo de entrevistas.',
      responsabilidades: 'Publicar vacantes, filtrar candidatos y coordinar entrevistas.',
      estado: 'Abierta'
    },
    {
      id: 'VAC-102',
      titulo: 'Soporte Tecnico Junior',
      departamento: 'Tecnologia',
      requisitos: 'Conocimientos basicos de redes, soporte a usuarios y documentacion.',
      responsabilidades: 'Atender tickets, registrar incidencias y escalar casos tecnicos.',
      estado: 'En evaluacion'
    }
  ];

  var candidatos = [
    {
      id: 'CAN-001',
      nombre: 'Laura Mendez',
      vacanteId: 'VAC-101',
      experiencia: '3 anos',
      estado: 'En evaluacion',
      resultadoEntrevista: 'Pendiente'
    },
    {
      id: 'CAN-002',
      nombre: 'Carlos Rivera',
      vacanteId: 'VAC-102',
      experiencia: '1 ano',
      estado: 'Aprobado',
      resultadoEntrevista: 'Entrevista tecnica aprobada'
    },
    {
      id: 'CAN-003',
      nombre: 'Ana Torres',
      vacanteId: 'VAC-101',
      experiencia: '4 anos',
      estado: 'Contratado',
      resultadoEntrevista: 'Seleccionada para contratacion'
    }
  ];

  // Estado de UI heredado del TSX
  var candVacanteId = 'VAC-101';
  var selectedCandidateId = null;
  var isUpdating = false;

  /* --------------------------------- Utils --------------------------------- */
  function $(id) { return document.getElementById(id); }
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function refreshIcons() { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons(); }

  /* ------------------------------ Métricas --------------------------------- */
  function renderMetricas() {
    var totalVacantes = vacantes.length;
    var totalCandidatos = candidatos.length;
    var totalEntrevistas = candidatos.filter(function (c) {
      return c.estado === 'En evaluacion' || c.estado === 'Aprobado';
    }).length;
    var totalContratados = candidatos.filter(function (c) { return c.estado === 'Contratado'; }).length;

    var map = {
      vacantes: totalVacantes,
      candidatos: totalCandidatos,
      entrevistas: totalEntrevistas,
      contratados: totalContratados
    };
    Object.keys(map).forEach(function (k) {
      var el = document.querySelector('[data-metric="' + k + '"]');
      if (el) el.textContent = map[k];
    });
  }

  /* ------------------------- Listado de vacantes --------------------------- */
  function estadoVacanteBadge(estado) {
    var cls = estado === 'Abierta'
      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
      : estado === 'En evaluacion'
      ? 'bg-cyan-50 text-cyan-600 border border-cyan-200'
      : 'bg-slate-100 text-slate-400 border border-slate-250';
    var label = estado === 'En evaluacion' ? 'En evaluacion' : estado;
    return '<span class="px-2.5 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider ' + cls + '">' + escapeHtml(label) + '</span>';
  }

  function renderVacantes() {
    var container = $('vacantes-list');
    if (!container) return;

    if (vacantes.length === 0) {
      container.innerHTML =
        '<div class="text-center py-8 text-slate-400">' +
          '<i data-lucide="briefcase" class="w-8 h-8 mx-auto mb-1 opacity-40"></i>' +
          'No hay vacantes registradas en el sistema.' +
        '</div>';
      refreshIcons();
      return;
    }

    container.innerHTML = vacantes.map(function (vac) {
      return '' +
        '<div class="vacante-card border border-slate-200/90 rounded-xl p-4 hover:border-slate-350 bg-slate-50/20 hover:bg-slate-50/50 transition-all text-xs">' +
          '<div class="flex items-start justify-between">' +
            '<div class="text-left">' +
              '<h3 class="text-sm font-bold text-slate-800">' + escapeHtml(vac.titulo) + '</h3>' +
              '<span class="text-[11px] text-slate-400 font-semibold inline-block mt-0.5">' + escapeHtml(vac.departamento) + '</span>' +
            '</div>' +
            estadoVacanteBadge(vac.estado) +
          '</div>' +
          '<div class="mt-3.5 space-y-2 text-left text-slate-700 border-t border-slate-100 pt-2.5">' +
            '<p class="leading-relaxed"><strong class="text-slate-500 font-bold">Requisitos:</strong> ' + escapeHtml(vac.requisitos) + '</p>' +
            '<p class="leading-relaxed"><strong class="text-slate-500 font-bold">Responsabilidades:</strong> ' + escapeHtml(vac.responsabilidades) + '</p>' +
          '</div>' +
        '</div>';
    }).join('');
    refreshIcons();
  }

  /* --------------------------- Options del select -------------------------- */
  function renderVacanteOptions() {
    var select = $('cand-vacante');
    if (!select) return;
    var current = candVacanteId;
    select.innerHTML = '<option value="" disabled>Seleccionar vacante</option>' +
      vacantes.map(function (v) {
        return '<option value="' + escapeHtml(v.id) + '"' + (v.id === current ? ' selected' : '') + '>' + escapeHtml(v.titulo) + '</option>';
      }).join('');
  }

  /* --------------------------- Tabla candidatos ---------------------------- */
  function estadoCandidatoSelect(estado) {
    var opts = ['En evaluacion', 'Aprobado', 'Contratado', 'Rechazado'];
    var cls = estado === 'Contratado'
      ? 'text-emerald-600 border-emerald-300 font-black bg-emerald-50/30'
      : estado === 'Aprobado'
      ? 'text-[#113B7A] border-[#113B7A]/40 bg-indigo-50/20'
      : estado === 'Rechazado'
      ? 'text-rose-500 border-rose-300 bg-rose-50/20'
      : 'text-amber-600 border-amber-300';
    var optionsHtml = opts.map(function (o) {
      return '<option value="' + o + '"' + (o === estado ? ' selected' : '') + '>' + o + '</option>';
    }).join('');
    return '<select class="estado-select bg-white border border-[#CBD5E1] rounded-lg p-1.5 pr-6 text-xs font-bold text-slate-700 focus:outline-none text-[11px] select-style cursor-pointer ' + cls + '">' + optionsHtml + '</select>';
  }

  function renderCandidatos() {
    var body = $('candidatos-body');
    if (!body) return;

    if (candidatos.length === 0) {
      body.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-400">No hay candidatos postulados actualmente.</td></tr>';
      return;
    }

    body.innerHTML = candidatos.map(function (c) {
      var associatedVac = vacantes.find(function (v) { return v.id === c.vacanteId; });
      var vacTitle = associatedVac ? associatedVac.titulo : 'Vacante de selección';
      var selectedCls = selectedCandidateId === c.id ? ' selected-row' : '';

      return '' +
        '<tr class="hover:bg-slate-50/50 transition-colors group' + selectedCls + '" data-cand-id="' + escapeHtml(c.id) + '">' +
          '<td class="py-3.5 px-4 pl-1">' +
            '<span class="font-bold text-slate-800 text-[13px]">' + escapeHtml(c.nombre) + '</span>' +
            '<span class="text-[10px] text-slate-400 block mt-0.5 uppercase tracking-wider">' + escapeHtml(c.id) + '</span>' +
          '</td>' +
          '<td class="py-3.5 px-4 font-bold text-slate-700">' + escapeHtml(vacTitle) + '</td>' +
          '<td class="py-3.5 px-4 text-slate-500 font-medium">' + escapeHtml(c.experiencia) + '</td>' +
          '<td class="py-3.5 px-4">' + estadoCandidatoSelect(c.estado) + '</td>' +
          '<td class="py-3.5 px-4 text-slate-500 italic max-w-[200px] truncate" title="' + escapeHtml(c.resultadoEntrevista) + '">' +
            escapeHtml(c.resultadoEntrevista) +
          '</td>' +
          '<td class="py-3.5 px-4 text-right pr-6">' +
            '<button class="btn-seleccionar text-[#113B7A] hover:text-[#1E3A8A] font-bold text-xs hover:underline decoration-solid">Seleccionar</button>' +
          '</td>' +
        '</tr>';
    }).join('');

    // Listeners por fila: select de estado + botón Seleccionar
    body.querySelectorAll('tr[data-cand-id]').forEach(function (tr) {
      var id = tr.getAttribute('data-cand-id');
      var sel = tr.querySelector('.estado-select');
      if (sel) {
        sel.addEventListener('change', function () { handleCambiarEstado(id, sel.value); });
      }
      var btn = tr.querySelector('.btn-seleccionar');
      if (btn) {
        btn.addEventListener('click', function () {
          var cand = candidatos.find(function (c) { return c.id === id; });
          if (cand) handleSeleccionarCandidato(cand);
        });
      }
    });
  }

  /* ------------------------------- Handlers -------------------------------- */
  // Guardar candidato (submit del formulario)
  function handleGuardarCandidato(e) {
    e.preventDefault();
    var nombreEl = $('cand-nombre');
    var experienciaEl = $('cand-experiencia');
    var observacionesEl = $('cand-observaciones');
    var vacanteEl = $('cand-vacante');

    var nombre = nombreEl.value.trim();
    if (!nombre) {
      toast('Nombre requerido', 'El nombre completo del candidato es obligatorio.', 'error');
      return;
    }

    var vacId = vacanteEl.value || candVacanteId;
    var matchedVacante = vacantes.find(function (v) { return v.id === vacId; });
    var vacName = matchedVacante ? matchedVacante.titulo : 'Vacante Desconocida';

    var nuevo = {
      id: 'CAN-0' + (Math.floor(Math.random() * 900) + 100),
      nombre: nombreEl.value,
      vacanteId: vacId,
      experiencia: experienciaEl.value || 'Sin especificar',
      estado: 'En evaluacion',
      resultadoEntrevista: observacionesEl.value.trim() || 'Pendiente'
    };

    candidatos.unshift(nuevo);
    toast('Candidato Registrado', 'Ficha cargada con éxito para la vacante "' + vacName + '".', 'success');

    // Reset inputs
    nombreEl.value = '';
    experienciaEl.value = '';
    observacionesEl.value = '';
    // Mantener candVacanteId coherente con el select
    candVacanteId = vacId;
    selectedCandidateId = null;

    renderAll();
  }

  // Cambiar estado de un candidato
  function handleCambiarEstado(id, nuevoEstado) {
    var cand = candidatos.find(function (c) { return c.id === id; });
    if (!cand) return;
    var oldState = cand.estado;

    if (nuevoEstado === 'Contratado') {
      cand.resultadoEntrevista = 'Seleccionada para contratacion';
    } else if (nuevoEstado === 'Aprobado') {
      cand.resultadoEntrevista = 'Entrevista aprobada';
    } else if (nuevoEstado === 'Rechazado') {
      cand.resultadoEntrevista = 'No califica para la posicion';
    } else {
      cand.resultadoEntrevista = 'Pendiente evaluacion posterior';
    }
    cand.estado = nuevoEstado;

    toast('Estatus Actualizado', cand.nombre + ' cambió de "' + oldState + '" a "' + nuevoEstado + '".', 'success');
    renderAll();
  }

  // Cargar candidato en el formulario
  function handleSeleccionarCandidato(c) {
    selectedCandidateId = c.id;
    $('cand-nombre').value = c.nombre;
    candVacanteId = c.vacanteId;
    $('cand-vacante').value = c.vacanteId;
    $('cand-experiencia').value = c.experiencia;
    $('cand-observaciones').value = c.resultadoEntrevista !== 'Pendiente' ? c.resultadoEntrevista : '';
    toast('Candidato seleccionado', 'Se cargó la información de ' + c.nombre + ' en el formulario de registro.', 'info');
    renderCandidatos();
  }

  // Actualizar datos (simula sincronización)
  function handleActualizarDatos() {
    if (isUpdating) return;
    isUpdating = true;
    var icon = $('icon-actualizar');
    if (icon) icon.classList.add('animate-spin');
    setTimeout(function () {
      isUpdating = false;
      if (icon) icon.classList.remove('animate-spin');
      toast('Planilla de Selección Sincronizada', 'Base de datos de reclutamiento refrescada correctamente.', 'info');
    }, 800);
  }

  /* ------------------------------ Modal vacante ---------------------------- */
  function openVacanteModal() {
    // Reset por defecto del TSX al abrir desde "Registrar" del listado
    $('vac-depto').value = 'Gestion Humana';
    var modal = $('vacante-modal');
    if (modal) modal.classList.remove('hidden');
    refreshIcons();
  }

  function closeVacanteModal() {
    var modal = $('vacante-modal');
    if (modal) modal.classList.add('hidden');
    // Limpiar formulario
    $('form-vacante').reset();
    // Reset radio a Abierta
    var abiertaRadio = document.querySelector('input[name="vacStateRadio"][value="Abierta"]');
    if (abiertaRadio) abiertaRadio.checked = true;
  }

  function handleGuardarVacante(e) {
    e.preventDefault();
    var titulo = $('vac-titulo').value.trim();
    if (!titulo) {
      toast('Título requerido', 'Por favor complete el nombre de la posición.', 'error');
      return;
    }
    var depto = $('vac-depto').value;
    var reqs = $('vac-reqs').value || 'Licenciatura o carrera técnica afín.';
    var resps = $('vac-resps').value || 'Tareas operativas y colaboración del puesto.';
    var estadoRadio = document.querySelector('input[name="vacStateRadio"]:checked');
    var estado = estadoRadio ? estadoRadio.value : 'Abierta';

    var nuevaVac = {
      id: 'VAC-' + (Math.floor(Math.random() * 900) + 100),
      titulo: titulo,
      departamento: depto,
      requisitos: reqs,
      responsabilidades: resps,
      estado: estado
    };
    vacantes.push(nuevaVac);
    toast('Nueva Vacante Publicada', 'Se registró la posición "' + titulo + '" correctamente.', 'success');

    closeVacanteModal();
    renderAll();
  }

  /* --------------------------------- Render -------------------------------- */
  function renderAll() {
    renderMetricas();
    renderVacantes();
    renderVacanteOptions();
    renderCandidatos();
  }

  /* --------------------------------- Boot ---------------------------------- */
  function bind() {
    // Form candidato
    var fc = $('form-candidato');
    if (fc) fc.addEventListener('submit', handleGuardarCandidato);

    // Select de vacante del formulario de candidato (mantiene candVacanteId)
    var cv = $('cand-vacante');
    if (cv) cv.addEventListener('change', function () { candVacanteId = cv.value; });

    // Botones abrir modal
    var bn = $('btn-nueva-vacante');
    if (bn) bn.addEventListener('click', openVacanteModal);
    var br = $('btn-registrar-vacante');
    if (br) br.addEventListener('click', openVacanteModal);

    // Botones cerrar modal
    var bx = $('btn-cerrar-modal');
    if (bx) bx.addEventListener('click', closeVacanteModal);
    var bc = $('btn-cancelar-modal');
    if (bc) bc.addEventListener('click', closeVacanteModal);

    // Click fuera del modal → cerrar
    var modal = $('vacante-modal');
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeVacanteModal();
      });
    }

    // Submit modal
    var fv = $('form-vacante');
    if (fv) fv.addEventListener('submit', handleGuardarVacante);

    // Actualizar datos
    var ba = $('btn-actualizar-datos');
    if (ba) ba.addEventListener('click', handleActualizarDatos);
  }

  function boot() {
    bind();
    renderAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();