import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { getProductById, saveProduct } from '../db/dbOperations';
import { Product } from '../db/dexieDb';
import { Package, ArrowLeft, Save, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Kirana',
  'Seeds & Fertilizer',
  'Dairy & Animal Feed',
  'Hardware',
  'Food & Snacks',
  'Textiles',
  'Other',
];

const UNITS = ['packet', 'kg', 'litre', 'bag', 'piece', 'quintal', 'box', 'gram'];

export const ProductFormPage: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    nameMr: '',
    category: 'Kirana',
    sku: `SKU-${Date.now().toString().slice(-4)}`,
    unit: 'packet',
    costPrice: 0,
    sellingPrice: 0,
    currentStock: 10,
    minStockThreshold: 5,
    barcode: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getProductById(id).then((p) => {
        if (p) setFormData(p);
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sellingPrice) {
      setError('Please provide product name and selling price.');
      return;
    }
    setLoading(true);
    try {
      await saveProduct(formData as any);
      navigate('/products');
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link
          to="/products"
          className="flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-900 bg-white border border-cream-300 px-3 py-1.5 rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'mr' ? 'मागे जा' : 'Back to Products'}</span>
        </Link>
        <span className="text-xs font-semibold text-slate-500">
          {language === 'mr' ? 'ऑफलाइन सेव्ह होते' : 'Saves directly to local IndexedDB'}
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-forest-100 text-forest-800">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {isEditing
                ? (language === 'mr' ? 'वस्तू माहिती संपादन' : 'Edit Product')
                : (language === 'mr' ? 'नवीन वस्तू नोंदणी' : 'Add New Product')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'mr'
                ? 'साठा किमान मर्यादेखाली गेल्यास आपोआप अलर्ट तयार होईल'
                : 'Automated low-stock threshold monitoring active'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.productName} *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Wada Kolam Rice 25kg"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-sm focus:ring-2 focus:ring-forest-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.productNameMr}
              </label>
              <input
                type="text"
                value={formData.nameMr || ''}
                onChange={(e) => setFormData({ ...formData, nameMr: e.target.value })}
                placeholder="उदा. वाडा कोलम तांदूळ २५ किलो"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-sm focus:ring-2 focus:ring-forest-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.category} *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-cream-300 text-sm font-semibold focus:ring-2 focus:ring-forest-500 bg-cream-50"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.sku}
              </label>
              <input
                type="text"
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-cream-300 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.unit} *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-cream-300 text-sm font-semibold focus:ring-2 focus:ring-forest-500 bg-cream-50"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.costPrice} (खरेदी दर)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.costPrice || ''}
                onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-sm font-bold focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.sellingPrice} (विक्री दर) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={formData.sellingPrice || ''}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-sm font-black focus:ring-2 focus:ring-forest-500 text-forest-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.stockQty} (सध्याचा साठा)
              </label>
              <input
                type="number"
                min="0"
                value={formData.currentStock || ''}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-sm font-black focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.minThreshold} (इशारा मर्यादा)
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStockThreshold || ''}
                onChange={(e) => setFormData({ ...formData, minStockThreshold: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-sm font-black focus:ring-2 focus:ring-forest-500 text-red-700"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-200">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="px-5 py-2.5 rounded-xl border border-cream-300 text-xs font-bold text-slate-600 hover:bg-cream-100 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? t.loading : t.saveProduct}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
