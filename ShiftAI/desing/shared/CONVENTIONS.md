# ShiftAI — Convenciones de migración (HTML/CSS/JS estático)

Cada pantalla del proyecto React `ShiftAI/` se migra a una carpeta
`desing/modules/<id>/` con tres archivos:

```
modules/<id>/index.html   ← estructura (HTML, clases Tailwind tal cual el TSX)
modules/<id>/style.css    ← estilos extra del módulo (animaciones/picos puntuales)
modules/<id>/script.js    ← lógica vanilla (render de listas, botones, etc.)
```

## Plantilla obligatoria de `index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><Título> — ShiftAI Design</title>
  <!-- Tailwind v4 (runtime browser) + iconos lucide -->
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="stylesheet" href="../../shared/shell.css">
  <link rel="stylesheet" href="style.css">
  <style type="text/tailwindcss">
    @import "tailwindcss";
    @theme {
      --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
      --font-display: "Space Grotesk", sans-serif;
    }
  </style>
</head>
<body data-module="<id>" class="bg-[#F8FAFC]">
  <div id="app-layout">
    <div id="sidebar-mount"></div>
    <div id="header-mount"></div>
    <main id="main" class="flex-1 p-6 relative">
      <!-- AQUÍ el contenido del módulo (el JSX del *View.tsx convertido a HTML) -->
    </main>
  </div>
  <script src="../../shared/data.js"></script>
  <script src="../../shared/shell.js"></script>
  <script src="script.js"></script>
</body>
</html>
```

`<id>` debe coincidir con uno de los módulos del sidebar (ver `shell.js`):
`dashboard, employees, attendance, vacations, history, payroll, recruitment,
training, evaluations, settings`.

## Reglas de conversión JSX → HTML

1. **Clases Tailwind**: se copian literal. El CDN v4 las procesa igual que en
   el proyecto React (incluye `text-[10.5px]`, `bg-white/10`, `shadow-sm`,
   `backdrop-blur-xs`, valores dinámicos, etc.).
2. **Iconos `lucide-react`**: se reemplazan por `<i data-lucide="<kebab>"></i>`.
   Ej. `<CheckCircle className="w-5 h-5" />` →
   `<i data-lucide="check-circle" class="w-5 h-5"></i>`. Mover `className` → `class`.
3. **Íconos inyectados dinámicamente** (los que genera `script.js`): después de
   insertarlos en el DOM llamar `window.lucide.createIcons()`.
4. **`className`** → `class`. **`htmlFor`** → `for`. **`strokeLinecap`** etc. en
   SVG inline se mantienen.
5. **Expresiones `{cond ? a : b}`**: resolver a static HTML o generar desde JS.
   Preferir generar listas/tarjetas desde `script.js` con los datos de
   `window.ShiftAI.data`.
6. **Atributos de evento `onClick`**: mover a `script.js` con
   `addEventListener` (o `id` + querySelector).
7. **Comentarios JSX `{/* ... */}`**: eliminar o pasar a `<!-- ... -->`.

## API de `window.ShiftAI` (provee `shared/shell.js`)

```js
ShiftAI.data                  // { EMPLEADOS, ASISTENCIAS, LICENCIAS, ... } (mutable)
ShiftAI.busqueda              // string actual del buscador del header
ShiftAI.toast(text, sub?, type?)   // type: 'success' | 'info' | 'error'
ShiftAI.openManualModal('attendance' | 'leave')
ShiftAI.onSearch(fn)          // fn(busqueda) cuando cambia el input del header
ShiftAI.onDataChange(fn)      // fn() cuando el modal global muta los datos
```

Patrón típico de `script.js`:

```js
(function () {
  var data = window.ShiftAI.data;

  function empleadoPorId(id) { return data.EMPLEADOS.find(function (e) { return e.id === id; }); }

  function render() {
    // construir HTML de listas/tarjetas y asignar a contenedores
    window.lucide.createIcons();
  }

  window.ShiftAI.onSearch(function (q) { /* filtrar y re-render */ render(); });
  window.ShiftAI.onDataChange(function () { render(); });

  document.addEventListener('DOMContentLoaded', render);
  if (document.readyState !== 'loading') render();
})();
```

## Notas

- Los datos viven en `shared/data.js`; las pantallas los leen y pueden mutarlos
  en memoria (no hay persistencia: es diseño estático).
- El sidebar y el header NO se dibujan en la página: los inyecta `shell.js` a
  partir de `body[data-module]`. La página solo aporta el `<main>`.
- El modal global de "Registro Administrativo Especial" y los toasts también los
  gestiona `shell.js`; las pantallas solo los disparan con la API.