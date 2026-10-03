import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, formatShortDate } from '../utils/formatters';
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Truck,
  Users,
  Building2,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { DocumentType } from '../components/DocumentPrintModal';

interface ReportsViewProps {
  onOpenDocument: (doc: DocumentType) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onOpenDocument }) => {
  const { salesDetailed, purchases, customerBalances, companyBalances, settings } = useApp();

  const [activeReport, setActiveReport] = useState<
    'PROFIT_LOSS' | 'SALES' | 'PURCHASES' | 'RECEIVABLES' | 'PAYABLES'
  >('PROFIT_LOSS');

  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');

  // Filter sales and purchases by date
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return salesDetailed.filter((s) => {
      const sDate = new Date(s.date);
      if (dateFilter === 'TODAY') return s.date.slice(0, 10) === todayStr;
      if (dateFilter === 'WEEK') return sDate >= oneWeekAgo;
      if (dateFilter === 'MONTH') return sDate >= oneMonthAgo;
      return true;
    });
  }, [salesDetailed, dateFilter]);

  const filteredPurchases = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return purchases.filter((p) => {
      const pDate = new Date(p.date);
      if (dateFilter === 'TODAY') return p.date.slice(0, 10) === todayStr;
      if (dateFilter === 'WEEK') return pDate >= oneWeekAgo;
      if (dateFilter === 'MONTH') return pDate >= oneMonthAgo;
      return true;
    });
  }, [purchases, dateFilter]);

  // Overall Financial Metrics
  const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + s.totalPrice, 0);
  const totalProfitCalculated = filteredSales.reduce((acc, s) => acc + (s.totalProfit || 0), 0);
  const totalCostOfGoodsSold = totalSalesRevenue - totalProfitCalculated;
  const profitMarginPercent = totalSalesRevenue > 0 ? (totalProfitCalculated / totalSalesRevenue) * 100 : 0;

  const totalPurchasesCost = filteredPurchases.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalReceivableDebt = customerBalances.reduce((acc, b) => acc + b.outstandingBalance, 0);
  const totalPayableDebt = companyBalances.reduce((acc, b) => acc + b.remainingPayable, 0);

  // Prepare the current filtered report for saving or sharing as a PDF.
  const handleOpenCurrentReportPdf = () => {
    let title = 'Financial Report';
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let summaryCards: { label: string; value: string; color?: string }[] = [];

    if (activeReport === 'PROFIT_LOSS') {
      title = 'Profit & Loss Statement';
      summaryCards = [
        { label: 'Total Revenue', value: formatCurrency(totalSalesRevenue, settings.currency), color: 'text-emerald-700' },
        { label: 'Cost of Goods Sold', value: formatCurrency(totalCostOfGoodsSold, settings.currency), color: 'text-slate-700' },
        { label: 'Gross Profit', value: formatCurrency(totalProfitCalculated, settings.currency), color: 'text-emerald-700' },
        { label: 'Profit Margin', value: `${profitMarginPercent.toFixed(1)}%`, color: 'text-blue-700' },
      ];
      headers = ['Invoice #', 'Date', 'Customer', 'Sale Total', 'Cost (COGS)', 'Gross Profit', 'Margin %'];
      rows = filteredSales.map((s) => {
        const cost = s.totalPrice - (s.totalProfit || 0);
        const margin = s.totalPrice > 0 ? (((s.totalProfit || 0) / s.totalPrice) * 100).toFixed(1) : '0';
        return [
          s.invoiceNumber || s.id,
          formatShortDate(s.date),
          s.customerName,
          formatCurrency(s.totalPrice, settings.currency),
          formatCurrency(cost, settings.currency),
          formatCurrency(s.totalProfit || 0, settings.currency),
          `${margin}%`,
        ];
      });
    } else if (activeReport === 'SALES') {
      title = 'Sales Summary Report';
      summaryCards = [
        { label: 'Total Sales Count', value: `${filteredSales.length} orders` },
        { label: 'Total Sales Revenue', value: formatCurrency(totalSalesRevenue, settings.currency), color: 'text-emerald-700' },
        { label: 'Cash Collected', value: formatCurrency(filteredSales.reduce((a, s) => a + s.paidAmount, 0), settings.currency), color: 'text-emerald-700' },
        { label: 'Udhaar Issued', value: formatCurrency(filteredSales.reduce((a, s) => a + s.balanceDue, 0), settings.currency), color: 'text-rose-700' },
      ];
      headers = ['Invoice #', 'Date', 'Customer', 'Items Qty', 'Total Bill', 'Paid Amount', 'Balance Due'];
      rows = filteredSales.map((s) => [
        s.invoiceNumber || s.id,
        formatShortDate(s.date),
        s.customerName,
        s.items?.reduce((a, it) => a + it.quantity, 0) || s.quantity || 1,
        formatCurrency(s.totalPrice, settings.currency),
        formatCurrency(s.paidAmount, settings.currency),
        formatCurrency(s.balanceDue, settings.currency),
      ]);
    } else if (activeReport === 'PURCHASES') {
      title = 'Company Purchases Report';
      summaryCards = [
        { label: 'Total Purchase Bills', value: `${filteredPurchases.length}` },
        { label: 'Total Inward Cost', value: formatCurrency(totalPurchasesCost, settings.currency), color: 'text-blue-700' },
        { label: 'Amount Paid', value: formatCurrency(filteredPurchases.reduce((a, p) => a + p.paidAmount, 0), settings.currency), color: 'text-emerald-700' },
        { label: 'Payable Due', value: formatCurrency(filteredPurchases.reduce((a, p) => a + p.balancePayable, 0), settings.currency), color: 'text-rose-700' },
      ];
      headers = ['Bill #', 'Date', 'Supplier Company', 'Total Bill', 'Paid to Supplier', 'Remaining Payable'];
      rows = filteredPurchases.map((p) => [
        p.billNumber || p.id,
        formatShortDate(p.date),
        p.companyName,
        formatCurrency(p.totalAmount, settings.currency),
        formatCurrency(p.paidAmount, settings.currency),
        formatCurrency(p.balancePayable, settings.currency),
      ]);
    } else if (activeReport === 'RECEIVABLES') {
      title = 'Customer Receivables (Udhaar Aging) Report';
      summaryCards = [
        { label: 'Total Outstanding Udhaar', value: formatCurrency(totalReceivableDebt, settings.currency), color: 'text-rose-700' },
        { label: 'Pending Debtors', value: `${customerBalances.filter((b) => b.outstandingBalance > 0).length} customers`, color: 'text-rose-700' },
      ];
      headers = ['Customer Name', 'Phone', 'Total Purchased', 'Total Paid', 'Outstanding Udhaar'];
      rows = customerBalances
        .filter((b) => b.outstandingBalance > 0)
        .map((b) => [
          b.customerName,
          b.customerPhone,
          formatCurrency(b.totalPurchased, settings.currency),
          formatCurrency(b.totalPaid, settings.currency),
          formatCurrency(b.outstandingBalance, settings.currency),
        ]);
    } else if (activeReport === 'PAYABLES') {
      title = 'Supplier Payables (Company Debt) Report';
      summaryCards = [
        { label: 'Total Company Payables', value: formatCurrency(totalPayableDebt, settings.currency), color: 'text-rose-700' },
        { label: 'Creditor Companies', value: `${companyBalances.filter((b) => b.remainingPayable > 0).length} suppliers`, color: 'text-rose-700' },
      ];
      headers = ['Supplier Company', 'Contact Phone', 'Total Purchases', 'Amount Paid', 'Remaining Payable Debt'];
      rows = companyBalances
        .filter((b) => b.remainingPayable > 0)
        .map((b) => [
          b.companyName,
          b.contactPhone || '-',
          formatCurrency(b.totalPurchasedAmount, settings.currency),
          formatCurrency(b.totalPaidAmount, settings.currency),
          formatCurrency(b.remainingPayable, settings.currency),
        ]);
    }

    onOpenDocument({
      type: 'REPORT',
      title,
      subtitle: `Filter: ${dateFilter} â€¢ Generated on ${formatDate(new Date().toISOString())}`,
      summaryCards,
      headers,
      rows,
    });
  };

  const handleExportCSV = () => {
    let csv = '';
    if (activeReport === 'PROFIT_LOSS') {
      csv = 'Invoice,Date,Customer,Total,Cost,Profit,Margin%\n' +
        filteredSales.map((s) => {
          const cost = s.totalPrice - (s.totalProfit || 0);
          const margin = s.totalPrice > 0 ? (((s.totalProfit || 0) / s.totalPrice) * 100).toFixed(1) : '0';
          return `"${s.invoiceNumber || s.id}","${s.date}","${s.customerName}",${s.totalPrice},${cost},${s.totalProfit || 0},${margin}%`;
        }).join('\n');
    } else {
      csv = 'Invoice,Date,Customer,Total,Paid,Balance\n' +
        filteredSales.map((s) => `"${s.invoiceNumber || s.id}","${s.date}","${s.customerName}",${s.totalPrice},${s.paidAmount},${s.balanceDue}`).join('\n');
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeReport.toLowerCase()}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            <span>Business Intelligence & Ledger Audits</span>
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">Financial Reports & Profit / Loss</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Real-time profit tracking calculated from product cost prices, sales, and purchases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenCurrentReportPdf}
            className="min-h-10 flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500 active:translate-y-px"
          >
            <Download className="h-4 w-4" />
            <span>Save PDF</span>
          </button>
        </div>
      </div>

      {/* Date Filter & Report Category Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <label className="grid min-w-0 flex-1 gap-1.5 text-xs font-semibold text-slate-600">
          Report
          <select value={activeReport} onChange={(event) => setActiveReport(event.target.value as typeof activeReport)} className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100">
            <option value="PROFIT_LOSS">Profit &amp; Loss</option>
            <option value="SALES">Sales Report</option>
            <option value="PURCHASES">Purchases Report</option>
            <option value="RECEIVABLES">Receivables (Udhaar)</option>
            <option value="PAYABLES">Payables (Suppliers)</option>
          </select>
        </label>

        <label className="grid min-w-0 flex-1 gap-1.5 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-slate-400" />Period</span>
          <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value as typeof dateFilter)} className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100">
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="WEEK">Last 7 Days</option>
            <option value="MONTH">This Month</option>
          </select>
        </label>
      </div>

      {/* Summary KPI Cards for Active Report */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeReport === 'PROFIT_LOSS' && (
          <>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs uppercase font-bold text-slate-500 block">Total Sales Revenue</span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {formatCurrency(totalSalesRevenue, settings.currency)}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">{filteredSales.length} invoices generated</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs uppercase font-bold text-slate-500 block">Cost of Goods Sold (COGS)</span>
              <p className="text-2xl font-black text-slate-700 mt-1">
                {formatCurrency(totalCostOfGoodsSold, settings.currency)}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">Total cost from supplier purchase prices</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-300 shadow-xs bg-emerald-50/20">
              <span className="text-xs uppercase font-bold text-emerald-800 block">Net Gross Profit</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {formatCurrency(totalProfitCalculated, settings.currency)}
              </p>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                Profit Margin: {profitMarginPercent.toFixed(1)}%
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs uppercase font-bold text-slate-500 block">Total Supplier Purchases</span>
              <p className="text-2xl font-black text-blue-700 mt-1">
                {formatCurrency(totalPurchasesCost, settings.currency)}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">{filteredPurchases.length} purchase bills</span>
            </div>
          </>
        )}

        {activeReport === 'SALES' && (
          <>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs uppercase font-bold text-slate-500 block">Sales Revenue</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {formatCurrency(totalSalesRevenue, settings.currency)}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs uppercase font-bold text-slate-500 block">Cash Received</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {formatCurrency(filteredSales.reduce((a, s) => a + s.paidAmount, 0), settings.currency)}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs uppercase font-bold text-slate-500 block">Udhaar Given</span>
              <p className="text-2xl font-black text-rose-700 mt-1">
                {formatCurrency(filteredSales.reduce((a, s) => a + s.balanceDue, 0), settings.currency)}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs uppercase font-bold text-slate-500 block">Total Profit</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {formatCurrency(totalProfitCalculated, settings.currency)}
              </p>
            </div>
          </>
        )}

        {activeReport === 'RECEIVABLES' && (
          <>
            <div className="bg-white p-5 rounded-2xl border border-rose-300 shadow-xs bg-rose-50/20 sm:col-span-2">
              <span className="text-xs uppercase font-bold text-rose-800 block">Total Customer Udhaar Due (Receivable)</span>
              <p className="text-3xl font-black text-rose-700 mt-1">
                {formatCurrency(totalReceivableDebt, settings.currency)}
              </p>
              <span className="text-xs text-rose-600 mt-1 block">
                Across {customerBalances.filter((b) => b.outstandingBalance > 0).length} customer accounts
              </span>
            </div>
          </>
        )}

        {activeReport === 'PAYABLES' && (
          <>
            <div className="bg-white p-5 rounded-2xl border border-purple-300 shadow-xs bg-purple-50/20 sm:col-span-2">
              <span className="text-xs uppercase font-bold text-purple-800 block">Total Company Payable Debt</span>
              <p className="text-3xl font-black text-purple-700 mt-1">
                {formatCurrency(totalPayableDebt, settings.currency)}
              </p>
              <span className="text-xs text-purple-600 mt-1 block">
                Across {companyBalances.filter((b) => b.remainingPayable > 0).length} supplier companies
              </span>
            </div>
          </>
        )}
      </div>

      {/* Main Table for Active Report */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {activeReport === 'PROFIT_LOSS' && (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-right">Sale Revenue</th>
                  <th className="py-3 px-4 text-right">Cost (COGS)</th>
                  <th className="py-3 px-4 text-right font-black text-emerald-800">Gross Profit</th>
                  <th className="py-3 px-4 text-center">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((s) => {
                  const cost = s.totalPrice - (s.totalProfit || 0);
                  const margin = s.totalPrice > 0 ? (((s.totalProfit || 0) / s.totalPrice) * 100).toFixed(1) : '0';
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.invoiceNumber || s.id}</td>
                      <td className="py-3 px-4 text-slate-500">{formatShortDate(s.date)}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{s.customerName}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">{formatCurrency(s.totalPrice, settings.currency)}</td>
                      <td className="py-3 px-4 text-right text-slate-600">{formatCurrency(cost, settings.currency)}</td>
                      <td className="py-3 px-4 text-right font-black text-emerald-700">{formatCurrency(s.totalProfit || 0, settings.currency)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 text-[10px]">
                          {margin}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeReport === 'RECEIVABLES' && (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4 text-right">Total Purchased</th>
                  <th className="py-3 px-4 text-right">Total Paid</th>
                  <th className="py-3 px-4 text-right font-bold text-rose-800">Outstanding Udhaar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerBalances
                  .filter((b) => b.outstandingBalance > 0)
                  .map((b) => (
                    <tr key={b.customerId} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-bold text-slate-900">{b.customerName}</td>
                      <td className="py-3 px-4 font-mono">{b.customerPhone}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(b.totalPurchased, settings.currency)}</td>
                      <td className="py-3 px-4 text-right text-emerald-700 font-medium">{formatCurrency(b.totalPaid, settings.currency)}</td>
                      <td className="py-3 px-4 text-right font-black text-rose-700 text-sm">
                        {formatCurrency(b.outstandingBalance, settings.currency)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {activeReport === 'PAYABLES' && (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Supplier Company</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-right">Total Purchases</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-right font-bold text-purple-800">Remaining Payable Debt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companyBalances
                  .filter((b) => b.remainingPayable > 0)
                  .map((b) => (
                    <tr key={b.companyId} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-bold text-slate-900">{b.companyName}</td>
                      <td className="py-3 px-4 font-mono">{b.contactPhone || '-'}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(b.totalPurchasedAmount, settings.currency)}</td>
                      <td className="py-3 px-4 text-right text-emerald-700 font-medium">{formatCurrency(b.totalPaidAmount, settings.currency)}</td>
                      <td className="py-3 px-4 text-right font-black text-purple-700 text-sm">
                        {formatCurrency(b.remainingPayable, settings.currency)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
