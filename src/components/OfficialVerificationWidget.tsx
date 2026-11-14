import React from 'react';
import { ShieldCheck, ExternalLink, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const OfficialVerificationWidget: React.FC = () => {
  const { lang, t } = useLanguage();

  const officialPortals = [
    {
      name_hi: 'बिहार विद्यालय परीक्षा समिति (BSEB)',
      name_en: 'Bihar School Examination Board (BSEB)',
      desc_hi: '10वीं व 12वीं बोर्ड परीक्षा, डमी एडमिट कार्ड व रिजल्ट',
      desc_en: 'Matric & Inter Exam, Admit Cards & Results',
      url: 'https://biharboardonline.bihar.gov.in/',
      domain: 'biharboardonline.bihar.gov.in'
    },
    {
      name_hi: 'मेधासॉफ्ट छात्रवृत्ति पोर्टल (Medhasoft)',
      name_en: 'Medhasoft Scholarship Portal',
      desc_hi: 'मुख्यमंत्री बालक/बालिका प्रोत्साहन एवं कन्या उत्थान योजना',
      desc_en: 'Mukhyamantri Protsahan & Kanya Utthan DBT',
      url: 'http://medhasoft.bih.nic.in/',
      domain: 'medhasoft.bih.nic.in'
    },
    {
      name_hi: 'बिहार लोक सेवा आयोग (BPSC)',
      name_en: 'Bihar Public Service Commission',
      desc_hi: 'शिक्षक नियुक्ति परीक्षा (TRE) एवं सिविल सेवा परीक्षा',
      desc_en: 'Teacher Recruitment TRE & Civil Services',
      url: 'https://www.bpsc.bih.nic.in/',
      domain: 'bpsc.bih.nic.in'
    },
    {
      name_hi: 'शिक्षा विभाग, बिहार सरकार',
      name_en: 'Education Dept, Govt of Bihar',
      desc_hi: 'आधिकारिक अधिसूचनाएं, सर्कुलर एवं शिक्षक नियमावली',
      desc_en: 'Official Gazette, Circulars & School Rules',
      url: 'https://state.bihar.gov.in/educationbihar/',
      domain: 'state.bihar.gov.in'
    }
  ];

  return (
    <section className="mb-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t('officialVerification')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'hi' ? 'सीधे सरकारी पोर्टल पर प्रमाणिकता की जांच करें' : 'Verify announcements directly on official government servers'}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800 self-start sm:self-auto">
          <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
          <span>{lang === 'hi' ? 'स्वतंत्र समाचार पोर्टल' : 'Independent News Portal'}</span>
        </div>
      </div>

      {/* Official Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {officialPortals.map((portal, idx) => (
          <a
            key={idx}
            href={portal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-slate-750 transition-all flex items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{lang === 'hi' ? portal.name_hi : portal.name_en}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'hi' ? portal.desc_hi : portal.desc_en}
              </p>
              <span className="inline-block text-[11px] font-mono text-blue-600 dark:text-blue-400">
                {portal.domain}
              </span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
          </a>
        ))}
      </div>

      {/* Portal Independent Disclaimer Banner */}
      <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-start gap-2">
        <span className="font-bold text-slate-700 dark:text-slate-300 flex-shrink-0">नोट:</span>
        <p>
          {t('independentDisclaimer')}
        </p>
      </div>
    </section>
  );
};
