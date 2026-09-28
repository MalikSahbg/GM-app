import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  CreditCard,
  Plus,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  User,
  Building2,
  Trash2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { CustomerPayment, CompanyPayment } from '../types';

interface PaymentsViewProps {
  onOpenCustomerPayment: (customerId?: string) => void;
  onOpenCompanyPayment: (companyId?: string) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  onOpenCustomerPayment,
  onOpenCompanyPayment,
}) => {
  const { customerPayments, companyPayments, customers, companies, deleteCustomerPayment, deleteCompanyPayment, settings } = useApp();

  const [activeTab, setActiveTab] = useState<'CUSTOMER' | 'COMPANY'>('CUSTOMER');
  const [searchTerm, setSearchTerm] = useState('');

  const customerMap = useMemo(() => new Map(customers.map((c) => [c.id, c.name])), [customers]);
  const companyMap = useMemo(() => new Map(companies.map((c) => [c.id, c.name])), [companies]);

  const filteredCustomerPayments = useMemo(() => {
    return customerPayments
      .filter((p) => {
        const custName = customerMap.get(p.customerId) || '';
        if (searchTerm.trim()) {
          const t = searchTerm.toLowerCase();
          return (
            custName.toLowerCase().includes(t) ||
            p.paymentMethod.toLowerCase().includes(t) ||
            (p.referenceNumber && p.referenceNumber.toLowerCase().includes(t)) ||
            (p.note && p.note.toLowerCase().includes(t))
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [customerPayments, customerMap, searchTerm]);

  const filteredCompanyPayments = useMemo(() => {
    return companyPayments
      .filter((p) => {
        const compName = companyMap.get(p.companyId) || '';
        if (searchTerm.trim()) {
          const t = searchTerm.toLowerCase();
          return (
            compName.toLowerCase().includes(t) ||
            p.paymentMethod.toLowerCase().includes(t) ||
            (p.referenceNumber && p.referenceNumber.toLowerCase().includes(t)) ||
            (p.note && p.note.toLowerCase().includes(t))
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [companyPayments, companyMap, searchTerm]);

  const totalCustomerReceived = customerPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalCompanyPaid = companyPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="h-4 w-4" />
            <span>Cash Flow & Payments Ledger</span>
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">Payments Management</h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-1">
            Separately manage customer Udhaar collections and payments sent to supplier companies.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onOpenCustomerPayment()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95"
          >
            <ArrowDownLeft className="h-4 w-4 text-emerald-200" />
            <span>+ Collect Customer Payment</span>
          </button>

          <button
            onClick={() => onOpenCompanyPayment()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95"
          >
            <ArrowUpRight className="h-4 w-4 text-purple-200" />
            <span>+ Pay Supplier Company</span>
          </button>
        </div>
      </div>

      {/* Tabs and Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => setActiveTab('CUSTOMER')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === 'CUSTOMER'
              ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider flex items-center gap-1.5">
              <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
              <span>Customer Payments (Inflow)</span>
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {customerPayments.length} txns
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">
            {formatCurrency(totalCustomerReceived, settings.currency)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total cash received towards customer Udhaar</p>
        </div>

        <div
          onClick={() => setActiveTab('COMPANY')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === 'COMPANY'
              ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-purple-800 tracking-wider flex items-center gap-1.5">
              <ArrowUpRight className="h-4 w-4 text-purple-600" />
              <span>Company Payments (Outflow)</span>
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {companyPayments.length} txns
            </span>
          </div>
          <p className="text-2xl font-black text-purple-700 mt-2">
            {formatCurrency(totalCompanyPaid, settings.currency)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total payments made to supplier companies</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'CUSTOMER' ? 'customer' : 'company'} payments by name, method or ref...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table according to active tab */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'CUSTOMER' ? (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Ref / Txn #</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Amount Received</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomerPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      No customer payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredCustomerPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                        {formatDate(p.date)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {customerMap.get(p.customerId) || 'Customer'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {p.paymentMethod || 'Cash'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        {p.referenceNumber || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                        {p.note || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-700 whitespace-nowrap text-base">
                        + {formatCurrency(p.amount, settings.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this customer payment record?')) {
                              deleteCustomerPayment(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Payment Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Supplier Company</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Ref / Cheque #</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompanyPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      No supplier company payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredCompanyPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                        {formatDate(p.date)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {companyMap.get(p.companyId) || 'Company'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
                          {p.paymentMethod || 'Bank Transfer'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        {p.referenceNumber || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                        {p.note || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-purple-700 whitespace-nowrap text-base">
                        - {formatCurrency(p.amount, settings.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this company payment record?')) {
                              deleteCompanyPayment(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Payment Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
