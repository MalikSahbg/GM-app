import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { CustomerOrder } from '../types';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { createOrderPdfFile, downloadOrderPdf, shareOrderPdf } from '../utils/orderPdf';
import { X, Share2, MessageCircle, FileText, Building2, User, Download } from 'lucide-react';

interface OrderPdfModalProps {
  order: CustomerOrder | null;
  initialType?: 'CUSTOMER' | 'COMPANY';
  onClose: () => void;
}

export const OrderPdfModal: React.FC<OrderPdfModalProps> = ({
  order,
  initialType = 'CUSTOMER',
  onClose,
}) => {
  const { settings } = useApp();
  const [docType, setDocType] = useState<'CUSTOMER' | 'COMPANY'>(
    initialType === 'COMPANY' && order?.companyName ? 'COMPANY' : 'CUSTOMER'
  );

  useEffect(() => {
    setDocType(initialType === 'COMPANY' && order?.companyName ? 'COMPANY' : 'CUSTOMER');
  }, [initialType, order?.id, order?.companyName]);

  if (!order) return null;

  const showPrice = !!order.showPrice;
  const hasCompany = !!order.companyName;

  const handleDownloadPdf = async () => {
    try {
      await downloadOrderPdf(createOrderPdfFile(order, settings, docType));
      alert(Capacitor.isNativePlatform() ? 'PDF saved in Documents/SalesManager.' : 'PDF download started.');
    } catch (error) {
      console.error('Order PDF save failed', error);
      alert('Could not save the PDF. Please try again.');
    }
  };

  const getWhatsAppMessage = () => {
    if (docType === 'CUSTOMER') {
      const itemsList = order.items
        .map((it, idx) => {
          const priceStr = showPrice && it.price ? ` @ ${formatCurrency(it.price, settings.currency)} = ${formatCurrency(it.totalPrice ?? (it.price * it.quantity), settings.currency)}` : '';
          return `${idx + 1}. *${it.productName}* - ${it.quantity} ${it.unit || 'pcs'}${priceStr}`;
        })
        .join('\n');

      const totalStr = showPrice && order.totalAmount
        ? `\n*Grand Total:* ${formatCurrency(order.totalAmount, settings.currency)}`
        : '';

      return `*${settings.businessName}*\n*ORDER CONFIRMATION*\n*Order #:* ${order.orderNumber}\n*Date:* ${formatDate(order.date)}\n*Customer:* ${order.customerName}\n*Phone:* ${order.customerPhone || 'N/A'}${order.customerAddress ? `\n*Address:* ${order.customerAddress}` : ''}${order.companyName ? `\n*Company:* ${order.companyName}` : ''}\n\n*Ordered Products (${order.totalProducts} items, ${order.totalQuantity} total qty):*\n${itemsList}\n${totalStr}\n\n*Status:* ${order.status}\n${order.notes ? `*Notes:* ${order.notes}\n` : ''}\nThank you for placing your order with us!`;
    } else {
      const itemsList = order.items
        .map((it, idx) => {
          const priceStr = showPrice && it.price ? ` @ ${formatCurrency(it.price, settings.currency)}` : '';
          return `${idx + 1}. *${it.productName}* - ${it.quantity} ${it.unit || 'pcs'}${priceStr}`;
        })
        .join('\n');

      const totalStr = showPrice && order.totalAmount
        ? `\n*Total Value:* ${formatCurrency(order.totalAmount, settings.currency)}`
        : '';

      return `*ORDER FOR SUPPLIER / COMPANY*\n*Company:* ${order.companyName}\n*Order #:* ${order.orderNumber}\n*Date:* ${formatDate(order.date)}\n*From:* ${settings.businessName} (${settings.phone})\n*Sales Rep / Contact:* ${order.salesRepName || settings.phone}\n*Customer:* ${order.customerName}\n\n*Products Required (${order.totalProducts} items, ${order.totalQuantity} total qty):*\n${itemsList}\n${totalStr}\n\n*Status:* ${order.status}\n${order.notes ? `*Notes:* ${order.notes}\n` : ''}\nPlease confirm order dispatch.`;
    }
  };

  const handleShareWhatsApp = () => {
    const text = getWhatsAppMessage();
    const phone = docType === 'CUSTOMER' ? (order.customerWhatsApp || order.customerPhone || '') : '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareNative = async () => {
    const file = createOrderPdfFile(order, settings, docType);
    try {
      await shareOrderPdf(
        file,
        `Order ${order.orderNumber} - ${docType === 'CUSTOMER' ? order.customerName : order.companyName}`
      );
    } catch {
      alert('The PDF was saved in Documents/SalesManager, but sharing could not be opened.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm">Order PDF Document</h3>
              <p className="text-[11px] text-slate-300 font-mono">{order.orderNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Document Type Switcher */}
            <div className="bg-slate-800 p-0.5 rounded-lg flex items-center text-xs">
              <button
                onClick={() => setDocType('CUSTOMER')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  docType === 'CUSTOMER'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <User className="h-3 w-3" />
                <span>Customer PDF</span>
              </button>
              {hasCompany ? (
                <button
                  onClick={() => setDocType('COMPANY')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                    docType === 'COMPANY'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Building2 className="h-3 w-3" />
                  <span>Company PDF</span>
                </button>
              ) : (
                <span
                  title="No company was selected for this order"
                  className="px-2 py-1 text-slate-500 cursor-not-allowed text-[11px]"
                >
                  Company PDF (N/A)
                </span>
              )}
            </div>

            <button
              onClick={handleDownloadPdf}
              className="min-h-10 rounded-lg bg-blue-600 px-3 text-white text-xs font-semibold flex items-center gap-1.5 transition hover:bg-blue-500 active:translate-y-px"
              title="Save PDF"
            >
              <Download className="h-4 w-4" />
              <span>Save PDF</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
              title="Share via WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handleShareNative}
              className="min-h-10 rounded-lg bg-slate-700 px-3 text-white text-xs font-semibold flex items-center gap-1.5 transition hover:bg-slate-600 active:translate-y-px"
              title="Share PDF"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Preview */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50 print:bg-white print:p-0" id="order-pdf-content">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200 print:shadow-none print:border-none print:p-0 max-w-xl mx-auto space-y-6">
            
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-5 gap-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 mb-1">
                  {docType === 'CUSTOMER' ? 'CUSTOMER ORDER' : 'COMPANY SUPPLY ORDER'}
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {settings.businessName}
                </h1>
                {settings.tagline && (
                  <p className="text-xs text-slate-500 mt-0.5">{settings.tagline}</p>
                )}
                <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                  <p>{settings.address}</p>
                  <p>Tel: {settings.phone} {settings.email ? `| Email: ${settings.email}` : ''}</p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="inline-block bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-left sm:text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Order Number</p>
                  <p className="text-base font-extrabold font-mono text-emerald-700">{order.orderNumber}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Date: {formatDate(order.date)}</p>
                  <p className="text-[11px] font-semibold text-slate-600">
                    Status: <span className="text-emerald-700">{order.status}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Target Information Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                  {docType === 'CUSTOMER' ? 'Order For Customer' : 'Client Customer Reference'}
                </p>
                <p className="font-bold text-sm text-slate-900">{order.customerName}</p>
                {order.customerPhone && (
                  <p className="text-slate-600 mt-0.5">Phone: {order.customerPhone}</p>
                )}
                {order.customerAddress && (
                  <p className="text-slate-600 mt-0.5">Address: {order.customerAddress}</p>
                )}
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                  {docType === 'COMPANY' ? 'Supplier Company' : 'Associated Company'}
                </p>
                <p className="font-bold text-sm text-slate-900">
                  {order.companyName || 'No Company Selected (Direct)'}
                </p>
                <p className="text-slate-600 mt-0.5">Booker / Rep: {order.salesRepName || 'Store Rep'}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Price Display: {showPrice ? 'Prices Visible' : 'Prices Hidden'}
                </p>
              </div>
            </div>

            {/* Products Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-left w-8">#</th>
                    <th className="py-2.5 px-3 text-left">Product Description</th>
                    <th className="py-2.5 px-3 text-left">Company</th>
                    <th className="py-2.5 px-3 text-center w-20">Quantity</th>
                    {showPrice && (
                      <>
                        <th className="py-2.5 px-3 text-right w-24">Rate</th>
                        <th className="py-2.5 px-3 text-right w-24">Total</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.productName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {item.companyName || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                        {item.quantity} <span className="text-[10px] font-normal text-slate-400">{item.unit || 'pcs'}</span>
                      </td>
                      {showPrice && (
                        <>
                          <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                            {formatCurrency(item.price || 0, settings.currency)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                            {formatCurrency(item.totalPrice || ((item.price || 0) * item.quantity), settings.currency)}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={3} className="py-2.5 px-3 text-slate-700">
                      Total ({order.totalProducts} products)
                    </td>
                    <td className="py-2.5 px-3 text-center text-emerald-800 font-extrabold text-sm">
                      {order.totalQuantity}
                    </td>
                    {showPrice && (
                      <td colSpan={2} className="py-2.5 px-3 text-right text-emerald-700 font-extrabold text-sm font-mono">
                        {formatCurrency(order.totalAmount || 0, settings.currency)}
                      </td>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Notes & Footer */}
            {order.notes && (
              <div className="bg-amber-50/60 border border-amber-200/60 p-3 rounded-lg text-xs text-amber-900">
                <span className="font-bold">Order Note: </span>
                <span>{order.notes}</span>
              </div>
            )}

            <div className="border-t border-dashed border-slate-200 pt-4 text-center text-[11px] text-slate-500 space-y-1">
              <p className="italic">{settings.pdfFooterText || 'Thank you for your order!'}</p>
              <p className="text-[10px] text-slate-400">
                Generated via {settings.businessName} Order Booking System
              </p>
              <p className="pt-1 text-[10px] font-medium tracking-wide text-slate-500">
                Powered by Noman Ali <span className="px-1 text-slate-300">·</span> Phone: 03067458074
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
