# ShiftAI — Diseño de pantallas (HTML/CSS/JS estático)

Migración del frontend React de `../ShiftAI/` a pantallas HTML/CSS/JavaScript
estáticas (sin build, sin framework). Cada pantalla reproduce fielmente el
diseño y comportamiento del módulo original.

## Cómo verlo

Abre `index.html` en el navegador (o sirve la carpeta con cualquier servidor
estático). Desde ahí se enlazan las 10 pantallas, o abre directamente cualquiera
en `modules/<modulo>/index.html`.

> Requiere conexión a internet: Tailwind y los iconos se cargan por CDN.

## Estructura

```
desing/
├── index.html                  ← Landing con enlaces a todas las pantallas
├── README.md
├── shared/                     ← Base compartida (no es una pantalla)
│   ├── shell.css               ← Layout (sidebar/header/main), fuentes, animaciones
│   ├── shell.js                ← Inyecta sidebar + header + modal global + toasts
│   ├── data.js                 ← Datos (migración de ShiftAI/src/data.ts)
│   ├── future-module.js        ← Render de los 5 módulos "futuros"
│   └── CONVENTIONS.md          ← Plantilla y reglas de conversión JSX→HTML
└── modules/                    ← Una carpeta por pantalla
    ├── dashboard/              ← index.html + style.css + script.js
    ├── employees/
    ├── attendance/
    ├── vacations/              ← Licencias y Vacaciones (LicensesView)
    ├── history/
    ├── payroll/
    ├── recruitment/
    ├── training/
    ├── evaluations/
    └── settings/
```

Cada modulo tiene su css y html.

Cada pantalla es **autónoma**: `modules/<id>/index.html` carga Tailwind v4 por
CDN, la base compartida (`shared/`) y sus propios `style.css` + `script.js`.



## Stack

- **Tailwind CSS v4** vía `@tailwindcss/browser@4` (CDN) — mismas clases que el
  proyecto React.
- **lucide** (CDN) — iconos como `<i data-lucide="...">`.
- **JavaScript vanilla** — sin React, sin motion, sin Vite.

## API compartida (`window.ShiftAI`)

Las pantallas consumen la base a través de `window.ShiftAI`:

| Miembro | Descripción |
|---|---|
| `ShiftAI.data` | Datos compartidos (`EMPLEADOS`, `ASISTENCIAS`, `LICENCIAS`, …) |
| `ShiftAI.busqueda` | Texto actual del buscador del header |
| `ShiftAI.toast(text, sub?, type?)` | Notificación flotante (`success`/`info`/`error`) |
| `ShiftAI.openManualModal('attendance' \| 'leave')` | Abre el modal global de registro |
| `ShiftAI.onSearch(fn)` | Callback al cambiar el buscador del header |
| `ShiftAI.onDataChange(fn)` | Callback cuando el modal muta los datos |

El sidebar y el header **no** se escriben en cada página: los inyecta
`shared/shell.js` a partir de `<body data-module="<id>">`. La página solo aporta
el contenido del `<main>`.

## Origen (mapeo React → HTML)

| Pantalla | Origen React |
|---|---|
| dashboard | `ShiftAI/src/modules/dashboard/DashboardView.tsx` |
| attendance | `ShiftAI/src/modules/attendance/AttendanceView.tsx` |
| vacations | `ShiftAI/src/modules/licenses/LicensesView.tsx` |
| history | `ShiftAI/src/modules/history/HistoryQueriesView.tsx` |
| recruitment | `ShiftAI/src/modules/hiring/RecruitmentView.tsx` |
| employees, payroll, training, evaluations, settings | `ShiftAI/src/components/FutureModulesView.tsx` |
| sidebar / header / modal / toasts | `ShiftAI/src/App.tsx` + `components/Sidebar.tsx` + `components/Header.tsx` |
| datos | `ShiftAI/src/data.ts` |