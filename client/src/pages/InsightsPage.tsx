import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { generateDetailedBIReport, BusinessIntelligenceReport } from '../services/biService';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  Cpu,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const InsightsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [report, setReport] = useState<BusinessIntelligenceReport | null>(null);
  const isLowResource = document.body.classList.contains('low-resource-mode');

  useEffect(() => {
    generateDetailedBIReport().then(setReport);
  }, []);

  if (!report) {
    return <div className="p-8 text-center text-xs font-bold text-slate-500">{t.loading}</div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-forest-700" />
            <span>{t.biTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{t.biSubtitle}</p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-forest-100 text-forest-800 rounded-full text-xs font-bold self-start sm:self-auto border border-forest-300">
          <Cpu className="w-3.5 h-3.5 text-forest-700" />
          <span>Local Engine (C++ / JS Rules)</span>
        </div>
      </div>

      {/* Week over Week Comparison Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-cream-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {language === 'mr' ? 'चालू आठवड्याची विक्री' : 'Current Week Revenue'}
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{report.currentWeekRevenue.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 mt-1">
            <ArrowUpRight className="w-4 h-4" />
            <span>+{report.revenueGrowthPercent}% {language === 'mr' ? 'वाढ' : 'growth'}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-cream-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {language === 'mr' ? 'मागील आठवड्याची विक्री' : 'Previous Week Revenue'}
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{Math.round(report.previousWeekRevenue).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {language === 'mr' ? 'तुलनात्मक आधार कालावधी' : 'Baseline period'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-cream-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {language === 'mr' ? 'पुन्हा भरण्याची गरज (साठा इशारा)' : 'Stock Reorder Alerts'}
          </span>
          <div className="text-2xl font-black text-red-700 mt-1">
            {report.restockList.length} {language === 'mr' ? 'वस्तू' : 'Items'}
          </div>
          <div className="text-xs text-red-600 font-semibold mt-1">
            {language === 'mr' ? 'किमान मर्यादेखाली' : 'Below safety threshold'}
          </div>
        </div>
      </div>

      {/* Actionable Practical Suggestions */}
      <div className="bg-forest-900 text-white rounded-3xl p-5 shadow-sm border border-forest-800 space-y-3">
        <h3 className="text-sm font-extrabold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <span>{t.actionableSuggestions}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {report.actionableInsights.map((ins, idx) => (
            <div key={idx} className="bg-forest-800/80 p-3.5 rounded-2xl border border-forest-700 text-xs leading-relaxed">
              <span className="font-bold text-emerald-300">#0{idx + 1}: </span>
              {language === 'mr' ? ins.mr : ins.en}
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Sales vs Expenses Chart */}
      <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-sm">
        <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center justify-between">
          <span>{t.salesTrends} (दैनिक विक्री व खर्च)</span>
          <span className="text-[11px] text-slate-400">7-Day Moving Window</span>
        </h3>

        {!isLowResource ? (
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.salesTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1efe7" />
                <XAxis dataKey="formattedDate" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: number) => [`₹${val}`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2ded4', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" name={language === 'mr' ? 'विक्री (Revenue)' : 'Revenue'} fill="#15803d" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name={language === 'mr' ? 'खर्च (Expenses)' : 'Expenses'} fill="#d97706" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="divide-y divide-cream-100 text-xs">
            {report.salesTrends.map((d) => (
              <div key={d.date} className="py-2 flex justify-between">
                <span className="font-bold text-slate-700">{d.formattedDate}</span>
                <span>विक्री: ₹{d.revenue} | खर्च: ₹{d.expenses}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Selling Products & Smart Restocking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Selling Products */}
        <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-forest-700" />
            <span>{t.topSellingProducts}</span>
          </h3>

          <div className="divide-y divide-cream-100 text-xs">
            {report.topProducts.map((p, idx) => (
              <div key={p.productId} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-800 font-extrabold text-[10px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">{language === 'mr' && p.nameMr ? p.nameMr : p.name}</div>
                    <div className="text-[10px] text-slate-400">विक्री: {p.unitsSold} युनिट्स</div>
                  </div>
                </div>
                <div className="font-black text-forest-900 text-sm">
                  ₹{p.totalRevenue.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Restocking Suggestions */}
        <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{t.restockSuggestions}</span>
          </h3>

          <div className="divide-y divide-cream-100 text-xs">
            {report.restockList.length > 0 ? (
              report.restockList.map((p) => (
                <div key={p.productId} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900">{language === 'mr' && p.nameMr ? p.nameMr : p.name}</div>
                    <div className="text-[10px] text-red-600 font-semibold">
                      शिल्लक: {p.currentStock} | Reorder Point: {p.reorderPoint}
                    </div>
                  </div>
                  <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                    {language === 'mr' ? 'माल भरा' : 'Restock'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic py-6 text-center">
                {language === 'mr' ? 'सर्व वस्तूंचा पुरेसा साठा उपलब्ध आहे.' : 'All products have adequate stock.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
