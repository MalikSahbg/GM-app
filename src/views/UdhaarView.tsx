import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Wallet,
  Search,
  CheckCircle2,
  AlertCircle,
  Phone,
  Share2,
  DollarSign,
  Filter,
  Plus,
  ArrowUpDown,
} from 'lucide-react';

interface UdhaarViewProps {
  onOpenRecordPayment: (customerId: string) => void;
  onOpenQuickSale: () => void;
}

export const UdhaarView: React.FC<UdhaarViewProps> = ({
  onOpenRecordPayment,
  onOpenQuickSale,
}) => {
  const { customerBalances, stats } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const [sortBy, setSortBy] = useState<'HIGHEST' | 'NAME'>('HIGHEST');

  const filteredBalances = useMemo(() => {
    return customerBalances
      .filter((b) => {
        // filter by status
        if (filterType === 'UNPAID' && b.outstandingBalance <= 0) return false;
        if (filterType === 'PAID' && b.outstandingBalance > 0) return false;

        // filter by search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          return (
            b.customerName.toLowerCase().includes(term) ||
            b.customerPhone.toLowerCase().includes(term)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'HIGHEST') {
          return b.outstandingBalance - a.outstandingBalance;
        } else {
          return a.customerName.localeCompare(b.customerName);
        }
      });
  }, [customerBalances, filterType, searchTerm, sortBy]);

  const handleShareWhatsApp = (customerName: string, phone: string, amount: number) => {
    const text = `Assalam-o-Alaikum ${customerName}, your current outstanding balance is ${formatCurrency(
      amount
    )}. Please arrange payment at your convenience. Thank you!`;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Total Outstanding Banner as specified in Android README */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-rose-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-200 text-xs font-bold uppercase tracking-wider">
            <Wallet className="h-4 w-4" />
            <span>Customer Udhaar Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            {formatCurrency(stats.totalUdhaar)}
          </h1>
          <p className="text-rose-100/90 text-xs sm:text-sm mt-1">
            Total outstanding balance across {stats.pendingUdhaarCustomers} pending customer accounts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-white/20 text-center">
            <span className="text-[11px] text-rose-200 font-semibold uppercase block">
              Clear Accounts
            </span>
            <span className="text-lg font-bold text-white">
              {customerBalances.filter((b) => b.outstandingBalance === 0).length} / {customerBalances.length}
            </span>
          </div>
          <button
            onClick={onOpenQuickSale}
            className="px-4 py-2.5 bg-white text-rose-800 hover:bg-rose-50 font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            + New Sale
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Status Filter Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterType === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({customerBalances.length})
            </button>
            <button
              onClick={() => setFilterType('UNPAID')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterType === 'UNPAID'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              Pending ({stats.pendingUdhaarCustomers})
            </button>
            <button
              onClick={() => setFilterType('PAID')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterType === 'PAID'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              Cleared ({customerBalances.filter((b) => b.outstandingBalance === 0).length})
            </button>
          </div>

          {/* Sort By Toggle */}
          <button
            onClick={() => setSortBy((prev) => (prev === 'HIGHEST' ? 'NAME' : 'HIGHEST'))}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-medium flex items-center gap-1 shrink-0"
            title="Sort By"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {sortBy === 'HIGHEST' ? 'Highest Due' : 'By Name'}
            </span>
          </button>
        </div>
      </div>

      {/* Udhaar Customer Cards Grid */}
      {/* Android spec: "Red cards = customers with unpaid balance, Green cards = fully paid customers" */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBalances.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Customer Balances Matching Filter</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Change the search term or status filter above to view all customer accounts.
            </p>
          </div>
        ) : (
          filteredBalances.map((item) => {
            const hasUdhaar = item.outstandingBalance > 0;
            return (
              <div
                key={item.customerId}
                className={`rounded-2xl p-5 border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                  hasUdhaar
                    ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300 hover:shadow-md'
                    : 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top row with name and badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-base text-slate-900 truncate">
                        {item.customerName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-mono">{item.customerPhone}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full shrink-0 ${
                        hasUdhaar
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {hasUdhaar ? 'UNPAID' : 'CLEARED'}
                    </span>
                  </div>

                  {/* Financial breakdown */}
                  <div className="mt-4 p-3 rounded-xl bg-white/80 border border-slate-200/60 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Purchases:</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(item.totalPurchased)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Total Paid:</span>
                      <span className="font-semibold text-emerald-700">
                        {formatCurrency(item.totalPaid)}
                      </span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200 flex justify-between items-baseline font-bold">
                      <span className={hasUdhaar ? 'text-rose-800' : 'text-emerald-800'}>
                        {hasUdhaar ? 'Pending Udhaar:' : 'Balance Due:'}
                      </span>
                      <span className={`text-base ${hasUdhaar ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {formatCurrency(item.outstandingBalance)}
                      </span>
                    </div>
                  </div>

                  {item.lastSaleDate && (
                    <p className="text-[11px] text-slate-400 mt-2">
                      Last transaction: {formatDate(item.lastSaleDate)}
                    </p>
                  )}
                </div>

                {/* Bottom Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {hasUdhaar && (
                      <button
                        onClick={() =>
                          handleShareWhatsApp(item.customerName, item.customerPhone, item.outstandingBalance)
                        }
                        title="Send WhatsApp Payment Reminder"
                        className="p-2 text-slate-600 hover:text-emerald-600 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors shadow-2xs"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    )}
                    <a
                      href={`tel:${item.customerPhone}`}
                      title="Call Customer"
                      className="p-2 text-slate-600 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-xl border border-slate-200 transition-colors shadow-2xs"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  </div>

                  {hasUdhaar ? (
                    <button
                      onClick={() => onOpenRecordPayment(item.customerId)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>Collect Payment</span>
                    </button>
                  ) : (
                    <button
                      onClick={onOpenQuickSale}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
                    >
                      + New Order
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
