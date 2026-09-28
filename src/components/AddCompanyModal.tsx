import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Building2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Company } from '../types';

interface AddCompanyModalProps {
  isOpen: boolean;
  companyToEdit: Company | null;
  onClose: () => void;
}

export const AddCompanyModal: React.FC<AddCompanyModalProps> = ({
  isOpen,
  companyToEdit,
  onClose,
}) => {
  const { addCompany, updateCompany } = useApp();

  const [name, setName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [address, setAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (companyToEdit) {
      setName(companyToEdit.name);
      setContactPhone(companyToEdit.contactPhone || '');
      setContactEmail(companyToEdit.contactEmail || '');
      setAddress(companyToEdit.address || '');
    } else {
      setName('');
      setContactPhone('');
      setContactEmail('');
      setAddress('');
    }
  }, [companyToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Company name is required');
      return;
    }

    if (companyToEdit) {
      updateCompany(companyToEdit.id, {
        name: name.trim(),
        contactPhone: contactPhone.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        address: address.trim() || undefined,
      });
    } else {
      addCompany({
        name: name.trim(),
        contactPhone: contactPhone.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        address: address.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-purple-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-white" />
            <h2 className="text-base font-bold">
              {companyToEdit ? 'Edit Company Supplier' : 'Add New Company'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-purple-200 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Company / Brand Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Unilever, Nestlé Supplies Ltd"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Contact Phone (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 0300-1234567"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Email Address (Optional)
            </label>
            <input
              type="email"
              placeholder="e.g. sales@vendor.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Address / Warehouse Location (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Plot 12, Industrial Area, Lahore"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{companyToEdit ? 'Save Changes' : 'Add Company'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
