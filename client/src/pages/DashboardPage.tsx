import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { calculateDashboardSummary, DashboardSummary } from '../services/biService';
import { db, Product } from '../db/dexieDb';
import { syncWithServer } from '../services/syncService';
import { StatCard } from '../components/common/StatCard';
import { DemoModeBanner } from '../components/common/DemoModeBanner';
import { LowStockAlertBanner } from '../components/common/LowStockAlertBanner';
import { Link, useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  TrendingUp,
  Receipt,
  Package,
  AlertTriangle,
  Users,
  RefreshCw,
  PlusCircle,
  ShoppingCart,
  CreditCard,
  Lightbulb,
  ArrowUpRight,
  Clock,
  Truck,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const s = await calculateDashboardSummary();
      setSummary(s);
      const low = await db.products.filter((p) => p.currentStock <= p.minStockThreshold).toArray();
      setLowStockProducts(low);
    } catch (err) {
      console.error('[Dashboard] Error loading data:', err);
    }
  };

  useEffect(() => {
    loadData();
    const handleDataChange = () => loadData();
    window.addEventListener('gramvikas:data_changed', handleDataChange);
    return () => window.removeEventListener('gramvikas:data_changed', handleDataChange);
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    const res = await syncWithServer();
    setSyncing(false);
    setSyncMessage(res.message);
    loadData();
    setTimeout(() => setSyncMessage(null), 4000);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Demo Mode & Offline Test Scenario Banner */}
      <DemoModeBanner />

      {/* Low Stock Warning Banner */}
      <LowStockAlertBanner lowStockProducts={lowStockProducts} />

      {/* Sync Status Banner if Unsynced records exist */}
      {summary && summary.pendingSyncCount > 0 && (
        <div className="bg-amber-100/80 border border-amber-300 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950 shadow-sm">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-5 h-5 text-amber-700 flex-shrink-0 animate-spin-slow" />
            <div>
              <div className="font-extrabold text-sm sm:text-base">
                {summary.pendingSyncCount} {language === 'mr' ? 'नोंदी स्थानिक पातळीवर सुरक्षित (सिंक प्रलंबित)' : 'Records stored safely offline (Sync Pending)'}
              </div>
              <p className="text-xs text-amber-800">
                {language === 'mr'
                  ? 'इंटरनेट कनेक्ट झाल्यावर सर्व्हरशी सिंक करा किंवा खालील बटण दाबा.'
                  : 'Changes are intact locally in IndexedDB. Click sync once internet is connected.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="self-end sm:self-center bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? t.loading : t.syncNow}</span>
          </button>
        </div>
      )}

      {syncMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl shadow-sm">
          {syncMessage}
        </div>
      )}

      {/* Dashboard KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title={t.todaySales}
          value={`₹${(summary?.todaySales || 0).toLocaleString('en-IN')}`}
          subtitle={language === 'mr' ? 'स्थानिक बिलांची बेरीज' : 'Calculated from local bills'}
          icon={IndianRupee}
          variant="forest"
          onClick={() => navigate('/sales')}
        />
        <StatCard
          title={t.todayExpenses}
          value={`₹${(summary?.todayExpenses || 0).toLocaleString('en-IN')}`}
          subtitle={language === 'mr' ? 'दैनिक हमाली, वीज व इतर' : 'Shop expenses today'}
          icon={Receipt}
          variant="amber"
          onClick={() => navigate('/expenses')}
        />
        <StatCard
          title={t.estimatedProfit}
          value={`₹${(summary?.estimatedProfit || 0).toLocaleString('en-IN')}`}
          subtitle={language === 'mr' ? 'निव्वळ नफा (विक्री - खरेदी - खर्च)' : 'Revenue - COGS - Expenses'}
          icon={TrendingUp}
          variant="forest"
          onClick={() => navigate('/insights')}
        />
        <StatCard
          title={t.pendingCustomerPayments}
          value={`₹${(summary?.pendingCustomerPayments || 0).toLocaleString('en-IN')}`}
          subtitle={language === 'mr' ? 'ग्राहकांकडील बाकी उधारी' : 'Outstanding Khata balance'}
          icon={Users}
          variant="terracotta"
          onClick={() => navigate('/customers')}
        />
      </div>

      {/* Secondary Metrics & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quick Action Buttons */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-cream-200 shadow-sm md:col-span-2">
          <h3 className="text-sm font-extrabold text-slate-800 mb-3 flex items-center justify-between">
            <span>{t.quickActions}</span>
            <span className="text-xs text-forest-700 font-bold bg-forest-50 px-2 py-0.5 rounded-lg border border-forest-200">
              1-Click Operations
            </span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Link
              to="/orders"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-forest-100/90 hover:bg-forest-200 border border-forest-300 text-forest-950 transition-all font-bold text-xs shadow-sm"
            >
              <Truck className="w-4 h-4 text-forest-800 flex-shrink-0" />
              <span>{language === 'mr' ? 'ग्राहक ऑर्डर्स व साठा' : 'Customer Orders & Stock'}</span>
            </Link>

            <Link
              to="/customer-portal"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 transition-all font-bold text-xs shadow-sm"
            >
              <Users className="w-4 h-4 text-amber-800 flex-shrink-0" />
              <span>{language === 'mr' ? 'ग्राहक पोर्टल व डिलिव्हरी' : 'Customer Portal'}</span>
            </Link>

            <Link
              to="/sales"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-forest-50 hover:bg-forest-100 border border-forest-200 text-forest-900 transition-all font-bold text-xs shadow-sm"
            >
              <ShoppingCart className="w-4 h-4 text-forest-700 flex-shrink-0" />
              <span>{t.newSale}</span>
            </Link>

            <Link
              to="/products/new"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-slate-800 transition-all font-bold text-xs shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-slate-700 flex-shrink-0" />
              <span>{t.addProduct}</span>
            </Link>

            <Link
              to="/customers"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-slate-800 transition-all font-bold text-xs shadow-sm"
            >
              <Users className="w-4 h-4 text-slate-700 flex-shrink-0" />
              <span>{t.customers}</span>
            </Link>

            <Link
              to="/expenses"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-slate-800 transition-all font-bold text-xs shadow-sm"
            >
              <Receipt className="w-4 h-4 text-slate-700 flex-shrink-0" />
              <span>{t.addExpense}</span>
            </Link>

            <Link
              to="/payments"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-slate-800 transition-all font-bold text-xs shadow-sm"
            >
              <CreditCard className="w-4 h-4 text-slate-700 flex-shrink-0" />
              <span>{t.recordPayment}</span>
            </Link>
          </div>
        </div>

        {/* Offline Business Intelligence Highlights Card */}
        <div className="bg-forest-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-forest-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                {language === 'mr' ? 'स्थानिक व्यवसाय बुद्धिमत्ता' : 'Local Business BI'}
              </span>
              <Link to="/insights" className="text-[11px] text-emerald-400 font-bold hover:underline">
                {language === 'mr' ? 'अधिक विश्लेषण' : 'View full'}
              </Link>
            </div>
            <p className="text-xs text-forest-200 mb-3">
              {language === 'mr'
                ? 'इंटरनेट किंवा क्लाउडशिवाय तुमच्या स्थानिक डेटावरून मोजलेले सल्ले:'
                : 'Calculated 100% locally from your device sales transactions:'}
            </p>
            <div className="space-y-2">
              {(language === 'mr' ? summary?.insightsMr : summary?.insights)?.map((insight, idx) => (
                <div key={idx} className="bg-forest-800/80 p-2.5 rounded-xl text-xs text-white border border-forest-700 leading-snug">
                  💡 {insight}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-forest-800 text-[11px] text-emerald-300/80 flex items-center justify-between">
            <span>Formula: ROP = (d × L) + SS</span>
            <span className="text-emerald-400 font-semibold">C++ BI Core</span>
          </div>
        </div>
      </div>

      {/* Recent Sales Transactions */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-cream-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest-700" />
            <span>{t.recentTransactions}</span>
          </h3>
          <Link
            to="/sales"
            className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
          >
            <span>{language === 'mr' ? 'सर्व बिले पहा' : 'View all bills'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-cream-200">
              <tr>
                <th className="p-3">{t.invoice}</th>
                <th className="p-3">{t.customer}</th>
                <th className="p-3">{t.date}</th>
                <th className="p-3">{t.paymentMethod}</th>
                <th className="p-3 text-right">{t.amount}</th>
                <th className="p-3 text-center">{language === 'mr' ? 'स्थिती' : 'Sync'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {summary?.recentSales && summary.recentSales.length > 0 ? (
                summary.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-cream-50 transition-colors">
                    <td className="p-3 font-bold text-forest-800">{sale.invoiceNumber}</td>
                    <td className="p-3 font-medium text-slate-800">{sale.customerName}</td>
                    <td className="p-3 text-slate-500">
                      {new Date(sale.transactionDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-cream-200 text-slate-700">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 text-right font-black text-slate-900">
                      ₹{sale.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sale.syncStatus === 'synced'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sale.syncStatus === 'synced' ? 'Synced' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500 italic">
                    {t.noRecords}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
