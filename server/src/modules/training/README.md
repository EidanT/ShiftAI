# API de Capacitaciones

El router se monta en `/api/v1/training` y sigue la estructura del resto del
backend: router, controller, service y repository.

## Almacenamiento

- `TRAINING_STORAGE=local` (predeterminado): persiste en
  `.local-data/training.json`, ignorado por Git. Cuando el archivo no existe,
  el backend lo crea automaticamente a partir de `training.seed.ts`.
- `TRAINING_STORAGE=supabase`: utiliza las tablas creadas por
  `server/supabase/migrations/002_training_module.sql`.

El modo local no necesita credenciales ni cambios en Supabase. Cada maquina
recibe los mismos datos iniciales, pero conserva sus cambios por separado.

Para iniciar el backend desde un clon nuevo:

```bash
cd server
npm install
npm run dev
```

La configuracion es opcional porque los valores locales son predeterminados.
Si se desea crear `server/.env`, se puede copiar `server/.env.example`.

Para una integracion futura con Supabase, ejecuta primero la migracion y
reinicia el backend con:

```env
TRAINING_STORAGE=supabase
```

No actives esta opcion si la migracion no ha sido aplicada.

## Endpoints

- `GET /summary`
- `GET /report`
- `GET /employees`
- `GET /employees/:id/history`
- `GET|POST /courses`
- `PATCH /courses/:id`
- `GET|POST /programs`
- `PATCH /programs/:id`
- `GET|POST /assignments`
- `PATCH /assignments/:id`
