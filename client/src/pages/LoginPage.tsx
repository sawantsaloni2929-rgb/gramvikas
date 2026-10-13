import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { loginUser } from '../services/authService';
import { Lock, Mail, ArrowRight, ShieldCheck, WifiOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('suresh@gramvikas.in');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await loginUser(email, password);
      if (user) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
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
              ? 'स्थानिक ऑफलाइन सत्रासह सुरक्षित व्यवसाय लॉगिन'
              : 'Secure business portal with offline session caching'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'mr' ? 'ईमेल किंवा मोबाईल' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm"
                placeholder="name@gramvikas.in"
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
              <WifiOff className="w-3 h-3 text-emerald-600" />
              {language === 'mr' ? 'ऑफलाइन लॉगिन समर्थित' : 'Works offline after setup'}
            </span>
            <span className="text-[11px] text-slate-400">Demo: admin123</span>
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
            to="/customer-portal"
            className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
          >
            <span>{language === 'mr' ? 'ग्राहक खातेवही व पासबुक पोर्टल उघडा' : 'Explore Customer Khata & Portal'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <p className="text-xs text-slate-500">
            {language === 'mr' ? 'नवीन व्यवसाय आहे का?' : "Don't have a business account?"}{' '}
            <Link to="/register" className="font-bold text-forest-700 hover:underline">
              {language === 'mr' ? 'येथे नोंदणी करा' : 'Register here'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
