# Modulo 1: Reclutamiento y seleccion

Estructura preparada a partir del UML `uml`.

## Entidades UML cubiertas

- `VACANTE` -> `vacante`
- `REQUISITO_VACANTE` -> `requisito_vacante`
- `CANDIDATO` -> `candidato`
- `POSTULACION` -> `postulacion`
- `ENTREVISTA` -> `entrevista`
- `EMPLEADO` -> `empleado`, usado al seleccionar candidato para contratacion

## Endpoints base

- `GET /api/v1/hiring/vacancies`
- `POST /api/v1/hiring/vacancies`
- `GET /api/v1/hiring/candidates`
- `POST /api/v1/hiring/candidates`
- `PATCH /api/v1/hiring/candidates/:id`
- `GET /api/v1/hiring/applications`
- `POST /api/v1/hiring/applications`
- `PATCH /api/v1/hiring/applications/:id/status`
- `POST /api/v1/hiring/applications/:id/interviews`
- `POST /api/v1/hiring/applications/:id/hire`

## Estado actual

El router usa `InMemoryHiringRepository` para omitir la conexion a Supabase por ahora.
El adaptador `SupabaseHiringRepository` queda preparado para mapear contra las tablas
PostgreSQL del UML cuando se configure la base de datos.

La migracion base esta en:

`server/supabase/migrations/001_hiring_module.sql`

## Activacion futura de Supabase

1. Ejecutar la migracion SQL en Supabase.
2. Configurar `SUPABASE_URL` y `SUPABASE_SECRET_KEY` en `.env`.
3. Cambiar el repositorio instanciado en `hiring.router.ts` de
   `InMemoryHiringRepository` a `SupabaseHiringRepository`.
