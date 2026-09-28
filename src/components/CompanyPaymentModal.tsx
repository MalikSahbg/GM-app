import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { X, ArrowUpRight, CheckCircle2, Building2 } from 'lucide-react';
import { CompanyPayment } from '../types';

interface CompanyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCompanyId?: string;
}

export const CompanyPaymentModal: React.FC<CompanyPaymentModalProps> = ({
  isOpen,
  onClose,
  preselectedCompanyId,
}) => {
  const { companies, companyBalances, recordCompanyPayment, settings } = useApp();

  const [companyId, setCompanyId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<CompanyPayment['paymentMethod']>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [note, setNote] = useState('Payment towards supplier ledger');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedCompanyId) {
      setCompanyId(preselectedCompanyId);
    } else if (companies.length > 0) {
      setCompanyId(companies[0].id);
    }
    setErrorMsg(null);
  }, [preselectedCompanyId, companies, isOpen]);

  const activeCompanyBalance = companyBalances.find((b) => b.companyId === companyId);
  const payable = activeCompanyBalance?.remainingPayable || 0;

  useEffect(() => {
    if (payable > 0) {
      setAmount(payable);
    }
  }, [companyId, payable]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      setErrorMsg('Please select a company');
      return;
    }
    if (amount <= 0) {
      setErrorMsg('Amount must be greater than 0');
      return;
    }

    recordCompanyPayment(companyId, amount, paymentMethod, note.trim() || undefined, referenceNumber.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-purple-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-purple-200" />
            <h2 className="text-base font-bold">Pay Supplier Company</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-purple-200 hover:text-white hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <p className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-semibold">
              {errorMsg}
            </p>
          )}

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
              Select Supplier Company *
            </label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500"
            >
              {companies.map((c) => {
                const bal = companyBalances.find((b) => b.companyId === c.id);
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} — {formatCurrency(bal?.remainingPayable || 0, settings.currency)} Payable
                  </option>
                );
              })}
            </select>
          </div>

          {/* Current payable card */}
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
            <span className="text-purple-900 font-medium">Total Company Payable Debt:</span>
            <span className="text-lg font-black text-purple-800">
              {formatCurrency(payable, settings.currency)}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Payment Amount to Pay ({settings.currency}) *
              </label>
              {payable > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(payable)}
                  className="text-purple-700 hover:underline font-bold text-[11px]"
                >
                  Pay Full Debt
                </button>
              )}
            </div>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 text-base font-black text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e: any) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                Cheque / Txn Slip #
              </label>
              <input
                type="text"
                placeholder="e.g. CHQ-48192"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
              Payment Remarks / Reason
            </label>
            <input
              type="text"
              placeholder="e.g. Cleared bill UNL-INV-4821 via online bank transfer"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={amount <= 0}
              className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 disabled:opacity-50 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Record Supplier Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
