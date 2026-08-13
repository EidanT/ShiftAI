import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Edit3,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';

import {
  type CreateLicenseDto,
  type License,
  type LicenseStatus,
  type LicenseType,
  createLicense,
  deleteLicense,
  getLicenses,
  updateLicense,
  updateLicenseStatus,
} from './licensesApi';

interface LicensesViewProps {
  onTriggerToast?: (
    text: string,
    sub?: string,
    type?: 'success' | 'info' | 'error',
  ) => void;
}

interface LicenseFormState {
  employee_id: string;
  type: LicenseType;
  start_date: string;
  end_date: string;
  reason: string;
}

const licenseTypes: LicenseType[] = [
  'PERMISO',
  'LICENCIA',
  'VACACIONES',
];

const licenseStatuses: LicenseStatus[] = [
  'PENDIENTE',
  'APROBADO',
  'RECHAZADO',
];

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm: LicenseFormState = {
  employee_id: '',
  type: 'PERMISO',
  start_date: today(),
  end_date: today(),
  reason: '',
};

const normalizeId = (value: string): number | null => {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : null;
};

const formatDate = (value: string): string => {
  const [year, month, day] = value.split('-');

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
};

const getStatusClass = (status: LicenseStatus): string => {
  switch (status) {
    case 'APROBADO':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';

    case 'RECHAZADO':
      return 'border-rose-200 bg-rose-50 text-rose-700';

    default:
      return 'border-amber-200 bg-amber-50 text-amber-700';
  }
};

const getTypeClass = (type: LicenseType): string => {
  switch (type) {
    case 'VACACIONES':
      return 'bg-blue-50 text-blue-700';

    case 'LICENCIA':
      return 'bg-purple-50 text-purple-700';

    default:
      return 'bg-slate-100 text-slate-700';
  }
};

export default function LicensesView({
  onTriggerToast,
}: LicensesViewProps) {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'Todos' | LicenseStatus
  >('Todos');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] =
    useState<LicenseFormState>(emptyForm);

  const loadLicenses = async (
    silent = false,
  ): Promise<boolean> => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError(null);

      const data = await getLicenses();

      setLicenses(data);

      return true;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'No fue posible cargar las solicitudes.';

      setError(message);

      onTriggerToast?.(
        'No se pudieron cargar las solicitudes',
        message,
        'error',
      );

      return false;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadLicenses();
  }, []);

  const filteredLicenses = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return licenses.filter((license) => {
      const text = [
        license.id,
        license.employee_id,
        license.type,
        license.reason ?? '',
        license.status,
        license.approved_by ?? '',
        license.start_date,
        license.end_date,
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        search.length === 0 || text.includes(search);

      const matchesStatus =
        filterStatus === 'Todos' ||
        license.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [licenses, searchQuery, filterStatus]);

  const totalPending = licenses.filter(
    (item) => item.status === 'PENDIENTE',
  ).length;

  const totalApproved = licenses.filter(
    (item) => item.status === 'APROBADO',
  ).length;

  const totalRejected = licenses.filter(
    (item) => item.status === 'RECHAZADO',
  ).length;

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleOpenCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (license: License) => {
    setEditingId(license.id);

    setForm({
      employee_id: String(license.employee_id),
      type: license.type,
      start_date: license.start_date,
      end_date: license.end_date,
      reason: license.reason ?? '',
    });

    setShowForm(true);
  };

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    const employeeId = normalizeId(form.employee_id);

    if (!employeeId) {
      onTriggerToast?.(
        'Empleado requerido',
        'Debe indicar un ID de empleado válido.',
        'error',
      );

      return;
    }

    if (form.end_date < form.start_date) {
      onTriggerToast?.(
        'Fechas inválidas',
        'La fecha final no puede ser anterior a la fecha inicial.',
        'error',
      );

      return;
    }

    const payload: CreateLicenseDto = {
      employee_id: employeeId,
      type: form.type,
      start_date: form.start_date,
      end_date: form.end_date,
      reason: form.reason.trim() || null,
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await updateLicense(editingId, payload);

        onTriggerToast?.(
          'Solicitud actualizada',
          'La solicitud fue actualizada correctamente.',
          'success',
        );
      } else {
        await createLicense(payload);

        onTriggerToast?.(
          'Solicitud registrada',
          'La solicitud fue creada como PENDIENTE.',
          'success',
        );
      }

      resetForm();
      await loadLicenses(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'No fue posible guardar la solicitud.';

      onTriggerToast?.(
        'No se pudo guardar la solicitud',
        message,
        'error',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (license: License) => {
    const confirmed = window.confirm(
      `¿Está seguro de eliminar la solicitud #${license.id}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteLicense(license.id);

      onTriggerToast?.(
        'Solicitud eliminada',
        `La solicitud #${license.id} fue eliminada correctamente.`,
        'success',
      );

      await loadLicenses(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'No fue posible eliminar la solicitud.';

      onTriggerToast?.(
        'No se pudo eliminar',
        message,
        'error',
      );
    }
  };

  const handleUpdateStatus = async (
    license: License,
    status: LicenseStatus,
  ) => {
    const approvedBy = window.prompt(
      status === 'APROBADO'
        ? '¿Quién aprueba esta solicitud?'
        : '¿Quién rechaza esta solicitud?',
    );

    if (!approvedBy?.trim()) {
      return;
    }

    try {
      await updateLicenseStatus(license.id, {
        status,
        approved_by: approvedBy.trim(),
      });

      onTriggerToast?.(
        status === 'APROBADO'
          ? 'Solicitud aprobada'
          : 'Solicitud rechazada',
        `La solicitud #${license.id} fue actualizada correctamente.`,
        'success',
      );

      await loadLicenses(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'No fue posible actualizar el estado.';

      onTriggerToast?.(
        'No se pudo actualizar el estado',
        message,
        'error',
      );
    }
  };

  const handleRefresh = async () => {
    const success = await loadLicenses(true);

    if (success) {
      onTriggerToast?.(
        'Datos actualizados',
        'Las solicitudes fueron recargadas desde Supabase.',
        'info',
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 text-left">
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Cargando solicitudes de personal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-display text-[26px] font-bold tracking-tight text-[#0F172A]">
            <FileText className="h-6 w-6 text-[#113B7A]" />
            Solicitudes de Personal
          </h1>

          <p className="mt-1 text-[13px] font-medium text-slate-500">
            Gestión de permisos, licencias y vacaciones de los empleados.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 self-start rounded-lg bg-[#113B7A] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#1E3A8A] lg:self-center"
        >
          <Plus className="h-4 w-4" />
          Nueva solicitud
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            'Total',
            licenses.length,
            'Solicitudes registradas',
          ],
          [
            'Pendientes',
            totalPending,
            'Esperando revisión',
          ],
          [
            'Aprobadas',
            totalApproved,
            'Solicitudes aprobadas',
          ],
          [
            'Rechazadas',
            totalRejected,
            'Solicitudes rechazadas',
          ],
        ].map(([label, value, caption]) => (
          <article
            key={String(label)}
            className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {label}
            </p>

            <strong className="mt-2 block text-3xl font-extrabold tracking-tight text-[#0F172A]">
              {value}
            </strong>

            <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
              {caption}
            </p>
          </article>
        ))}
      </div>

      <section className="rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
              Solicitudes registradas
            </h2>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Consulte, edite, apruebe, rechace o elimine solicitudes.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />

              <input
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Buscar solicitud"
                className="form-input min-w-[220px] pl-9"
              />
            </label>

            <select
              value={filterStatus}
              onChange={(event) =>
                setFilterStatus(
                  event.target.value as
                    | 'Todos'
                    | LicenseStatus,
                )
              }
              className="form-input min-w-[160px]"
            >
              <option value="Todos">Todos</option>

              {licenseStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => void handleRefresh()}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#F1F5F9] px-3.5 py-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-200"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-slate-500 ${
                  refreshing ? 'animate-spin' : ''
                }`}
              />

              Actualizar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3">Empleado</th>
                <th className="px-3 py-3">Tipo</th>
                <th className="px-3 py-3">Desde</th>
                <th className="px-3 py-3">Hasta</th>
                <th className="px-3 py-3">Motivo</th>
                <th className="px-3 py-3">Estado</th>
                <th className="px-3 py-3">Aprobado por</th>
                <th className="px-3 py-3 text-right">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {filteredLicenses.map((license) => (
                <tr
                  key={license.id}
                  className="hover:bg-slate-50/60"
                >
                  <td className="px-3 py-4">
                    <span className="font-bold text-slate-800">
                      #{license.id}
                    </span>
                  </td>

                  <td className="px-3 py-4">
                    <span className="block font-bold text-slate-700">
                      EMP-{license.employee_id}
                    </span>

                    <span className="mt-1 block text-[10px] text-slate-400">
                      ID empleado: {license.employee_id}
                    </span>
                  </td>

                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${getTypeClass(
                        license.type,
                      )}`}
                    >
                      {license.type}
                    </span>
                  </td>

                  <td className="px-3 py-4 font-bold text-slate-700">
                    {formatDate(license.start_date)}
                  </td>

                  <td className="px-3 py-4 font-bold text-slate-700">
                    {formatDate(license.end_date)}
                  </td>

                  <td className="max-w-[220px] px-3 py-4">
                    <span
                      className="block truncate font-medium text-slate-600"
                      title={license.reason ?? ''}
                    >
                      {license.reason || 'Sin motivo'}
                    </span>
                  </td>

                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusClass(
                        license.status,
                      )}`}
                    >
                      {license.status}
                    </span>
                  </td>

                  <td className="px-3 py-4">
                    <span className="font-medium text-slate-600">
                      {license.approved_by || '—'}
                    </span>
                  </td>

                  <td className="px-3 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {license.status === 'PENDIENTE' && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              void handleUpdateStatus(
                                license,
                                'APROBADO',
                              )
                            }
                            className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Aprobar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleUpdateStatus(
                                license,
                                'RECHAZADO',
                              )
                            }
                            className="flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Rechazar
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(license)
                        }
                        className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void handleDelete(license)
                        }
                        className="flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredLicenses.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-10 text-center text-slate-400"
                  >
                    No hay solicitudes con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#F8FAFC] px-6 py-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">
                  {editingId !== null
                    ? 'Editar solicitud'
                    : 'Nueva solicitud'}
                </h2>

                <p className="mt-1 text-[11px] text-slate-400">
                  Registre la información de la solicitud de personal.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-6"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="ID del empleado">
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.employee_id}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        employee_id: event.target.value,
                      }))
                    }
                    placeholder="Ej. 12"
                    className="form-input"
                  />
                </Field>

                <Field label="Tipo de solicitud">
                  <select
                    required
                    value={form.type}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        type: event.target.value as LicenseType,
                      }))
                    }
                    className="form-input"
                  >
                    {licenseTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Fecha de inicio">
                  <input
                    required
                    type="date"
                    value={form.start_date}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        start_date: event.target.value,
                      }))
                    }
                    className="form-input"
                  />
                </Field>

                <Field label="Fecha final">
                  <input
                    required
                    type="date"
                    value={form.end_date}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        end_date: event.target.value,
                      }))
                    }
                    className="form-input"
                  />
                </Field>
              </div>

              <Field label="Motivo">
                <textarea
                  rows={4}
                  value={form.reason}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      reason: event.target.value,
                    }))
                  }
                  placeholder="Describa el motivo de la solicitud"
                  className="form-input resize-none"
                />
              </Field>

              {editingId !== null && (
                <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-[11px] font-semibold text-blue-700">
                  El estado de la solicitud se gestiona desde las
                  acciones de aprobar o rechazar.
                </div>
              )}

              <div className="flex gap-3 border-t border-slate-100 pt-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-lg bg-slate-100 py-3 text-slate-600 hover:bg-slate-200"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-[#113B7A] py-3 text-white shadow-md hover:bg-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving
                    ? 'Guardando...'
                    : editingId !== null
                      ? 'Actualizar solicitud'
                      : 'Crear solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-left">
      <span className="pl-0.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </span>

      {children}
    </label>
  );
}