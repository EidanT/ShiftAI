import { motion } from 'motion/react';
import { X, Printer, Loader2, Building2, CheckCircle } from 'lucide-react';
import { usePayrollReceipt } from '../../hooks/usePayroll';

interface PayReceiptModalProps {
  runId: number;
  employeeId: number;
  onClose: () => void;
}

const currency = new Intl.NumberFormat('es-DO', {
  style: 'currency',
  currency: 'DOP',
  maximumFractionDigits: 2,
});

export default function PayReceiptModal({ runId, employeeId, onClose }: PayReceiptModalProps) {
  const { data: receipt, isLoading, isError, error } = usePayrollReceipt(runId, employeeId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Acciones superiores (No se imprimen) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 print:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Comprobante Oficial de Pago
          </span>
          <div className="flex items-center gap-2">
            {receipt && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              >
                <Printer size={14} />
                Imprimir / PDF
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Estado de Carga */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 size={20} className="animate-spin text-[#6366F1]" />
            <span className="text-sm font-medium">Generando volante de pago...</span>
          </div>
        )}

        {/* Estado de Error */}
        {isError && (
          <div className="p-8 text-center">
            <p className="text-sm text-rose-600 font-medium">
              No se pudo cargar el recibo de pago.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {(error as Error)?.message ?? 'Error de conexión'}
            </p>
          </div>
        )}

        {/* Cuerpo del Recibo Printable */}
        {receipt && (
          <div className="p-8 print:p-0 print:text-black">
            {/* Header del documento */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#6366F1]">
                  <Building2 size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">ShiftAI Systems</h2>
                  <p className="text-xs text-slate-500">Comprobante de Pago de Nómina</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  No. Recibo
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">{receipt.receipt_number}</span>
                <p className="text-xs text-slate-500 mt-0.5">Emitido: {receipt.issued_at}</p>
              </div>
            </div>

            {/* Información del Empleado y Periodo */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 print:bg-slate-100/50 rounded-xl p-4 mb-6 text-xs">
              <div>
                <p className="text-slate-400 font-medium uppercase mb-1">Empleado</p>
                <p className="font-bold text-slate-900 text-sm">{receipt.employee.name}</p>
                <p className="text-slate-600 mt-0.5">Cédula: {receipt.employee.national_id}</p>
                <p className="text-slate-600">
                  {receipt.employee.position ?? 'Empleado'} · {receipt.employee.department ?? 'General'}
                </p>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <p className="text-slate-400 font-medium uppercase mb-1">Detalles del Periodo</p>
                <p className="font-semibold text-slate-800">
                  {receipt.period.start} al {receipt.period.end}
                </p>
                <p className="text-slate-600 mt-0.5">Frecuencia: {receipt.period.type}</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-700 font-semibold">
                  <CheckCircle size={12} />
                  <span>Estado: {receipt.status}</span>
                </div>
              </div>
            </div>

            {/* Tabla de Ganancias y Deducciones */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Ingresos */}
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-500 border-b border-slate-200 pb-2 mb-3">
                  Ingresos / Ganancias
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Salario Base</span>
                    <span className="font-mono font-medium">{currency.format(receipt.earnings.base_salary)}</span>
                  </div>
                  {receipt.earnings.overtime_hours > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Horas Extra ({receipt.earnings.overtime_hours}h)</span>
                      <span className="font-mono font-medium">{currency.format(receipt.earnings.overtime_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2 mt-2">
                    <span>Total Bruto</span>
                    <span className="font-mono">{currency.format(receipt.earnings.gross_pay)}</span>
                  </div>
                </div>
              </div>

              {/* Deducciones */}
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-500 border-b border-slate-200 pb-2 mb-3">
                  Deducciones de Ley
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>AFP (Pensines)</span>
                    <span className="font-mono font-medium">{currency.format(receipt.deductions.afp)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SFS (Salud)</span>
                    <span className="font-mono font-medium">{currency.format(receipt.deductions.sfs)}</span>
                  </div>
                  {receipt.deductions.isr > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>ISR (Impuesto)</span>
                      <span className="font-mono font-medium">{currency.format(receipt.deductions.isr)}</span>
                    </div>
                  )}
                  {receipt.deductions.other > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Otras Deducciones</span>
                      <span className="font-mono font-medium">{currency.format(receipt.deductions.other)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-rose-600 border-t border-slate-100 pt-2 mt-2">
                    <span>Total Deducciones</span>
                    <span className="font-mono">-{currency.format(receipt.deductions.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Neto a Cobrar */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                  Monto Neto a Recibir
                </span>
                <p className="text-xs text-indigo-600">Transferencia o depósito bancario</p>
              </div>
              <span className="text-2xl font-bold font-mono text-[#6366F1]">
                {currency.format(receipt.net_pay)}
              </span>
            </div>

            {/* Pie de firma / Nota legal */}
            <div className="mt-8 pt-6 border-t border-dashed border-slate-200 text-center text-[10px] text-slate-400">
              Este comprobante es generado electrónicamente por el sistema SIGRH de ShiftAI. Válido sin firma ni sello.
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}