import React, { useState, useMemo } from 'react';
import { CustomerOrder, CustomerOrderStatus } from '../types';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Calendar,
  Building2,
  Users,
  Package,
  Layers,
  FileText,
  Copy,
  ChevronRight,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface OrdersViewProps {
  onOpenCreateOrder: () => void;
  onOpenOrderDetails: (order: CustomerOrder) => void;
  onOpenOrderPdf: (order: CustomerOrder, docType?: 'CUSTOMER' | 'COMPANY') => void;
  onDuplicateOrder: (order: CustomerOrder) => void;
}

type DateFilterType =
  | 'ALL'
  | 'TODAY'
  | 'YESTERDAY'
  | 'THIS_WEEK'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'CUSTOM';

const getStatusBadge = (status: CustomerOrderStatus) => {
  switch (status) {
    case 'Pending':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'Sent':
    case 'Sent to Company':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Confirmed':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'Completed':
    case 'Delivered':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'Cancelled':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
};

export const OrdersView: React.FC<OrdersViewProps> = ({
  onOpenCreateOrder,
  onOpenOrderDetails,
  onOpenOrderPdf,
  onDuplicateOrder,
}) => {
  const { orders, customers, companies, settings } = useApp();

  // Filters
  const [dateFilter, setDateFilter] = useState<DateFilterType>('ALL');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('ALL');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Custom date range
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Date helpers
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.date);
      const orderDateStr = order.date.slice(0, 10);

      // Date filter
      if (dateFilter === 'TODAY' && orderDateStr !== todayStr) return false;
      if (dateFilter === 'YESTERDAY' && orderDateStr !== yesterdayStr) return false;

      if (dateFilter === 'THIS_WEEK') {
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay(); // 0 is Sunday
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        if (orderDate < startOfWeek) return false;
      }

      if (dateFilter === 'THIS_MONTH') {
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        if (orderDate.getMonth() !== currentMonth || orderDate.getFullYear() !== currentYear) {
          return false;
        }
      }

      if (dateFilter === 'LAST_MONTH') {
        const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();
        if (orderDate.getMonth() !== lastMonth || orderDate.getFullYear() !== lastMonthYear) {
          return false;
        }
      }

      if (dateFilter === 'CUSTOM') {
        if (customStartDate && orderDateStr < customStartDate) return false;
        if (customEndDate && orderDateStr > customEndDate) return false;
      }

      // Company filter (Point 16)
      if (selectedCompanyId !== 'ALL') {
        if (order.companyId !== selectedCompanyId) return false;
      }

      // Customer filter (Point 17)
      if (selectedCustomerId !== 'ALL') {
        if (order.customerId !== selectedCustomerId) return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL') {
        if (order.status !== selectedStatus) return false;
      }

      // Search query (Order number, customer name, company name, product name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = order.orderNumber.toLowerCase().includes(q);
        const matchCustomer = order.customerName.toLowerCase().includes(q);
        const matchCompany = (order.companyName || '').toLowerCase().includes(q);
        const matchProducts = order.items.some((it) => it.productName.toLowerCase().includes(q));
        if (!matchNumber && !matchCustomer && !matchCompany && !matchProducts) return false;
      }

      return true;
    });
  }, [
    orders,
    dateFilter,
    selectedCompanyId,
    selectedCustomerId,
    selectedStatus,
    searchQuery,
    customStartDate,
    customEndDate,
    todayStr,
    yesterdayStr,
  ]);

  // Summary Metrics for the currently active filter
  const summary = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const uniqueCustomers = new Set(filteredOrders.map((o) => o.customerId)).size;
    const totalProductsCount = filteredOrders.reduce((sum, o) => sum + o.totalProducts, 0);
    const totalQuantity = filteredOrders.reduce((sum, o) => sum + o.totalQuantity, 0);
    const totalValue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      totalOrders,
      uniqueCustomers,
      totalProductsCount,
      totalQuantity,
      totalValue,
    };
  }, [filteredOrders]);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <ClipboardList className="h-4 w-4" />
            <span>Order Management & Field Booking</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
            Orders History & Dispatch
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-xl">
            Track customer orders, company bookings, and generate order PDFs.
          </p>
        </div>

        <div>
          <button
            onClick={onOpenCreateOrder}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>+ Create Order</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR SECTION */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        {/* Date Filter Chips (Point 13) */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
            Filter by Date:
          </span>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Orders' },
              { id: 'TODAY', label: 'Today' },
              { id: 'YESTERDAY', label: 'Yesterday' },
              { id: 'THIS_WEEK', label: 'This Week' },
              { id: 'THIS_MONTH', label: 'This Month' },
              { id: 'LAST_MONTH', label: 'Last Month' },
              { id: 'CUSTOM', label: 'Custom Date Range' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setDateFilter(f.id as DateFilterType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  dateFilter === f.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {dateFilter === 'CUSTOM' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>
        )}

        {/* Dropdown Filters & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Company-Wise Filter (Point 16) */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Company / Supplier
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="ALL">All Companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Customer-Wise Filter (Point 17) */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Customer
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="ALL">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Order Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Sent">Sent</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Search Orders
            </label>
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search order #, customer, item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY STATS CARDS (Points 13, 14, 15, 16, 17) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <ClipboardList className="h-4 w-4 text-emerald-600" />
            <span>Total Orders</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            {summary.totalOrders}
          </p>
          <span className="text-[11px] text-slate-400">In current filter</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Total Customers</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            {summary.uniqueCustomers}
          </p>
          <span className="text-[11px] text-slate-400">Unique accounts</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Package className="h-4 w-4 text-amber-600" />
            <span>Total Products</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            {summary.totalProductsCount}
          </p>
          <span className="text-[11px] text-slate-400">Distinct lines</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Layers className="h-4 w-4 text-teal-600" />
            <span>Total Quantity</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1">
            {summary.totalQuantity}
          </p>
          <span className="text-[11px] text-slate-400">Total units ordered</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <span>Total Order Value</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono mt-1">
            {formatCurrency(summary.totalValue, settings.currency)}
          </p>
          <span className="text-[11px] text-slate-400">Gross order book</span>
        </div>
      </div>

      {/* SPECIAL WEEKLY / MONTHLY HIGHLIGHT CARD */}
      {(dateFilter === 'THIS_WEEK' || dateFilter === 'THIS_MONTH') && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-emerald-950">
                {dateFilter === 'THIS_WEEK' ? 'Weekly Order Summary' : 'Monthly Order Summary'}
              </h3>
              <p className="text-xs text-emerald-800/80">
                {dateFilter === 'THIS_WEEK'
                  ? `This Week: ${summary.totalOrders} Orders from ${summary.uniqueCustomers} Customers with ${summary.totalQuantity} total items.`
                  : `This Month: ${summary.totalOrders} Orders totaling ${formatCurrency(summary.totalValue, settings.currency)} across ${summary.uniqueCustomers} customers.`}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs font-bold font-mono text-emerald-900 bg-white px-3 py-1.5 rounded-lg border border-emerald-200">
              Total Value: {formatCurrency(summary.totalValue, settings.currency)}
            </span>
          </div>
        </div>
      )}

      {/* ORDERS LIST / TABLE (Point 12) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Orders ({filteredOrders.length})
          </h2>
          <span className="text-xs text-slate-400">
            Showing matching orders
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3 shadow-2xs">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <ClipboardList className="h-7 w-7" />
            </div>
            <h3 className="font-bold text-base text-slate-800">No orders found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no orders matching your current filter criteria. You can create a new order right now!
            </p>
            <button
              onClick={onOpenCreateOrder}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>+ Create First Order</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const showPrice = !!order.showPrice;
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left: Order Info */}
                  <div
                    onClick={() => onOpenOrderDetails(order)}
                    className="cursor-pointer space-y-1.5 flex-1"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold font-mono text-sm sm:text-base text-emerald-800">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        • {formatDate(order.date)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span>{order.customerName}</span>
                      </span>

                      {order.companyName ? (
                        <span className="text-teal-700 font-semibold flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-teal-600" />
                          <span>{order.companyName}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          (No Company Selected)
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-600 pt-0.5">
                      <span>
                        <strong>{order.totalProducts}</strong> Products
                      </span>
                      <span>
                        <strong>{order.totalQuantity}</strong> Total Items
                      </span>
                      {showPrice && order.totalAmount && (
                        <span className="font-bold font-mono text-emerald-700">
                          {formatCurrency(order.totalAmount, settings.currency)}
                        </span>
                      )}
                      {!showPrice && (
                        <span className="text-[10px] text-slate-400 italic">
                          Prices Hidden
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onOpenOrderPdf(order, 'CUSTOMER')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
                      title="Generate Customer PDF"
                    >
                      <FileText className="h-3.5 w-3.5 text-slate-600" />
                      <span className="hidden md:inline">PDF</span>
                    </button>

                    <button
                      onClick={() => onDuplicateOrder(order)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
                      title="Duplicate this order"
                    >
                      <Copy className="h-3.5 w-3.5 text-blue-600" />
                      <span className="hidden md:inline">Duplicate</span>
                    </button>

                    <button
                      onClick={() => onOpenOrderDetails(order)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <span>View</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
