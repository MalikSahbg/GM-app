import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Company } from '../types';
import { Building2, X } from 'lucide-react';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCompany: Company | null;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  editingCompany,
}) => {
  const { addCompany, updateCompany } = useApp();

  const [name, setName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingCompany) {
      setName(editingCompany.name);
      setContactPhone(editingCompany.contactPhone || '');
      setContactEmail(editingCompany.contactEmail || '');
      setAddress(editingCompany.address || '');
    } else {
      setName('');
      setContactPhone('');
      setContactEmail('');
      setAddress('');
    }
    setError(null);
  }, [editingCompany, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Company name is required.');
      return;
    }

    if (editingCompany) {
      updateCompany(editingCompany.id, {
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {editingCompany ? 'Edit Company' : 'Add New Company'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg">{error}</p>}

          <div>
            <label className="text-xs font-semibold uppercase text-slate-600 block mb-1">
              Company / Supplier Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nestlé Supplies, Unilever Distributorship"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-600 block mb-1">
              Contact Phone
            </label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="e.g. 0300-1234567"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-600 block mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="e.g. orders@supplier.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-600 block mb-1">
              Office / Warehouse Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Grain Market, Industrial Area"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors"
            >
              {editingCompany ? 'Save Changes' : 'Add Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
