import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { registerUser } from '../services/authService';
import { Store, User, MapPin, Phone, Mail, Lock, ArrowRight } from 'lucide-react';

const MAHARASHTRA_DISTRICTS = [
  'Ahmednagar', 'Akola', 'Amravati', 'Chhatrapati Sambhajinagar', 'Beed', 'Bhandara',
  'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon',
  'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded',
  'Nandurbar', 'Nashik', 'Dharashiv', 'Palghar', 'Parbhani', 'Pune', 'Raigad',
  'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha',
  'Washim', 'Yavatmal'
];

export const RegisterPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    businessName: 'Shree Ganesh Krishi & Kirana',
    ownerName: 'Suresh Patil',
    email: 'patil@gramvikas.in',
    phone: '+919822998877',
    village: 'Baramati Rural',
    district: 'Pune',
    password: 'password123',
    preferredLanguage: language as 'mr' | 'en',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(formData);
      navigate('/dashboard');
    } catch {
      // offline fallback
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-forest-700 text-white font-black text-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
            ग
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {language === 'mr' ? 'नवीन व्यवसाय नोंदणी' : 'Register Your Business'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'mr'
              ? 'महाराष्ट्रातील ग्रामीण व्यावसायिकांसाठी सुलभ नोंदणी'
              : 'GramVikas Offline-First Business Setup for Rural Maharashtra'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.businessName} *
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:ring-2 focus:ring-forest-500"
                placeholder="उदा. समर्थ किराणा व जनरल स्टोअर्स"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.ownerName} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:ring-2 focus:ring-forest-500"
                  placeholder="उदा. रमेश सावंत"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.phone} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:ring-2 focus:ring-forest-500"
                  placeholder="+919822000000"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.village} *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:ring-2 focus:ring-forest-500"
                  placeholder="गाव / वाडी"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.district} *
              </label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-cream-300 text-sm focus:ring-2 focus:ring-forest-500"
              >
                {MAHARASHTRA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ईमेल (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                पासवर्ड (Password) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.preferredLanguage}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, preferredLanguage: 'mr' });
                  setLanguage('mr');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  formData.preferredLanguage === 'mr'
                    ? 'bg-forest-700 text-white border-forest-800'
                    : 'bg-cream-100 text-slate-700 border-cream-300'
                }`}
              >
                मराठी (Default)
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, preferredLanguage: 'en' });
                  setLanguage('en');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  formData.preferredLanguage === 'en'
                    ? 'bg-forest-700 text-white border-forest-800'
                    : 'bg-cream-100 text-slate-700 border-cream-300'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest-700 hover:bg-forest-800 text-white font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm mt-4"
          >
            <span>{loading ? t.loading : (language === 'mr' ? 'नोंदणी पूर्ण करा' : 'Complete Setup')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-cream-200 text-center">
          <p className="text-xs text-slate-500">
            {language === 'mr' ? 'आधीच खाते आहे का?' : 'Already have an account?'}{' '}
            <Link to="/login" className="font-bold text-forest-700 hover:underline">
              {language === 'mr' ? 'येथे लॉगिन करा' : 'Sign In'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
