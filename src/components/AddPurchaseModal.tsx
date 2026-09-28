import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { X, Truck, Plus, Trash2, CheckCircle2, AlertTriangle, Building2, Package } from 'lucide-react';
import { PurchaseItem } from '../types';

interface AddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCompanyId?: string;
  onOpenAddCompany?: () => void;
  onOpenAddProduct?: () => void;
}

export const AddPurchaseModal: React.FC<AddPurchaseModalProps> = ({
  isOpen,
  onClose,
  preselectedCompanyId,
  onOpenAddCompany,
  onOpenAddProduct,
}) => {
  const { companies, products, recordPurchase, settings } = useApp();

  const [companyId, setCompanyId] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'JazzCash' | 'EasyPaisa' | 'Cheque' | 'Credit'>('Bank Transfer');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Line items for this purchase
  const [items, setItems] = useState<PurchaseItem[]>([]);

  // Item selector state
  const [selectedProdId, setSelectedProdId] = useState('');
  const [inputQty, setInputQty] = useState<number>(10);
  const [inputCost, setInputCost] = useState<number>(100);

  useEffect(() => {
    if (companies.length > 0) {
      setCompanyId(preselectedCompanyId || companies[0].id);
    }
    setBillNumber(`BIL-${Date.now().toString().slice(-4)}`);
    setItems([]);
    setPaidAmount(0);
    setNotes('');
    setErrorMsg(null);
  }, [preselectedCompanyId, companies, isOpen]);

  // Filter products for the selected company
  const availableCompanyProducts = products.filter(
    (p) => !companyId || p.companyId === companyId
  );

  useEffect(() => {
    if (availableCompanyProducts.length > 0) {
      const p = availableCompanyProducts[0];
      setSelectedProdId(p.id);
      setInputCost(p.purchasePrice || p.price);
    } else {
      setSelectedProdId('');
    }
  }, [companyId, products]);

  const handleProductSelectChange = (pId: string) => {
    setSelectedProdId(pId);
    const prod = products.find((p) => p.id === pId);
    if (prod) {
      setInputCost(prod.purchasePrice || prod.price);
    }
  };

  const handleAddItem = () => {
    if (!selectedProdId) {
      setErrorMsg('Please select a product to add.');
      return;
    }
    if (inputQty <= 0) {
      setErrorMsg('Quantity must be greater than 0.');
      return;
    }
    if (inputCost < 0) {
      setErrorMsg('Cost price cannot be negative.');
      return;
    }

    const prod = products.find((p) => p.id === selectedProdId);
    if (!prod) return;

    // Check if already in items
    const existingIndex = items.findIndex((it) => it.productId === selectedProdId);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += inputQty;
      updated[existingIndex].costPrice = inputCost;
      updated[existingIndex].totalCost = updated[existingIndex].quantity * inputCost;
      setItems(updated);
    } else {
      const newItem: PurchaseItem = {
        productId: prod.id,
        productName: prod.name,
        unit: prod.unit || 'pcs',
        costPrice: inputCost,
        quantity: inputQty,
        totalCost: inputQty * inputCost,
      };
      setItems([...items, newItem]);
    }

    setInputQty(10);
    setErrorMsg(null);
  };

  const handleRemoveItem = (prodId: string) => {
    setItems(items.filter((it) => it.productId !== prodId));
  };

  const totalBillAmount = items.reduce((acc, it) => acc + it.totalCost, 0);

  // Auto sync paid amount when full credit or cash is chosen
  const handleFullPaid = () => setPaidAmount(totalBillAmount);
  const handleFullCredit = () => setPaidAmount(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!companyId) {
      setErrorMsg('Please select a supplier company.');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('Please add at least one product to the purchase bill.');
      return;
    }

    const res = recordPurchase({
      companyId,
      billNumber: billNumber.trim(),
      items,
      paidAmount,
      paymentMethod,
      notes: notes.trim(),
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to record purchase');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Record Company Purchase (Stock Inflow)</h2>
              <p className="text-xs text-blue-100">
                Increases stock automatically and updates supplier payable Khata
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Supplier & Bill Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Supplier Company *
                </label>
                {onOpenAddCompany && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddCompany();
                    }}
                    className="text-blue-600 hover:underline text-[11px] font-semibold"
                  >
                    + New Company
                  </button>
                )}
              </div>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                Supplier Bill / Invoice #
              </label>
              <input
                type="text"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                placeholder="e.g. UNL-INV-8891"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Add Product Line Item Box */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2.5">
            <span className="font-bold text-blue-900 uppercase tracking-wider text-[10px] block">
              + Add Products to this Purchase Bill
            </span>

            {availableCompanyProducts.length === 0 ? (
              <p className="text-slate-500 italic">
                No products found for this supplier. Please add products to this company in the Products tab.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Select Product</label>
                  <select
                    value={selectedProdId}
                    onChange={(e) => handleProductSelectChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    {availableCompanyProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.stockQuantity} {p.unit} in stock]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Cost Rate ({settings.currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={inputCost}
                    onChange={(e) => setInputCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Quantity</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      min="1"
                      value={inputQty}
                      onChange={(e) => setInputQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Line Items List */}
          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
              Purchase Items ({items.length}):
            </label>

            {items.length === 0 ? (
              <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                No items added yet. Select products above to build your purchase invoice.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {items.map((it) => (
                  <div key={it.productId} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-slate-900 block truncate">{it.productName}</span>
                      <span className="text-[11px] text-slate-500">
                        {it.quantity} {it.unit} × {formatCurrency(it.costPrice, settings.currency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-slate-900">
                        {formatCurrency(it.totalCost, settings.currency)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(it.productId)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financial Breakdown & Payment */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 font-mono">
            <div className="flex justify-between items-center text-sm font-bold pb-2 border-b border-slate-800">
              <span>Total Bill Amount:</span>
              <span className="text-blue-400 text-lg">{formatCurrency(totalBillAmount, settings.currency)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-semibold block mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="Credit">Credit / Payable</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 text-[10px] uppercase font-semibold">
                    Amount Paid to Supplier
                  </label>
                  <div className="space-x-1">
                    <button type="button" onClick={handleFullPaid} className="text-[10px] text-emerald-400 hover:underline">
                      Full
                    </button>
                    <button type="button" onClick={handleFullCredit} className="text-[10px] text-rose-400 hover:underline">
                      Credit (0)
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  max={totalBillAmount}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-white rounded-lg font-bold"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400">Remaining Payable (Added to Company Khata):</span>
              <span className={`font-bold ${totalBillAmount - paidAmount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {formatCurrency(Math.max(0, totalBillAmount - paidAmount), settings.currency)}
              </span>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
              Purchase Notes / Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Received at main warehouse, driver name, vehicle #"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={items.length === 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Record Purchase & Update Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
