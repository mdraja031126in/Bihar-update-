import React from 'react';
import { Microscope, Dna, Atom, Award, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { NewsItem } from '../types';

interface ScienceEducationSectionProps {
  scienceNews: NewsItem[];
  onSelectArticle: (article: NewsItem) => void;
  onViewCategory: () => void;
}

export const ScienceEducationSection: React.FC<ScienceEducationSectionProps> = ({
  scienceNews,
  onSelectArticle,
  onViewCategory
}) => {
  const { lang, t } = useLanguage();

  return (
    <section className="mb-10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 border border-indigo-900 shadow-xl overflow-hidden relative">
      {/* Background Decorative Science Orbits */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-indigo-800/60 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black tracking-wider uppercase border border-cyan-500/30">
              <Microscope className="w-4 h-4 text-cyan-400" />
              <span>{t('scienceCorner')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {lang === 'hi' 
                ? 'बिहार बोर्ड विज्ञान एवं जैविकी (PCB/PCM) विशेष कॉर्नर' 
                : 'Bihar Board Science & Bioscience (PCB/PCM) Special Corner'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {t('scienceSubtitle')}
            </p>
          </div>

          <button
            onClick={onViewCategory}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs transition-colors self-start md:self-auto shadow-md"
          >
            <span>{lang === 'hi' ? 'सभी साइंस अपडेट्स' : 'All Science Updates'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Interactive Quick Subject Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Dna className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs sm:text-sm text-emerald-300">
                {lang === 'hi' ? 'जीव विज्ञान (Biology)' : 'Biological Sciences'}
              </div>
              <div className="text-[11px] text-slate-400">
                {lang === 'hi' ? 'प्रैक्टिकल व आरेख गाइड' : 'Practicals & Diagram Bank'}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
              <Atom className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs sm:text-sm text-cyan-300">
                {lang === 'hi' ? 'भौतिकी व रसायन विज्ञान' : 'Physics & Chemistry'}
              </div>
              <div className="text-[11px] text-slate-400">
                {lang === 'hi' ? 'मॉडल पेपर्स व फॉर्मूला' : 'Model Papers & Formulae'}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs sm:text-sm text-amber-300">
                {lang === 'hi' ? 'DST INSPIRE स्कॉलरशिप' : 'INSPIRE Scholarships'}
              </div>
              <div className="text-[11px] text-slate-400">
                {lang === 'hi' ? 'टॉप 1% साइंस छात्रों हेतु' : 'For Top 1% Science Rankers'}
              </div>
            </div>
          </div>
        </div>

        {/* Featured Science Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scienceNews.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectArticle(item)}
              className="group bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-indigo-900/60 p-4 transition-all cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                    {item.subcategory || '12th Science'}
                  </span>
                  <span className="text-slate-400">
                    {new Date(item.created_at).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {lang === 'hi' ? item.title_hi : item.title_en}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {lang === 'hi' ? item.summary_hi : item.summary_en}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-amber-300 text-[11px] font-medium">
                  {item.source_name}
                </span>
                <span className="text-cyan-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>{t('readMore')}</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
