import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useConnectivity } from '../services/connectivity';
import { syncWithServer, SyncResult } from '../services/syncService';
import { db, SyncEvent } from '../db/dexieDb';
import {
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const SyncCentrePage: React.FC = () => {
  const { language, t } = useLanguage();
  const { isOnline, checkConnection } = useConnectivity();
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  // Counters
  const [counts, setCounts] = useState({
    products: 0,
    sales: 0,
    expenses: 0,
    customers: 0,
    payments: 0,
    sms: 0,
  });

  // Simulated Conflict Modal State
  const [showConflictModal, setShowConflictModal] = useState(false);

  const loadSyncData = async () => {
    const p = await db.products.where('syncStatus').equals('pending').count();
    const s = await db.sales.where('syncStatus').equals('pending').count();
    const e = await db.expenses.where('syncStatus').equals('pending').count();
    const c = await db.customers.where('syncStatus').equals('pending').count();
    const pay = await db.payments.where('syncStatus').equals('pending').count();
    const sms = await db.smsQueue.where('status').equals('offline_queued').count();
    setCounts({ products: p, sales: s, expenses: e, customers: c, payments: pay, sms });

    const events = await db.syncEvents.reverse().limit(10).toArray();
    setSyncEvents(events);
  };

  useEffect(() => {
    loadSyncData();
    const handleDataChange = () => loadSyncData();
    window.addEventListener('gramvikas:data_changed', handleDataChange);
    return () => window.removeEventListener('gramvikas:data_changed', handleDataChange);
  }, []);

  const totalPending =
    counts.products + counts.sales + counts.expenses + counts.customers + counts.payments + counts.sms;

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    const res = await syncWithServer();
    setSyncing(false);
    setSyncResult(res);
    loadSyncData();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <RefreshCw className="w-6 h-6 text-forest-700" />
          <span>{t.syncCentreTitle}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">{t.syncDescription}</p>
      </div>

      {syncResult && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold shadow-sm flex items-start gap-2.5 ${
            syncResult.success
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          {syncResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <div>{syncResult.message}</div>
            {syncResult.serverTimestamp && (
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Server Ack Timestamp: {syncResult.serverTimestamp}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connectivity & Sync Status Hero */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-cream-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`p-3.5 rounded-2xl flex-shrink-0 ${
              isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
            }`}
          >
            {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg text-slate-900">
                {isOnline ? t.online : t.offline}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isOnline ? 'Connected to Java 17 Backend' : 'Offline Mode Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              {isOnline
                ? 'High-speed local network / internet connected. Java server is ready to synchronize batch updates.'
                : 'No network detected. All transactions, sales, and inventory changes remain safely isolated in IndexedDB.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={() => checkConnection()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-cream-300 font-bold text-xs text-slate-700 hover:bg-cream-100"
          >
            Test Connection
          </button>
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="w-full sm:w-auto bg-forest-700 hover:bg-forest-800 text-white font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? t.loading : t.manualSyncButton}</span>
          </button>
        </div>
      </div>

      {/* Pending Local Items Breakdown */}
      <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-sm space-y-3">
        <h3 className="font-black text-sm text-slate-900 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-forest-700" />
            <span>{language === 'mr' ? 'स्थानिक प्रलंबित नोंदींचे विभाजन' : 'Local Unsynced Changes Breakdown'}</span>
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              totalPending > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {totalPending} {language === 'mr' ? 'एकूण प्रलंबित' : 'Pending Items'}
          </span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-center">
          <div className="bg-cream-50 p-3 rounded-2xl border border-cream-200">
            <div className="text-xl font-black text-slate-900">{counts.sales}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Sales (विक्री)</div>
          </div>
          <div className="bg-cream-50 p-3 rounded-2xl border border-cream-200">
            <div className="text-xl font-black text-slate-900">{counts.products}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Products (वस्तू)</div>
          </div>
          <div className="bg-cream-50 p-3 rounded-2xl border border-cream-200">
            <div className="text-xl font-black text-slate-900">{counts.expenses}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Expenses (खर्च)</div>
          </div>
          <div className="bg-cream-50 p-3 rounded-2xl border border-cream-200">
            <div className="text-xl font-black text-slate-900">{counts.customers}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Khata (ग्राहक)</div>
          </div>
          <div className="bg-cream-50 p-3 rounded-2xl border border-cream-200">
            <div className="text-xl font-black text-slate-900">{counts.payments}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Payments (जमा)</div>
          </div>
          <div className="bg-cream-50 p-3 rounded-2xl border border-cream-200">
            <div className="text-xl font-black text-slate-900">{counts.sms}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">SMS Queue</div>
          </div>
        </div>
      </div>

      {/* Conflict Resolution Policy & Simulator */}
      <div className="bg-amber-50/70 border border-amber-300 rounded-3xl p-5 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div>
          <h4 className="font-extrabold text-sm text-amber-950 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>{language === 'mr' ? 'पारदर्शक विसंगती निवारण धोरण (Conflict Policy)' : 'Transparent Conflict Resolution Policy'}</span>
          </h4>
          <p className="text-xs text-amber-900 mt-1 max-w-2xl leading-relaxed">
            {language === 'mr'
              ? 'ग्रामविकास आर्थिक व्यवहारांच्या नोंदी परस्पर खोडून टाकत नाही. दोन वेगवेगळ्या उपकरणांवर एकाच वेळी खात्यात बदल झाल्यास तुलना दाखवून उद्योजकास निवड दिली जाते.'
              : 'GramVikas never silently overwrites financial ledger records. In the rare event of concurrent multi-device edits, a side-by-side comparison modal lets the entrepreneur choose.'}
          </p>
        </div>
        <button
          onClick={() => setShowConflictModal(true)}
          className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors shadow-xs flex-shrink-0"
        >
          {language === 'mr' ? 'विसंगती उदाहरण पहा' : 'Simulate Conflict Resolver'}
        </button>
      </div>

      {/* Sync Events History Table */}
      <div className="bg-white rounded-3xl border border-cream-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-cream-200 flex items-center justify-between">
          <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest-700" />
            <span>{language === 'mr' ? 'सिंक इतिहास व अहवाल' : 'Synchronization Audit Log'}</span>
          </h3>
          <span className="text-xs font-semibold text-slate-400">Java Backend Protocol v1.0</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-cream-200">
              <tr>
                <th className="p-3.5">तारीख व वेळ</th>
                <th className="p-3.5">तपशील (Details)</th>
                <th className="p-3.5 text-center">अपलोड नोंदी</th>
                <th className="p-3.5 text-right">स्थिती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {syncEvents.length > 0 ? (
                syncEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-cream-50 transition-colors">
                    <td className="p-3.5 text-slate-500 font-medium whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-slate-800 font-medium">{evt.details}</td>
                    <td className="p-3.5 text-center font-bold text-forest-800">
                      {evt.itemsPushed}
                    </td>
                    <td className="p-3.5 text-right">
                      <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                        {evt.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400 italic">
                    {language === 'mr' ? 'अद्याप सिंक इतिहास उपलब्ध नाही.' : 'No sync history records yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conflict Resolution Simulator Modal */}
      {showConflictModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-cream-200 animate-scale-up">
            <h3 className="font-black text-base text-slate-900 mb-1 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>{language === 'mr' ? 'नोंद विसंगती आढळली (Conflict Review)' : 'Record Conflict Detected'}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Two versions of customer ledger record <strong>"Savita Ramesh Jadhav"</strong> exist. Select which version to keep:
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-2xl border-2 border-forest-600 bg-forest-50/60">
                <div className="text-[10px] font-bold uppercase text-forest-800">Local Phone Version (IndexedDB)</div>
                <div className="font-black text-lg text-slate-900 mt-1">₹850</div>
                <div className="text-xs text-slate-600 mt-1">Edited: Today 10:15 AM</div>
                <div className="text-[11px] text-slate-500">Note: Collected ₹500 via cash</div>
              </div>

              <div className="p-3.5 rounded-2xl border border-cream-300 bg-cream-50">
                <div className="text-[10px] font-bold uppercase text-slate-500">Cloud Server Version</div>
                <div className="font-black text-lg text-slate-900 mt-1">₹1,350</div>
                <div className="text-xs text-slate-600 mt-1">Edited: Yesterday 06:00 PM</div>
                <div className="text-[11px] text-slate-500">Note: Previous recorded balance</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConflictModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-cream-300 text-xs font-bold text-slate-600"
              >
                Keep Server (₹1,350)
              </button>
              <button
                onClick={() => {
                  alert(language === 'mr' ? 'स्थानिक आवृत्ती (₹८५०) सुरक्षित ठेवली गेली!' : 'Local version (₹850) retained and marked synced!');
                  setShowConflictModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-xs font-bold text-white shadow-sm"
              >
                Keep Local (₹850)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
