/* ============================================================================
   ShiftAI — Evaluaciones de Desempeño (vanilla JS)
   Migración de FutureModulesView.tsx (variante 'evaluations').
   Delega el render en shared/future-module.js.
   ========================================================================== */
(function () {
  'use strict';

  var ShiftAI = window.ShiftAI;
  var moduleId = document.body.dataset.module; // 'evaluations'
  var mount = document.getElementById('future-module-mount');

  function render() {
    if (mount) ShiftAI.renderFutureModule(moduleId, mount);
  }

  ShiftAI.onSearch(function () { render(); });
  ShiftAI.onDataChange(function () { render(); });

  document.addEventListener('DOMContentLoaded', render);
  if (document.readyState !== 'loading') render();
})();