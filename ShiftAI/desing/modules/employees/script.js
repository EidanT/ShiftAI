/* ============================================================================
   ShiftAI — Plantilla de Empleados (vanilla JS)
   Migración de FutureModulesView.tsx (variante 'employees') + handleAgregarColaborador
   Delega el render en shared/future-module.js.
   ========================================================================== */
(function () {
  'use strict';

  var ShiftAI = window.ShiftAI;
  var moduleId = document.body.dataset.module; // 'employees'
  var mount = document.getElementById('future-module-mount');

  function render() {
    if (mount) ShiftAI.renderFutureModule(moduleId, mount);
  }

  // Re-render cuando cambia la búsqueda global del header (filtra empleados)
  ShiftAI.onSearch(function () { render(); });

  // Re-render cuando el modal global muta datos
  ShiftAI.onDataChange(function () { render(); });

  document.addEventListener('DOMContentLoaded', render);
  if (document.readyState !== 'loading') render();
})();