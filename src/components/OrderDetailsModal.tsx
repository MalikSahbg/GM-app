import React, { useState } from 'react';
import { CustomerOrder, CustomerOrderStatus } from '../types';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  X,
  FileText,
  Copy,
  MessageCircle,
  Share2,
  Trash2,
  Edit,
  Building2,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';

interface OrderDetailsModalProps {
  order: CustomerOrder | null;
  onClose: () => void;
  onDuplicate: (order: CustomerOrder) => void;
  onEdit: (order: CustomerOrder) => void;
  onOpenPdf: (order: CustomerOrder, docType?: 'CUSTOMER' | 'COMPANY') => void;
}

const STATUS_OPTIONS: CustomerOrderStatus[] = [
  'Pending',
  'Sent',
  'Confirmed',
  'Completed',
  'Cancelled',
];

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

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onDuplicate,
  onEdit,
  onOpenPdf,
}) => {
  const { updateOrderStatus, deleteOrder, settings } = useApp();
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!order) return null;

  const showPrice = !!order.showPrice;
  const hasCompany = !!order.companyName;

  const handleStatusChange = (newStatus: CustomerOrderStatus) => {
    updateOrderStatus(order.id, newStatus);
    setShowStatusDropdown(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete Order ${order.orderNumber}?`)) {
      deleteOrder(order.id);
      onClose();
    }
  };

  const handleSendToCustomer = () => {
    const itemsList = order.items
      .map((it, idx) => {
        const priceStr = showPrice && it.price ? ` @ ${formatCurrency(it.price, settings.currency)}` : '';
        return `${idx + 1}. *${it.productName}* - ${it.quantity} ${it.unit || 'pcs'}${priceStr}`;
      })
      .join('\n');

    const totalStr = showPrice && order.totalAmount
      ? `\n*Grand Total:* ${formatCurrency(order.totalAmount, settings.currency)}`
      : '';

    const text = `*${settings.businessName}*\n*Order #${order.orderNumber}*\nDate: ${formatDate(order.date)}\nCustomer: ${order.customerName}\nStatus: *${order.status}*\n\n*Products:*\n${itemsList}\n${totalStr}\n\nThank you for ordering with us!`;

    const phone = (order.customerWhatsApp || order.customerPhone || '').replace(/[^0-9]/g, '');
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSendToCompany = () => {
    if (!order.companyName) return;

    const itemsList = order.items
      .map((it, idx) => {
        const priceStr = showPrice && it.price ? ` @ ${formatCurrency(it.price, settings.currency)}` : '';
        return `${idx + 1}. *${it.productName}* - ${it.quantity} ${it.unit || 'pcs'}${priceStr}`;
      })
      .join('\n');

    const totalStr = showPrice && order.totalAmount
      ? `\n*Total Value:* ${formatCurrency(order.totalAmount, settings.currency)}`
      : '';

    const text = `*Order Booking for ${order.companyName}*\n*Order #${order.orderNumber}*\nDate: ${formatDate(order.date)}\nFrom: ${settings.businessName}\nBooker: ${order.salesRepName || settings.phone}\nCustomer: ${order.customerName}\n\n*Products Requested:*\n${itemsList}\n${totalStr}\n\nPlease dispatch this order at your earliest.`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base font-mono">{order.orderNumber}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Clock className="h-3 w-3 text-slate-400" />
                <span>Booked on {formatDate(order.date)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status change dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
              >
                <span>Status</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {showStatusDropdown && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 text-slate-800">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                    Update Status
                  </div>
                  {STATUS_OPTIONS.map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 font-medium flex items-center justify-between ${
                        order.status === st ? 'text-emerald-600 font-bold bg-emerald-50' : ''
                      }`}
                    >
                      <span>{st}</span>
                      {order.status === st && <CheckCircle className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Customer & Company Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Customer Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <User className="h-3.5 w-3.5 text-emerald-600" />
                <span>Customer</span>
              </div>
              <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
              {order.customerPhone && (
                <p className="text-xs text-slate-600 font-mono">Phone: {order.customerPhone}</p>
              )}
              {order.customerAddress && (
                <p className="text-xs text-slate-500">Address: {order.customerAddress}</p>
              )}
            </div>

            {/* Company Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <Building2 className="h-3.5 w-3.5 text-teal-600" />
                <span>Company</span>
              </div>
              <p className="font-bold text-slate-900 text-sm">
                {order.companyName || 'Not Selected (Multi-Brand / Direct)'}
              </p>
              <p className="text-xs text-slate-500">
                Show Price in Order: <span className="font-semibold text-slate-700">{showPrice ? 'ON (Prices Shown)' : 'OFF (Prices Hidden)'}</span>
              </p>
            </div>
          </div>

          {/* Products List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Ordered Products ({order.totalProducts} items)
              </h4>
              <span className="text-xs text-slate-500">
                Total Units: <strong className="text-slate-900">{order.totalQuantity}</strong>
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-left w-8">#</th>
                    <th className="py-2.5 px-3 text-left">Product</th>
                    <th className="py-2.5 px-3 text-left">Company</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    {showPrice && (
                      <>
                        <th className="py-2.5 px-3 text-right">Price</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((it, idx) => (
                    <tr key={it.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{it.productName}</td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">{it.companyName || '-'}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                        {it.quantity} <span className="text-[10px] font-normal text-slate-400">{it.unit || 'pcs'}</span>
                      </td>
                      {showPrice && (
                        <>
                          <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                            {formatCurrency(it.price || 0, settings.currency)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                            {formatCurrency(it.totalPrice || ((it.price || 0) * it.quantity), settings.currency)}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={3} className="py-2.5 px-3 text-slate-700">
                      Total Summary
                    </td>
                    <td className="py-2.5 px-3 text-center text-emerald-800 font-extrabold text-sm">
                      {order.totalQuantity}
                    </td>
                    {showPrice && (
                      <td colSpan={2} className="py-2.5 px-3 text-right text-emerald-700 font-extrabold text-sm font-mono">
                        {formatCurrency(order.totalAmount || 0, settings.currency)}
                      </td>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
              <span className="font-bold text-slate-900">Notes / Remarks: </span>
              <span>{order.notes}</span>
            </div>
          )}
        </div>

        {/* Action Buttons Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDuplicate(order)}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Duplicate this order into a new booking"
            >
              <Copy className="h-3.5 w-3.5 text-blue-600" />
              <span>Duplicate</span>
            </button>

            <button
              onClick={() => onEdit(order)}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Edit quantities and products in this order"
            >
              <Edit className="h-3.5 w-3.5 text-amber-600" />
              <span>Edit</span>
            </button>

            <button
              onClick={handleDelete}
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Delete Order"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPdf(order, 'CUSTOMER')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <FileText className="h-3.5 w-3.5 text-emerald-400" />
              <span>Generate PDF</span>
            </button>

            <button
              onClick={handleSendToCustomer}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              title="Send Order to Customer via WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>To Customer</span>
            </button>

            {hasCompany ? (
              <button
                onClick={handleSendToCompany}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                title="Send Order to Company via WhatsApp"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>To Company</span>
              </button>
            ) : (
              <button
                disabled
                className="px-3 py-2 bg-slate-200 text-slate-400 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-not-allowed"
                title="No company was selected for this order"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>To Company (N/A)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
