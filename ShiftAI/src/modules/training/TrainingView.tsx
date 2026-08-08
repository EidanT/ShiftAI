import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { sileo } from 'sileo';
import {
  AlertTriangle,
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleCheck,
  Clock,
  Download,
  GraduationCap,
  Library,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Target,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { getTrainingReport } from '../../api/training';
import {
  useCreateTrainingAssignment,
  useCreateTrainingCourse,
  useCreateTrainingProgram,
  useEmployeeTrainingHistory,
  useTrainingAssignments,
  useTrainingCourses,
  useTrainingEmployees,
  useTrainingPrograms,
  useTrainingSummary,
  useUpdateTrainingAssignment,
  useUpdateTrainingCourse,
  useUpdateTrainingProgram,
} from '../../hooks/useTraining';
import type {
  TrainingAssignment,
  TrainingCourse,
  TrainingFormat,
  TrainingStatus,
} from './training.types';

type ModalKind = 'course' | 'program' | 'assignment' | 'progress' | null;
type TrainingTab = 'overview' | 'catalog' | 'history';

interface TrainingViewProps {
  busqueda: string;
}

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none transition-colors focus:border-[#6366F1] focus:bg-white focus:ring-3 focus:ring-indigo-100';

export default function TrainingView({ busqueda }: TrainingViewProps) {
  const summaryQuery = useTrainingSummary();
  const employeesQuery = useTrainingEmployees();
  const coursesQuery = useTrainingCourses();
  const programsQuery = useTrainingPrograms();
  const assignmentsQuery = useTrainingAssignments();
  const createCourse = useCreateTrainingCourse();
  const updateCourse = useUpdateTrainingCourse();
  const createProgram = useCreateTrainingProgram();
  const updateProgram = useUpdateTrainingProgram();
  const createAssignment = useCreateTrainingAssignment();
  const updateAssignment = useUpdateTrainingAssignment();

  const [activeTab, setActiveTab] = useState<TrainingTab>('overview');
  const [modal, setModal] = useState<ModalKind>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<TrainingAssignment | null>(null);
  const [statusFilter, setStatusFilter] = useState<'Todos' | TrainingStatus>('Todos');
  const [departmentFilter, setDepartmentFilter] = useState('Todos los departamentos');
  const [historyEmployeeId, setHistoryEmployeeId] = useState<number | null>(null);
  const [assignmentCourseId, setAssignmentCourseId] = useState<number | null>(null);

  const employees = useMemo(() => employeesQuery.data ?? [], [employeesQuery.data]);
  const courses = useMemo(() => coursesQuery.data ?? [], [coursesQuery.data]);
  const programs = useMemo(() => programsQuery.data ?? [], [programsQuery.data]);
  const assignments = useMemo(() => assignmentsQuery.data ?? [], [assignmentsQuery.data]);
  const summary = summaryQuery.data;
  const resolvedHistoryEmployeeId = historyEmployeeId ?? employees[0]?.id ?? null;
  const historyQuery = useEmployeeTrainingHistory(resolvedHistoryEmployeeId);

  const departments = useMemo(
    () => [...new Set(employees.map((employee) => employee.department).filter(Boolean))] as string[],
    [employees],
  );

  const filteredAssignments = assignments.filter((assignment) => {
    const departmentMatches =
      departmentFilter === 'Todos los departamentos' ||
      assignment.employee_department === departmentFilter;
    const statusMatches = statusFilter === 'Todos' || assignment.status === statusFilter;
    return (
      departmentMatches &&
      statusMatches &&
      matchesQuery(
        busqueda,
        assignment.employee_name,
        assignment.employee_code,
        assignment.employee_department ?? undefined,
        assignment.course_title,
        assignment.course_category,
        assignment.program_name ?? undefined,
      )
    );
  });

  const filteredCourses = courses.filter((course) =>
    matchesQuery(
      busqueda,
      course.title,
      course.category,
      course.department,
      course.provider,
    ),
  );
  const filteredPrograms = programs.filter((program) =>
    matchesQuery(busqueda, program.name, program.department, program.level),
  );
  const pendingAssignments = filteredAssignments.filter(
    (assignment) => assignment.status !== 'Completado',
  );
  const historyAssignments = historyQuery.data ?? [];
  const historyEmployee = employees.find((employee) => employee.id === resolvedHistoryEmployeeId);
  const selectedCourse = courses.find((course) => course.id === assignmentCourseId);
  const compatiblePrograms = programs.filter(
    (program) => program.active && selectedCourse && program.course_ids.includes(selectedCourse.id),
  );

  const queries = [
    summaryQuery,
    employeesQuery,
    coursesQuery,
    programsQuery,
    assignmentsQuery,
  ];
  const isInitialLoading = queries.some((query) => query.isLoading);
  const firstError = queries.find((query) => query.error)?.error;

  const closeModal = () => {
    setModal(null);
    setSelectedAssignment(null);
  };

  const openAssignment = () => {
    setAssignmentCourseId(courses.find((course) => course.active)?.id ?? null);
    setModal('assignment');
  };

  const openProgress = (assignment: TrainingAssignment) => {
    setSelectedAssignment(assignment);
    setModal('progress');
  };

  const saveCourse = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    createCourse.mutate(
      {
        title: String(data.get('title') ?? '').trim(),
        description: String(data.get('description') ?? '').trim(),
        category: String(data.get('category') ?? '').trim(),
        department: String(data.get('department') ?? ''),
        provider: String(data.get('provider') ?? '').trim(),
        duration_hours: Number(data.get('duration_hours')),
        format: String(data.get('format')) as TrainingFormat,
        capacity: Number(data.get('capacity')),
      },
      mutationFeedback('Curso registrado', 'El curso ya está disponible para asignación.'),
    );
  };

  const saveProgram = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const courseIds = data.getAll('course_ids').map(Number);
    if (courseIds.length === 0) {
      sileo.info({
        title: 'Selecciona al menos un curso',
        description: 'Cada programa debe incluir una ruta de aprendizaje.',
      });
      return;
    }
    createProgram.mutate(
      {
        name: String(data.get('name') ?? '').trim(),
        description: String(data.get('description') ?? '').trim(),
        department: String(data.get('department') ?? ''),
        level: String(data.get('level') ?? ''),
        course_ids: courseIds,
      },
      mutationFeedback('Programa creado', 'La ruta de aprendizaje se guardó correctamente.'),
    );
  };

  const saveAssignment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const programId = Number(data.get('program_id'));
    const employee = employees.find((item) => item.id === Number(data.get('employee_id')));
    createAssignment.mutate(
      {
        employee_id: Number(data.get('employee_id')),
        course_id: Number(data.get('course_id')),
        program_id: programId || null,
        due_date: String(data.get('due_date')),
        notes: String(data.get('notes') ?? '').trim() || undefined,
      },
      mutationFeedback(
        'Capacitación asignada',
        `La asignación de ${employee?.name ?? 'este colaborador'} fue registrada.`,
      ),
    );
  };

  const saveProgress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedAssignment) return;
    const data = new FormData(event.currentTarget);
    const scoreText = String(data.get('score') ?? '').trim();
    updateAssignment.mutate(
      {
        id: selectedAssignment.id,
        input: {
          status: String(data.get('status')) as TrainingStatus,
          progress: Number(data.get('progress')),
          score: scoreText ? Number(scoreText) : null,
          notes: String(data.get('notes') ?? '').trim() || null,
        },
      },
      mutationFeedback(
        'Seguimiento actualizado',
        'La participación y los resultados fueron registrados.',
      ),
    );
  };

  function mutationFeedback(title: string, description: string) {
    return {
      onSuccess: () => {
        closeModal();
        sileo.success({ title, description });
      },
      onError: (error: Error) => {
        sileo.error({ title: 'No se pudo guardar', description: error.message });
      },
    };
  }

  const toggleCourse = (course: TrainingCourse) => {
    updateCourse.mutate(
      { id: course.id, input: { active: !course.active } },
      {
        onSuccess: () =>
          sileo.success({
            title: course.active ? 'Curso desactivado' : 'Curso activado',
            description: `${course.title} fue actualizado.`,
          }),
        onError: (error) =>
          sileo.error({ title: 'No se pudo actualizar', description: error.message }),
      },
    );
  };

  const toggleProgram = (id: number, name: string, active: boolean) => {
    updateProgram.mutate(
      { id, input: { active: !active } },
      {
        onSuccess: () =>
          sileo.success({
            title: active ? 'Programa desactivado' : 'Programa activado',
            description: `${name} fue actualizado.`,
          }),
        onError: (error) =>
          sileo.error({ title: 'No se pudo actualizar', description: error.message }),
      },
    );
  };

  const downloadReport = async () => {
    try {
      const report = await getTrainingReport();
      const rows = report.map((row) => [
        row.assignment_code,
        row.employee_code,
        row.employee_name,
        row.department ?? '',
        row.course,
        row.program ?? 'Asignación directa',
        row.status,
        `${row.progress}%`,
        row.score ?? '',
        row.assigned_on,
        row.due_date,
        row.completed_on ?? '',
        row.notes ?? '',
      ]);
      const csv = [
        [
          'Folio',
          'ID empleado',
          'Empleado',
          'Departamento',
          'Curso',
          'Programa',
          'Estado',
          'Progreso',
          'Resultado',
          'Asignación',
          'Fecha límite',
          'Finalización',
          'Observaciones',
        ],
        ...rows,
      ]
        .map((row) => row.map(csvCell).join(','))
        .join('\n');
      const url = URL.createObjectURL(
        new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }),
      );
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `reporte-capacitacion-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      sileo.success({ title: 'Reporte generado', description: 'El archivo CSV fue descargado.' });
    } catch (error) {
      sileo.error({
        title: 'No se pudo generar el reporte',
        description: (error as Error).message,
      });
    }
  };

  if (isInitialLoading) return <LoadingState />;

  if (firstError) {
    return (
      <ErrorState
        message={(firstError as Error).message}
        onRetry={() => queries.forEach((query) => void query.refetch())}
      />
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <GraduationCap className="h-4.5 w-4.5" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
              Desarrollo de talento
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Capacitación y Desarrollo
          </h1>
          <p className="mt-1 text-sm text-[#45474c]">
            Administra programas, cursos, participación y resultados del personal.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void downloadReport()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Download className="h-4 w-4 text-slate-400" /> Exportar reporte
          </button>
          <button
            onClick={openAssignment}
            disabled={!employees.length || !courses.some((course) => course.active)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" /> Asignar capacitación
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Library className="h-5 w-5" />}
          label="Cursos activos"
          value={String(summary?.active_courses ?? 0)}
          detail={`${summary?.active_programs ?? 0} programas vigentes`}
          tone="indigo"
        />
        <MetricCard
          icon={<ClipboardIcon />}
          label="Asignaciones abiertas"
          value={String(summary?.open_assignments ?? 0)}
          detail="Pendientes de completar"
          tone="amber"
        />
        <MetricCard
          icon={<CircleCheck className="h-5 w-5" />}
          label="Finalización"
          value={`${summary?.completion_rate ?? 0}%`}
          detail={`${summary?.completed_assignments ?? 0} resultados registrados`}
          tone="emerald"
        />
        <MetricCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Colaboradores pendientes"
          value={String(summary?.pending_employees ?? 0)}
          detail={`${summary?.overdue_assignments ?? 0} asignaciones vencidas`}
          tone="rose"
        />
      </div>

      <TabBar activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <OverviewTab
          assignments={filteredAssignments}
          pendingAssignments={pendingAssignments}
          departments={departments}
          departmentFilter={departmentFilter}
          statusFilter={statusFilter}
          onDepartmentChange={setDepartmentFilter}
          onStatusChange={setStatusFilter}
          onClear={() => {
            setDepartmentFilter('Todos los departamentos');
            setStatusFilter('Todos');
          }}
          onProgress={openProgress}
        />
      )}

      {activeTab === 'catalog' && (
        <CatalogTab
          courses={filteredCourses}
          programs={filteredPrograms}
          allCourses={courses}
          onNewCourse={() => setModal('course')}
          onNewProgram={() => setModal('program')}
          onToggleCourse={toggleCourse}
          onToggleProgram={toggleProgram}
        />
      )}

      {activeTab === 'history' && (
        <HistoryTab
          employees={employees}
          selectedEmployeeId={resolvedHistoryEmployeeId}
          selectedEmployeeName={historyEmployee?.name}
          assignments={historyAssignments}
          loading={historyQuery.isLoading}
          onEmployeeChange={setHistoryEmployeeId}
          onProgress={openProgress}
        />
      )}

      <AnimatePresence>
        {modal === 'course' && (
          <CourseDialog
            departments={departments}
            pending={createCourse.isPending}
            onClose={closeModal}
            onSubmit={saveCourse}
          />
        )}
        {modal === 'program' && (
          <ProgramDialog
            departments={departments}
            courses={courses.filter((course) => course.active)}
            pending={createProgram.isPending}
            onClose={closeModal}
            onSubmit={saveProgram}
          />
        )}
        {modal === 'assignment' && (
          <AssignmentDialog
            employees={employees}
            courses={courses.filter(
              (course) => course.active && course.enrolled_count < course.capacity,
            )}
            programs={compatiblePrograms}
            selectedCourseId={assignmentCourseId}
            pending={createAssignment.isPending}
            onCourseChange={setAssignmentCourseId}
            onClose={closeModal}
            onSubmit={saveAssignment}
          />
        )}
        {modal === 'progress' && selectedAssignment && (
          <ProgressDialog
            assignment={selectedAssignment}
            pending={updateAssignment.isPending}
            onClose={closeModal}
            onSubmit={saveProgress}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TabBar({ activeTab, onChange }: { activeTab: TrainingTab; onChange: (tab: TrainingTab) => void }) {
  const tabs = [
    { id: 'overview' as const, label: 'Resumen y seguimiento', icon: BarChart3 },
    { id: 'catalog' as const, label: 'Cursos y programas', icon: BookOpen },
    { id: 'history' as const, label: 'Historial por empleado', icon: Users },
  ];
  return (
    <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2 px-2 text-[11px] font-semibold text-slate-400">
        <Search className="h-4 w-4" /> El buscador global filtra este módulo
      </div>
    </div>
  );
}

interface OverviewProps {
  assignments: TrainingAssignment[];
  pendingAssignments: TrainingAssignment[];
  departments: string[];
  departmentFilter: string;
  statusFilter: 'Todos' | TrainingStatus;
  onDepartmentChange: (value: string) => void;
  onStatusChange: (value: 'Todos' | TrainingStatus) => void;
  onClear: () => void;
  onProgress: (assignment: TrainingAssignment) => void;
}

function OverviewTab(props: OverviewProps) {
  const nextDue = [...props.pendingAssignments].sort((a, b) => a.due_date.localeCompare(b.due_date))[0];
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Departamento">
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <select
                value={props.departmentFilter}
                onChange={(event) => props.onDepartmentChange(event.target.value)}
                className={`${inputClass} pl-9`}
              >
                <option>Todos los departamentos</option>
                {props.departments.map((department) => <option key={department}>{department}</option>)}
              </select>
            </div>
          </Field>
          <Field label="Estado">
            <select
              value={props.statusFilter}
              onChange={(event) => props.onStatusChange(event.target.value as 'Todos' | TrainingStatus)}
              className={inputClass}
            >
              <option>Todos</option>
              <option>Pendiente</option>
              <option>En progreso</option>
              <option>Completado</option>
              <option>Vencido</option>
            </select>
          </Field>
          <div className="flex items-end">
            <button onClick={props.onClear} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100">
              Limpiar filtros
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-8">
          <SectionHeader
            title="Seguimiento de asignaciones"
            description="Participación, avance y resultado de cada capacitación."
            badge={`${props.assignments.length} registros`}
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="p-4 pl-5">Colaborador</th><th className="p-4">Capacitación</th><th className="p-4 text-center">Avance</th><th className="p-4">Fecha límite</th><th className="p-4">Estado</th><th className="p-4 pr-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {props.assignments.length ? props.assignments.map((assignment) => (
                  <tr key={assignment.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="p-4 pl-5">
                      <div className="flex items-center gap-3">
                        <Avatar initials={initials(assignment.employee_name)} />
                        <div><p className="font-bold text-slate-800">{assignment.employee_name}</p><p className="mt-0.5 text-[10px] text-slate-400">{assignment.employee_department ?? 'Sin departamento'}</p></div>
                      </div>
                    </td>
                    <td className="p-4"><p className="max-w-[190px] font-bold text-slate-700">{assignment.course_title}</p><p className="mt-0.5 text-[10px] text-slate-400">{assignment.program_name ?? assignment.course_category}</p></td>
                    <td className="p-4"><Progress assignment={assignment} /></td>
                    <td className="p-4 font-medium text-slate-500">{formatDate(assignment.due_date)}</td>
                    <td className="p-4"><StatusBadge status={assignment.status} /></td>
                    <td className="p-4 pr-5 text-right"><button onClick={() => props.onProgress(assignment)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50">Actualizar <ChevronRight className="h-3.5 w-3.5" /></button></td>
                  </tr>
                )) : <EmptyRow colSpan={6} label="No hay asignaciones que coincidan con los filtros." />}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-5 xl:col-span-4">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-amber-50/40 px-5 py-4">
              <div><h2 className="text-sm font-bold text-slate-800">Pendientes de capacitación</h2><p className="mt-0.5 text-[11px] text-slate-500">Requieren seguimiento de RR. HH.</p></div>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="divide-y divide-slate-100">
              {props.pendingAssignments.slice(0, 5).map((assignment) => (
                <button key={assignment.id} onClick={() => props.onProgress(assignment)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-slate-50">
                  <Avatar initials={initials(assignment.employee_name)} />
                  <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-700">{assignment.employee_name}</p><p className="mt-0.5 truncate text-[10px] text-slate-400">{assignment.course_title}</p></div>
                  <StatusBadge status={assignment.status} compact />
                </button>
              ))}
              {!props.pendingAssignments.length && <p className="px-5 py-8 text-center text-xs font-semibold text-slate-400">No hay pendientes con estos filtros.</p>}
            </div>
          </section>
          <section className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-white p-2 text-indigo-600 shadow-sm"><Target className="h-4 w-4" /></div>
              <div><p className="text-xs font-bold text-slate-800">Próximo vencimiento</p><p className="mt-1 text-[11px] leading-relaxed text-slate-500">{nextDue ? `${nextDue.employee_name} debe completar ${nextDue.course_title} antes del ${formatDate(nextDue.due_date)}.` : 'No hay actividades pendientes.'}</p></div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

interface CatalogProps {
  courses: TrainingCourse[];
  programs: ReturnType<typeof useTrainingPrograms>['data'] extends infer T ? NonNullable<T> : never;
  allCourses: TrainingCourse[];
  onNewCourse: () => void;
  onNewProgram: () => void;
  onToggleCourse: (course: TrainingCourse) => void;
  onToggleProgram: (id: number, name: string, active: boolean) => void;
}

function CatalogTab(props: CatalogProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <ActionHeader title="Catálogo de cursos" description="Cursos disponibles para asignación y desarrollo profesional." action="Registrar curso" onAction={props.onNewCourse} />
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {props.courses.map((course) => (
            <article key={course.id} className={`flex flex-col rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm ${course.active ? 'border-slate-200 bg-slate-50/40 hover:border-indigo-200' : 'border-slate-200 bg-slate-100/70 opacity-70'}`}>
              <div className="mb-4 flex items-start justify-between gap-3"><div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><BookOpen className="h-5 w-5" /></div><span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-500">{course.format}</span></div>
              <h3 className="text-sm font-bold text-slate-800">{course.title}</h3>
              <p className="mt-1.5 min-h-10 text-[11px] leading-relaxed text-slate-500">{course.description || 'Sin descripción registrada.'}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3 text-[10px] font-semibold text-slate-500"><span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.duration_hours} horas</span><span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course.enrolled_count}/{course.capacity}</span><span className="col-span-2 flex items-center gap-1 truncate"><Building2 className="h-3.5 w-3.5" />{course.department}</span></div>
              <div className="mt-3 flex items-center justify-between gap-2"><div><p className="text-[10px] font-bold text-indigo-600">{course.category}</p><p className="text-[10px] text-slate-400">{course.provider}</p></div><button onClick={() => props.onToggleCourse(course)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50">{course.active ? 'Desactivar' : 'Activar'}</button></div>
            </article>
          ))}
          {!props.courses.length && <EmptyState label="No se encontraron cursos." />}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <ActionHeader title="Programas de capacitación" description="Rutas compuestas por varios cursos según la necesidad del área." action="Crear programa" onAction={props.onNewProgram} dark />
        <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-3">
          {props.programs.map((program) => (
            <article key={program.id} className={`rounded-xl border border-slate-200 p-5 ${program.active ? '' : 'bg-slate-50 opacity-70'}`}>
              <div className="flex items-start justify-between gap-3"><div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600"><BookMarked className="h-5 w-5" /></div><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{program.level}</span></div>
              <h3 className="mt-4 text-sm font-bold text-slate-800">{program.name}</h3><p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{program.description || 'Sin descripción registrada.'}</p>
              <div className="mt-4 border-t border-slate-100 pt-3"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Incluye</p><div className="mt-2 flex flex-wrap gap-1.5">{program.course_ids.map((courseId) => <span key={courseId} className="rounded bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600">{props.allCourses.find((course) => course.id === courseId)?.title ?? `Curso ${courseId}`}</span>)}</div></div>
              <div className="mt-4 flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><Building2 className="h-3.5 w-3.5" />{program.department}</span><button onClick={() => props.onToggleProgram(program.id, program.name, program.active)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50">{program.active ? 'Desactivar' : 'Activar'}</button></div>
            </article>
          ))}
          {!props.programs.length && <EmptyState label="No se encontraron programas." />}
        </div>
      </section>
    </div>
  );
}

function HistoryTab({ employees, selectedEmployeeId, selectedEmployeeName, assignments, loading, onEmployeeChange, onProgress }: { employees: ReturnType<typeof useTrainingEmployees>['data'] extends infer T ? NonNullable<T> : never; selectedEmployeeId: number | null; selectedEmployeeName?: string; assignments: TrainingAssignment[]; loading: boolean; onEmployeeChange: (id: number) => void; onProgress: (assignment: TrainingAssignment) => void }) {
  const completed = assignments.filter((assignment) => assignment.status === 'Completado');
  const scored = assignments.filter((assignment) => assignment.score !== null);
  const average = scored.length ? Math.round(scored.reduce((sum, assignment) => sum + (assignment.score ?? 0), 0) / scored.length) : null;
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-1 gap-5 border-b border-slate-100 bg-slate-50/70 p-5 lg:grid-cols-[1fr_auto]"><div><h2 className="text-base font-bold text-slate-800">Historial individual de capacitación</h2><p className="mt-1 text-xs text-slate-500">Itinerario, participación y resultados de cada colaborador.</p></div><Field label="Colaborador"><select value={selectedEmployeeId ?? ''} onChange={(event) => onEmployeeChange(Number(event.target.value))} className={`${inputClass} min-w-[280px]`}>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.code}</option>)}</select></Field></div>
      {loading ? <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400"><Loader2 className="h-5 w-5 animate-spin" /> Cargando historial...</div> : <>
        <div className="grid grid-cols-1 gap-4 border-b border-slate-100 p-5 md:grid-cols-3"><HistoryStat icon={<GraduationCap className="h-4 w-4" />} label="Asignadas" value={String(assignments.length)} /><HistoryStat icon={<CheckCircle2 className="h-4 w-4" />} label="Completadas" value={String(completed.length)} /><HistoryStat icon={<Award className="h-4 w-4" />} label="Promedio" value={average === null ? 'Sin resultados' : `${average}/100`} /></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left"><thead><tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-400"><th className="p-4 pl-5">Curso</th><th className="p-4">Programa</th><th className="p-4">Finalización</th><th className="p-4 text-center">Resultado</th><th className="p-4">Observación</th><th className="p-4 pr-5 text-right">Acción</th></tr></thead><tbody className="divide-y divide-slate-100 text-xs">{assignments.length ? assignments.map((assignment) => <tr key={assignment.id} className="hover:bg-slate-50/70"><td className="p-4 pl-5 font-bold text-slate-700">{assignment.course_title}</td><td className="p-4 text-slate-500">{assignment.program_name ?? 'Asignación directa'}</td><td className="p-4 text-slate-500">{assignment.completed_on ? formatDate(assignment.completed_on) : 'Aún no finalizado'}</td><td className="p-4 text-center">{assignment.score === null ? '—' : <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">{assignment.score}/100</span>}</td><td className="max-w-[220px] p-4 text-[11px] leading-relaxed text-slate-500">{assignment.notes ?? 'Sin observaciones.'}</td><td className="p-4 pr-5 text-right"><button onClick={() => onProgress(assignment)} className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50">Editar</button></td></tr>) : <EmptyRow colSpan={6} label={`${selectedEmployeeName ?? 'Este colaborador'} no tiene capacitaciones registradas.`} />}</tbody></table></div>
      </>}
    </section>
  );
}

function CourseDialog({ departments, pending, onClose, onSubmit }: { departments: string[]; pending: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <Dialog title="Registrar curso" description="Agrega una capacitación al catálogo institucional." onClose={onClose}><form onSubmit={onSubmit} className="space-y-4 p-6"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field label="Nombre del curso" required><input name="title" required minLength={3} className={inputClass} placeholder="Ej. Gestión ágil de proyectos" /></Field><Field label="Proveedor" required><input name="provider" required className={inputClass} placeholder="Ej. ShiftAI Academy" /></Field><Field label="Categoría" required><input name="category" required className={inputClass} placeholder="Ej. Liderazgo" /></Field><Field label="Departamento objetivo" required><select name="department" defaultValue="Todos los departamentos" className={inputClass}><option>Todos los departamentos</option>{departments.map((department) => <option key={department}>{department}</option>)}</select></Field><Field label="Modalidad" required><select name="format" className={inputClass}><option>Virtual</option><option>Presencial</option><option>Híbrido</option></select></Field><Field label="Duración (horas)" required><input name="duration_hours" type="number" min="1" max="2000" defaultValue="8" required className={inputClass} /></Field><Field label="Cupo máximo" required><input name="capacity" type="number" min="1" max="10000" defaultValue="20" required className={inputClass} /></Field></div><Field label="Descripción"><textarea name="description" className={`${inputClass} min-h-22`} placeholder="Objetivo y contenido principal" /></Field><FormActions onCancel={onClose} submitLabel="Registrar curso" pending={pending} /></form></Dialog>;
}

function ProgramDialog({ departments, courses, pending, onClose, onSubmit }: { departments: string[]; courses: TrainingCourse[]; pending: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <Dialog title="Crear programa de capacitación" description="Agrupa cursos en una ruta de aprendizaje." onClose={onClose}><form onSubmit={onSubmit} className="space-y-4 p-6"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field label="Nombre del programa" required><input name="name" required minLength={3} className={inputClass} placeholder="Ej. Desarrollo de líderes" /></Field><Field label="Nivel" required><select name="level" className={inputClass}><option>Inicial</option><option>Intermedio</option><option>Avanzado</option></select></Field><Field label="Departamento objetivo" required><select name="department" defaultValue="Todos los departamentos" className={inputClass}><option>Todos los departamentos</option>{departments.map((department) => <option key={department}>{department}</option>)}</select></Field></div><Field label="Descripción"><textarea name="description" className={`${inputClass} min-h-20`} placeholder="Propósito y alcance de la ruta" /></Field><fieldset><legend className="mb-2 ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Cursos incluidos *</legend><div className="max-h-44 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">{courses.map((course) => <label key={course.id} className="flex cursor-pointer items-center gap-3 rounded-md bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50"><input type="checkbox" name="course_ids" value={course.id} className="rounded border-slate-300 text-indigo-600" /><span className="flex-1">{course.title}</span><span className="text-[10px] text-slate-400">{course.duration_hours} h</span></label>)}</div></fieldset><FormActions onCancel={onClose} submitLabel="Crear programa" pending={pending} /></form></Dialog>;
}

function AssignmentDialog({ employees, courses, programs, selectedCourseId, pending, onCourseChange, onClose, onSubmit }: { employees: NonNullable<ReturnType<typeof useTrainingEmployees>['data']>; courses: TrainingCourse[]; programs: NonNullable<ReturnType<typeof useTrainingPrograms>['data']>; selectedCourseId: number | null; pending: boolean; onCourseChange: (id: number) => void; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <Dialog title="Asignar capacitación" description="Vincula un curso con un colaborador y una fecha objetivo." onClose={onClose}><form onSubmit={onSubmit} className="space-y-4 p-6"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field label="Colaborador" required><select name="employee_id" defaultValue={employees[0]?.id} className={inputClass}>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.department}</option>)}</select></Field><Field label="Curso" required><select name="course_id" value={selectedCourseId ?? ''} onChange={(event) => onCourseChange(Number(event.target.value))} className={inputClass}>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></Field><Field label="Programa (opcional)"><select name="program_id" defaultValue="" className={inputClass}><option value="">Asignación directa</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select></Field><Field label="Fecha límite" required><input name="due_date" type="date" min={today()} defaultValue={futureDate(30)} required className={inputClass} /></Field></div><Field label="Nota para el colaborador"><textarea name="notes" className={`${inputClass} min-h-20`} placeholder="Objetivo o instrucciones" /></Field><FormActions onCancel={onClose} submitLabel="Asignar capacitación" pending={pending} /></form></Dialog>;
}

function ProgressDialog({ assignment, pending, onClose, onSubmit }: { assignment: TrainingAssignment; pending: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <Dialog title="Registrar participación y resultado" description="Actualiza el avance, la calificación y las observaciones." onClose={onClose}><form onSubmit={onSubmit} className="space-y-4 p-6"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-white p-2 text-indigo-600 shadow-sm"><GraduationCap className="h-5 w-5" /></div><div><p className="text-xs font-bold text-slate-800">{assignment.course_title}</p><p className="mt-0.5 text-[10px] text-slate-400">{assignment.employee_name} · Límite: {formatDate(assignment.due_date)}</p></div></div></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field label="Estado" required><select name="status" defaultValue={assignment.status} className={inputClass}><option>Pendiente</option><option>En progreso</option><option>Completado</option><option>Vencido</option></select></Field><Field label="Progreso (%)" required><input name="progress" type="number" min="0" max="100" defaultValue={assignment.progress} required className={inputClass} /></Field><Field label="Resultado / calificación"><input name="score" type="number" min="0" max="100" step="0.01" defaultValue={assignment.score ?? ''} className={inputClass} placeholder="0 a 100" /></Field></div><Field label="Observaciones"><textarea name="notes" defaultValue={assignment.notes ?? ''} className={`${inputClass} min-h-24`} placeholder="Participación, evidencia o retroalimentación" /></Field><FormActions onCancel={onClose} submitLabel="Guardar seguimiento" pending={pending} /></form></Dialog>;
}

function Dialog({ title, description, onClose, children }: { title: string; description: string; onClose: () => void; children: ReactNode }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={onClose}><motion.section initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }} onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={title} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"><header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-4"><div><h2 className="text-sm font-bold text-slate-800">{title}</h2><p className="mt-1 text-[11px] leading-relaxed text-slate-500">{description}</p></div><button type="button" onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700" aria-label="Cerrar diálogo"><X className="h-5 w-5" /></button></header>{children}</motion.section></motion.div>;
}

function MetricCard({ icon, label, value, detail, tone }: { icon: ReactNode; label: string; value: string; detail: string; tone: 'indigo' | 'amber' | 'emerald' | 'rose' }) {
  const toneClass = { indigo: 'bg-indigo-50 text-indigo-600', amber: 'bg-amber-50 text-amber-600', emerald: 'bg-emerald-50 text-emerald-600', rose: 'bg-rose-50 text-rose-600' }[tone];
  return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p><p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-800">{value}</p></div><span className={`rounded-lg p-2.5 ${toneClass}`}>{icon}</span></div><p className="mt-2 text-[11px] font-medium text-slate-500">{detail}</p></article>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return <label className="block space-y-1.5"><span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}{required && <span className="text-rose-500"> *</span>}</span>{children}</label>;
}

function FormActions({ onCancel, submitLabel, pending }: { onCancel: () => void; submitLabel: string; pending: boolean }) {
  return <div className="flex gap-3 border-t border-slate-100 pt-4"><button type="button" onClick={onCancel} disabled={pending} className="flex-1 rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-60">Cancelar</button><button type="submit" disabled={pending} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F172A] py-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60">{pending && <Loader2 className="h-4 w-4 animate-spin" />}{submitLabel}</button></div>;
}

function ActionHeader({ title, description, action, onAction, dark = false }: { title: string; description: string; action: string; onAction: () => void; dark?: boolean }) {
  return <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center"><div><h2 className="text-base font-bold text-slate-800">{title}</h2><p className="mt-1 text-xs text-slate-500">{description}</p></div><button onClick={onAction} className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-xs font-bold shadow-sm ${dark ? 'bg-[#0F172A] text-white hover:bg-slate-800' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}><Plus className="h-4 w-4" /> {action}</button></div>;
}

function SectionHeader({ title, description, badge }: { title: string; description: string; badge: string }) {
  return <div className="flex flex-col justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center"><div><h2 className="text-sm font-bold text-slate-800">{title}</h2><p className="mt-0.5 text-[11px] text-slate-500">{description}</p></div><span className="w-fit rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500">{badge}</span></div>;
}

function Progress({ assignment }: { assignment: TrainingAssignment }) {
  const color = assignment.status === 'Vencido' ? 'bg-rose-500' : assignment.status === 'Completado' ? 'bg-emerald-500' : 'bg-indigo-500';
  return <div className="mx-auto w-24"><div className="mb-1 flex justify-between text-[10px] font-bold text-slate-500"><span>{assignment.progress}%</span>{assignment.score !== null && <span className="text-emerald-600">{assignment.score}/100</span>}</div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${assignment.progress}%` }} /></div></div>;
}

function StatusBadge({ status, compact = false }: { status: TrainingStatus; compact?: boolean }) {
  const styles: Record<TrainingStatus, string> = { Pendiente: 'border-amber-100 bg-amber-50 text-amber-700', 'En progreso': 'border-indigo-100 bg-indigo-50 text-indigo-700', Completado: 'border-emerald-100 bg-emerald-50 text-emerald-700', Vencido: 'border-rose-100 bg-rose-50 text-rose-700' };
  return <span className={`inline-flex rounded-full border font-bold ${compact ? 'px-2 py-0.5 text-[9px]' : 'px-2 py-1 text-[10px]'} ${styles[status]}`}>{status}</span>;
}

function Avatar({ initials: value }: { initials: string }) {
  return <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-[10px] font-bold text-slate-600">{value}</div>;
}

function HistoryStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4"><span className="rounded-lg bg-white p-2 text-indigo-600 shadow-sm">{icon}</span><div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p><p className="mt-1 text-lg font-extrabold text-slate-800">{value}</p></div></div>;
}

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return <tr><td colSpan={colSpan} className="p-12 text-center text-xs font-semibold text-slate-400">{label}</td></tr>;
}

function EmptyState({ label }: { label: string }) {
  return <div className="col-span-full flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center"><Search className="h-7 w-7 text-slate-300" /><p className="mt-2 text-xs font-bold text-slate-500">{label}</p></div>;
}

function LoadingState() {
  return <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white"><div className="text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" /><p className="mt-3 text-sm font-semibold text-slate-500">Cargando Capacitaciones...</p></div></div>;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-rose-200 bg-white p-6"><div className="max-w-md text-center"><AlertTriangle className="mx-auto h-10 w-10 text-rose-500" /><h2 className="mt-3 text-lg font-bold text-slate-800">No se pudo cargar Capacitaciones</h2><p className="mt-2 text-sm text-slate-500">{message}</p><button onClick={onRetry} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white"><RefreshCw className="h-4 w-4" /> Reintentar</button></div></div>;
}

function ClipboardIcon() {
  return <BarChart3 className="h-5 w-5" />;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-DO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
}

function matchesQuery(query: string, ...values: Array<string | undefined>): boolean {
  const normalized = query.trim().toLocaleLowerCase('es');
  return !normalized || values.some((value) => value?.toLocaleLowerCase('es').includes(normalized));
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function csvCell(value: unknown): string {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function futureDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
