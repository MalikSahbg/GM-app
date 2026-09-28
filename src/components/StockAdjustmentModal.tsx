import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Boxes, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { StockAdjustment } from '../types';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProductId?: string;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  preselectedProductId,
}) => {
  const { products, adjustStock } = useApp();

  const [productId, setProductId] = useState('');
  const [type, setType] = useState<StockAdjustment['type']>('ADD');
  const [quantity, setQuantity] = useState<number>(5);
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedProductId) {
      setProductId(preselectedProductId);
    } else if (products.length > 0) {
      setProductId(products[0].id);
    }
    setQuantity(5);
    setReason('Physical audit correction');
    setErrorMsg(null);
  }, [preselectedProductId, products, isOpen]);

  const selectedProduct = products.find((p) => p.id === productId);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      setErrorMsg('Please select a product');
      return;
    }
    if (quantity <= 0) {
      setErrorMsg('Quantity must be greater than 0');
      return;
    }

    const delta = type === 'ADD' || type === 'RETURN' ? quantity : -quantity;

    if (delta < 0 && selectedProduct && Math.abs(delta) > selectedProduct.stockQuantity) {
      setErrorMsg(`Cannot deduct ${quantity} units! Current stock is only ${selectedProduct.stockQuantity}.`);
      return;
    }

    adjustStock(productId, delta, reason.trim() || `${type} Adjustment`, type);
    onClose();
  };

  const newStockPreview = selectedProduct
    ? Math.max(0, selectedProduct.stockQuantity + (type === 'ADD' || type === 'RETURN' ? quantity : -quantity))
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-amber-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-amber-200" />
            <h2 className="text-base font-bold">Adjust Stock / Return Item</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-amber-200 hover:text-white hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <p className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-semibold">
              {errorMsg}
            </p>
          )}

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
              Select Product *
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} [{p.stockQuantity} {p.unit} in stock]
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Current Stock:</span>
                <span className="text-base font-black text-slate-900">
                  {selectedProduct.stockQuantity} {selectedProduct.unit}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Stock After Adjustment:</span>
                <span className="text-base font-black text-amber-700">
                  {newStockPreview} {selectedProduct.unit}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
              Adjustment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('ADD')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                  type === 'ADD'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                + Add / Found Stock
              </button>

              <button
                type="button"
                onClick={() => setType('DEDUCT')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                  type === 'DEDUCT'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                - Deduct / Shrinkage
              </button>

              <button
                type="button"
                onClick={() => setType('RETURN')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                  type === 'RETURN'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                + Customer Return
              </button>

              <button
                type="button"
                onClick={() => setType('DAMAGE')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                  type === 'DAMAGE'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                - Damaged / Expired
              </button>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
              Quantity to Adjust
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 text-base font-black text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
              Reason / Remark
            </label>
            <input
              type="text"
              placeholder="e.g. Expired batch discarded, recount at shelf"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
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
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Apply Adjustment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
