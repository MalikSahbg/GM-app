import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import {
  ShoppingCart,
  Users,
  Package,
  AlertCircle,
  CheckCircle2,
  Plus,
  Coins,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { Sale } from '../types';

interface NewSaleViewProps {
  onOpenAddCustomer: () => void;
  onOpenAddProduct: () => void;
  onSaleCompleted?: (sale: Sale) => void;
}

export const NewSaleView: React.FC<NewSaleViewProps> = ({
  onOpenAddCustomer,
  onOpenAddProduct,
  onSaleCompleted,
}) => {
  const { customers, productsWithCompany, recordSale } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'FULL_CASH' | 'FULL_UDHAAR' | 'CUSTOM'>('FULL_CASH');
  const [notes, setNotes] = useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const [successSale, setSuccessSale] = useState<Sale | null>(null);

  // Set initial customer & product if available
  useEffect(() => {
    if (!selectedCustomerId && customers.length > 0) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  useEffect(() => {
    if (!selectedProductId && productsWithCompany.length > 0) {
      // Pick first in-stock product
      const inStock = productsWithCompany.find((p) => p.stockQuantity > 0) || productsWithCompany[0];
      setSelectedProductId(inStock.id);
    }
  }, [productsWithCompany, selectedProductId]);

  const selectedProduct = useMemo(() => {
    return productsWithCompany.find((p) => p.id === selectedProductId);
  }, [productsWithCompany, selectedProductId]);

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const totalPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    return selectedProduct.price * Math.max(1, quantity);
  }, [selectedProduct, quantity]);

  // Keep paidAmount in sync with paymentMode
  useEffect(() => {
    if (paymentMode === 'FULL_CASH') {
      setPaidAmount(totalPrice);
    } else if (paymentMode === 'FULL_UDHAAR') {
      setPaidAmount(0);
    }
  }, [paymentMode, totalPrice]);

  const balanceDue = Math.max(0, totalPrice - paidAmount);
  const isOutOfStock = selectedProduct ? selectedProduct.stockQuantity === 0 : true;
  const isExceedingStock = selectedProduct ? quantity > selectedProduct.stockQuantity : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCustomerId) {
      setError('Please select a customer first.');
      return;
    }
    if (!selectedProductId) {
      setError('Please select a product.');
      return;
    }
    if (quantity <= 0) {
      setError('Quantity must be at least 1.');
      return;
    }
    if (selectedProduct && quantity > selectedProduct.stockQuantity) {
      setError(`Requested quantity (${quantity}) exceeds current available stock (${selectedProduct.stockQuantity}).`);
      return;
    }

    const result = recordSale(selectedCustomerId, selectedProductId, quantity, paidAmount, notes);
    if (!result.success || !result.sale) {
      setError(result.error || 'Failed to record sale');
      return;
    }

    setSuccessSale(result.sale);
    if (onSaleCompleted) {
      onSaleCompleted(result.sale);
    }
  };

  const handleReset = () => {
    setSuccessSale(null);
    setQuantity(1);
    setPaymentMode('FULL_CASH');
    setNotes('');
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Record New Sale</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Deducts stock in real-time and automatically updates customer's Udhaar ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddCustomer}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
          >
            <Users className="h-3.5 w-3.5" />
            <span>+ Customer</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddProduct}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <Package className="h-3.5 w-3.5" />
            <span>+ Product</span>
          </button>
        </div>
      </div>

      {/* Sale Form or Success Confirmation */}
      {successSale ? (
        <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 sm:p-8 text-center space-y-6 shadow-sm">
          <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">Sale Recorded Successfully!</h2>
            <p className="text-sm text-slate-500 mt-1">
              Receipt ID: <span className="font-mono font-semibold text-slate-700">{successSale.id}</span>
            </p>
          </div>

          {/* Receipt Breakdown Card */}
          <div className="max-w-md mx-auto bg-slate-50 rounded-xl p-5 text-left border border-slate-200 space-y-3">
            <div className="flex justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
              <span>Customer:</span>
              <span className="font-semibold text-slate-800">{selectedCustomer?.name}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
              <span>Item:</span>
              <span className="font-semibold text-slate-800">{selectedProduct?.name}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
              <span>Quantity:</span>
              <span className="font-semibold text-slate-800">{successSale.quantity} units</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
              <span>Total Price:</span>
              <span className="font-bold text-slate-900">{formatCurrency(successSale.totalPrice)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
              <span>Paid (Received):</span>
              <span className="font-bold text-emerald-700">{formatCurrency(successSale.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-600">Udhaar (Balance Due):</span>
              <span className={`font-bold ${successSale.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {formatCurrency(successSale.balanceDue)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Record Another Sale</span>
            </button>
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Receipt className="h-4 w-4" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Cannot record sale</p>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Customer Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-500" />
                <span>Select Customer</span>
              </label>
              <button
                type="button"
                onClick={onOpenAddCustomer}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                + New Customer
              </button>
            </div>
            {customers.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                No customers found. Please add a customer first.
              </div>
            ) : (
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Product Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-slate-500" />
                <span>Select Product</span>
              </label>
              <button
                type="button"
                onClick={onOpenAddProduct}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                + New Product
              </button>
            </div>
            {productsWithCompany.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                No products found. Please add a company and product first.
              </div>
            ) : (
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setQuantity(1);
                }}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                {productsWithCompany.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.stockQuantity === 0}>
                    {p.name} — {formatCurrency(p.price)} [{p.stockQuantity} in stock] ({p.companyName})
                    {p.stockQuantity === 0 ? ' (OUT OF STOCK)' : ''}
                  </option>
                ))}
              </select>
            )}

            {/* Product Meta Pill */}
            {selectedProduct && (
              <div className="mt-2 flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                <div>
                  <span className="font-semibold text-slate-900">{selectedProduct.name}</span>
                  <span className="text-slate-400 ml-1.5">Supplier: {selectedProduct.companyName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{formatCurrency(selectedProduct.price)} / unit</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      selectedProduct.stockQuantity === 0
                        ? 'bg-rose-100 text-rose-800'
                        : selectedProduct.stockQuantity <= 5
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selectedProduct.stockQuantity} available
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quantity Selector with live validation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Quantity to Sell
              </label>
              {selectedProduct && (
                <span className="text-xs text-slate-400">
                  Max available: {selectedProduct.stockQuantity}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="h-11 w-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={selectedProduct?.stockQuantity || 999}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className={`flex-1 px-4 py-2.5 text-center font-bold text-lg rounded-xl border ${
                  isExceedingStock
                    ? 'border-rose-500 bg-rose-50 text-rose-800 focus:ring-rose-500'
                    : 'border-slate-200 bg-white text-slate-900 focus:ring-emerald-500'
                } focus:outline-none focus:ring-2`}
              />
              <button
                type="button"
                onClick={() =>
                  setQuantity((prev) =>
                    selectedProduct ? Math.min(selectedProduct.stockQuantity, prev + 1) : prev + 1
                  )
                }
                disabled={Boolean(selectedProduct && quantity >= selectedProduct.stockQuantity)}
                className="h-11 w-11 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold text-lg flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>

            {isExceedingStock && (
              <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Quantity cannot exceed current stock ({selectedProduct?.stockQuantity}).</span>
              </p>
            )}
          </div>

          {/* Pricing & Udhaar Breakdown Card */}
          <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                Total Calculated Price
              </span>
              <span className="text-2xl font-black text-emerald-400">
                {formatCurrency(totalPrice)}
              </span>
            </div>

            {/* Payment Mode Selector */}
            <div>
              <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-2">
                Payment Option
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('FULL_CASH')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors border ${
                    paymentMode === 'FULL_CASH'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  Full Paid
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('FULL_UDHAAR')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors border ${
                    paymentMode === 'FULL_UDHAAR'
                      ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  Full Udhaar
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('CUSTOM')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors border ${
                    paymentMode === 'CUSTOM'
                      ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  Partial Cash
                </button>
              </div>
            </div>

            {/* Paid Amount Input */}
            {paymentMode === 'CUSTOM' && (
              <div className="pt-2">
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Amount Customer Paid in Cash:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    max={totalPrice}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Calculated Udhaar Banner */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Remaining Udhaar (Debt):</span>
                <span className="text-[11px] text-slate-500">
                  {balanceDue > 0 ? 'Will be added to customer balance' : 'Completely settled in cash'}
                </span>
              </div>
              <span className={`text-lg font-bold ${balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {formatCurrency(balanceDue)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1">
              Transaction Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Promised to pay remaining on Monday"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isOutOfStock || isExceedingStock}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>RECORD SALE & DEDUCT STOCK</span>
          </button>
        </form>
      )}
    </div>
  );
};
