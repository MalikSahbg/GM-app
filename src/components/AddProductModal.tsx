import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Package,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Upload,
  Image as ImageIcon,
  Barcode,
  Trash2,
} from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  productIdToEdit: string | null;
  onClose: () => void;
  onOpenAddCompany: () => void;
}

const COMMON_UNITS = ['pcs', 'kg', 'litre', 'box', 'packet', 'carton', 'dozen', 'meter', 'gm'];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  productIdToEdit,
  onClose,
  onOpenAddCompany,
}) => {
  const { companies, products, addProduct, updateProduct } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [minStockThreshold, setMinStockThreshold] = useState<number>(5);
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [image, setImage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const productToEdit = products.find((p) => p.id === productIdToEdit);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCompanyId(productToEdit.companyId);
      setPurchasePrice(productToEdit.purchasePrice || 0);
      setPrice(productToEdit.price);
      setStockQuantity(productToEdit.stockQuantity);
      setMinStockThreshold(productToEdit.minStockThreshold ?? 5);
      setCategory(productToEdit.category || '');
      setSku(productToEdit.sku || '');
      setUnit(productToEdit.unit || 'pcs');
      setImage(productToEdit.image || '');
    } else {
      setName('');
      setPurchasePrice(0);
      setPrice(0);
      setStockQuantity(10);
      setMinStockThreshold(5);
      setCategory('');
      setSku('');
      setUnit('pcs');
      setImage('');
      if (companies.length > 0) {
        setCompanyId(companies[0].id);
      }
    }
    setErrorMsg(null);
  }, [productToEdit, companies, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateBarcode = () => {
    const randomSku = 'SKU-' + Math.floor(100000 + Math.random() * 900000);
    setSku(randomSku);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Product name is required');
      return;
    }

    if (!companyId) {
      setErrorMsg('Please select a company supplier.');
      return;
    }

    if (price <= 0) {
      setErrorMsg('Sale price must be greater than 0');
      return;
    }

    if (purchasePrice < 0) {
      setErrorMsg('Purchase cost cannot be negative');
      return;
    }

    if (stockQuantity < 0) {
      setErrorMsg('Stock quantity cannot be negative');
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

    if (productToEdit) {
      updateProduct(productToEdit.id, payload);
    } else {
      addProduct(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-4">
        {/* Header */}
        <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-white" />
            <h2 className="text-base font-bold">
              {productToEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[85vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Product Image / Gallery */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="relative w-20 h-20 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
              {image ? (
                <>
                  <img src={image} alt="Product" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                    title="Remove Image"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <ImageIcon className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <span className="block text-xs font-bold text-slate-700">Product Image</span>
              <p className="text-[11px] text-slate-500">
                Upload a product photo for visual catalogs and receipts (max 2MB).
              </p>
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>{image ? 'Change Photo' : 'Upload Image'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Shan Biryani Masala 50g"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Company (Supplier) *
              </label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddCompany();
                }}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
              >
                <Plus className="h-3 w-3" />
                <span>New Company</span>
              </button>
            </div>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing: Purchase Cost & Sale Price */}
          <div className="grid grid-cols-2 gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Purchase / Cost Price *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                placeholder="Cost price"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400">Used to calculate profit</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Sale / Retail Price *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="Selling rate"
                value={price}
                onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-emerald-700 font-medium">
                Margin: {price > purchasePrice ? `+${(price - purchasePrice).toFixed(0)}` : '0'}
              </span>
            </div>
          </div>

          {/* Stock & Unit */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Stock Qty *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1" title="Low stock threshold">
                Min Stock Alert
              </label>
              <input
                type="number"
                min="1"
                value={minStockThreshold}
                onChange={(e) => setMinStockThreshold(Math.max(1, parseInt(e.target.value) || 5))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Category & SKU / Barcode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. Spices, Grocery"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  SKU / Barcode
                </label>
                <button
                  type="button"
                  onClick={handleGenerateBarcode}
                  className="text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Generate
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Barcode or SKU"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <Barcode className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{productToEdit ? 'Save Changes' : 'Add Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
