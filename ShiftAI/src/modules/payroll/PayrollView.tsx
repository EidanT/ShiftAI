import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { sileo } from 'sileo';
import {
  Plus,
  X,
  Banknote,
  CalendarRange,
  Loader2,
  CheckCircle2,
  CircleDollarSign,
  Ban,
  ChevronRight,
  Receipt,
} from 'lucide-react';

import PayReceiptModal from '../../components/payroll/PayReceiptModal';
import {
  usePayrollRuns,
  usePayrollRun,
  useGeneratePayroll,
  useUpdatePayrollStatus,
} from '../../hooks/usePayroll';
import type { PayrollPeriodType, PayrollStatus } from '../../api/types';

const currency = new Intl.NumberFormat('es-DO', {
  style: 'currency',
  currency: 'DOP',
  maximumFractionDigits: 2,
});

const STATUS_STYLES: Record<PayrollStatus, string> = {
  Generada: 'bg-slate-100 text-slate-700',
  Aprobada: 'bg-blue-50 text-blue-700',
  Pagada: 'bg-emerald-50 text-emerald-700',
  Anulada: 'bg-rose-50 text-rose-700',
};

const NEXT_STATUS: Partial<Record<PayrollStatus, PayrollStatus>> = {
  Generada: 'Aprobada',
  Aprobada: 'Pagada',
};

export default function PayrollView() {
  const { data: runs, isLoading, isError, error } = usePayrollRuns();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  
  // Estado para controlar qué recibo se está viendo
  const [selectedReceipt, setSelectedReceipt] = useState<{ runId: number; employeeId: number } | null>(null);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <p className="text-xs font-bold tracking-wide uppercase text-[#6366F1] mb-1">
            RRHH · Nómina
          </p>
          <h1 className="text-3xl font-display font-semibold text-slate-900">
            Gestión de Nómina
          </h1>
          <p className="text-slate-500 mt-1">
            Genera corridas, aprueba pagos y consulta comprobantes por empleado.
          </p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 bg-[#6366F1] text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#4F46E5] transition-colors shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
          Generar Nómina
        </button>
      </div>

      {/* Summary strip */}
      {runs && runs.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <SummaryCard
            icon={<CalendarRange size={18} />}
            label="Corridas generadas"
            value={String(runs.length)}
          />
          <SummaryCard
            icon={<Banknote size={18} />}
            label="Último periodo"
            value={`${runs[0].period_start} — ${runs[0].period_end}`}
          />
          <SummaryCard
            icon={<CircleDollarSign size={18} />}
            label="Total neto (último)"
            value={currency.format(runs[0].total_net)}
          />
        </div>
      )}

      {/* Runs table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
            <Loader2 size={18} className="animate-spin" />
            Cargando corridas de nómina...
          </div>
        )}

        {isError && (
          <div className="p-6 text-sm text-rose-600">
            No se pudieron cargar las nóminas: {(error as Error)?.message ?? 'Error desconocido'}
          </div>
        )}

        {!isLoading && !isError && (!runs || runs.length === 0) && (
          <div className="p-10 text-center text-slate-500">
            Aún no se ha generado ninguna nómina. Crea la primera con el botón de arriba.
          </div>
        )}

        {!isLoading && !isError && runs && runs.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                <th className="px-5 py-3">Periodo</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Bruto</th>
                <th className="px-5 py-3">Deducciones</th>
                <th className="px-5 py-3">Neto</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <RunRow
                  key={run.id}
                  run={run}
                  onOpen={() => setSelectedRunId(run.id)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {showGenerateModal && (
          <GenerateModal onClose={() => setShowGenerateModal(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRunId !== null && (
          <RunDetailDrawer 
            runId={selectedRunId} 
            onClose={() => setSelectedRunId(null)} 
            onOpenReceipt={(employeeId) => setSelectedReceipt({ runId: selectedRunId, employeeId })}
          />
        )}
      </AnimatePresence>

      {/* MODAL NUEVO: Recibo de Pago */}
      <AnimatePresence>
        {selectedReceipt !== null && (
          <PayReceiptModal
            runId={selectedReceipt.runId}
            employeeId={selectedReceipt.employeeId}
            onClose={() => setSelectedReceipt(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-lg font-semibold text-slate-900 truncate">{value}</p>
    </div>
  );
}

function RunRow({
  run,
  onOpen,
}: {
  run: { id: number; period_start: string; period_end: string; period_type: PayrollPeriodType; status: PayrollStatus; total_gross: number; total_deductions: number; total_net: number };
  onOpen: () => void;
}) {
  const { mutate: updateStatus, isPending } = useUpdatePayrollStatus();
  const nextStatus = NEXT_STATUS[run.status];

  const handleAdvance = () => {
    if (!nextStatus) return;
    updateStatus(
      { id: run.id, input: { status: nextStatus } },
      {
        onSuccess: () => {
          sileo.success({
            title: `Nómina marcada como ${nextStatus}`,
            description: `Periodo ${run.period_start} al ${run.period_end}.`,
          });
        },
        onError: (err) => {
          sileo.error({ title: 'No se pudo actualizar', description: (err as Error).message });
        },
      },
    );
  };

  const handleCancel = () => {
    updateStatus(
      { id: run.id, input: { status: 'Anulada' } },
      {
        onSuccess: () => {
          sileo.info({ title: 'Nómina anulada', description: `Folio #${run.id} anulado.` });
        },
        onError: (err) => {
          sileo.error({ title: 'No se pudo anular', description: (err as Error).message });
        },
      },
    );
  };

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
      <td className="px-5 py-3.5 font-medium text-slate-800">
        {run.period_start} — {run.period_end}
      </td>
      <td className="px-5 py-3.5 text-slate-500">{run.period_type}</td>
      <td className="px-5 py-3.5">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[run.status]}`}>
          {run.status}
        </span>
      </td>
      <td className="px-5 py-3.5 text-slate-700">{currency.format(run.total_gross)}</td>
      <td className="px-5 py-3.5 text-slate-700">{currency.format(run.total_deductions)}</td>
      <td className="px-5 py-3.5 font-semibold text-slate-900">{currency.format(run.total_net)}</td>
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-2">
          {nextStatus && (
            <button
              onClick={handleAdvance}
              disabled={isPending}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 size={13} />
              Marcar {nextStatus}
            </button>
          )}
          {run.status !== 'Anulada' && run.status !== 'Pagada' && (
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg hover:bg-rose-100 transition-colors disabled:opacity-50"
            >
              <Ban size={13} />
              Anular
            </button>
          )}
          <button
            onClick={onOpen}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Ver detalle
            <ChevronRight size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function GenerateModal({ onClose }: { onClose: () => void }) {
  const { mutate: generate, isPending } = useGeneratePayroll();
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [periodType, setPeriodType] = useState<PayrollPeriodType>('Mensual');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodStart || !periodEnd) return;

    generate(
      { period_start: periodStart, period_end: periodEnd, period_type: periodType },
      {
        onSuccess: () => {
          sileo.success({
            title: 'Nómina generada',
            description: `Corrida ${periodType.toLowerCase()} del ${periodStart} al ${periodEnd} creada.`,
          });
          onClose();
        },
        onError: (err) => {
          sileo.error({ title: 'No se pudo generar la nómina', description: (err as Error).message });
        },
      },
    );
  };

  return (
    <motion.div
      className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Generar Nómina</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Tipo de periodo
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value as PayrollPeriodType)}
              className="form-input"
            >
              <option value="Mensual">Mensual</option>
              <option value="Quincenal">Quincenal</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Inicio del periodo
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                required
                className="form-input"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Fin del periodo
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                required
                className="form-input"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#6366F1] hover:bg-[#4F46E5] transition-colors disabled:opacity-60"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Generar
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function RunDetailDrawer({ 
  runId, 
  onClose,
  onOpenReceipt
}: { 
  runId: number; 
  onClose: () => void;
  onOpenReceipt: (employeeId: number) => void;
}) {
  const { data: run, isLoading } = usePayrollRun(runId);

  return (
    <motion.div
      className="fixed inset-0 bg-slate-900/40 flex justify-end z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="bg-white w-full max-w-2xl h-full overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase text-[#6366F1] mb-1">Detalle de Nómina</p>
            <h2 className="text-xl font-semibold text-slate-900">
              {run ? `${run.period_start} — ${run.period_end}` : 'Cargando...'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
            <Loader2 size={18} className="animate-spin" />
            Cargando detalle...
          </div>
        )}

        {run && (
          <div className="grid gap-4">
            {(run.details ?? []).map((detail) => (
              <div key={detail.employee_id} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{detail.employee_name}</p>
                    <p className="text-xs text-slate-500">
                      {detail.position ?? 'Sin cargo'} · {detail.department ?? 'Sin departamento'}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-900">{currency.format(detail.net_pay)}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-500">
                  <span>Salario base: {currency.format(detail.base_salary)}</span>
                  <span>Horas extra: {detail.overtime_hours}h ({currency.format(detail.overtime_amount)})</span>
                  <span>AFP: {currency.format(detail.afp)}</span>
                  <span>SFS: {currency.format(detail.sfs)}</span>
                  <span>ISR: {currency.format(detail.isr)}</span>
                  <span>Total deducciones: {currency.format(detail.total_deductions)}</span>
                </div>
                
                {/* BOTÓN ACTUALIZADO PARA ABRIR EL MODAL */}
                <button
                  type="button"
                  onClick={() => onOpenReceipt(detail.employee_id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6366F1] hover:text-[#4F46E5] mt-3 transition-colors"
                >
                  <Receipt size={13} />
                  Ver comprobante
                </button>
              </div>
            ))}

            {(!run.details || run.details.length === 0) && (
              <p className="text-sm text-slate-500">Sin detalle disponible para esta corrida.</p>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}