import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { getStoredUser, setStoredUser, UserProfile } from '../services/authService';
import {
  Settings,
  Store,
  User,
  Phone,
  MapPin,
  Globe,
  Zap,
  Save,
  CheckCircle,
  Moon,
  Sun,
  ShieldAlert,
} from 'lucide-react';

interface ProfileSettingsPageProps {
  lowResourceMode: boolean;
  setLowResourceMode: (val: boolean) => void;
}

export const ProfileSettingsPage: React.FC<ProfileSettingsPageProps> = ({
  lowResourceMode,
  setLowResourceMode,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [user, setUser] = useState<UserProfile>(getStoredUser());
  const [toast, setToast] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredUser(user);
    setToast(language === 'mr' ? 'माहिती यशस्वीरीत्या जतन झाली!' : 'Settings updated successfully!');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-forest-700" />
          <span>{t.profileTitle}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {language === 'mr'
            ? 'व्यवसायाचे तपशील, भाषा, कमी-साधन मोड व एसएमएस सेटिंग्ज'
            : 'Configure business identity, rural smartphone optimizations, and notification preferences'}
        </p>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Business Profile Form */}
      <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-sm">
        <h3 className="font-black text-sm text-slate-900 mb-4 flex items-center gap-2">
          <Store className="w-4 h-4 text-forest-700" />
          <span>{language === 'mr' ? 'व्यवसाय व मालकाची माहिती' : 'Business & Owner Information'}</span>
        </h3>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.businessName} *
              </label>
              <input
                type="text"
                required
                value={user.businessName}
                onChange={(e) => setUser({ ...user, businessName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.ownerName} *
              </label>
              <input
                type="text"
                required
                value={user.ownerName}
                onChange={(e) => setUser({ ...user, ownerName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.phone} (एसएमएस अलर्टसाठी)
              </label>
              <input
                type="tel"
                value={user.phone}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs sm:text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.village} (गाव / वाडी)
              </label>
              <input
                type="text"
                value={user.village}
                onChange={(e) => setUser({ ...user, village: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.district}
              </label>
              <input
                type="text"
                value={user.district}
                onChange={(e) => setUser({ ...user, district: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs sm:text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Preferences Card: Language & Low-Resource Mode */}
      <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-sm space-y-4">
        <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-forest-700" />
          <span>{language === 'mr' ? 'सिस्टम व उपकरण प्राधान्ये' : 'System & Device Preferences'}</span>
        </h3>

        {/* Language Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-cream-50 rounded-2xl border border-cream-200">
          <div>
            <span className="font-bold text-xs text-slate-900 block">{t.preferredLanguage}</span>
            <span className="text-[11px] text-slate-500">
              {language === 'mr'
                ? 'स्थानिक भाषा ऑफलाइन मोडमध्येही कायम सेव्ह राहते.'
                : 'Language preference persists offline in local storage.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLanguage('mr');
                setUser({ ...user, preferredLanguage: 'mr' });
                localStorage.setItem('gv_language', 'mr');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                language === 'mr'
                  ? 'bg-forest-700 text-white border-forest-800 shadow-xs'
                  : 'bg-white text-slate-700 border-cream-300'
              }`}
            >
              मराठी (मराठी)
            </button>
            <button
              onClick={() => {
                setLanguage('en');
                setUser({ ...user, preferredLanguage: 'en' });
                localStorage.setItem('gv_language', 'en');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                language === 'en'
                  ? 'bg-forest-700 text-white border-forest-800 shadow-xs'
                  : 'bg-white text-slate-700 border-cream-300'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Low-Resource Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-cream-50 rounded-2xl border border-cream-200">
          <div>
            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{t.lowResourceModeToggle}</span>
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block max-w-md">
              {t.lowResourceDesc}
            </span>
          </div>

          <button
            onClick={() => setLowResourceMode(!lowResourceMode)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              lowResourceMode
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                : 'bg-white text-slate-700 border-cream-300 hover:bg-cream-100'
            }`}
          >
            {lowResourceMode ? 'ENABLED (सक्रिय)' : 'DISABLED (बंद)'}
          </button>
        </div>
      </div>
    </div>
  );
};
