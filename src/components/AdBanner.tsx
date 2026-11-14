import React, { useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { Advertisement } from '../types';

interface AdBannerProps {
  placement: 'header_top' | 'sidebar' | 'in_article' | 'footer_above';
  advertisements: Advertisement[];
}

export const AdBanner: React.FC<AdBannerProps> = ({ placement, advertisements }) => {
  const ad = advertisements.find(a => a.placement === placement && a.active);

  useEffect(() => {
    if (ad) {
      // Record impression
      fetch(`/api/ads/${ad.id}/impression`, { method: 'POST' }).catch(() => {});
    }
  }, [ad?.id]);

  if (!ad) return null;

  const handleClick = () => {
    fetch(`/api/ads/${ad.id}/click`, { method: 'POST' }).catch(() => {});
    window.open(ad.target_url, '_blank', 'noopener,noreferrer');
  };

  if (placement === 'sidebar') {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>विज्ञापन / SPONSORED</span>
          <ExternalLink className="w-3 h-3" />
        </div>
        <div 
          onClick={handleClick}
          className="rounded-xl overflow-hidden cursor-pointer group relative"
        >
          <img 
            src={ad.image_url} 
            alt={ad.alt_text || ad.title} 
            className="w-full h-auto object-cover group-hover:scale-102 transition-transform"
          />
          <div className="p-2 text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
            {ad.title}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 max-w-7xl mx-auto px-4">
      <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-2 sm:p-3 relative overflow-hidden">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2 mb-1.5">
          <span>विज्ञापन / SPONSORED ADVERTISEMENT</span>
          <ExternalLink className="w-3 h-3" />
        </div>
        <div 
          onClick={handleClick}
          className="rounded-xl overflow-hidden cursor-pointer group flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 hover:border-blue-300 transition-all"
        >
          <img 
            src={ad.image_url} 
            alt={ad.alt_text || ad.title} 
            className="w-full sm:w-64 h-24 object-cover rounded-lg group-hover:scale-102 transition-transform"
          />
          <div className="p-2 flex-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              {ad.title}
            </h4>
            <span className="inline-block mt-2 text-xs font-extrabold text-blue-600 dark:text-blue-400">
              अधिक जानकारी के लिए क्लिक करें →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
