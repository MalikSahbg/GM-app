import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, formatShortDate } from '../utils/formatters';
import { Printer, Download, Share2, X, Store, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';
import { Sale, Customer, Company, CustomerBalance, CompanyBalance, Purchase, CustomerPayment, CompanyPayment } from '../types';

export type DocumentType =
  | { type: 'SALE_INVOICE'; sale: Sale }
  | { type: 'CUSTOMER_KHATA'; customer: Customer }
  | { type: 'COMPANY_KHATA'; company: Company }
  | { type: 'REPORT'; title: string; subtitle?: string; summaryCards: { label: string; value: string; color?: string }[]; headers: string[]; rows: (string | number)[][] };

interface DocumentPrintModalProps {
  isOpen: boolean;
  document: DocumentType | null;
  onClose: () => void;
  onSendWhatsApp?: (phone: string, text: string) => void;
}

export const DocumentPrintModal: React.FC<DocumentPrintModalProps> = ({
  isOpen,
  document: doc,
  onClose,
  onSendWhatsApp,
}) => {
  const { settings, customers, companies, sales, purchases, customerPayments, companyPayments, customerBalances, companyBalances } = useApp();
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !doc) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!doc) return;
    let phone = '';
    let message = '';

    if (doc.type === 'SALE_INVOICE') {
      const cust = customers.find((c) => c.id === doc.sale.customerId);
      phone = cust?.whatsapp || cust?.phone || '';
      message = `*${settings.businessName}*\n*Sales Invoice: ${doc.sale.invoiceNumber || doc.sale.id}*\nDate: ${formatDate(doc.sale.date)}\nCustomer: ${cust?.name}\nTotal: ${formatCurrency(doc.sale.totalPrice, settings.currency)}\nPaid: ${formatCurrency(doc.sale.paidAmount, settings.currency)}\n*Balance Due: ${formatCurrency(doc.sale.balanceDue, settings.currency)}*\n\nThank you for choosing ${settings.businessName}!`;
    } else if (doc.type === 'CUSTOMER_KHATA') {
      const bal = customerBalances.find((b) => b.customerId === doc.customer.id);
      phone = doc.customer.whatsapp || doc.customer.phone || '';
      message = `*${settings.businessName} - Account Statement*\nCustomer: ${doc.customer.name}\nTotal Purchases: ${formatCurrency(bal?.totalPurchased || 0, settings.currency)}\nTotal Paid: ${formatCurrency(bal?.totalPaid || 0, settings.currency)}\n*Outstanding Balance: ${formatCurrency(bal?.outstandingBalance || 0, settings.currency)}*\n\nKindly clear your pending balance at your earliest convenience. Thank you!`;
    }

    if (phone && onSendWhatsApp) {
      onSendWhatsApp(phone, message);
    } else if (phone) {
      const clean = phone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${clean}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Modal Action Bar (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Professional Document Preview</span>
            <span className="text-xs text-slate-400">| Ready for PDF & Print</span>
          </div>

          <div className="flex items-center gap-2">
            {doc.type === 'SALE_INVOICE' || doc.type === 'CUSTOMER_KHATA' ? (
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </button>
            ) : null}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="overflow-y-auto p-6 sm:p-10 flex-1 bg-slate-50 print:bg-white print:p-0" id="print-section" ref={printAreaRef}>
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xs print:shadow-none border border-slate-200 print:border-none max-w-2xl mx-auto text-slate-900 font-sans text-xs">
            {/* Header: Business Info & Logo */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
              <div>
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="h-12 w-auto object-contain mb-2" />
                ) : (
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Store className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-black text-slate-900 tracking-tight">
                      {settings.businessName}
                    </span>
                  </div>
                )}
                {settings.tagline && <p className="text-[11px] text-slate-500 italic mb-1">{settings.tagline}</p>}
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>{settings.address}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>{settings.phone} {settings.whatsapp && `| WA: ${settings.whatsapp}`}</span>
                  </p>
                  {settings.email && (
                    <p className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{settings.email}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px] rounded-sm">
                  {doc.type === 'SALE_INVOICE'
                    ? 'SALES INVOICE'
                    : doc.type === 'CUSTOMER_KHATA'
                    ? 'CUSTOMER STATEMENT'
                    : doc.type === 'COMPANY_KHATA'
                    ? 'SUPPLIER LEDGER'
                    : 'FINANCIAL REPORT'}
                </span>
                <p className="text-[11px] font-mono text-slate-500 mt-2">
                  Date: {formatDate(new Date().toISOString())}
                </p>
              </div>
            </div>

            {/* Document Body Variant: SALE INVOICE */}
            {doc.type === 'SALE_INVOICE' && (() => {
              const sale = doc.sale;
              const customer = customers.find((c) => c.id === sale.customerId);
              return (
                <div className="mt-5 space-y-5">
                  {/* Bill To & Invoice Info */}
                  <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        BILL TO / CUSTOMER:
                      </span>
                      <p className="font-bold text-sm text-slate-900 mt-0.5">{customer?.name || 'Walk-in Customer'}</p>
                      <p className="text-[11px] text-slate-600">{customer?.phone}</p>
                      {customer?.address && <p className="text-[11px] text-slate-500">{customer.address}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        INVOICE DETAILS:
                      </span>
                      <p className="font-mono font-bold text-slate-900 mt-0.5">{sale.invoiceNumber || sale.id}</p>
                      <p className="text-[11px] text-slate-600">Date: {formatDate(sale.date)}</p>
                      <p className="text-[11px] text-slate-600">Method: {sale.paymentMethod || 'Cash'}</p>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 uppercase text-[10px] font-bold text-slate-600 border-y border-slate-200">
                        <tr>
                          <th className="py-2 px-3">#</th>
                          <th className="py-2 px-3">Item Description</th>
                          <th className="py-2 px-3 text-center">Unit</th>
                          <th className="py-2 px-3 text-right">Price</th>
                          <th className="py-2 px-3 text-center">Qty</th>
                          <th className="py-2 px-3 text-right">Discount</th>
                          <th className="py-2 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sale.items && sale.items.length > 0 ? (
                          sale.items.map((it, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                              <td className="py-2.5 px-3">
                                <span className="font-bold text-slate-900 block">{it.productName}</span>
                                {it.companyName && <span className="text-[10px] text-slate-400">{it.companyName}</span>}
                              </td>
                              <td className="py-2.5 px-3 text-center text-slate-500">{it.unit || 'pcs'}</td>
                              <td className="py-2.5 px-3 text-right">{formatCurrency(it.unitPrice, settings.currency)}</td>
                              <td className="py-2.5 px-3 text-center font-bold">{it.quantity}</td>
                              <td className="py-2.5 px-3 text-right text-slate-500">
                                {it.discount > 0 ? formatCurrency(it.discount, settings.currency) : '-'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                {formatCurrency(it.totalPrice, settings.currency)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="py-2.5 px-3">1</td>
                            <td className="py-2.5 px-3 font-bold">{sale.productName || 'General Product'}</td>
                            <td className="py-2.5 px-3 text-center">pcs</td>
                            <td className="py-2.5 px-3 text-right">{formatCurrency(sale.unitPrice || 0, settings.currency)}</td>
                            <td className="py-2.5 px-3 text-center font-bold">{sale.quantity || 1}</td>
                            <td className="py-2.5 px-3 text-right">-</td>
                            <td className="py-2.5 px-3 text-right font-bold">{formatCurrency(sale.totalPrice, settings.currency)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Totals */}
                  <div className="flex justify-end pt-3 border-t border-slate-200">
                    <div className="w-64 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(sale.subtotal || sale.totalPrice, settings.currency)}</span>
                      </div>
                      {sale.totalDiscount > 0 && (
                        <div className="flex justify-between text-emerald-700">
                          <span>Total Discount:</span>
                          <span>- {formatCurrency(sale.totalDiscount, settings.currency)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                        <span>Grand Total:</span>
                        <span>{formatCurrency(sale.totalPrice, settings.currency)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-emerald-700">
                        <span>Amount Received:</span>
                        <span>{formatCurrency(sale.paidAmount, settings.currency)}</span>
                      </div>
                      <div className="flex justify-between font-black text-sm pt-1 border-t-2 border-slate-900">
                        <span className={sale.balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                          Balance Due (Udhaar):
                        </span>
                        <span className={sale.balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                          {formatCurrency(sale.balanceDue, settings.currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {sale.notes && (
                    <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900">
                      <span className="font-bold">Remarks: </span>
                      <span>{sale.notes}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Document Body Variant: CUSTOMER KHATA / STATEMENT */}
            {doc.type === 'CUSTOMER_KHATA' && (() => {
              const cust = doc.customer;
              const custSales = sales.filter((s) => s.customerId === cust.id);
              const custPayments = customerPayments.filter((p) => p.customerId === cust.id);
              const bal = customerBalances.find((b) => b.customerId === cust.id);

              // Merge into chronological ledger
              const ledger = [
                ...custSales.map((s) => ({
                  type: 'INVOICE' as const,
                  date: s.date,
                  ref: s.invoiceNumber || s.id,
                  description: s.items?.map((it) => `${it.quantity}x ${it.productName}`).join(', ') || 'Sale Invoice',
                  debit: s.totalPrice, // Customer owes this
                  credit: s.paidAmount, // Customer paid at invoice
                  balanceChange: s.balanceDue,
                })),
                ...custPayments.map((p) => ({
                  type: 'PAYMENT' as const,
                  date: p.date,
                  ref: p.referenceNumber || p.id,
                  description: p.note || `Payment received via ${p.paymentMethod}`,
                  debit: 0,
                  credit: p.amount,
                  balanceChange: -p.amount,
                })),
              ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

              let runningBalance = 0;
              const ledgerWithRunning = ledger.map((row) => {
                runningBalance += row.debit - row.credit;
                return { ...row, runningBalance };
              });

              return (
                <div className="mt-5 space-y-5">
                  <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        CUSTOMER ACCOUNT:
                      </span>
                      <p className="font-bold text-sm text-slate-900 mt-0.5">{cust.name}</p>
                      <p className="text-[11px] text-slate-600">Phone: {cust.phone}</p>
                      {cust.address && <p className="text-[11px] text-slate-500">{cust.address}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        OUTSTANDING UDHAAR:
                      </span>
                      <p className="text-xl font-black text-rose-700 mt-0.5">
                        {formatCurrency(bal?.outstandingBalance || 0, settings.currency)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Total Purchases: {formatCurrency(bal?.totalPurchased || 0, settings.currency)}
                      </p>
                    </div>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 uppercase text-[10px] font-bold text-slate-600 border-y border-slate-200">
                      <tr>
                        <th className="py-2 px-2.5">Date</th>
                        <th className="py-2 px-2.5">Ref #</th>
                        <th className="py-2 px-2.5">Transaction</th>
                        <th className="py-2 px-2.5 text-right">Debit (Sale)</th>
                        <th className="py-2 px-2.5 text-right">Credit (Paid)</th>
                        <th className="py-2 px-2.5 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ledgerWithRunning.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-2.5 whitespace-nowrap text-slate-500">{formatShortDate(row.date)}</td>
                          <td className="py-2 px-2.5 font-mono text-[11px]">{row.ref}</td>
                          <td className="py-2 px-2.5 max-w-[200px] truncate">{row.description}</td>
                          <td className="py-2 px-2.5 text-right text-slate-900 font-medium">
                            {row.debit > 0 ? formatCurrency(row.debit, settings.currency) : '-'}
                          </td>
                          <td className="py-2 px-2.5 text-right text-emerald-700 font-medium">
                            {row.credit > 0 ? formatCurrency(row.credit, settings.currency) : '-'}
                          </td>
                          <td className="py-2 px-2.5 text-right font-bold text-slate-900">
                            {formatCurrency(row.runningBalance, settings.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {/* Document Body Variant: COMPANY KHATA / SUPPLIER STATEMENT */}
            {doc.type === 'COMPANY_KHATA' && (() => {
              const comp = doc.company;
              const compPurchases = purchases.filter((p) => p.companyId === comp.id);
              const compPayments = companyPayments.filter((p) => p.companyId === comp.id);
              const bal = companyBalances.find((b) => b.companyId === comp.id);

              const ledger = [
                ...compPurchases.map((p) => ({
                  type: 'PURCHASE' as const,
                  date: p.date,
                  ref: p.billNumber || p.id,
                  description: p.items?.map((it) => `${it.quantity}x ${it.productName}`).join(', ') || 'Purchase Bill',
                  credit: p.totalAmount, // We owe company
                  debit: p.paidAmount, // Paid on bill
                })),
                ...compPayments.map((p) => ({
                  type: 'PAYMENT' as const,
                  date: p.date,
                  ref: p.referenceNumber || p.id,
                  description: p.note || `Paid to supplier via ${p.paymentMethod}`,
                  credit: 0,
                  debit: p.amount,
                })),
              ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

              let runningPayable = 0;
              const ledgerWithRunning = ledger.map((row) => {
                runningPayable += row.credit - row.debit;
                return { ...row, runningPayable };
              });

              return (
                <div className="mt-5 space-y-5">
                  <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        SUPPLIER COMPANY:
                      </span>
                      <p className="font-bold text-sm text-slate-900 mt-0.5">{comp.name}</p>
                      <p className="text-[11px] text-slate-600">Contact: {comp.contactPhone || comp.contactEmail}</p>
                      {comp.ntn && <p className="text-[11px] text-slate-500">NTN: {comp.ntn}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        TOTAL PAYABLE DEBT:
                      </span>
                      <p className="text-xl font-black text-rose-700 mt-0.5">
                        {formatCurrency(bal?.remainingPayable || 0, settings.currency)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Total Stock Purchased: {formatCurrency(bal?.totalPurchasedAmount || 0, settings.currency)}
                      </p>
                    </div>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 uppercase text-[10px] font-bold text-slate-600 border-y border-slate-200">
                      <tr>
                        <th className="py-2 px-2.5">Date</th>
                        <th className="py-2 px-2.5">Bill / Ref #</th>
                        <th className="py-2 px-2.5">Description</th>
                        <th className="py-2 px-2.5 text-right">Bill Amount</th>
                        <th className="py-2 px-2.5 text-right">Amount Paid</th>
                        <th className="py-2 px-2.5 text-right">Remaining Payable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ledgerWithRunning.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-2.5 text-slate-500">{formatShortDate(row.date)}</td>
                          <td className="py-2 px-2.5 font-mono text-[11px]">{row.ref}</td>
                          <td className="py-2 px-2.5 max-w-[200px] truncate">{row.description}</td>
                          <td className="py-2 px-2.5 text-right font-medium">
                            {row.credit > 0 ? formatCurrency(row.credit, settings.currency) : '-'}
                          </td>
                          <td className="py-2 px-2.5 text-right text-emerald-700 font-medium">
                            {row.debit > 0 ? formatCurrency(row.debit, settings.currency) : '-'}
                          </td>
                          <td className="py-2 px-2.5 text-right font-bold text-slate-900">
                            {formatCurrency(row.runningPayable, settings.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {/* Document Body Variant: REPORT */}
            {doc.type === 'REPORT' && (
              <div className="mt-5 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{doc.title}</h3>
                  {doc.subtitle && <p className="text-xs text-slate-500 mt-0.5">{doc.subtitle}</p>}
                </div>

                {doc.summaryCards && doc.summaryCards.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {doc.summaryCards.map((c, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">{c.label}</span>
                        <span className={`text-base font-bold mt-0.5 block ${c.color || 'text-slate-900'}`}>{c.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 uppercase text-[10px] font-bold text-slate-600 border-y border-slate-200">
                      <tr>
                        {doc.headers.map((h, i) => (
                          <th key={i} className="py-2 px-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {doc.rows.map((r, ri) => (
                        <tr key={ri} className="hover:bg-slate-50">
                          {r.map((cell, ci) => (
                            <td key={ci} className="py-2.5 px-3">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Document Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
              <p>{settings.pdfFooterText || 'Thank you for your business!'}</p>
              <p className="font-mono text-[9px]">Generated by {settings.businessName} — Management System</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
