import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import {
  Users,
  Plus,
  Search,
  Phone,
  MapPin,
  Trash2,
  Edit2,
  Wallet,
  CheckCircle2,
  Share2,
  FileText,
  CreditCard,
  MessageSquare,
} from 'lucide-react';
import { Customer } from '../types';

interface CustomerViewProps {
  onOpenAddCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onOpenRecordPayment: (customerId: string) => void;
  onViewKhata?: (customer: Customer) => void;
  onOpenWhatsApp?: (customerId: string) => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  onOpenAddCustomer,
  onEditCustomer,
  onOpenRecordPayment,
  onViewKhata,
  onOpenWhatsApp,
}) => {
  const { customers, customerBalances, deleteCustomer, settings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const customerBalanceMap = new Map(customerBalances.map((b) => [b.customerId, b]));

  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.phone.toLowerCase().includes(term) ||
      (c.whatsapp && c.whatsapp.toLowerCase().includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term))
    );
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete customer "${name}"?`)) {
      const res = deleteCustomer(id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  const handleShareWhatsApp = (c: Customer, outstanding: number) => {
    if (onOpenWhatsApp) {
      onOpenWhatsApp(c.id);
    } else {
      const phone = c.whatsapp || c.phone;
      const text = `Assalam-o-Alaikum ${c.name},\nYour pending balance at *${settings.businessName}* is *${formatCurrency(outstanding, settings.currency)}*.\nPlease arrange payment at your earliest convenience.\nThank you!`;
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-600" />
            <h1 className="text-xl font-bold text-slate-900">Customer Management & Khata</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete profiles with phone, WhatsApp, address, order history, and account ledger statements.
          </p>
        </div>

        <button
          onClick={onOpenAddCustomer}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers by name, phone, WhatsApp or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200">
            <CheckCircle2 className="h-12 w-12 text-teal-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Customers Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add a customer to begin recording sales, generating Khata statements and sending reminders.
            </p>
          </div>
        ) : (
          filteredCustomers.map((c) => {
            const bal = customerBalanceMap.get(c.id);
            const outstanding = bal?.outstandingBalance || 0;
            const hasUdhaar = outstanding > 0;

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 leading-tight">
                          {c.name}
                        </h3>
                        <a
                          href={`tel:${c.phone}`}
                          className="flex items-center gap-1 text-xs text-slate-600 hover:text-teal-600 font-mono mt-0.5"
                        >
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{c.phone}</span>
                        </a>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-[11px] font-bold rounded-full shrink-0 ${
                        hasUdhaar
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {hasUdhaar ? 'Udhaar Due' : 'Cleared'}
                    </span>
                  </div>

                  {/* WhatsApp / Address */}
                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    {c.whatsapp && (
                      <div className="flex items-center gap-1.5 font-mono text-emerald-700">
                        <MessageSquare className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span>WA: {c.whatsapp}</span>
                      </div>
                    )}
                    {c.address && (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="truncate">{c.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Financial snapshot */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Sales</span>
                      <span className="font-bold text-slate-800">{formatCurrency(bal?.totalPurchased || 0, settings.currency)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Paid</span>
                      <span className="font-bold text-emerald-700">{formatCurrency(bal?.totalPaid || 0, settings.currency)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Balance Due</span>
                      <span
                        className={`font-black ${
                          hasUdhaar ? 'text-rose-700' : 'text-emerald-700'
                        }`}
                      >
                        {formatCurrency(outstanding, settings.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    {onViewKhata && (
                      <button
                        onClick={() => onViewKhata(c)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                        title="View Customer Khata Statement"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Khata</span>
                      </button>
                    )}

                    {hasUdhaar && (
                      <button
                        onClick={() => onOpenRecordPayment(c.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                        title="Record Payment from Customer"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Collect</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {hasUdhaar && (
                      <button
                        onClick={() => handleShareWhatsApp(c, outstanding)}
                        title="Send WhatsApp Reminder"
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEditCustomer(c)}
                      className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Edit Customer"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Customer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
