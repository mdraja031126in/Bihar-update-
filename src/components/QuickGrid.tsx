import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CategoryItem } from '../types';

interface QuickGridProps {
  categories: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (catSlug: string) => void;
}

export const QuickGrid: React.FC<QuickGridProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  const { lang, t } = useLanguage();

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span>
          <span>{lang === 'hi' ? 'त्वरित श्रेणी चयन' : 'Quick Categories'}</span>
        </h3>
        <span className="text-xs text-slate-400">
          {lang === 'hi' ? 'सीधे अपनी परीक्षा के अनुसार खोजें' : 'Filter by examination'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {categories.slice(0, 10).map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.name_en.toLowerCase();
          const name = lang === 'hi' ? cat.name_hi : cat.name_en;
          const desc = lang === 'hi' ? cat.description_hi : cat.description_en;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? 'all' : cat.name_en)}
              className={`p-3 rounded-xl border text-left transition-all group flex flex-col justify-between ${
                isSelected 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300 dark:ring-blue-800' 
                  : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full mb-1">
                <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                  {cat.icon}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                }`}>
                  UPDATE
                </span>
              </div>
              <div>
                <div className={`font-bold text-xs sm:text-sm line-clamp-1 ${
                  isSelected ? 'text-white' : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                }`}>
                  {name}
                </div>
                {desc && (
                  <div className={`text-[11px] line-clamp-1 mt-0.5 ${
                    isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-400'
                  }`}>
                    {desc}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
