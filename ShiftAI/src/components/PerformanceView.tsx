import React, { useState, type FormEvent } from 'react';
import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import { sileo } from 'sileo';
import {
  Target,
  Award,
  Users,
  UserCheck,
  Briefcase,
  Star,
  Plus,
  ChevronRight,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';

import {
  useEvaluaciones,
  useEmpleadosEvaluacion,
  useCrearEvaluacion,
  useEnviarCalificacion,
  useCerrarEvaluacion,
} from '../hooks/useEvaluations';

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none transition-colors focus:border-[#6366F1] focus:bg-white focus:ring-3 focus:ring-indigo-100';

export default function PerformanceView() {
  const {
    data: evaluacionesData,
    isLoading: isLoadingEvals,
    refetch: refetchEvaluaciones,
  } = useEvaluaciones();

  const {
    data: empleadosData,
    isLoading: isLoadingEmp,
  } = useEmpleadosEvaluacion();

  const evaluaciones = Array.isArray(evaluacionesData)
    ? evaluacionesData
    : [];

  const empleados = Array.isArray(empleadosData)
    ? empleadosData
    : [];

  const createEval = useCrearEvaluacion();
  const submitReview = useEnviarCalificacion();
  const closeEval = useCerrarEvaluacion();

  const [isCreateOpen, setIsCreateOpen] =
    useState(false);

  const [selectedEval, setSelectedEval] =
    useState<any>(null);

  const [activeReview, setActiveReview] =
    useState<any>(null);

  // =====================================================
  // CREAR EVALUACIÓN
  // =====================================================

  const handleCreate = (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);

    const id_empleado = Number(
      data.get('id_empleado')
    );

    const titulo = String(
      data.get('titulo') ?? ''
    ).trim();

    const periodo = String(
      data.get('periodo') ?? ''
    ).trim();

    const emp = empleados.find(
      (empleado: any) =>
        empleado.id_empleado === id_empleado
    );

    if (!id_empleado) {
      sileo.error({
        title: 'Empleado requerido',
        description:
          'Debes seleccionar un empleado.',
      });

      return;
    }

    if (!titulo) {
      sileo.error({
        title: 'Título requerido',
        description:
          'Debes ingresar un título para la evaluación.',
      });

      return;
    }

    if (!periodo) {
      sileo.error({
        title: 'Período requerido',
        description:
          'Debes ingresar el período de evaluación.',
      });

      return;
    }

    createEval.mutate(
      {
        id_empleado,
        titulo,
        periodo,
        nombre_empleado: emp
          ? `${emp.nombre} ${emp.apellido}`
          : 'Empleado',
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);

          sileo.success({
            title: 'Evaluación Iniciada',
            description:
              'Se generaron los 3 formularios 360°.',
          });
        },

        onError: (error: any) => {
          console.error(
            'Error creando evaluación:',
            error
          );

          const message =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            'No se pudo crear la evaluación.';

          sileo.error({
            title: 'Error',
            description: message,
          });
        },
      }
    );
  };

  // =====================================================
  // GUARDAR CALIFICACIÓN
  // =====================================================

  const handleSubmitReview = (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!activeReview) {
      sileo.error({
        title: 'Error',
        description:
          'No hay una evaluación seleccionada.',
      });

      return;
    }

    const data = new FormData(e.currentTarget);

    const id_detalle = Number(
      activeReview.id_detalle
    );

    const score = Number(
      data.get('score')
    );

    const comentarios = String(
      data.get('comentarios') ?? ''
    ).trim();

    // ---------------------------------------------
    // Validaciones
    // ---------------------------------------------

    if (!id_detalle) {
      sileo.error({
        title: 'Error',
        description:
          'No se encontró el ID del detalle de evaluación.',
      });

      return;
    }

    if (
      Number.isNaN(score) ||
      score < 0 ||
      score > 100
    ) {
      sileo.error({
        title: 'Puntuación inválida',
        description:
          'La puntuación debe estar entre 0 y 100.',
      });

      return;
    }

    if (!comentarios) {
      sileo.error({
        title: 'Comentario requerido',
        description:
          'Debes escribir una justificación para la calificación.',
      });

      return;
    }

    console.log(
      'Enviando calificación:',
      {
        id_detalle,
        score,
        comentarios,
      }
    );

    // ---------------------------------------------
    // Enviar al backend
    // ---------------------------------------------

    submitReview.mutate(
      {
        id_detalle,
        score,
        comentarios,
      },

      {
        // -----------------------------------------
        // ÉXITO
        // -----------------------------------------

        onSuccess: async () => {
          console.log(
            'Calificación guardada correctamente.'
          );

          try {
            // Volver a consultar la BD
            const result =
              await refetchEvaluaciones();

            const nuevasEvaluaciones =
              Array.isArray(result.data)
                ? result.data
                : [];

            // Buscar nuevamente la evaluación
            if (selectedEval) {
              const updatedEval =
                nuevasEvaluaciones.find(
                  (ev: any) =>
                    ev.id_evaluacion ===
                    selectedEval.id_evaluacion
                );

              if (updatedEval) {
                setSelectedEval(updatedEval);
              }
            }

            // Cerrar formulario de calificación
            setActiveReview(null);

            sileo.success({
              title: 'Calificación Guardada',
              description:
                'El feedback ha sido registrado correctamente.',
            });
          } catch (error) {
            console.error(
              'Error actualizando la vista:',
              error
            );

            setActiveReview(null);

            sileo.success({
              title: 'Calificación Guardada',
              description:
                'La calificación fue guardada correctamente.',
            });
          }
        },

        // -----------------------------------------
        // ERROR
        // -----------------------------------------

        onError: (error: any) => {
          console.error(
            'Error al guardar calificación:',
            error
          );

          const message =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            'No se pudo guardar la calificación.';

          sileo.error({
            title: 'Error al guardar',
            description: message,
          });
        },
      }
    );
  };

  // =====================================================
  // CERRAR EVALUACIÓN
  // =====================================================

  const handleCloseEvaluation = (
    evaluation: any
  ) => {
    const reviews =
      Array.isArray(
        evaluation?.detalles_evaluacion_360
      )
        ? evaluation.detalles_evaluacion_360
        : [];

    if (reviews.length === 0) {
      sileo.error({
        title: 'No hay evaluaciones',
        description:
          'No existen perspectivas para calcular el consenso.',
      });

      return;
    }

    const allCompleted =
      reviews.every(
        (review: any) =>
          review.estado === 'Completado'
      );

    if (!allCompleted) {
      sileo.error({
        title: 'Evaluación incompleta',
        description:
          'Todas las perspectivas deben estar completadas antes de cerrar la evaluación.',
      });

      return;
    }

    const totalScore = reviews.reduce(
      (acc: number, review: any) =>
        acc + Number(review.score || 0),
      0
    );

    const finalScore = Math.round(
      totalScore / reviews.length
    );

    closeEval.mutate(
      {
        id_evaluacion:
          evaluation.id_evaluacion,
        finalScore,
      },

      {
        onSuccess: async () => {
          await refetchEvaluaciones();

          setSelectedEval(null);

          sileo.success({
            title: 'Consenso Cerrado',
            description:
              `Nota final generada: ${finalScore}/100`,
          });
        },

        onError: (error: any) => {
          console.error(
            'Error cerrando evaluación:',
            error
          );

          const message =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            'No se pudo cerrar la evaluación.';

          sileo.error({
            title: 'Error',
            description: message,
          });
        },
      }
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (
    isLoadingEvals ||
    isLoadingEmp
  ) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // =====================================================
  // VIEW
  // =====================================================

  return (
    <div className="space-y-6 animate-fadeIn pb-12 text-left">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Target className="h-4.5 w-4.5" />
            </span>

            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
              Desempeño y Productividad
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Evaluación 360°
          </h1>

          <p className="mt-1 text-sm text-[#45474c]">
            Mide el rendimiento mediante consenso técnico y retroalimentación iterativa.
          </p>
        </div>

        <button
          onClick={() =>
            setIsCreateOpen(true)
          }
          className="inline-flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Nueva Evaluación
        </button>
      </div>

      {/* =================================================
          EVALUACIONES
      ================================================= */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

        {evaluaciones.map(
          (ev: any) => {
            const nombreCompleto =
              ev.empleado
                ? `${ev.empleado.nombre} ${ev.empleado.apellido}`
                : 'Colaborador';

            const reviews =
              Array.isArray(
                ev.detalles_evaluacion_360
              )
                ? ev.detalles_evaluacion_360
                : [];

            const completedReviews =
              reviews.filter(
                (review: any) =>
                  review.estado ===
                  'Completado'
              ).length;

            return (
              <article
                key={ev.id_evaluacion}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold uppercase text-slate-600">
                      {nombreCompleto.substring(
                        0,
                        2
                      )}
                    </div>

                    <div>
                      <h3 className="max-w-[140px] truncate text-sm font-bold text-slate-800">
                        {nombreCompleto}
                      </h3>

                      <p className="text-[10px] font-semibold text-slate-400">
                        {ev.titulo} • {ev.periodo}
                      </p>
                    </div>

                  </div>

                  <StatusBadge
                    status={
                      ev.estado ||
                      'Pendiente'
                    }
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Perspectivas
                    </span>

                    <p className="mt-1 text-xs font-bold text-slate-700">
                      {completedReviews} / 3 completas
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Consenso
                    </span>

                    <p
                      className={`mt-1 text-xs font-extrabold ${
                        ev.score_final !== null &&
                        ev.score_final !== undefined
                          ? 'text-emerald-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {ev.score_final !== null &&
                      ev.score_final !== undefined
                        ? `${ev.score_final}/100`
                        : 'Pendiente'}
                    </p>
                  </div>

                </div>

                <button
                  onClick={() =>
                    setSelectedEval(ev)
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-50 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                >
                  Auditar Detalle 360°
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </article>
            );
          }
        )}

        {evaluaciones.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-16">
            <Star className="mb-3 h-8 w-8 text-slate-300" />

            <p className="text-xs font-bold text-slate-500">
              No hay evaluaciones registradas en el sistema.
            </p>
          </div>
        )}

      </div>

      {/* =================================================
          MODALES
      ================================================= */}

      <AnimatePresence>

        {/* =================================================
            CREAR EVALUACIÓN
        ================================================= */}

        {isCreateOpen && (
          <Modal
            title="Generar Nueva Evaluación"
            description="Asigna un ciclo de evaluación a un colaborador."
            onClose={() =>
              setIsCreateOpen(false)
            }
          >
            <form
              onSubmit={handleCreate}
              className="space-y-4"
            >

              <label className="block space-y-1.5">
                <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Colaborador a Evaluar *
                </span>

                <select
                  name="id_empleado"
                  required
                  className={inputClass}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecciona un empleado
                  </option>

                  {empleados.map(
                    (employee: any) => (
                      <option
                        key={
                          employee.id_empleado
                        }
                        value={
                          employee.id_empleado
                        }
                      >
                        {employee.nombre}{' '}
                        {employee.apellido} -{' '}
                        {employee
                          .departamentos
                          ?.nombre ||
                          'General'}
                      </option>
                    )
                  )}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-4">

                <label className="block space-y-1.5">
                  <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Título *
                  </span>

                  <input
                    name="titulo"
                    required
                    placeholder="Ej. Desempeño Anual"
                    className={inputClass}
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Período *
                  </span>

                  <input
                    name="periodo"
                    required
                    placeholder="Ej. Q4 2026"
                    className={inputClass}
                  />
                </label>

              </div>

              <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />

                <p className="text-[11px] font-medium leading-relaxed text-indigo-800">
                  Al iniciar, el sistema despachará automáticamente 3 formularios: uno para el empleado (Autoevaluación), uno para un colega y uno para su Jefe Directo.
                </p>
              </div>

              <div className="flex gap-3 border-t border-slate-100 pt-4">

                <button
                  type="button"
                  onClick={() =>
                    setIsCreateOpen(false)
                  }
                  className="flex-1 rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-600 hover:bg-slate-200"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    createEval.isPending
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F172A] py-3 text-xs font-bold text-white hover:bg-slate-800"
                >
                  {createEval.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Iniciar Proceso'
                  )}
                </button>

              </div>

            </form>
          </Modal>
        )}

        {/* =================================================
            AUDITORÍA
        ================================================= */}

        {selectedEval &&
          !activeReview && (
            <Modal
              title="Auditoría 360°"
              description={`Detalle de consenso para ${
                selectedEval.empleado
                  ?.nombre ||
                'Colaborador'
              }`}
              onClose={() =>
                setSelectedEval(null)
              }
            >

              <div className="space-y-5">

                <div className="grid grid-cols-3 gap-3 border-b border-slate-100 pb-5">

                  <div className="col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Evaluación
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {selectedEval.titulo}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Nota Consenso
                    </p>

                    <p className="text-2xl font-black text-indigo-600">
                      {selectedEval.score_final !== null &&
                      selectedEval.score_final !== undefined
                        ? selectedEval.score_final
                        : '--'}
                    </p>
                  </div>

                </div>

                <div className="space-y-3">

                  <h4 className="ml-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Perspectivas Requeridas
                  </h4>

                  {Array.isArray(
                    selectedEval.detalles_evaluacion_360
                  ) &&
                    selectedEval.detalles_evaluacion_360.map(
                      (rev: any) => (
                        <div
                          key={
                            rev.id_detalle
                          }
                          className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition-colors hover:bg-slate-50"
                        >

                          <div className="flex items-center gap-3">

                            <div
                              className={`rounded-lg p-2 ${
                                rev.estado ===
                                'Completado'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-amber-50 text-amber-600'
                              }`}
                            >
                              {rev.rol_evaluador ===
                              'Autoevaluación' ? (
                                <UserCheck className="h-4 w-4" />
                              ) : rev.rol_evaluador ===
                                'Colega' ? (
                                <Users className="h-4 w-4" />
                              ) : (
                                <Briefcase className="h-4 w-4" />
                              )}
                            </div>

                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                {rev.rol_evaluador}
                              </p>

                              <p className="text-[10px] font-medium text-slate-500">
                                {rev.estado}
                              </p>
                            </div>

                          </div>

                          {rev.estado ===
                          'Completado' ? (
                            <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-black text-slate-700">
                              {rev.score}/100
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveReview(
                                  rev
                                )
                              }
                              className="rounded-lg bg-indigo-50 px-3.5 py-2 text-[10px] font-bold text-indigo-600 hover:bg-indigo-100"
                            >
                              Calificar
                            </button>
                          )}

                        </div>
                      )
                    )}

                </div>

                {selectedEval.estado !==
                  'Completado' &&
                  Array.isArray(
                    selectedEval.detalles_evaluacion_360
                  ) &&
                  selectedEval
                    .detalles_evaluacion_360
                    .length > 0 &&
                  selectedEval
                    .detalles_evaluacion_360
                    .every(
                      (review: any) =>
                        review.estado ===
                        'Completado'
                    ) && (
                    <div className="pt-2">

                      <button
                        onClick={() =>
                          handleCloseEvaluation(
                            selectedEval
                          )
                        }
                        disabled={
                          closeEval.isPending
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-700"
                      >
                        {closeEval.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Award className="h-4 w-4" />
                        )}

                        Calcular Consenso Técnico y Cerrar
                      </button>

                    </div>
                  )}

              </div>

            </Modal>
          )}

        {/* =================================================
            CALIFICAR
        ================================================= */}

        {activeReview && (
          <Modal
            title={`Emitir Calificación: ${activeReview.rol_evaluador}`}
            description="El feedback quedará registrado en el expediente."
            onClose={() =>
              setActiveReview(null)
            }
          >

            <form
              onSubmit={
                handleSubmitReview
              }
              className="space-y-4"
            >

              <label className="block space-y-1.5">

                <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Puntuación Técnica (0-100) *
                </span>

                <input
                  name="score"
                  type="number"
                  min="0"
                  max="100"
                  required
                  autoFocus
                  className={`${inputClass} h-12 text-center text-lg font-bold`}
                />

              </label>

              <label className="block space-y-1.5">

                <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Justificación de la matriz *
                </span>

                <textarea
                  name="comentarios"
                  required
                  className={`${inputClass} min-h-[100px]`}
                  placeholder="Describa el razonamiento del puntaje otorgado..."
                />

              </label>

              <div className="flex gap-3 border-t border-slate-100 pt-4">

                <button
                  type="button"
                  onClick={() =>
                    setActiveReview(null)
                  }
                  className="flex-1 rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-600 hover:bg-slate-200"
                >
                  Volver
                </button>

                <button
                  type="submit"
                  disabled={
                    submitReview.isPending
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F172A] py-3 text-xs font-bold text-white hover:bg-slate-800"
                >
                  {submitReview.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Feedback'
                  )}
                </button>

              </div>

            </form>

          </Modal>
        )}

      </AnimatePresence>
    </div>
  );
}

// =====================================================
// MODAL
// =====================================================

function Modal({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{
          scale: 0.95,
          y: 10,
        }}
        animate={{
          scale: 1,
          y: 0,
        }}
        exit={{
          scale: 0.95,
          y: 10,
        }}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
      >

        <header className="flex items-start justify-between border-b border-slate-100 bg-slate-50 p-6">

          <div>
            <h2 className="text-sm font-bold text-slate-800">
              {title}
            </h2>

            <p className="mt-1 pr-4 text-[11px] leading-relaxed text-slate-500">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>

        </header>

        <div className="p-6">
          {children}
        </div>

      </motion.div>
    </motion.div>
  );
}

// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    Pendiente:
      'border-amber-100 bg-amber-50 text-amber-700',

    'En progreso':
      'border-indigo-100 bg-indigo-50 text-indigo-700',

    Completado:
      'border-emerald-100 bg-emerald-50 text-emerald-700',
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider ${
        styles[status] ??
        'border-slate-200 bg-slate-50 text-slate-500'
      }`}
    >
      {status}
    </span>
  );
}