import React from 'react';
import { Sparkles, Calendar, Eye, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { NewsItem } from '../types';

interface HeroFeaturedProps {
  featuredNews: NewsItem[];
  onSelectArticle: (article: NewsItem) => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  featuredNews,
  onSelectArticle
}) => {
  const { lang, t } = useLanguage();

  if (!featuredNews || featuredNews.length === 0) return null;

  const mainStory = featuredNews[0];
  const sideStories = featuredNews.slice(1, 3);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="mb-8">
      {/* Bihar Education Banner Badge */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-xs font-black tracking-wider text-blue-700 dark:text-blue-400 uppercase">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>{lang === 'hi' ? 'प्रमुख शिक्षा समाचार व मुख्य अपडेट्स' : 'TOP EDUCATION SPOTLIGHT'}</span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {lang === 'hi' ? 'सत्यापित आधिकारिक बुलेटिन' : 'Verified Official Bulletins'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Spotlight Story (8 cols on lg) */}
        {mainStory && (
          <div 
            onClick={() => onSelectArticle(mainStory)}
            className="lg:col-span-8 group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-end min-h-[380px] sm:min-h-[440px]"
          >
            {/* Background Image with dark gradient overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img 
                src={mainStory.image_url || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1000&auto=format&fit=crop&q=80'} 
                alt={lang === 'hi' ? mainStory.title_hi : mainStory.title_en} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent"></div>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 p-5 sm:p-7 text-white space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="bg-blue-600 font-bold px-2.5 py-1 rounded-md text-white shadow-xs">
                  {mainStory.category}
                </span>
                {mainStory.is_official_verified && (
                  <span className="bg-emerald-500/90 text-white font-bold px-2.5 py-1 rounded-md flex items-center gap-1 backdrop-blur-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t('verified')}</span>
                  </span>
                )}
                {mainStory.breaking && (
                  <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[11px] uppercase tracking-wider animate-pulse">
                    {t('breaking')}
                  </span>
                )}
                <span className="text-slate-300 flex items-center gap-1 ml-auto">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(mainStory.created_at)}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-snug group-hover:text-blue-300 transition-colors">
                {lang === 'hi' ? mainStory.title_hi : mainStory.title_en}
              </h2>

              <p className="text-sm text-slate-200 line-clamp-2 font-normal leading-relaxed max-w-3xl">
                {lang === 'hi' ? mainStory.summary_hi : mainStory.summary_en}
              </p>

              <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-300 border-t border-slate-700/60">
                <span className="text-amber-300 font-medium truncate max-w-md">
                  स्रोत: {mainStory.source_name}
                </span>
                <span className="inline-flex items-center gap-1 text-white font-bold group-hover:translate-x-1 transition-transform">
                  <span>{t('readMore')}</span>
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Side Stories (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {sideStories.map((story) => (
            <div
              key={story.id}
              onClick={() => onSelectArticle(story)}
              className="group flex-1 bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded">
                    {story.category}
                  </span>
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(story.created_at)}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {lang === 'hi' ? story.title_hi : story.title_en}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {lang === 'hi' ? story.summary_hi : story.summary_en}
                </p>
              </div>

              <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-700/70 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {story.views} {t('views')}
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>{t('readMore')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}

          {/* Quick Notice Card */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'hi' ? 'सीधा आधिकारिक पोर्टल' : 'Direct Official Access'}</span>
            </div>
            <p className="text-xs text-slate-200">
              {lang === 'hi' 
                ? 'मैट्रिक व इंटर के एडमिट कार्ड व रिजल्ट की जांच सीधे बिहार बोर्ड के पोर्टल से करें।' 
                : 'Access authentic admit cards & results directly on BSEB government portal.'}
            </p>
            <a 
              href="https://biharboardonline.bihar.gov.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>biharboardonline.bihar.gov.in</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
