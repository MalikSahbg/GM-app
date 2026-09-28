import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, cleanPhoneForWhatsApp } from '../utils/formatters';
import { Share2, X, Send, Users, CheckSquare, Square, MessageSquare, Copy, Check } from 'lucide-react';
import { Customer } from '../types';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCustomerId?: string;
  initialMessage?: string;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  preselectedCustomerId,
  initialMessage,
}) => {
  const { customers, customerBalances, settings } = useApp();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    settings.whatsappTemplates[0]?.id || ''
  );
  const [customMessage, setCustomMessage] = useState<string>(
    initialMessage || settings.whatsappTemplates[0]?.content || ''
  );
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>(() => {
    if (preselectedCustomerId) return [preselectedCustomerId];
    // Default to customers with pending balance
    const debtors = customerBalances.filter((b) => b.outstandingBalance > 0).map((b) => b.customerId);
    return debtors.length > 0 ? debtors : customers.map((c) => c.id);
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = settings.whatsappTemplates.find((t) => t.id === tplId);
    if (tpl) {
      setCustomMessage(tpl.content);
    }
  };

  const toggleSelectCustomer = (id: string) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCustomerIds.length === customers.length) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds(customers.map((c) => c.id));
    }
  };

  const getPersonalizedMessage = (customer: Customer): string => {
    const bal = customerBalances.find((b) => b.customerId === customer.id);
    const balanceNum = bal?.outstandingBalance || 0;

    let text = customMessage
      .replace(/{customer_name}/g, customer.name)
      .replace(/{balance}/g, new Intl.NumberFormat('en-IN').format(balanceNum))
      .replace(/{store_name}/g, settings.businessName)
      .replace(/{phone}/g, settings.phone)
      .replace(/{currency}/g, settings.currency)
      .replace(/{total_purchased}/g, new Intl.NumberFormat('en-IN').format(bal?.totalPurchased || 0))
      .replace(/{total_paid}/g, new Intl.NumberFormat('en-IN').format(bal?.totalPaid || 0));

    return text;
  };

  const handleSendSingle = (customer: Customer) => {
    const text = getPersonalizedMessage(customer);
    const rawPhone = customer.whatsapp || customer.phone;
    const cleanPhone = cleanPhoneForWhatsApp(rawPhone);
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopySingle = (customer: Customer) => {
    const text = getPersonalizedMessage(customer);
    navigator.clipboard.writeText(text);
    setCopiedId(customer.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Share2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">WhatsApp Reminder & Broadcast</h2>
              <p className="text-xs text-emerald-100">
                Personalized templates with automatic customer names & balance replacement
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Template Selection */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 uppercase tracking-wider text-[11px]">
              Select WhatsApp Template:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {settings.whatsappTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleTemplateChange(tpl.id)}
                  className={`p-2.5 text-left rounded-xl border transition-all ${
                    selectedTemplateId === tpl.id
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-xs font-semibold">{tpl.name}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5 uppercase">{tpl.type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message Text Editor */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Message Content (Variables will be auto-replaced):
              </label>
              <div className="text-[10px] text-slate-400 font-mono">
                {`{customer_name}, {balance}, {store_name}`}
              </div>
            </div>
            <textarea
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Customer Selection & Personalized Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Select Recipients ({selectedCustomerIds.length}/{customers.length}):
                </label>
              </div>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                {selectedCustomerIds.length === customers.length ? 'Deselect All' : 'Select All Customers'}
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {customers.map((c) => {
                const bal = customerBalances.find((b) => b.customerId === c.id);
                const isSelected = selectedCustomerIds.includes(c.id);
                const isDebtor = (bal?.outstandingBalance || 0) > 0;

                return (
                  <div
                    key={c.id}
                    className={`p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                      onClick={() => toggleSelectCustomer(c.id)}
                    >
                      <button type="button" className="text-emerald-600 shrink-0">
                        {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-slate-300" />}
                      </button>

                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block truncate">{c.name}</span>
                        <span className="text-[11px] text-slate-500">{c.whatsapp || c.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className={`font-bold block ${isDebtor ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {formatCurrency(bal?.outstandingBalance || 0, settings.currency)}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-slate-400">
                          {isDebtor ? 'Udhaar Due' : 'Cleared'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopySingle(c)}
                        title="Copy personalized message"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                      >
                        {copiedId === c.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendSingle(c)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Send className="h-3 w-3" />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Clicking <strong>Send</strong> opens WhatsApp directly with the customer's personalized balance text.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
