import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useConnectivity } from '../../services/connectivity';
import { getStoredUser, logoutUser } from '../../services/authService';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wifi, WifiOff, Globe, Users, Store, LogOut, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { isOnline } = useConnectivity();
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();

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

          {/* User Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-cream-100 rounded-lg text-xs font-bold text-slate-800 border border-cream-300">
            <User className="w-3.5 h-3.5 text-forest-700" />
            <span className="truncate max-w-[120px]">{user.ownerName}</span>
            <span className="text-[10px] bg-white px-1.5 py-0.2 rounded text-slate-500 font-semibold">
              {user.role === 'customer' ? (language === 'mr' ? 'ग्राहक' : 'Customer') : (language === 'mr' ? 'दुकानदार' : 'Shopkeeper')}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
            title={language === 'mr' ? 'बाहेर पडा (Logout)' : 'Logout'}
          >
            <LogOut className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">{language === 'mr' ? 'बाहेर पडा' : 'Logout'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
