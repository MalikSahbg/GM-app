import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Package,
  Trash2,
  Edit2,
  CheckCircle2,
  FileText,
  CreditCard,
  Truck,
} from 'lucide-react';
import { Company } from '../types';

interface CompanyViewProps {
  onOpenAddCompany: () => void;
  onEditCompany: (company: Company) => void;
  onOpenPurchase?: (companyId: string) => void;
  onOpenPayment?: (companyId: string) => void;
  onViewKhata?: (company: Company) => void;
}

export const CompanyView: React.FC<CompanyViewProps> = ({
  onOpenAddCompany,
  onEditCompany,
  onOpenPurchase,
  onOpenPayment,
  onViewKhata,
}) => {
  const { companies, products, companyBalances, deleteCompany, settings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const companyBalanceMap = new Map(companyBalances.map((b) => [b.companyId, b]));

  const filteredCompanies = companies.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.contactPhone && c.contactPhone.toLowerCase().includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term)) ||
      (c.contactPerson && c.contactPerson.toLowerCase().includes(term))
    );
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete company "${name}"?`)) {
      const res = deleteCompany(id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-900">Company & Vendor Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supplier directory, purchase tracking, payables balance, and company-wise Khata ledgers.
          </p>
        </div>

        <button
          onClick={onOpenAddCompany}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Company</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search companies by name, person, phone or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Company Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200">
            <CheckCircle2 className="h-12 w-12 text-purple-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Companies Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add your first company / supplier to start attaching products and tracking purchases.
            </p>
          </div>
        ) : (
          filteredCompanies.map((c) => {
            const productCount = products.filter((p) => p.companyId === c.id).length;
            const bal = companyBalanceMap.get(c.id);
            const payable = bal?.remainingPayable || 0;
            const hasPayable = payable > 0;

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 leading-tight">
                          {c.name}
                        </h3>
                        {c.contactPerson && (
                          <span className="text-[11px] text-slate-500 block">
                            Contact: {c.contactPerson}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full mt-1">
                          <Package className="h-3 w-3" />
                          {productCount} product{productCount === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-[11px] font-bold rounded-full shrink-0 ${
                        hasPayable
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {hasPayable ? 'Payable Due' : 'Cleared'}
                    </span>
                  </div>

                  {/* Financial Metrics */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Purchased</span>
                      <span className="font-bold text-slate-800">{formatCurrency(bal?.totalPurchasedAmount || 0, settings.currency)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Paid</span>
                      <span className="font-bold text-emerald-700">{formatCurrency(bal?.totalPaidAmount || 0, settings.currency)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Payable</span>
                      <span className={`font-black ${hasPayable ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {formatCurrency(payable, settings.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="mt-3 space-y-1 text-xs text-slate-600 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                    {c.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono">{c.contactPhone}</span>
                      </div>
                    )}
                    {c.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="truncate">{c.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions & Ledger */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    {onViewKhata && (
                      <button
                        onClick={() => onViewKhata(c)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                        title="View Company Khata Ledger"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Khata</span>
                      </button>
                    )}

                    {onOpenPurchase && (
                      <button
                        onClick={() => onOpenPurchase(c.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        title="New Purchase from Company"
                      >
                        <Truck className="h-3.5 w-3.5" />
                        <span>Purchase</span>
                      </button>
                    )}

                    {onOpenPayment && hasPayable && (
                      <button
                        onClick={() => onOpenPayment(c.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                        title="Pay Company"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Pay</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditCompany(c)}
                      className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit Company Profile"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Company"
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
