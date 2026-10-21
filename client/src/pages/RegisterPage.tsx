import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { registerUser } from '../services/authService';
import { Store, User, MapPin, Phone, Mail, Lock, ArrowRight, Users, CheckCircle2 } from 'lucide-react';

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

  const [role, setRole] = useState<'shopkeeper' | 'customer'>('shopkeeper');
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    village: '',
    district: 'Thane',
    password: '',
    preferredLanguage: language as 'mr' | 'en',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await registerUser({
        ...formData,
        role,
        businessName: role === 'shopkeeper' ? formData.businessName : `${formData.ownerName}'s Account`,
      });

      if (user.role === 'customer') {
        navigate('/customer-portal');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
            {language === 'mr' ? 'नवीन नोंदणी (Register Account)' : 'Create New Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'mr'
              ? 'दुकानदार किंवा ग्राहक खाते तयार करा — डेटा स्थानिक डेटाबेसमध्ये कायमस्वरूपी जतन होतो'
              : 'Permanent IndexedDB Database Registration for Maharashtra Retail'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* ROLE SELECTOR (Shopkeeper vs Customer) */}
        <div className="mb-5 bg-cream-100/70 p-1.5 rounded-2xl border border-cream-200">
          <div className="text-[11px] font-bold text-slate-600 px-2 py-1 uppercase tracking-wider">
            {language === 'mr' ? 'नोंदणी प्रकार निवडा (Choose Account Type):' : 'Select Account Type:'}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={() => setRole('shopkeeper')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all ${
                role === 'shopkeeper'
                  ? 'bg-forest-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-cream-50 border border-cream-200'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>{language === 'mr' ? 'दुकानदार / उद्योजक' : 'Shopkeeper / Store'}</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all ${
                role === 'customer'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-cream-50 border border-cream-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{language === 'mr' ? 'ग्राहक / शेतकरी' : 'Customer / Farmer'}</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Business Name (Only if Shopkeeper) */}
          {role === 'shopkeeper' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'mr' ? 'दुकान / व्यवसायाचे नाव (Business Name) *' : 'Business / Store Name *'}
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:ring-2 focus:ring-forest-500"
                  placeholder="उदा. सावंत किराणा व जनरल स्टोअर्स"
                />
              </div>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {role === 'shopkeeper'
                ? (language === 'mr' ? 'मालकाचे पूर्ण नाव (Owner Name) *' : 'Owner Full Name *')
                : (language === 'mr' ? 'ग्राहकाचे पूर्ण नाव (Customer Name) *' : 'Customer Full Name *')}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:ring-2 focus:ring-forest-500"
                placeholder="उदा. सलोनी सावंत / Saloni Sawant"
              />
            </div>
          </div>

          {/* Mobile Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'mr' ? 'मोबाईल नंबर (Phone) *' : 'Mobile Number *'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:ring-2 focus:ring-forest-500"
                  placeholder="उदा. 9876543210"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ईमेल पत्ता (Email) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:ring-2 focus:ring-forest-500"
                  placeholder="name@example.com"
                />
              </div>
            </div>
          </div>

          {/* Village & District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'mr' ? 'गाव / परिसर (Village) *' : 'Village / Town *'}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:ring-2 focus:ring-forest-500"
                  placeholder="उदा. ठाणे ग्रामीण / पालघर"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'mr' ? 'जिल्हा (District) *' : 'District *'}
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

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'mr' ? 'पासवर्ड तयार करा (Set Password) *' : 'Password *'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:ring-2 focus:ring-forest-500"
                placeholder="किमान ६ अक्षरे (Min 6 chars)"
              />
            </div>
          </div>

          {/* Preferred Language */}
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
            <span>{loading ? t.loading : (language === 'mr' ? 'नोंदणी पूर्ण करा (Register)' : 'Complete Registration')}</span>
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
