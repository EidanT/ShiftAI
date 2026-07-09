# Modulo 1: Reclutamiento y Seleccion de Personal

Este modulo ya consume el backend real de Hiring y persiste sus operaciones en
Supabase.

## Alcance activo

- Registro de vacantes con requisitos y responsabilidades.
- Alta y edicion de candidatos.
- Creacion de postulaciones por vacante.
- Registro de entrevistas.
- Cambio de estado de postulacion.
- Contratacion persistida en la tabla `empleado`.

## Configuracion

- El frontend usa `VITE_API_BASE_URL` si esta definida.
- Si no existe, apunta por defecto a `http://localhost:3000/api/v1`.
