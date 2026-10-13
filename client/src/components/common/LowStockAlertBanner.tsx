import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Product } from '../../db/dexieDb';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LowStockAlertBannerProps {
  lowStockProducts: Product[];
}

export const LowStockAlertBanner: React.FC<LowStockAlertBannerProps> = ({ lowStockProducts }) => {
  const { language, t } = useLanguage();

  if (lowStockProducts.length === 0) return null;

  return (
    <div className="mb-4 bg-red-50 border border-red-300 rounded-2xl p-3 sm:p-4 text-red-900 shadow-sm animate-pulse-slow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-red-600 text-white flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-red-950 flex items-center gap-2">
              <span>{t.lowStockItems}</span>
              <span className="bg-red-200 text-red-900 font-extrabold text-xs px-2 py-0.5 rounded-full">
                {lowStockProducts.length} {language === 'mr' ? 'वस्तू' : 'items'}
              </span>
            </h4>
            <div className="text-xs text-red-800 mt-1 flex flex-wrap gap-x-3 gap-y-1">
              {lowStockProducts.slice(0, 3).map((p) => (
                <span key={p.id} className="font-semibold underline">
                  {language === 'mr' && p.nameMr ? p.nameMr : p.name} ({p.currentStock} {p.unit} left)
                </span>
              ))}
              {lowStockProducts.length > 3 && (
                <span>+{lowStockProducts.length - 3} more</span>
              )}
            </div>
          </div>
        </div>

        <Link
          to="/products"
          className="self-end sm:self-center flex items-center gap-1 bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-colors shadow-sm"
        >
          <span>{language === 'mr' ? 'साठा तपासा' : 'Review Inventory'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
