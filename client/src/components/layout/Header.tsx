import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useConnectivity } from '../../services/connectivity';
import { syncWithServer } from '../../services/syncService';
import { getPendingSyncCount } from '../../db/dbOperations';
import { getStoredUser, logoutUser } from '../../services/authService';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wifi, WifiOff, RefreshCw, Globe, Zap, LogOut, ShieldCheck, User, Users, Store } from 'lucide-react';

interface HeaderProps {
  lowResourceMode: boolean;
  setLowResourceMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ lowResourceMode, setLowResourceMode }) => {
  const { language, setLanguage, t } = useLanguage();
  const { isOnline } = useConnectivity();
  const [pendingSync, setPendingSync] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();

  const loadPendingCount = async () => {
    try {
      const count = await getPendingSyncCount();
      setPendingSync(count);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadPendingCount();
    const handler = () => loadPendingCount();
    window.addEventListener('gramvikas:data_changed', handler);
    const interval = setInterval(loadPendingCount, 5000);
    return () => {
      window.removeEventListener('gramvikas:data_changed', handler);
      clearInterval(interval);
    };
  }, []);

  const handleQuickSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncToast(language === 'mr' ? 'डेटा सिंक होत आहे...' : 'Syncing data with server...');
    const res = await syncWithServer();
    setIsSyncing(false);
    setSyncToast(res.message);
    loadPendingCount();
    setTimeout(() => setSyncToast(null), 4000);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cream-200 px-3 sm:px-6 py-2.5 shadow-sm">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Brand / Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-forest-700 flex items-center justify-center text-white font-bold text-lg shadow-inner">
            ग
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-forest-900 tracking-tight text-base sm:text-lg">
                {language === 'mr' ? 'ग्रामविकास' : 'GramVikas'}
              </span>
              <span className="text-[10px] bg-forest-100 text-forest-800 font-bold px-1.5 py-0.5 rounded-full border border-forest-300 hidden sm:inline">
                PWA Offline
              </span>
            </div>
            <p className="text-[11px] text-earth-700 font-medium hidden md:block">
              {user.businessName}
            </p>
          </div>
        </Link>

        {/* Status Indicators & Action Bar */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Online / Offline Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse'
            }`}
            title={isOnline ? 'Online - Live server connected' : 'Offline Mode - Storing 100% locally in IndexedDB'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden xs:inline">{t.online}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                <span>{t.offline}</span>
              </>
            )}
          </div>

          {/* Sync Button & Pending Badge */}
          <button
            onClick={handleQuickSync}
            disabled={isSyncing}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
              pendingSync > 0
                ? 'bg-amber-100 text-amber-900 border-amber-400 hover:bg-amber-200'
                : 'bg-cream-100 text-slate-700 border-cream-300 hover:bg-cream-200'
            }`}
            title="Click to sync changes with Java Backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-forest-700' : 'text-slate-600'}`} />
            {pendingSync > 0 ? (
              <span className="font-bold text-amber-800">
                {pendingSync} <span className="hidden sm:inline">{t.syncPending}</span>
              </span>
            ) : (
              <span className="hidden sm:inline">{t.syncCompleted}</span>
            )}
          </button>

          {/* Low Resource Mode Toggle */}
          <button
            onClick={() => setLowResourceMode(!lowResourceMode)}
            className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
              lowResourceMode
                ? 'bg-emerald-700 text-white border-emerald-800'
                : 'bg-cream-100 text-slate-700 border-cream-300 hover:bg-cream-200'
            }`}
            title="Low Resource Mode: Saves Battery & Data on Budget Phones"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline text-[11px]">{t.lowResource}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'mr' ? 'en' : 'mr')}
            className="flex items-center gap-1 bg-forest-50 hover:bg-forest-100 border border-forest-300 text-forest-900 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
            title="Toggle Marathi / English"
          >
            <Globe className="w-3.5 h-3.5 text-forest-700" />
            <span>{language === 'mr' ? 'English' : 'मराठी'}</span>
          </button>

          {/* Customer / Shopkeeper Portal Switcher */}
          {location.pathname.includes('customer') ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all"
              title="Switch to Shopkeeper Dashboard"
            >
              <Store className="w-3.5 h-3.5 text-amber-800" />
              <span className="hidden sm:inline">{t.shopkeeperPortal}</span>
            </Link>
          ) : (
            <Link
              to="/customer-portal"
              className="flex items-center gap-1.5 bg-forest-100 hover:bg-forest-200 text-forest-950 border border-forest-300 px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all"
              title="Switch to Customer Passbook & Portal"
            >
              <Users className="w-3.5 h-3.5 text-forest-800" />
              <span className="hidden sm:inline">{t.customerPortal}</span>
            </Link>
          )}

          {/* Admin link if role is admin */}
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className="p-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100"
              title="Admin Portal"
            >
              <ShieldCheck className="w-4 h-4" />
            </Link>
          )}

          {/* Profile / Logout */}
          <Link
            to="/settings"
            className="p-1.5 bg-cream-100 text-slate-700 border border-cream-300 rounded-lg hover:bg-cream-200 hidden sm:block"
            title="Profile & Settings"
          >
            <User className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Sync Toast Feedback */}
      {syncToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-forest-900 text-white text-xs px-4 py-2 rounded-xl shadow-lg border border-forest-700 animate-fade-in">
          {syncToast}
        </div>
      )}
    </header>
  );
};
