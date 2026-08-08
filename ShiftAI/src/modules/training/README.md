# Capacitaciones

Frontend del módulo 5. Consume exclusivamente la API del backend bajo
`/api/v1/training`; los datos no están simulados dentro de la vista.

## Funciones

- Registro y activación de cursos.
- Creación y activación de programas con múltiples cursos.
- Asignación de capacitaciones a empleados.
- Seguimiento de participación, progreso, resultado y observaciones.
- Historial individual por empleado.
- Indicadores de cumplimiento, pendientes y vencimientos.
- Reporte descargable en CSV.

## Ejecución local

El frontend usa `VITE_API_URL`, con valor predeterminado
`http://localhost:3000/api/v1`. El backend debe estar iniciado antes de abrir
esta vista.

Para trabajar sin autenticacion ni credenciales de Supabase, copia el ejemplo
de configuracion antes de iniciar Vite:

```powershell
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm install
npm run dev
```

En macOS o Linux, el comando equivalente es `cp .env.example .env.local`.
El archivo `.env.local` es privado y no debe subirse al repositorio.
Si PowerShell bloquea el comando `npm`, utiliza `npm.cmd install` y
`npm.cmd run dev`.
