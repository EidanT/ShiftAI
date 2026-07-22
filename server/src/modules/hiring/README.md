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

El router usa `SupabaseHiringRepository` como implementacion activa.
El modulo ya lee y escribe directamente en las tablas PostgreSQL creadas por la
migracion del UML.

La migracion base esta en:

`server/supabase/migrations/001_hiring_module.sql`

## Requisitos de entorno

1. Ejecutar la migracion SQL en Supabase.
2. Configurar `SUPABASE_URL` y `SUPABASE_SECRET_KEY` en `.env`.
3. Verificar que el frontend apunte al backend con `VITE_API_BASE_URL` o al
   valor por defecto `http://localhost:3000/api/v1`.
