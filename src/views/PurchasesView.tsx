import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Truck,
  Plus,
  Search,
  Building2,
  Trash2,
  Package,
  Calendar,
  CreditCard,
  CheckCircle2,
  Eye,
  X,
} from 'lucide-react';
import { Purchase, PurchaseItem } from '../types';

interface PurchasesViewProps {
  onOpenNewPurchase: () => void;
  onViewCompanyKhata: (companyId: string) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  onOpenNewPurchase,
  onViewCompanyKhata,
}) => {
  const { purchases, companies, deletePurchase, settings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('ALL');
  const [selectedPurchaseDetail, setSelectedPurchaseDetail] = useState<Purchase | null>(null);

  const filteredPurchases = useMemo(() => {
    return purchases
      .filter((p) => {
        if (selectedCompanyFilter !== 'ALL' && p.companyId !== selectedCompanyFilter) return false;
        if (searchTerm.trim()) {
          const t = searchTerm.toLowerCase();
          return (
            p.companyName.toLowerCase().includes(t) ||
            p.id.toLowerCase().includes(t) ||
            (p.billNumber && p.billNumber.toLowerCase().includes(t)) ||
            (p.notes && p.notes.toLowerCase().includes(t))
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [purchases, selectedCompanyFilter, searchTerm]);

  const handleDelete = (id: string, billNum?: string) => {
    if (
      window.confirm(
        `Void purchase bill "${billNum || id}"?`
      )
    ) {
      deletePurchase(id);
    }
  };

  const totalPurchasesSum = useMemo(() => {
    return purchases.reduce((acc, p) => acc + p.totalAmount, 0);
  }, [purchases]);

  const totalPayableSum = useMemo(() => {
    return purchases.reduce((acc, p) => acc + p.balancePayable, 0);
  }, [purchases]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-blue-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="h-4 w-4" />
            <span>Supplier Purchases</span>
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">Company Purchases</h1>
          <p className="text-blue-100/80 text-xs sm:text-sm mt-1">
            Record supplier purchases and track payable balances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-xs px-4 py-2 rounded-xl border border-white/20 text-center">
            <span className="text-[10px] text-blue-200 font-semibold uppercase block">Total Purchases</span>
            <span className="text-lg font-bold text-white">
              {formatCurrency(totalPurchasesSum, settings.currency)}
            </span>
          </div>

          <button
            onClick={onOpenNewPurchase}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Purchase</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search purchases by company, bill #, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedCompanyFilter}
          onChange={(e) => setSelectedCompanyFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-hidden"
        >
          <option value="ALL">All Companies ({companies.length})</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date / Bill #</th>
                <th className="py-3 px-4">Supplier Company</th>
                <th className="py-3 px-4">Items Received</th>
                <th className="py-3 px-4 text-right">Total Bill</th>
                <th className="py-3 px-4 text-right">Paid to Vendor</th>
                <th className="py-3 px-4 text-right">Balance Payable</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No purchase records found. Click "+ New Purchase" to record a company purchase.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => {
                  const isFullyPaid = purchase.balancePayable === 0;
                  const isUnpaid = purchase.paidAmount === 0;

                  return (
                    <tr key={purchase.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block font-mono text-xs">
                          {purchase.billNumber || purchase.id}
                        </span>
                        <span className="text-[11px] text-slate-400">{formatDate(purchase.date)}</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">{purchase.companyName}</span>
                        <button
                          onClick={() => onViewCompanyKhata(purchase.companyId)}
                          className="text-[11px] text-blue-600 hover:underline"
                        >
                          View Khata Ledger →
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs">
                          <span className="font-medium text-slate-800">
                            {purchase.items?.length || 0} product type(s)
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                            {purchase.items?.map((it) => `${it.quantity} ${it.unit} ${it.productName}`).join(', ')}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrency(purchase.totalAmount, settings.currency)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-emerald-700 whitespace-nowrap">
                        {formatCurrency(purchase.paidAmount, settings.currency)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                        <span className={purchase.balancePayable > 0 ? 'text-rose-700' : 'text-slate-400'}>
                          {formatCurrency(purchase.balancePayable, settings.currency)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isFullyPaid ? (
                          <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                            Paid
                          </span>
                        ) : isUnpaid ? (
                          <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-800">
                            Unpaid Debt
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                            Partial Paid
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedPurchaseDetail(purchase)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Purchase Bill"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(purchase.id, purchase.billNumber)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Void Purchase"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Detail Modal */}
      {selectedPurchaseDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Purchase Bill Summary</h3>
                <p className="text-xs text-slate-500 font-mono">
                  Bill #: {selectedPurchaseDetail.billNumber || selectedPurchaseDetail.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedPurchaseDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Supplier Company:</span>
                <span className="font-bold text-slate-900">{selectedPurchaseDetail.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date Received:</span>
                <span>{formatDate(selectedPurchaseDetail.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span>{selectedPurchaseDetail.paymentMethod}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600">Items Received:</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                {selectedPurchaseDetail.items?.map((it, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-900 block">{it.productName}</span>
                      <span className="text-[11px] text-slate-500">
                        {it.quantity} {it.unit} × {formatCurrency(it.costPrice, settings.currency)}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(it.totalCost, settings.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span>Total Bill Amount:</span>
                <span className="font-bold">{formatCurrency(selectedPurchaseDetail.totalAmount, settings.currency)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Amount Paid:</span>
                <span>{formatCurrency(selectedPurchaseDetail.paidAmount, settings.currency)}</span>
              </div>
              <div className="flex justify-between text-rose-400 font-bold pt-1 border-t border-slate-800">
                <span>Remaining Payable:</span>
                <span>{formatCurrency(selectedPurchaseDetail.balancePayable, settings.currency)}</span>
              </div>
            </div>

            {selectedPurchaseDetail.notes && (
              <p className="text-xs text-slate-500 italic">Note: {selectedPurchaseDetail.notes}</p>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPurchaseDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
