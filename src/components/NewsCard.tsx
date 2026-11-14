import React from 'react';
import { Calendar, Eye, Share2, ShieldCheck, ArrowRight, Video } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { NewsItem } from '../types';

interface NewsCardProps {
  news: NewsItem;
  onSelect: (item: NewsItem) => void;
  onShareWhatsApp: (item: NewsItem, e: React.MouseEvent) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, onSelect, onShareWhatsApp }) => {
  const { lang, t } = useLanguage();

  const title = lang === 'hi' ? news.title_hi : news.title_en;
  const summary = lang === 'hi' ? news.summary_hi : news.summary_en;

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
    <article 
      onClick={() => onSelect(news)}
      className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* News Thumbnail */}
        <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
          {news.image_url ? (
            <img 
              src={news.image_url} 
              alt={title}
              loading="lazy"
              onError={(e) => {
                // Fallback placeholder on image load error
                (e.target as HTMLElement).style.display = 'none';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-slate-800 text-white font-black text-3xl">
              UB
            </div>
          )}

          {/* Badges on Thumbnail */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="bg-blue-600/90 text-white font-bold text-[11px] px-2 py-0.5 rounded-md backdrop-blur-xs shadow-xs">
              {news.category}
            </span>
            {news.is_official_verified && (
              <span className="bg-emerald-600/90 text-white font-bold text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
                <ShieldCheck className="w-3 h-3" />
                <span>{t('verified')}</span>
              </span>
            )}
            {news.video_url && (
              <span className="bg-red-600/90 text-white font-bold text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
                <Video className="w-3 h-3" />
                <span>Video</span>
              </span>
            )}
          </div>
        </div>

        {/* News Body Info */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(news.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {news.views} {t('views')}
            </span>
          </div>

          <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {summary}
          </p>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs">
        <button
          onClick={(e) => onShareWhatsApp(news, e)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-bold transition-colors"
          title={t('shareWhatsApp')}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">WhatsApp</span>
        </button>

        <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
          <span>{t('readMore')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
};
