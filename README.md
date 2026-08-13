# ShiftAI

## Capacitaciones en modo local

El modulo de Capacitaciones puede ejecutarse de extremo a extremo sin acceder
a Supabase. El frontend consume la API real del backend y el backend persiste
los cambios en un archivo JSON local.

Los datos iniciales forman parte del codigo fuente. Al iniciar el backend por
primera vez se crea automaticamente `server/.local-data/training.json`. Este
archivo esta ignorado por Git para que las pruebas de una persona no generen
conflictos con las de los demas.

### Requisitos

- Git.
- Node.js `20.19` o superior. Se recomienda Node.js `22.12` o superior.
- Dos terminales: una para el backend y otra para el frontend.

Las dependencias del frontend y del backend se instalan por separado. No es
necesario ejecutar `npm install` en la raiz del repositorio.

### 1. Backend

```bash
cd server
npm install
npm run dev
```

En Windows PowerShell, si `npm` muestra un error sobre la politica de ejecucion
de scripts, usa `npm.cmd install` y `npm.cmd run dev`.

No se necesita un archivo `.env` para Capacitaciones. Si quieres declarar la
configuracion de forma explicita, copia `server/.env.example` a `server/.env`.
Si ya existe `server/.env`, no lo reemplaces: Capacitaciones usa almacenamiento
local por defecto mientras no tenga `TRAINING_STORAGE=supabase`.

El backend debe mostrar que esta disponible en `http://localhost:3000`. Su
estado se puede comprobar en `http://localhost:3000/health`.

### 2. Frontend

En otra terminal:

```powershell
cd ShiftAI
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm install
npm run dev
```

Si PowerShell bloquea `npm`, usa `npm.cmd install` y `npm.cmd run dev`.

En macOS o Linux usa `cp .env.example .env.local`. Luego abre la direccion que
muestre Vite, normalmente `http://localhost:5173`, e ingresa a
**Capacitaciones**.

Si `.env.local` ya existia, comprueba que contenga estas variables para trabajar
sin Supabase:

```env
VITE_SKIP_AUTH=true
VITE_API_URL=http://localhost:3000/api/v1
```

Vite puede seleccionar otro puerto si `5173` esta ocupado; en ese caso utiliza
la direccion exacta mostrada en la terminal.

### Actualizar despues de la integracion

Cuando el cambio haya sido revisado e integrado en `dev`, los demas integrantes
pueden obtenerlo con:

```powershell
git switch dev
git pull origin dev
```

Despues deben instalar las dependencias dentro de `server` y `ShiftAI` y seguir
los pasos anteriores. El archivo JSON local se crea automaticamente al hacer la
primera solicitud al modulo.

### Alcance del modo local

- Cursos, programas, asignaciones, progreso e historial son funcionales.
- Los cambios persisten al reiniciar el backend.
- Cada computadora mantiene su propia copia de los datos.
- Eliminar `server/.local-data/training.json` restaura los datos iniciales en
  el siguiente arranque.
- Los otros modulos pueden seguir requiriendo Supabase; Capacitaciones no.

La migracion `server/supabase/migrations/002_training_module.sql` queda
disponible para una integracion futura, pero no debe ejecutarse para usar el
modo local.
