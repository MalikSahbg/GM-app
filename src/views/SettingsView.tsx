import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Building,
  Image as ImageIcon,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  DollarSign,
  FileText,
  Moon,
  Sun,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { WhatsAppTemplate } from '../types';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, exportDataJSON, importDataJSON, resetDemoData, clearAllData } = useApp();

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [tagline, setTagline] = useState(settings.tagline || '');
  const [phone, setPhone] = useState(settings.phone);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [currency, setCurrency] = useState(settings.currency);
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix || 'INV-');
  const [pdfFooterText, setPdfFooterText] = useState(settings.pdfFooterText || 'Thank you for your business!');
  const [theme, setTheme] = useState<'light' | 'dark'>(settings.theme || 'light');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(settings.whatsappTemplates || []);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName,
      tagline,
      phone,
      whatsapp,
      email,
      address,
      currency,
      invoicePrefix,
      pdfFooterText,
      theme,
      logoUrl,
      whatsappTemplates: templates,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales_manager_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const res = importDataJSON(text);
        if (res.success) {
          setImportStatus('Backup restored successfully! All data updated.');
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus(`Import failed: ${res.error}`);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUpdateTemplate = (id: string, newContent: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, content: newContent } : t))
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">Business & App Settings</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure store branding, invoices, PDF receipts, WhatsApp templates, and backups.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {importStatus && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 font-semibold ${
            importStatus.includes('failed')
              ? 'bg-rose-50 border border-rose-200 text-rose-900'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
          }`}
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Business Identity & Contact</h2>
          </div>

          {/* Logo upload */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="relative w-16 h-16 rounded-xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
              {logoUrl ? (
                <>
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="absolute top-1 right-1 p-0.5 bg-rose-600 text-white rounded-full"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <ImageIcon className="h-7 w-7 text-slate-400" />
              )}
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-700">Business Logo</span>
              <p className="text-[11px] text-slate-500">
                Printed on sales invoices, PDFs, and customer Khata statements.
              </p>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="mt-1 px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                {logoUrl ? 'Change Logo' : 'Upload Logo'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Store / Business Name *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Quality Wholesale & Retail Solutions"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <Phone className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                WhatsApp Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <MessageSquare className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <Mail className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Store / Business Address
            </label>
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address printed on invoices"
                className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <MapPin className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Invoicing, Currency & PDF Footer */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Invoicing, Currency & PDF Format</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Currency Symbol
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Rs.">Rs. (Pakistani / Indian Rupee)</option>
                <option value="PKR">PKR</option>
                <option value="₹">₹ (INR)</option>
                <option value="$">$ (USD)</option>
                <option value="AED">AED (Dirham)</option>
                <option value="SAR">SAR (Riyal)</option>
                <option value="€">€ (Euro)</option>
                <option value="£">£ (Pound)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Invoice Number Prefix
              </label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                placeholder="e.g. INV-"
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Theme
              </label>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    theme === 'light'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              PDF & Receipt Footer Message
            </label>
            <input
              type="text"
              value={pdfFooterText}
              onChange={(e) => setPdfFooterText(e.target.value)}
              placeholder="e.g. Goods once sold will not be returned without bill."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* WhatsApp Message Templates */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Customizable WhatsApp Templates</h2>
                <p className="text-[11px] text-slate-400">
                  Placeholders like <code className="text-emerald-700 bg-emerald-50 px-1 rounded">{'{customer_name}'}</code>, <code className="text-emerald-700 bg-emerald-50 px-1 rounded">{'{balance}'}</code>, <code className="text-emerald-700 bg-emerald-50 px-1 rounded">{'{store_name}'}</code> are auto-filled.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {templates.map((tpl) => (
              <div key={tpl.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-xs text-slate-800 uppercase block">{tpl.name}</span>
                <textarea
                  rows={3}
                  value={tpl.content}
                  onChange={(e) => handleUpdateTemplate(tpl.id, e.target.value)}
                  className="w-full p-2.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Backup, Restore & Reset */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <RotateCcw className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Backup & Restore Data</h2>
          </div>

          <p className="text-xs text-slate-500">
            Export a full JSON backup of your companies, products, customers, sales history, purchases, and payments. You can restore this backup anytime.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Full Backup (JSON)</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Import & Restore Backup</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset app data to default sample demo store?')) {
                  resetDemoData();
                  alert('Reset to demo sample data complete!');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs rounded-xl border border-amber-200 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset to Sample Data</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('WARNING: Are you sure you want to completely erase all data and start empty?')) {
                  clearAllData();
                  alert('All data has been cleared!');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-xs rounded-xl border border-rose-200 transition-colors ml-auto"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
export default SettingsView;
