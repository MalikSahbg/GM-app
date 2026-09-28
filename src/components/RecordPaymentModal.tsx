import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { Coins, X, CheckCircle2 } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  customerId,
}) => {
  const { customerBalances, recordPayment } = useApp();

  const customerBalance = useMemo(() => {
    return customerBalances.find((b) => b.customerId === customerId);
  }, [customerBalances, customerId]);

  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customerBalance) {
      setAmount(customerBalance.outstandingBalance);
      setNote('Cash payment received towards balance');
    }
    setError(null);
  }, [customerBalance, isOpen]);

  if (!isOpen || !customerBalance) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Please enter a payment amount greater than 0.');
      return;
    }

    recordPayment(customerBalance.customerId, amount, note);
    onClose();
  };

  const remainingAfterPayment = Math.max(0, customerBalance.outstandingBalance - amount);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Coins className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Collect Udhaar Payment</h2>
              <p className="text-xs text-slate-500">{customerBalance.customerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Balance Banner */}
        <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block">
              Current Outstanding Udhaar
            </span>
            <span className="text-2xl font-black text-rose-700">
              {formatCurrency(customerBalance.outstandingBalance)}
            </span>
          </div>
          <span className="text-xs text-rose-700 font-medium">
            {customerBalance.customerPhone}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg">{error}</p>}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase text-slate-600">
                Amount Received (Rs.) *
              </label>
              <button
                type="button"
                onClick={() => setAmount(customerBalance.outstandingBalance)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Full Balance
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">Rs.</span>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Quick amount shortcuts */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400">Quick:</span>
              {[500, 1000, 2000, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition-colors"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Balance after payment:</span>
            <span
              className={`font-bold text-sm ${
                remainingAfterPayment === 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {formatCurrency(remainingAfterPayment)}
              {remainingAfterPayment === 0 && ' (Account Fully Cleared ✓)'}
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-600 block mb-1">
              Payment Note / Receipt Detail
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Received via cash / JazzCash / bank transfer"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Record & Update Ledger</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
