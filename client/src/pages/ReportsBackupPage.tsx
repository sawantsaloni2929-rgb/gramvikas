import React, { useState, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  exportSalesToCSV,
  exportProductsToCSV,
  exportCustomersToCSV,
  downloadFullDatabaseJSON,
  restoreDatabaseFromJSON,
} from '../services/exportService';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Printer,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export const ReportsBackupPage: React.FC = () => {
  const { language, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const res = await restoreDatabaseFromJSON(text);
      setRestoreStatus(res.message);
      setTimeout(() => setRestoreStatus(null), 5000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-forest-700" />
          <span>{t.reportsTitle}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {language === 'mr'
            ? 'CSV स्प्रेडशीट निर्यात, संपूर्ण JSON डेटाबेस बॅकअप आणि सुरक्षित रिस्टोर'
            : 'Export financial reports to CSV, download JSON backups, and restore validated data'}
        </p>
      </div>

      {restoreStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{restoreStatus}</span>
        </div>
      )}

      {/* Security Warning Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-3xl p-4 text-amber-950 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-extrabold text-amber-900 block mb-0.5">
            {language === 'mr' ? 'डेटा सुरक्षितता सूचना' : 'Sensitive Data Notice'}
          </span>
          <p className="text-slate-600 leading-relaxed">
            {t.backupNotice}
          </p>
        </div>
      </div>

      {/* CSV Export Grid */}
      <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-sm space-y-3">
        <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
          <Download className="w-4 h-4 text-forest-700" />
          <span>{language === 'mr' ? 'CSV स्प्रेडशीट निर्यात (Excel/Sheets)' : 'Export CSV Spreadsheets'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={exportSalesToCSV}
            className="p-4 rounded-2xl border border-cream-200 bg-cream-50 hover:bg-forest-50 hover:border-forest-300 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center mb-2 font-bold group-hover:bg-forest-700 group-hover:text-white transition-colors">
              ₹
            </div>
            <div className="font-bold text-xs text-slate-900">
              {language === 'mr' ? 'विक्री अहवाल (Sales)' : 'Sales & Invoices'}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Download invoice history, item quantities, and payment modes
            </p>
          </button>

          <button
            onClick={exportProductsToCSV}
            className="p-4 rounded-2xl border border-cream-200 bg-cream-50 hover:bg-forest-50 hover:border-forest-300 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center mb-2 font-bold group-hover:bg-forest-700 group-hover:text-white transition-colors">
              📦
            </div>
            <div className="font-bold text-xs text-slate-900">
              {language === 'mr' ? 'साठा अहवाल (Inventory)' : 'Product & Stock List'}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Download current stock, cost prices, and minimum alert thresholds
            </p>
          </button>

          <button
            onClick={exportCustomersToCSV}
            className="p-4 rounded-2xl border border-cream-200 bg-cream-50 hover:bg-forest-50 hover:border-forest-300 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center mb-2 font-bold group-hover:bg-forest-700 group-hover:text-white transition-colors">
              👥
            </div>
            <div className="font-bold text-xs text-slate-900">
              {language === 'mr' ? 'उधारी वही (Customer Khata)' : 'Customer Ledgers'}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Download customer phone numbers, outstanding balances, and due dates
            </p>
          </button>
        </div>
      </div>

      {/* Complete JSON Backup & Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full JSON Download */}
        <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-slate-900">
              {t.downloadJSONBackup}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {language === 'mr'
                ? 'फोन बदलताना किंवा कॉम्प्युटरवर हलवताना संपूर्ण डेटाबेस एका क्लिकवर JSON फाइलमध्ये डाऊनलोड करा.'
                : 'Exports entire local database (products, sales, expenses, customers, SMS queue) into an encrypted backup JSON file.'}
            </p>
          </div>

          <button
            onClick={downloadFullDatabaseJSON}
            className="mt-4 bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{t.downloadJSONBackup}</span>
          </button>
        </div>

        {/* Restore from JSON */}
        <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-slate-900">
              {t.restoreBackup}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {language === 'mr'
                ? 'मागील बॅकअप फाइल निवडून स्थानिक डेटाबेस पूर्ववत करा. विसंगती किंवा डुप्लिकेट नोंदी आपोआप टाळल्या जातात.'
                : 'Upload a previously generated GramVikas backup JSON file to restore records with schema validation.'}
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 w-full bg-cream-100 hover:bg-cream-200 text-slate-800 border border-cream-300 font-bold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>{language === 'mr' ? 'JSON बॅकअप फाइल निवडा' : 'Select Backup JSON File'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Print Friendly Daily Summary Button */}
      <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-sm flex items-center justify-between">
        <div>
          <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Printer className="w-4 h-4 text-forest-700" />
            <span>{language === 'mr' ? 'दैनिक हिशोब छापील प्रत (Print Daily Summary)' : 'Print-Friendly Daily Business Statement'}</span>
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Formats today's sales and expense figures for thermal printer or A4 paper
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-forest-50 hover:bg-forest-100 border border-forest-300 text-forest-900 font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-xs"
        >
          {language === 'mr' ? 'प्रिंट करा' : 'Print Now'}
        </button>
      </div>
    </div>
  );
};
