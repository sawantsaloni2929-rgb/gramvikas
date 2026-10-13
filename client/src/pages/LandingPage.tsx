import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import {
  WifiOff,
  RefreshCw,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Smartphone,
  Store,
  Users,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-cream-50 text-slate-800">
      {/* Top Navbar */}
      <nav className="border-b border-cream-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-forest-700 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
              ग
            </div>
            <div>
              <span className="font-black text-xl text-forest-900 tracking-tight">ग्रामविकास</span>
              <span className="text-xs text-slate-500 font-semibold block sm:inline sm:ml-2">GramVikas</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setLanguage(language === 'mr' ? 'en' : 'mr')}
              className="text-xs font-bold border border-forest-300 bg-forest-50 hover:bg-forest-100 text-forest-800 px-3 py-1.5 rounded-xl transition-colors"
            >
              {language === 'mr' ? 'English' : 'मराठी'}
            </button>
            <Link
              to="/login"
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-forest-900 px-3 py-1.5"
            >
              {language === 'mr' ? 'प्रवेश करा' : 'Sign In'}
            </Link>
            <Link
              to="/customer-portal"
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-amber-300 transition-all flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-amber-800" />
              <span>{language === 'mr' ? 'ग्राहक पोर्टल' : 'Customer Portal'}</span>
            </Link>
            <Link
              to="/dashboard"
              className="bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'दुकानदार डॅशबोर्ड' : 'Shopkeeper Demo'}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 pt-12 pb-16 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-100 text-forest-900 border border-forest-300 text-xs font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-forest-700" />
          <span>
            {language === 'mr'
              ? 'महाराष्ट्रातील ग्रामीण व्यावसायिकांसाठी १००% ऑफलाइन चालणारी प्रणाली'
              : '100% Offline-First Smart Management for Rural Maharashtra'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight max-w-3xl mx-auto">
          {language === 'mr' ? (
            <>
              इंटरनेट नसले तरी <span className="text-forest-700">व्यवसाय थांबणार नाही!</span>
            </>
          ) : (
            <>
              Your Business Never Stops, <span className="text-forest-700">Even Without Internet!</span>
            </>
          )}
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {language === 'mr'
            ? 'लाईट गेली किंवा नेटवर्क नसले तरी बिलिंग, साठा, उधारी आणि नफा व्यवस्थापन सुरळीतपणे करा. इंटरनेट येताच डेटा आपोआप क्लाउडवर सुरक्षित सिंक होतो.'
            : 'Designed specifically for Kirana stores, agro-service centers, and rural micro-enterprises. Works 100% offline with zero cloud dependency and automatic synchronization.'}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto bg-forest-700 hover:bg-forest-800 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-md text-sm sm:text-base transition-all flex items-center justify-center gap-2"
          >
            <Store className="w-5 h-5" />
            <span>{language === 'mr' ? 'दुकानदार डॅशबोर्ड' : 'Shopkeeper Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/customer-portal"
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-md text-sm sm:text-base transition-all flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            <span>{language === 'mr' ? 'ग्राहक खातेवही पोर्टल' : 'Customer Khata Portal'}</span>
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto bg-white hover:bg-cream-100 text-forest-900 border border-forest-300 font-bold px-6 py-3.5 rounded-2xl text-sm sm:text-base transition-all"
          >
            {language === 'mr' ? 'नवीन व्यवसाय नोंदणी' : 'Register Business'}
          </Link>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14 text-left">
          <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
              <WifiOff className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              {language === 'mr' ? 'ऑफलाइन-फर्स्ट कार्यप्रणाली' : 'Offline-First Storage'}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {language === 'mr'
                ? 'IndexedDB तंत्रज्ञानामुळे सर्व वस्तू, बिले व उधारी फोनमध्येच जतन होतात. नेटवर्क नसतानाही जलद बिलिंग.'
                : 'All transactions store directly in browser IndexedDB. Fast local billing even with airplane mode on.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center mb-3">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              {language === 'mr' ? 'स्मार्ट डेटा सिंक व बॅकअप' : 'Idempotent Cloud Sync'}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {language === 'mr'
                ? 'नेटवर्क आल्यावर जावा सर्व्हरशी सुरक्षित ताळमेळ. जुन्या व नवीन नोंदींचा अचूक मेळ.'
                : 'Seamless two-way sync with Java 17 backend. Automatic conflict detection and idempotency keys.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              {language === 'mr' ? 'स्थानिक व्यवसाय बुद्धिमत्ता' : 'Offline Business Insights'}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {language === 'mr'
                ? 'कोणती वस्तू जास्त विकली जाते, कोणता माल संपत आला आहे याचे स्थानिक गणित व सल्ले.'
                : 'Zero-cloud statistical rules compute sales velocity, restock points, and profit trends.'}
            </p>
          </div>
        </div>
      </section>

      {/* Rural Maharashtra Testimonials */}
      <section className="bg-cream-100/70 border-t border-cream-300 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-black text-center text-slate-900 mb-8">
            {language === 'mr'
              ? 'महाराष्ट्रातील ग्रामीण उद्योजकांचा विश्वास'
              : 'Trusted Across Rural Maharashtra'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-sm">
              <p className="text-xs text-slate-600 italic">
                "बारामतीमध्ये पावसाळ्यात वारंवार वीज जाते. ग्रामविकासमुळे एकाही ग्राहकाचे बिल थांबले नाही. उधारी स्मरणपत्र एसएमएसमुळे वेळेवर पैसे परत मिळतात."
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-forest-200 flex items-center justify-center text-forest-800 font-bold text-xs">
                  सु
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-800">सुरेश पाटील</div>
                  <div className="text-[10px] text-slate-500">श्री गणेश किराणा, बारामती (पुणे)</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-sm">
              <p className="text-xs text-slate-600 italic">
                "खत व बियाणे दुकानात आठवडे बाजाराच्या दिवशी खूप गर्दी असते. फोनचा डेटा संपला तरी साठा आपोआप मोजला जातो."
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-xs">
                  वि
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-800">विकास सावंत</div>
                  <div className="text-[10px] text-slate-500">कृषी सेवा केंद्र, निफाड (नाशिक)</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-sm">
              <p className="text-xs text-slate-600 italic">
                "कमी-साधन मोडमुळे जुन्या १० हजार रुपयांच्या फोनवरही ॲप एकदम स्मूथ चालते. बॅटरी व इंटरनेट दोन्हीची बचत होते."
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-800 font-bold text-xs">
                  अ
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-800">अनिता कदम</div>
                  <div className="text-[10px] text-slate-500">श्रीमंत बचत गट गृहउद्योग, कराड (सातारा)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cream-300 py-6 px-4 text-center text-xs text-slate-500">
        <p>GramVikas — ग्रामीण उद्योजक स्मार्ट व्यवसाय प्रणाली | Made for Maharashtra Micro-Enterprises</p>
      </footer>
    </div>
  );
};
