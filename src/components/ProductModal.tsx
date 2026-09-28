import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { Package, X, Building2, Image as ImageIcon, Upload, Trash2, Barcode } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  defaultCompanyId?: string;
  onOpenAddCompany?: () => void;
}

const COMMON_UNITS = ['pcs', 'kg', 'litre', 'box', 'packet', 'carton', 'dozen', 'meter', 'gm'];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  editingProduct,
  defaultCompanyId,
  onOpenAddCompany,
}) => {
  const { companies, addProduct, updateProduct } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [price, setPrice] = useState<number>(100);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [minStockThreshold, setMinStockThreshold] = useState<number>(5);
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [image, setImage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setCompanyId(editingProduct.companyId);
      setPurchasePrice(editingProduct.purchasePrice || 0);
      setPrice(editingProduct.price);
      setStockQuantity(editingProduct.stockQuantity);
      setMinStockThreshold(editingProduct.minStockThreshold ?? 5);
      setCategory(editingProduct.category || '');
      setSku(editingProduct.sku || '');
      setUnit(editingProduct.unit || 'pcs');
      setImage(editingProduct.image || '');
    } else {
      setName('');
      setCompanyId(defaultCompanyId || (companies[0]?.id ?? ''));
      setPurchasePrice(0);
      setPrice(100);
      setStockQuantity(10);
      setMinStockThreshold(5);
      setCategory('');
      setSku('');
      setUnit('pcs');
      setImage('');
    }
    setError(null);
  }, [editingProduct, defaultCompanyId, companies, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!companyId) {
      setError('You must select a company first. Please add a company if list is empty.');
      return;
    }
    if (price < 0) {
      setError('Price cannot be negative.');
      return;
    }
    if (purchasePrice < 0) {
      setError('Purchase cost cannot be negative.');
      return;
    }
    if (stockQuantity < 0) {
      setError('Stock quantity cannot be negative.');
      return;
    }

    const payload = {
      name: name.trim(),
      companyId,
      purchasePrice,
      price,
      stockQuantity,
      minStockThreshold,
      category: category.trim() || undefined,
      sku: sku.trim() || undefined,
      unit: unit || 'pcs',
      image: image || undefined,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 my-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {companies.length === 0 ? (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-3">
            <Building2 className="h-8 w-8 text-amber-600 mx-auto" />
            <div>
              <p className="font-bold text-sm text-amber-900">Company Required</p>
              <p className="text-xs text-amber-700 mt-1">
                You must add at least one supplier company before adding products.
              </p>
            </div>
            {onOpenAddCompany && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddCompany();
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl"
              >
                + Add Company Now
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg">{error}</p>}

            {/* Product Image */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="relative w-16 h-16 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                {image ? (
                  <>
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="absolute top-1 right-1 p-0.5 bg-rose-600 text-white rounded-full"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </>
                ) : (
                  <ImageIcon className="h-6 w-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Upload className="h-3 w-3" />
                  <span>{image ? 'Change Photo' : 'Upload Image'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-600 block mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shan Biryani Masala 50g"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-600 block mb-1">
                Company / Supplier *
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-700 block mb-1">
                  Purchase / Cost Price *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-700 block mb-1">
                  Sale / Retail Price *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={price}
                  onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-600 block mb-1">
                  Stock Units *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-600 block mb-1">
                  Unit *
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {COMMON_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-600 block mb-1">
                  Min Stock Alert
                </label>
                <input
                  type="number"
                  min="1"
                  value={minStockThreshold}
                  onChange={(e) => setMinStockThreshold(Math.max(1, parseInt(e.target.value) || 5))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-600 block mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Beverages, Spices"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-600 block mb-1">
                  SKU / Barcode
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Barcode"
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <Barcode className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
              >
                {editingProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
