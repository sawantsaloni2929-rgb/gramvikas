import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { getProducts, deleteProduct, updateStock } from '../db/dbOperations';
import { Product } from '../db/dexieDb';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  ArrowUpDown,
  Filter,
  CheckCircle,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('New wholesale stock purchase');

  const loadProducts = async () => {
    const list = await getProducts();
    setProducts(list);
  };

  useEffect(() => {
    loadProducts();
    const handleDataChange = () => loadProducts();
    window.addEventListener('gramvikas:data_changed', handleDataChange);
    return () => window.removeEventListener('gramvikas:data_changed', handleDataChange);
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`${t.confirmDeleteProduct}\n("${name}")`)) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  const handleStockAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct || adjustQty === 0) return;
    await updateStock(
      adjustingProduct.id,
      adjustQty,
      adjustQty > 0 ? 'purchase_restock' : 'damage_loss',
      adjustReason
    );
    setAdjustingProduct(null);
    setAdjustQty(0);
    loadProducts();
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.nameMr && p.nameMr.includes(searchTerm)) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesLowStock = !filterLowStockOnly || p.currentStock <= p.minStockThreshold;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-forest-700" />
            <span>{t.products}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'mr'
              ? 'सर्व वस्तूंचा स्थानिक साठा, खरेदी-विक्री दर व किमान मर्यादा व्यवस्थापन'
              : 'Local inventory management with automated low-stock detection'}
          </p>
        </div>

        <Link
          to="/products/new"
          className="bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.addProduct}</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-cream-200 shadow-sm flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchProducts}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-cream-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-cream-300 text-xs font-semibold focus:outline-none bg-cream-50"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? (language === 'mr' ? 'सर्व श्रेणी (All)' : 'All Categories') : c}
              </option>
            ))}
          </select>

          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              filterLowStockOnly
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-cream-100 text-slate-700 border-cream-300 hover:bg-cream-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t.lowStock}</span>
          </button>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-cream-200">
              <tr>
                <th className="p-3.5">{t.productName}</th>
                <th className="p-3.5">{t.category}</th>
                <th className="p-3.5 text-right">{t.costPrice}</th>
                <th className="p-3.5 text-right">{t.sellingPrice}</th>
                <th className="p-3.5 text-center">{t.stockQty}</th>
                <th className="p-3.5 text-center">{t.stockStatus}</th>
                <th className="p-3.5 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {filtered.length > 0 ? (
                filtered.map((product) => {
                  const isLow = product.currentStock <= product.minStockThreshold;
                  return (
                    <tr key={product.id} className="hover:bg-cream-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-sm">{product.name}</div>
                        {product.nameMr && (
                          <div className="text-xs text-forest-800 font-medium">{product.nameMr}</div>
                        )}
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          SKU: {product.sku} | Unit: {product.unit}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-cream-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-medium text-slate-600">
                        ₹{product.costPrice}
                      </td>
                      <td className="p-3.5 text-right font-black text-slate-900 text-sm">
                        ₹{product.sellingPrice}
                      </td>
                      <td className="p-3.5 text-center font-black text-sm">
                        <span className={isLow ? 'text-red-700' : 'text-slate-900'}>
                          {product.currentStock} {product.unit}
                        </span>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Min: {product.minStockThreshold}
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{t.lowStock}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                            <CheckCircle className="w-3 h-3" />
                            <span>{t.inStock}</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setAdjustingProduct(product);
                              setAdjustQty(0);
                            }}
                            className="p-1.5 rounded-lg bg-cream-100 hover:bg-cream-200 text-slate-700 font-semibold text-[11px] px-2"
                            title="Quick Stock Adjustment / Restock"
                          >
                            + / -
                          </button>
                          <Link
                            to={`/products/edit/${product.id}`}
                            className="p-1.5 rounded-lg bg-cream-100 hover:bg-cream-200 text-slate-700"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500 italic">
                    {t.noRecords}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-cream-200 animate-scale-up">
            <h3 className="font-black text-base text-slate-900 mb-1">
              {language === 'mr' ? 'साठा बदल / नवीन खरेदी' : 'Quick Stock Adjustment'}
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-semibold">
              {adjustingProduct.name} ({language === 'mr' ? 'सध्या शिल्लक:' : 'Current:'} {adjustingProduct.currentStock} {adjustingProduct.unit})
            </p>

            <form onSubmit={handleStockAdjustSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'संख्या बदल (+ वाढवा किंवा - घटवा)' : 'Quantity Change (+ add or - subtract)'}
                </label>
                <input
                  type="number"
                  required
                  value={adjustQty || ''}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                  placeholder="+10 किंवा -2"
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-sm font-bold focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'कारणांची नोंद' : 'Reason / Note'}
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="flex-1 py-2 rounded-xl border border-cream-300 text-xs font-bold text-slate-600 hover:bg-cream-100"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-xs font-bold text-white shadow-sm"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
