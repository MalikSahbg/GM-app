import React from 'react';
import { Sale, Customer, ProductWithCompany } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useApp } from '../context/AppContext';
import { X, Printer, Share2, CheckCircle2 } from 'lucide-react';

interface SaleReceiptModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export const SaleReceiptModal: React.FC<SaleReceiptModalProps> = ({ sale, onClose }) => {
  const { customers, productsWithCompany, settings } = useApp();

  if (!sale) return null;

  const customer = customers.find((c) => c.id === sale.customerId);
  const fallbackProduct = productsWithCompany.find((p) => p.id === sale.productId);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const itemsSummary =
      sale.items && sale.items.length > 0
        ? sale.items.map((it) => `${it.productName} x ${it.quantity} (${formatCurrency(it.totalPrice, settings.currency)})`).join('\n')
        : `${fallbackProduct?.name || sale.productName || 'Item'} x ${sale.quantity || 1}`;

    const text = `*${settings.businessName}*\n*Sale Receipt #${sale.invoiceNumber || sale.id}*\nDate: ${formatDate(sale.date)}\nCustomer: ${customer?.name || 'Walk-in'}\n\n*Items:*\n${itemsSummary}\n\n*Total:* ${formatCurrency(sale.totalPrice, settings.currency)}\n*Paid:* ${formatCurrency(sale.paidAmount, settings.currency)}\n*Balance Due:* ${formatCurrency(sale.balanceDue, settings.currency)}\n\nThank you for your business!`;

    if (navigator.share) {
      navigator.share({ title: 'Sale Receipt', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Receipt text copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:w-full my-4">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Sale Receipt Recorded</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-4 text-slate-800" id="receipt-print-area">
          <div className="text-center border-b border-dashed border-slate-300 pb-4">
            <h2 className="text-lg font-bold text-slate-900">{settings.businessName}</h2>
            {settings.tagline && <p className="text-xs text-slate-500">{settings.tagline}</p>}
            <p className="text-xs text-slate-500">{settings.address || 'Sales & Inventory Management'}</p>
            {settings.phone && <p className="text-xs text-slate-500">Tel: {settings.phone}</p>}
            <p className="text-xs font-mono text-slate-400 mt-1">Invoice: #{sale.invoiceNumber || sale.id}</p>
            <p className="text-xs text-slate-500">{formatDate(sale.date)}</p>
          </div>

          {/* Customer Details */}
          <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-bold text-slate-900">{customer?.name || 'Walk-in Customer'}</span>
            </div>
            {customer?.phone && (
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-medium text-slate-700">{customer.phone}</span>
              </div>
            )}
            {customer?.address && (
              <div className="flex justify-between">
                <span className="text-slate-500">Address:</span>
                <span className="font-medium text-slate-700 truncate max-w-[200px]">{customer.address}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-left">
                <th className="py-2">Item</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Rate</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items && sale.items.length > 0 ? (
                sale.items.map((it, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-2 font-medium text-slate-900">
                      {it.productName}
                      {it.companyName && (
                        <span className="block text-[10px] text-slate-400">{it.companyName}</span>
                      )}
                    </td>
                    <td className="py-2 text-center font-bold">
                      {it.quantity} {it.unit || 'pcs'}
                    </td>
                    <td className="py-2 text-right">{formatCurrency(it.unitPrice, settings.currency)}</td>
                    <td className="py-2 text-right font-bold text-slate-900">
                      {formatCurrency(it.totalPrice, settings.currency)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-slate-100">
                  <td className="py-2 font-medium text-slate-900">
                    {fallbackProduct?.name || sale.productName || 'Product'}
                    {fallbackProduct?.companyName && (
                      <span className="block text-[10px] text-slate-400">{fallbackProduct.companyName}</span>
                    )}
                  </td>
                  <td className="py-2 text-center font-bold">{sale.quantity || 1}</td>
                  <td className="py-2 text-right">{formatCurrency(sale.unitPrice || 0, settings.currency)}</td>
                  <td className="py-2 text-right font-bold text-slate-900">
                    {formatCurrency(sale.totalPrice, settings.currency)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Financials */}
          <div className="pt-2 border-t border-dashed border-slate-300 space-y-1.5 text-xs">
            {sale.totalDiscount > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Discount:</span>
                <span>-{formatCurrency(sale.totalDiscount, settings.currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm">
              <span>Total Bill:</span>
              <span className="text-slate-900">{formatCurrency(sale.totalPrice, settings.currency)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Paid ({sale.paymentMethod || 'Cash'}):</span>
              <span>{formatCurrency(sale.paidAmount, settings.currency)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-100">
              <span className={sale.balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                Remaining Balance:
              </span>
              <span className={sale.balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                {formatCurrency(sale.balanceDue, settings.currency)}
              </span>
            </div>
          </div>

          {sale.notes && (
            <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100 text-[11px] text-amber-900">
              <span className="font-semibold">Note: </span>
              {sale.notes}
            </div>
          )}

          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            {settings.pdfFooterText || 'Thank you for your business!'}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-2xs"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
