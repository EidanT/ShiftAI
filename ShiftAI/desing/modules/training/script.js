/* ============================================================================
   ShiftAI — Capacitación y Desarrollo (vanilla JS)
   Migración de FutureModulesView.tsx (variante 'training').
   Delega el render en shared/future-module.js.
   ========================================================================== */
(function () {
  'use strict';

  var ShiftAI = window.ShiftAI;
  var moduleId = document.body.dataset.module; // 'training'
  var mount = document.getElementById('future-module-mount');

  function render() {
    if (mount) ShiftAI.renderFutureModule(moduleId, mount);
  }

  ShiftAI.onSearch(function () { render(); });
  ShiftAI.onDataChange(function () { render(); });

  document.addEventListener('DOMContentLoaded', render);
  if (document.readyState !== 'loading') render();
})();