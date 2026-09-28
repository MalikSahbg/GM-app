import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { Users, X } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCustomer: Customer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  editingCustomer,
}) => {
  const { addCustomer, updateCustomer } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingCustomer) {
      setName(editingCustomer.name);
      setPhone(editingCustomer.phone);
      setAddress(editingCustomer.address || '');
      setNotes(editingCustomer.notes || '');
    } else {
      setName('');
      setPhone('');
      setAddress('');
      setNotes('');
    }
    setError(null);
  }, [editingCustomer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Contact phone number is required.');
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
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
              Customer Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Haji Aslam, Tariq Mehmood"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-600 block mb-1">
              Phone Number *
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0300-5551234"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-600 block mb-1">
              Shop / Home Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Shop 4, Main Bazar"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-600 block mb-1">
              Customer Notes / Terms
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Pays at end of month, regular buyer"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
            >
              {editingCustomer ? 'Save Changes' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
