import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Users, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Customer } from '../types';

interface AddCustomerModalProps {
  isOpen: boolean;
  customerToEdit: Customer | null;
  onClose: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  customerToEdit,
  onClose,
}) => {
  const { addCustomer, updateCustomer } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone);
      setAddress(customerToEdit.address || '');
      setNotes(customerToEdit.notes || '');
    } else {
      setName('');
      setPhone('');
      setAddress('');
      setNotes('');
    }
  }, [customerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Customer name is required');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('Phone number is required');
      return;
    }

    if (customerToEdit) {
      updateCustomer(customerToEdit.id, {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-white" />
            <h2 className="text-base font-bold">
              {customerToEdit ? 'Edit Customer' : 'Add New Customer'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-teal-200 hover:text-white hover:bg-white/10"
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
              Customer Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chaudhry Tariq Mehmood"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Phone Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 0300-1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Address / Shop Location (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Shop #4, Main Bazaar"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Internal Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Regular wholesale customer, pays on Fridays"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
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
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{customerToEdit ? 'Save Changes' : 'Add Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
