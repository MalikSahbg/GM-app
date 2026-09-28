import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Wallet,
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  ShoppingCart,
  Building2,
  Boxes,
  ArrowRight,
  Share2,
  DollarSign,
  Truck,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';

interface DashboardViewProps {
  onSelectTab: (tab: string) => void;
  onOpenQuickSale: () => void;
  onOpenAddProduct: () => void;
  onOpenAddCompany: () => void;
  onOpenAddCustomer: () => void;
  onOpenRecordPayment: (customerId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTab,
  onOpenQuickSale,
  onOpenAddProduct,
  onOpenAddCompany,
  onOpenAddCustomer,
  onOpenRecordPayment,
}) => {
  const {
    stats,
    customerBalances,
    salesDetailed,
    productsWithCompany,
    customerPayments,
    adjustStock,
    settings,
  } = useApp();
  const [restockSuccessId, setRestockSuccessId] = useState<string | null>(null);
  const [recentTab, setRecentTab] = useState<'SALES' | 'PAYMENTS'>('SALES');

  // Top unpaid customers
  const topDebtors = customerBalances
    .filter((b) => b.outstandingBalance > 0)
    .sort((a, b) => b.outstandingBalance - a.outstandingBalance)
    .slice(0, 5);

  // Low stock items
  const lowStockProducts = productsWithCompany
    .filter((p) => p.stockQuantity <= (p.minStockThreshold || 5))
    .slice(0, 6);

  // Recent 6 sales
  const recentSales = salesDetailed.slice(0, 6);
  // Recent 6 payments
  const recentPayments = customerPayments.slice(0, 6);

  const handleQuickRestock = (productId: string) => {
    adjustStock(productId, 10, 'Quick restock from Dashboard');
    setRestockSuccessId(productId);
    setTimeout(() => setRestockSuccessId(null), 2000);
  };

  const handleShareWhatsApp = (customerName: string, phone: string, amount: number) => {
    const text = `Assalam-o-Alaikum ${customerName},\nYour current outstanding balance at *${settings.businessName}* is *${formatCurrency(amount, settings.currency)}*.\nPlease arrange payment at your earliest convenience.\nThank you!`;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-5 sm:p-6 text-white shadow-sm">
        <div>
          <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            {settings.businessName} Operations
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
            Store Performance & Khata Dashboard
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-xl">
            Live profit calculations, multi-product invoicing, vendor payables, and customer receivables.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQuickSale}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-95"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>New Sale</span>
          </button>
          <button
            onClick={() => onSelectTab('reports')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-xl backdrop-blur-xs transition-colors"
          >
            <TrendingUp className="h-4 w-4 text-emerald-300" />
            <span>Reports & P&L</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid - Highlights all 9 core dashboard metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* 1. Today's Sales */}
        <div
          onClick={() => onSelectTab('sales-history')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Today's Sales
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <ShoppingCart className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(stats.todaySalesAmount, settings.currency)}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
              {stats.todaySalesCount} sale{stats.todaySalesCount === 1 ? '' : 's'} recorded today
            </p>
          </div>
        </div>

        {/* 2. Today's Profit */}
        <div
          onClick={() => onSelectTab('reports')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Today's Profit
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
              {formatCurrency(stats.todayProfit, settings.currency)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Computed from product cost vs sale rate
            </p>
          </div>
        </div>

        {/* 3. Total Receivable (Udhaar) */}
        <div
          onClick={() => onSelectTab('udhaar')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Receivable (Udhaar)
            </span>
            <div className="h-9 w-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
              <Wallet className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold text-rose-700 tracking-tight">
              {formatCurrency(stats.totalUdhaar, settings.currency)}
            </div>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5">
              {stats.pendingUdhaarCustomers} customer{stats.pendingUdhaarCustomers === 1 ? '' : 's'} owe balance
            </p>
          </div>
        </div>

        {/* 4. Total Payable (To Suppliers) */}
        <div
          onClick={() => onSelectTab('companies')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Payable (Companies)
            </span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
              <Building2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold text-purple-700 tracking-tight">
              {formatCurrency(stats.totalPayable, settings.currency)}
            </div>
            <p className="text-[11px] text-purple-600 font-medium mt-0.5">
              Owed across {stats.totalCompanies} supplier companies
            </p>
          </div>
        </div>
      </div>

      {/* Secondary 4 Metrics: Customers, Companies, Total Products, Low Stock */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div
          onClick={() => onSelectTab('customers')}
          className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:border-teal-300 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Customers</span>
            <Users className="h-4 w-4 text-teal-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.totalCustomers}</p>
        </div>

        <div
          onClick={() => onSelectTab('companies')}
          className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:border-purple-300 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Companies</span>
            <Building2 className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.totalCompanies}</p>
        </div>

        <div
          onClick={() => onSelectTab('products')}
          className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:border-blue-300 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Products</span>
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.totalProducts}</p>
        </div>

        <div
          onClick={() => onSelectTab('stock')}
          className={`rounded-xl p-3.5 border shadow-2xs cursor-pointer transition-colors ${
            stats.lowStockCount > 0
              ? 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Low Stock Items</span>
            <AlertTriangle className={`h-4 w-4 ${stats.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <p className={`text-xl font-bold ${stats.lowStockCount > 0 ? 'text-amber-800' : 'text-slate-900'}`}>
              {stats.lowStockCount}
            </p>
            {stats.lowStockCount > 0 && (
              <span className="text-[10px] font-semibold text-amber-700">Need restock</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Launch Buttons */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Quick Launch
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button
            onClick={onOpenQuickSale}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors border border-emerald-100 group"
          >
            <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold">New Sale</span>
          </button>

          <button
            onClick={() => onSelectTab('purchases')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors border border-blue-100 group"
          >
            <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <Truck className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold">Purchases</span>
          </button>

          <button
            onClick={() => onSelectTab('payments')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-indigo-50 text-indigo-800 hover:bg-indigo-100 transition-colors border border-indigo-100 group"
          >
            <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold">Payments</span>
          </button>

          <button
            onClick={() => onSelectTab('udhaar')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-rose-50 text-rose-800 hover:bg-rose-100 transition-colors border border-rose-100 group"
          >
            <div className="h-9 w-9 rounded-lg bg-rose-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold">Udhaar</span>
          </button>

          <button
            onClick={onOpenAddProduct}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors border border-amber-100 group"
          >
            <div className="h-9 w-9 rounded-lg bg-amber-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold">+ Product</span>
          </button>

          <button
            onClick={onOpenAddCustomer}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 transition-colors border border-teal-100 group"
          >
            <div className="h-9 w-9 rounded-lg bg-teal-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold">+ Customer</span>
          </button>
        </div>
      </div>

      {/* Main Split: Top Udhaar Debtors & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Udhaar Priority List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-rose-500" />
              <h2 className="text-base font-bold text-slate-900">Highest Outstanding Udhaar</h2>
            </div>
            <button
              onClick={() => onSelectTab('udhaar')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 p-2 sm:p-4 flex-1">
            {topDebtors.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-sm text-slate-800">No Pending Udhaar!</p>
                <p className="text-xs text-slate-500 mt-0.5">All customer balances are fully settled.</p>
              </div>
            ) : (
              topDebtors.map((debtor) => (
                <div key={debtor.customerId} className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {debtor.customerName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span className="truncate">{debtor.customerPhone}</span>
                      <span>•</span>
                      <span>{debtor.totalSales} orders</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-bold text-rose-700 block">
                        {formatCurrency(debtor.outstandingBalance, settings.currency)}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-sm">
                        Pending
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenRecordPayment(debtor.customerId)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-2xs"
                    >
                      Collect
                    </button>

                    <button
                      onClick={() => handleShareWhatsApp(debtor.customerName, debtor.customerPhone, debtor.outstandingBalance)}
                      title="Send WhatsApp Reminder"
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Warning Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">Low Stock Inventory Alerts</h2>
            </div>
            <button
              onClick={() => onSelectTab('stock')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Manage Stock</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 p-2 sm:p-4 flex-1">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-sm text-slate-800">Stock Levels are Healthy!</p>
                <p className="text-xs text-slate-500 mt-0.5">No products currently below minimum threshold.</p>
              </div>
            ) : (
              lowStockProducts.map((product) => (
                <div key={product.id} className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span className="truncate">{product.companyName}</span>
                      <span>•</span>
                      <span>{formatCurrency(product.price, settings.currency)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        product.stockQuantity === 0
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        <AlertTriangle className="h-3 w-3" />
                        {product.stockQuantity} {product.unit || 'left'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleQuickRestock(product.id)}
                      disabled={restockSuccessId === product.id}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      {restockSuccessId === product.id ? '✓ Restocked' : '+10 Restock'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales & Payments Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-900">Recent Transactions</h2>
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setRecentTab('SALES')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  recentTab === 'SALES' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Recent Sales ({recentSales.length})
              </button>
              <button
                onClick={() => setRecentTab('PAYMENTS')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  recentTab === 'PAYMENTS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Recent Payments ({recentPayments.length})
              </button>
            </div>
          </div>

          <button
            onClick={() => onSelectTab(recentTab === 'SALES' ? 'sales-history' : 'payments')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentTab === 'SALES' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Product / Items</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                      {formatDate(sale.date)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {sale.customerName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {sale.items && sale.items.length > 0 ? (
                        <span>
                          {sale.items[0].productName}
                          {sale.items.length > 1 && ` +${sale.items.length - 1} more`}
                        </span>
                      ) : (
                        <span>{sale.productName || 'Sale'}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      {sale.items && sale.items.length > 0
                        ? sale.items.reduce((s, it) => s + it.quantity, 0)
                        : (sale.quantity || 1)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(sale.totalPrice, settings.currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-700">
                      {formatCurrency(sale.paidAmount, settings.currency)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {sale.balanceDue === 0 ? (
                        <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                          Paid
                        </span>
                      ) : sale.paidAmount === 0 ? (
                        <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-800">
                          Full Udhaar
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                          Partial
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4 text-right">Amount Received</th>
                  <th className="py-3 px-4">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      No payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                        {formatDate(p.date)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {p.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-500">
                        {p.referenceNumber || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        +{formatCurrency(p.amount, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {p.note || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
