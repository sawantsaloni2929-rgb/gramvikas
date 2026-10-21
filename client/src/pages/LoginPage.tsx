import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { loginUser } from '../services/authService';
import { Lock, Mail, ArrowRight, WifiOff, Store, Users, Sparkles, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('suresh@gramvikas.in');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await loginUser(identifier, password);
      if (user) {
        if (user.role === 'customer') {
          navigate('/customer-portal');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-md">
        {/* Logo header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-forest-700 text-white font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            ग
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {language === 'mr' ? 'ग्रामविकास प्रवेश' : 'Sign in to GramVikas'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {language === 'mr'
              ? 'दुकानदार किंवा ग्राहक खाते निवडून लॉगिन करा'
              : 'Login as Shopkeeper or Customer (Works 100% Offline)'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* 1-Click Demo Profiles */}
        <div className="mb-5 bg-cream-50 p-3 rounded-2xl border border-cream-200">
          <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2 flex items-center justify-between">
            <span>{language === 'mr' ? 'त्वरित डेमो खाती (Quick Fill)' : 'Demo Accounts'}</span>
            <span className="text-forest-700 font-bold">1-Click</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickFill('suresh@gramvikas.in', 'admin123')}
              className="p-1.5 rounded-lg border bg-white border-forest-300 text-forest-900 font-bold hover:bg-forest-50 transition-all text-center"
              title="Demo Shopkeeper"
            >
              🏪 Suresh (दुकानदार)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('ramesh@gramvikas.in', 'customer123')}
              className="p-1.5 rounded-lg border bg-white border-amber-300 text-amber-900 font-bold hover:bg-amber-50 transition-all text-center"
              title="Demo Customer"
            >
              👤 Ramesh (ग्राहक)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('saloni.s.sawant25@slrtce.in', 'saloni123')}
              className="p-1.5 rounded-lg border bg-white border-purple-300 text-purple-900 font-bold hover:bg-purple-50 transition-all text-center"
              title="Saloni Sawant"
            >
              🌟 Saloni Sawant
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'mr' ? 'ईमेल किंवा मोबाईल नंबर' : 'Email or Mobile Number'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm"
                placeholder="उदा. 9822998877 किंवा name@gmail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'mr' ? 'पासवर्ड' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1 text-[11px] text-emerald-800 font-semibold">
              <WifiOff className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'mr' ? '१००% ऑफलाइन चालते' : '100% Offline Ready'}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">IndexedDB DB</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest-700 hover:bg-forest-800 text-white font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm mt-2"
          >
            <span>{loading ? t.loading : (language === 'mr' ? 'प्रवेश करा (लॉगिन)' : 'Sign In')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-cream-200 text-center space-y-3">
          <Link
            to="/register"
            className="w-full bg-forest-50 hover:bg-forest-100 text-forest-900 border border-forest-300 font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
          >
            <span>{language === 'mr' ? 'नवीन खाते तयार करा (दुकानदार / ग्राहक नोंदणी)' : 'Create New Account (Register Shop or Customer)'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
