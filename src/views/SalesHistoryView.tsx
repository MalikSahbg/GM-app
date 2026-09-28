import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
  Eye,
  Download,
  Filter,
} from 'lucide-react';
import { Sale } from '../types';

interface SalesHistoryViewProps {
  onOpenQuickSale: () => void;
  onViewReceipt: (sale: Sale) => void;
}

export const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({
  onOpenQuickSale,
  onViewReceipt,
}) => {
  const { salesDetailed, deleteSale } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UDHAAR' | 'PARTIAL'>('ALL');

  const filteredSales = useMemo(() => {
    return salesDetailed.filter((s) => {
      // filter status
      if (statusFilter === 'PAID' && s.balanceDue > 0) return false;
      if (statusFilter === 'UDHAAR' && s.paidAmount > 0) return false;
      if (statusFilter === 'PARTIAL' && (s.paidAmount === 0 || s.balanceDue === 0)) return false;

      // search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const pNames = s.items && s.items.length > 0
          ? s.items.map((i) => i.productName).join(' ').toLowerCase()
          : (s.productName || '').toLowerCase();
        return (
          s.customerName.toLowerCase().includes(term) ||
          pNames.includes(term) ||
          (s.notes && s.notes.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [salesDetailed, statusFilter, searchTerm]);

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to void/delete this sale? The deducted quantity will be restored back to product inventory.'
      )
    ) {
      deleteSale(id);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Sale ID', 'Date', 'Customer', 'Product', 'Quantity', 'Rate', 'Total', 'Paid', 'Udhaar Due', 'Notes'];
    const rows = filteredSales.map((s) => {
      const pName = s.items && s.items.length > 0
        ? s.items.map((i) => `${i.productName} (${i.quantity})`).join('; ')
        : (s.productName || 'Product');
      const totalQty = s.items && s.items.length > 0
        ? s.items.reduce((acc, i) => acc + i.quantity, 0)
        : (s.quantity || 1);
      return [
        s.id,
        s.date,
        `"${s.customerName}"`,
        `"${pName}"`,
        totalQty,
        s.unitPrice || 0,
        s.totalPrice,
        s.paidAmount,
        s.balanceDue,
        `"${s.notes || ''}"`,
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">Sales Transactions & History</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete audit trail of store sales, invoices, and cash vs. credit breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenQuickSale}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>New Sale</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer, product, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({salesDetailed.length})
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === 'PAID'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-emerald-700 hover:text-emerald-900'
            }`}
          >
            Paid Cash
          </button>
          <button
            onClick={() => setStatusFilter('UDHAAR')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === 'UDHAAR'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-rose-700 hover:text-rose-900'
            }`}
          >
            Full Udhaar
          </button>
          <button
            onClick={() => setStatusFilter('PARTIAL')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === 'PARTIAL'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-amber-700 hover:text-amber-900'
            }`}
          >
            Partial
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    No sales records found matching your query.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                      {formatDate(sale.date)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {sale.customerName}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {sale.items && sale.items.length > 0 ? (
                        <div>
                          <span className="font-medium text-slate-800">
                            {sale.items[0].productName}
                            {sale.items.length > 1 && ` +${sale.items.length - 1} more`}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            {sale.items.length} {sale.items.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="font-medium text-slate-800">{sale.productName || 'Sale Item'}</span>
                          {sale.companyName && (
                            <span className="block text-[11px] text-slate-400">{sale.companyName}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {sale.items && sale.items.length > 0
                        ? sale.items.reduce((acc, i) => acc + i.quantity, 0)
                        : (sale.quantity || 1)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(sale.totalPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-emerald-700">
                      {formatCurrency(sale.paidAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold">
                      <span className={sale.balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                        {formatCurrency(sale.balanceDue)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {sale.balanceDue === 0 ? (
                        <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                          Paid
                        </span>
                      ) : sale.paidAmount === 0 ? (
                        <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-800">
                          Full Udhaar
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                          Partial
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewReceipt(sale)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View / Print Receipt"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Void Sale & Restore Stock"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
