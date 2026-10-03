import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import {
  X,
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Plus,
  Trash2,
  Users,
  Package,
  Image as ImageIcon,
  Building2,
  Coins,
  Percent,
} from 'lucide-react';
import { Sale, SaleItem } from '../types';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleSuccess: (sale: Sale) => void;
  onOpenAddCustomer: () => void;
  onOpenAddProduct: () => void;
}

export const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  onSaleSuccess,
  onOpenAddCustomer,
  onOpenAddProduct,
}) => {
  const { customers, productsWithCompany, recordMultiItemSale, settings } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [items, setItems] = useState<SaleItem[]>([]);

  // Item selector state
  const [activeProductId, setActiveProductId] = useState<string>('');
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemDiscount, setItemDiscount] = useState<number>(0);

  // Financials
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UDHAAR' | 'PARTIAL'>('CASH');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('Cash');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Set default customer
  useEffect(() => {
    if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  // Set default product
  useEffect(() => {
    if (productsWithCompany.length > 0 && !activeProductId) {
      setActiveProductId(productsWithCompany[0].id);
    }
  }, [productsWithCompany, activeProductId]);

  const activeProduct = useMemo(() => {
    return productsWithCompany.find((p) => p.id === activeProductId);
  }, [productsWithCompany, activeProductId]);

  // Reset inputs when modal opens
  useEffect(() => {
    if (isOpen) {
      setItems([]);
      setItemQty(1);
      setItemDiscount(0);
      setPaidAmount(0);
      setPaymentMode('CASH');
      setNotes('');
      setErrorMsg(null);
    }
  }, [isOpen]);

  // Calculate totals
  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  }, [items]);

  const totalDiscount = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.discount || 0), 0);
  }, [items]);

  const grandTotal = Math.max(0, subtotal - totalDiscount);

  const totalProfit = useMemo(() => {
    return items.reduce((acc, it) => acc + it.itemProfit, 0);
  }, [items]);

  // Keep paidAmount in sync with paymentMode
  useEffect(() => {
    if (paymentMode === 'CASH') {
      setPaidAmount(grandTotal);
      setPaymentMethod('Cash');
    } else if (paymentMode === 'UDHAAR') {
      setPaidAmount(0);
      setPaymentMethod('Udhaar');
    }
  }, [paymentMode, grandTotal]);

  const balanceDue = Math.max(0, grandTotal - paidAmount);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setErrorMsg(null);
    if (!activeProduct) {
      setErrorMsg('Please select a product.');
      return;
    }

    if (itemQty <= 0) {
      setErrorMsg('Quantity must be at least 1.');
      return;
    }

    // Check existing quantity of this product already in cart
    const existingItem = items.find((it) => it.productId === activeProduct.id);
    const unitPrice = activeProduct.price;
    const purchaseCost = activeProduct.purchasePrice || 0;
    const lineDiscount = Math.max(0, itemDiscount);
    const lineTotal = Math.max(0, unitPrice * itemQty - lineDiscount);
    const itemProfit = lineTotal - purchaseCost * itemQty;

    if (existingItem) {
      // Update existing item in cart
      setItems((prev) =>
        prev.map((it) => {
          if (it.productId === activeProduct.id) {
            const newQty = it.quantity + itemQty;
            const newDiscount = (it.discount || 0) + lineDiscount;
            const newTotal = Math.max(0, it.unitPrice * newQty - newDiscount);
            const newProfit = newTotal - it.purchasePrice * newQty;
            return {
              ...it,
              quantity: newQty,
              discount: newDiscount,
              totalPrice: newTotal,
              itemProfit: newProfit,
            };
          }
          return it;
        })
      );
    } else {
      // Add new item
      const newItem: SaleItem = {
        productId: activeProduct.id,
        productName: activeProduct.name,
        companyName: activeProduct.companyName,
        unit: activeProduct.unit || 'pcs',
        image: activeProduct.image,
        purchasePrice: purchaseCost,
        unitPrice: unitPrice,
        quantity: itemQty,
        discount: lineDiscount,
        totalPrice: lineTotal,
        itemProfit: itemProfit,
      };
      setItems((prev) => [...prev, newItem]);
    }

    // Reset line item inputs
    setItemQty(1);
    setItemDiscount(0);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedCustomerId) {
      setErrorMsg('Please select a customer.');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Invoice must contain at least 1 product item.');
      return;
    }

    const cleanPaid = Math.max(0, Math.min(paidAmount, grandTotal));

    const res = recordMultiItemSale({
      customerId: selectedCustomerId,
      items,
      paidAmount: cleanPaid,
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    if (!res.success || !res.sale) {
      setErrorMsg(res.error || 'Failed to record invoice');
      return;
    }

    onSaleSuccess(res.sale);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-4">
        {/* Header */}
        <div className="p-4 sm:px-6 bg-emerald-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">New Multi-Product Sale Invoice</h2>
              <p className="text-xs text-emerald-100">
                Add products, calculate totals, and update Udhaar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Customer Selection */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-600" />
                <span>Customer *</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddCustomer();
                }}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
              >
                <Plus className="h-3 w-3" />
                <span>New Customer</span>
              </button>
            </div>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Product Picker & Cart Line Add */}
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                <Package className="h-4 w-4 text-emerald-600" />
                <span>Add Products to Invoice</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddProduct();
                }}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
              >
                <Plus className="h-3 w-3" />
                <span>New Product</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              {/* Product dropdown */}
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Select Product
                </label>
                <select
                  value={activeProductId}
                  onChange={(e) => setActiveProductId(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {productsWithCompany.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.companyName} | {formatCurrency(p.price, settings.currency)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Qty ({activeProduct?.unit || 'pcs'})
                </label>
                <input
                  type="number"
                  min="1"
                  value={itemQty}
                  onChange={(e) => setItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2.5 py-2 text-xs sm:text-sm font-bold bg-white border border-slate-300 rounded-xl text-center focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Line Discount */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Discount
                </label>
                <input
                  type="number"
                  min="0"
                  value={itemDiscount}
                  onChange={(e) => setItemDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-center focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Add Button */}
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Selected product preview info */}
            {activeProduct && (
              <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                {activeProduct.image && (
                  <img
                    src={activeProduct.image}
                    alt={activeProduct.name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                  />
                )}
                <span>
                  Rate: <strong>{formatCurrency(activeProduct.price, settings.currency)}</strong> / {activeProduct.unit || 'pcs'}
                </span>
                <span>•</span>
                <span className="text-emerald-700">
                  Estimated Profit: +{formatCurrency(activeProduct.price - (activeProduct.purchasePrice || 0), settings.currency)}/unit
                </span>
              </div>
            )}
          </div>

          {/* Cart Table of Multi-Items */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Invoice Products ({items.length})</span>
              <span>Subtotal: {formatCurrency(subtotal, settings.currency)}</span>
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No items added yet. Select a product and click "+ Add".
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Product</th>
                      <th className="py-2 px-3 text-center">Unit</th>
                      <th className="py-2 px-3 text-right">Rate</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Discount</th>
                      <th className="py-2 px-3 text-right">Total</th>
                      <th className="py-2 px-3 text-right">Profit</th>
                      <th className="py-2 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            {it.image ? (
                              <img src={it.image} alt={it.productName} className="w-6 h-6 rounded-md object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-400">
                                <Package className="h-3 w-3" />
                              </div>
                            )}
                            <div>
                              <span>{it.productName}</span>
                              {it.companyName && (
                                <span className="block text-[10px] text-slate-400 font-normal">
                                  {it.companyName}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500">{it.unit}</td>
                        <td className="py-2.5 px-3 text-right font-medium">
                          {formatCurrency(it.unitPrice, settings.currency)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                          {it.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500">
                          {it.discount > 0 ? `-${formatCurrency(it.discount, settings.currency)}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatCurrency(it.totalPrice, settings.currency)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">
                          +{formatCurrency(it.itemProfit, settings.currency)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Terms & Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Payment Mode */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Payment Type
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('CASH')}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all ${
                    paymentMode === 'CASH'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Full Paid
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('UDHAAR')}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all ${
                    paymentMode === 'UDHAAR'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Full Udhaar
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('PARTIAL')}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all ${
                    paymentMode === 'PARTIAL'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Partial
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Amount Paid
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={grandTotal}
                    step="any"
                    value={paidAmount}
                    onChange={(e) => {
                      setPaymentMode('PARTIAL');
                      setPaidAmount(Math.max(0, parseFloat(e.target.value) || 0));
                    }}
                    className="w-full px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as Sale['paymentMethod'])}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Udhaar">Udhaar (Credit)</option>
                  </select>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Optional sale note (e.g. delivered by rider)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2 text-xs">
              <div className="space-y-1.5 border-b border-slate-100 pb-2">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal, settings.currency)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Discount:</span>
                    <span>-{formatCurrency(totalDiscount, settings.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Net Estimated Profit:</span>
                  <span>+{formatCurrency(totalProfit, settings.currency)}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-sm font-bold text-slate-900">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(grandTotal, settings.currency)}</span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-700">
                  <span>Paid Amount:</span>
                  <span>{formatCurrency(paidAmount, settings.currency)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-100">
                  <span className={balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                    Customer Udhaar Due:
                  </span>
                  <span className={balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                    {formatCurrency(balanceDue, settings.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={items.length === 0}
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Confirm & Generate Invoice ({formatCurrency(grandTotal, settings.currency)})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
