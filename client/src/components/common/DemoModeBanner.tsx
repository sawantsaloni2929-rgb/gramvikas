import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { resetToDemoData } from '../../db/dbOperations';
import { Sparkles, RotateCcw, HelpCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export const DemoModeBanner: React.FC = () => {
  const { language, t } = useLanguage();
  const [showGuide, setShowGuide] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (!window.confirm(language === 'mr' ? 'डेमो डेटा पुन्हा पूर्ववत करायचा आहे का?' : 'Reset demo database to fresh sample records?')) {
      return;
    }
    setResetting(true);
    await resetToDemoData();
    setResetting(false);
    window.location.reload();
  };

  return (
    <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-3 sm:p-4 text-amber-900 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500 text-white flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-amber-950">
                {t.demoMode}
              </span>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-400">
                Baramati, Pune Sample Data
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-0.5">
              {language === 'mr'
                ? 'हा केवळ प्रात्यक्षिक (डेमो) डेटा आहे. खरा डेटा वापरण्यासाठी आपण नवीन नोंदी करू शकता.'
                : 'Sample data active for demonstration. Offline persistence & local calculations are fully functional.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1 text-xs font-bold text-amber-900 bg-white/80 hover:bg-white border border-amber-300 px-3 py-1.5 rounded-xl transition-colors shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>{language === 'mr' ? 'ऑफलाइन चाचणी मार्गदर्शक' : 'Test Scenarios'}</span>
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 px-3 py-1.5 rounded-xl transition-colors shadow-sm"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{t.resetDemoData}</span>
          </button>
        </div>
      </div>

      {/* Expandable Step-by-Step Offline Testing Guide */}
      {showGuide && (
        <div className="mt-3 pt-3 border-t border-amber-200 text-xs text-amber-950 grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
          <div className="bg-white/80 rounded-xl p-3 border border-amber-200 space-y-2">
            <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {language === 'mr' ? '१. ऑफलाइन चाचणी पायऱ्या:' : '1. Test Offline CRUD:'}
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed text-slate-700">
              <li>Turn off Wi-Fi or disconnect Internet on your computer/phone.</li>
              <li>Observe header status switch immediately to <strong>"Offline Mode"</strong>.</li>
              <li>Add a product or complete a new bill in <strong>Sales & Billing</strong>.</li>
              <li>Notice stock updates instantly and transaction is saved locally in IndexedDB.</li>
              <li>Refresh the browser: your records remain 100% intact offline!</li>
            </ol>
          </div>

          <div className="bg-white/80 rounded-xl p-3 border border-amber-200 space-y-2">
            <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {language === 'mr' ? '२. सिंक व एसएमएस चाचणी पायऱ्या:' : '2. Test Sync & SMS Flow:'}
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed text-slate-700">
              <li>Sell stock below minimum threshold: watch low-stock SMS queue offline.</li>
              <li>Click <strong>"Open Native SMS App"</strong> to see prefilled SMS on phone.</li>
              <li>Reconnect internet / turn on Wi-Fi.</li>
              <li>Click <strong>"Sync Now"</strong>: unsynced records push to Java backend.</li>
              <li>Check <strong>Sync Centre</strong> to view the sync audit report.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
