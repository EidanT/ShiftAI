# Modulo 1: Reclutamiento y Seleccion de Personal

Este modulo contiene la primera pantalla del sistema ShiftAI para gestionar el
flujo inicial de reclutamiento. Por ahora es una vista de frontend con datos de
prueba y sin conexion a base de datos.

## Alcance actual

- Registro visual de vacantes laborales.
- Espacio para requisitos y responsabilidades por vacante.
- Formulario visual para registrar candidatos.
- Listado de candidatos registrados.
- Campo para actualizar el estado de la candidatura:
  `En evaluacion`, `Aprobado`, `Rechazado`, `Contratado`.
- Espacio para observaciones y resultados de entrevistas.
- Accion visual para seleccionar candidato para contratacion.

## Pendiente para backend/base de datos

- Crear servicios o API dentro de `src/api`.
- Reemplazar los arreglos estaticos en `HiringModule.tsx`.
- Agregar validaciones de formulario.
- Guardar entrevistas, observaciones y cambios de estado.
- Conectar la accion de contratacion con el modulo de empleados cuando exista.

## Nota para el siguiente modulo

Crear una carpeta nueva dentro de `src/modules` y mantener sus componentes,
datos de prueba y comentarios separados para evitar modificar este modulo sin
necesidad.
