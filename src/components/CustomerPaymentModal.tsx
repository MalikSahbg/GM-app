import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { X, ArrowDownLeft, CheckCircle2, User } from 'lucide-react';
import { CustomerPayment } from '../types';

interface CustomerPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCustomerId?: string;
}

export const CustomerPaymentModal: React.FC<CustomerPaymentModalProps> = ({
  isOpen,
  onClose,
  preselectedCustomerId,
}) => {
  const { customers, customerBalances, recordCustomerPayment, settings } = useApp();

  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<CustomerPayment['paymentMethod']>('Cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [note, setNote] = useState('Payment received towards balance');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedCustomerId) {
      setCustomerId(preselectedCustomerId);
    } else if (customers.length > 0) {
      setCustomerId(customers[0].id);
    }
    setErrorMsg(null);
  }, [preselectedCustomerId, customers, isOpen]);

  const activeCustomerBalance = customerBalances.find((b) => b.customerId === customerId);
  const outstanding = activeCustomerBalance?.outstandingBalance || 0;

  useEffect(() => {
    if (outstanding > 0) {
      setAmount(outstanding);
    }
  }, [customerId, outstanding]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setErrorMsg('Please select a customer');
      return;
    }
    if (amount <= 0) {
      setErrorMsg('Amount must be greater than 0');
      return;
    }

    recordCustomerPayment(customerId, amount, paymentMethod, note.trim() || undefined, referenceNumber.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="h-5 w-5 text-emerald-200" />
            <h2 className="text-base font-bold">Collect Customer Udhaar Payment</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10">
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
              Select Customer *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
            >
              {customers.map((c) => {
                const bal = customerBalances.find((b) => b.customerId === c.id);
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) — {formatCurrency(bal?.outstandingBalance || 0, settings.currency)} Due
                  </option>
                );
              })}
            </select>
          </div>

          {/* Current balance card */}
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
            <span className="text-rose-800 font-medium">Outstanding Udhaar:</span>
            <span className="text-lg font-black text-rose-700">
              {formatCurrency(outstanding, settings.currency)}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Amount Received ({settings.currency}) *
              </label>
              {outstanding > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(outstanding)}
                  className="text-emerald-700 hover:underline font-bold text-[11px]"
                >
                  Clear Full Balance
                </button>
              )}
            </div>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 text-base font-black text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
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
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                Ref / Slip #
              </label>
              <input
                type="text"
                placeholder="e.g. TXN-1092"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
              Payment Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Cash received at store counter"
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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Record Payment & Update Khata</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
