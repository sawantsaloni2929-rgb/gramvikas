import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { db, SchemeInfo } from '../db/dexieDb';
import {
  Landmark,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Award,
  Filter,
  CheckCircle,
} from 'lucide-react';

export const SchemesPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [schemes, setSchemes] = useState<SchemeInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    db.schemes.toArray().then(setSchemes);
  }, []);

  const filtered = schemes.filter(
    (s) => selectedCategory === 'ALL' || s.category === selectedCategory
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Landmark className="w-6 h-6 text-forest-700" />
          <span>{t.schemesTitle}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">{t.schemesSubtitle}</p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'ALL', label: language === 'mr' ? 'सर्व योजना' : 'All Schemes' },
          { key: 'subsidy', label: language === 'mr' ? 'अनुदान योजना (Subsidy)' : 'Subsidies' },
          { key: 'training', label: language === 'mr' ? 'प्रशिक्षण व टूलकिट' : 'Training & Toolkits' },
          { key: 'equipment', label: language === 'mr' ? 'यंत्रसामग्री व शेती' : 'Machinery & Equipment' },
          { key: 'loan', label: language === 'mr' ? 'सवलतीचे कर्ज (PMEGP)' : 'Enterprise Loans' },
        ].map((c) => (
          <button
            key={c.key}
            onClick={() => setSelectedCategory(c.key)}
            className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all border ${
              selectedCategory === c.key
                ? 'bg-forest-700 text-white border-forest-800 shadow-xs'
                : 'bg-white text-slate-700 border-cream-300 hover:bg-cream-100'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Schemes Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((scheme) => (
          <div
            key={scheme.id}
            className="bg-white rounded-3xl p-5 border border-cream-200 shadow-sm flex flex-col justify-between hover:border-forest-400 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 uppercase border border-forest-300">
                  {scheme.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified: {scheme.verifiedDate}</span>
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                {language === 'mr' ? scheme.titleMr : scheme.title}
              </h3>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">
                {scheme.department}
              </p>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {language === 'mr' ? scheme.descriptionMr : scheme.description}
              </p>

              {/* Benefits Box */}
              <div className="mt-3 p-3 bg-cream-50 rounded-2xl border border-cream-200 space-y-1.5 text-xs">
                <div>
                  <span className="font-bold text-forest-900">{t.benefits}: </span>
                  <span className="text-slate-700">
                    {language === 'mr' ? scheme.benefitsMr : scheme.benefits}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">{t.eligibility}: </span>
                  <span className="text-slate-600">
                    {language === 'mr' ? scheme.eligibilityMr : scheme.eligibility}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-cream-100 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-[11px] text-amber-800 font-bold">
                <Calendar className="w-3.5 h-3.5" />
                <span>{scheme.deadline}</span>
              </span>

              <a
                href={scheme.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-forest-700 hover:text-forest-900 font-bold text-xs"
              >
                <span>{scheme.officialSource}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
