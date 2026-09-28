import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import {
  Boxes,
  AlertTriangle,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Package,
  ArrowUpDown,
  Building2,
} from 'lucide-react';

interface StockViewProps {
  onOpenAddProduct: () => void;
  onEditProduct: (productId: string) => void;
}

export const StockView: React.FC<StockViewProps> = ({
  onOpenAddProduct,
  onEditProduct,
}) => {
  const { productsWithCompany, adjustStock, stats } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OUT' | 'IN'>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');

  // Company list for filter dropdown
  const companiesList = useMemo(() => {
    const list = Array.from(new Set(productsWithCompany.map((p) => p.companyName)));
    return list.sort();
  }, [productsWithCompany]);

  const filteredProducts = useMemo(() => {
    return productsWithCompany.filter((p) => {
      const isLow = p.stockQuantity <= (p.minStockThreshold || 5);
      const isOut = p.stockQuantity === 0;

      if (stockFilter === 'LOW' && !isLow) return false;
      if (stockFilter === 'OUT' && !isOut) return false;
      if (stockFilter === 'IN' && isLow) return false;

      if (selectedCompany !== 'ALL' && p.companyName !== selectedCompany) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(term) ||
          p.companyName.toLowerCase().includes(term) ||
          (p.sku && p.sku.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [productsWithCompany, stockFilter, selectedCompany, searchTerm]);

  // Inventory valuation
  const inventoryTotalValue = useMemo(() => {
    return productsWithCompany.reduce((acc, p) => acc + p.price * p.stockQuantity, 0);
  }, [productsWithCompany]);

  const outOfStockCount = useMemo(() => {
    return productsWithCompany.filter((p) => p.stockQuantity === 0).length;
  }, [productsWithCompany]);

  return (
    <div className="space-y-6">
      {/* Top Inventory Banner - matches Android README requirement: "Low stock count shown at top" */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-200 text-xs font-bold uppercase tracking-wider">
            <Boxes className="h-4 w-4" />
            <span>Stock Inventory & Restocking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            {stats.lowStockCount} Products Low in Stock
          </h1>
          <p className="text-amber-100/90 text-xs sm:text-sm mt-1">
            Threshold ≤ 5 units triggers automated low stock warning badge
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-xs px-4 py-2 rounded-xl border border-white/20 text-center">
            <span className="text-[10px] text-amber-200 font-semibold uppercase block">
              Inventory Value
            </span>
            <span className="text-lg font-bold text-white">
              {formatCurrency(inventoryTotalValue)}
            </span>
          </div>
          <button
            onClick={onOpenAddProduct}
            className="px-4 py-2.5 bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Company filter */}
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="ALL">All Companies ({companiesList.length})</option>
            {companiesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Stock filter tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setStockFilter('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                stockFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({productsWithCompany.length})
            </button>
            <button
              onClick={() => setStockFilter('LOW')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                stockFilter === 'LOW'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-amber-800 hover:text-amber-950'
              }`}
            >
              Low (≤5) ({stats.lowStockCount})
            </button>
            <button
              onClick={() => setStockFilter('OUT')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                stockFilter === 'OUT'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-rose-800 hover:text-rose-950'
              }`}
            >
              Out (0) ({outOfStockCount})
            </button>
          </div>
        </div>
      </div>

      {/* Stock Cards Grid */}
      {/* Android spec: "⚠️ LOW badge appears when stock <= 5" */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Stock Records Found</h3>
            <p className="text-xs text-slate-500 mt-1">No products match your current filter.</p>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isLow = p.stockQuantity <= (p.minStockThreshold || 5);
            const isOut = p.stockQuantity === 0;

            return (
              <div
                key={p.id}
                className={`rounded-2xl p-5 border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                  isOut
                    ? 'bg-rose-50/70 border-rose-200 hover:shadow-md'
                    : isLow
                    ? 'bg-amber-50/70 border-amber-200 hover:shadow-md'
                    : 'bg-white border-slate-200 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
                        {p.companyName}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 truncate mt-0.5">
                        {p.name}
                      </h3>
                      {p.sku && (
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">SKU: {p.sku}</p>
                      )}
                    </div>

                    {/* LOW stock badge from Android layout */}
                    {isOut ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black rounded-full bg-rose-600 text-white shrink-0 shadow-2xs">
                        ⚠️ OUT OF STOCK
                      </span>
                    ) : isLow ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black rounded-full bg-amber-500 text-white shrink-0 shadow-2xs">
                        ⚠️ LOW ({p.stockQuantity})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                        In Stock ({p.stockQuantity})
                      </span>
                    )}
                  </div>

                  {/* Stock Quantity Bar & Price */}
                  <div className="mt-4 p-3 rounded-xl bg-white/90 border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Retail Unit Price:</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {formatCurrency(p.price)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Available Stock:</span>
                      <span
                        className={`font-black text-sm ${
                          isOut ? 'text-rose-700' : isLow ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        {p.stockQuantity} units
                      </span>
                    </div>

                    {/* Stock level visual bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOut
                            ? 'w-0'
                            : isLow
                            ? 'bg-amber-500 w-1/4'
                            : p.stockQuantity < 20
                            ? 'bg-emerald-500 w-1/2'
                            : 'bg-emerald-600 w-full'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Restock Action Bar */}
                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">Quick Restock:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => adjustStock(p.id, 5)}
                      className="px-2 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => adjustStock(p.id, 10)}
                      className="px-2 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => adjustStock(p.id, 50)}
                      className="px-2 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
                    >
                      +50
                    </button>
                    <button
                      onClick={() => onEditProduct(p.id)}
                      className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
