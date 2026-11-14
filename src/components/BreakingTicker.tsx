import React, { useState } from 'react';
import { Flame, Play, Pause, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SiteSettings, NewsItem } from '../types';

interface BreakingTickerProps {
  settings: SiteSettings;
  breakingNews: NewsItem[];
  onSelectArticle: (article: NewsItem) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  settings,
  breakingNews,
  onSelectArticle
}) => {
  const { lang, t } = useLanguage();
  const [isPaused, setIsPaused] = useState(false);

  if (!settings.ticker_enabled) return null;

  const defaultTicker = lang === 'hi' ? settings.ticker_text_hi : settings.ticker_text_en;

  // Combine breaking news items with the custom ticker text
  const tickerItems = breakingNews.length > 0 
    ? breakingNews.map(item => ({
        id: item.id,
        text: lang === 'hi' ? item.title_hi : item.title_en,
        item
      }))
    : [{ id: 'default', text: defaultTicker, item: null }];

  return (
    <div className="bg-amber-50 dark:bg-slate-900 border-b border-amber-200 dark:border-slate-800 flex items-stretch h-11 overflow-hidden shadow-xs">
      {/* Ticker Badge */}
      <div className="bg-red-600 dark:bg-red-700 text-white flex items-center gap-1.5 px-3.5 sm:px-5 font-black text-xs sm:text-sm tracking-wider uppercase flex-shrink-0 z-10 shadow-md">
        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
        <Flame className="w-4 h-4 fill-white text-white" />
        <span>{t('breaking')}</span>
      </div>

      {/* Marquee Container */}
      <div 
        className="flex-1 overflow-hidden relative flex items-center cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className={`flex items-center gap-12 whitespace-nowrap text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 ${
            isPaused ? '' : 'animate-marquee'
          }`}
          style={{ animationDuration: `${Math.max(16, settings.ticker_speed || 26)}s` }}
        >
          {tickerItems.map((n, i) => (
            <div 
              key={n.id + '-' + i}
              onClick={() => n.item && onSelectArticle(n.item)}
              className="inline-flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <span>{n.text}</span>
              <span className="text-red-500 font-extrabold text-xs">✦</span>
            </div>
          ))}
          {/* Duplicate for smooth continuous looping */}
          {tickerItems.map((n, i) => (
            <div 
              key={'dup-' + n.id + '-' + i}
              onClick={() => n.item && onSelectArticle(n.item)}
              className="inline-flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <span>{n.text}</span>
              <span className="text-red-500 font-extrabold text-xs">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* Control Pause/Play */}
      <div className="flex items-center px-2 bg-amber-100/60 dark:bg-slate-800/80 border-l border-amber-200 dark:border-slate-800">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded transition-colors"
          title={isPaused ? 'Play Ticker' : 'Pause Ticker'}
          aria-label={isPaused ? 'Play Ticker' : 'Pause Ticker'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
