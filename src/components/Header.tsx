import React, { useState } from 'react';
import { 
  Search, Moon, Sun, Globe, Shield, Menu, X, 
  ExternalLink, Bell, Sparkles, BookOpen, Users, UserCheck, Flame, Smartphone, Download 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { SiteSettings, CategoryItem, RegisteredUser, HeartbeatStats } from '../types';

interface HeaderProps {
  settings: SiteSettings;
  categories: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAdmin: () => void;
  onNavigateHome: () => void;
  onNavigatePage: (page: string) => void;
  currentPage: string;
  isAdminLoggedIn: boolean;
  heartbeat: HeartbeatStats;
  currentUser: RegisteredUser | null;
  onOpenGoogleAuth: () => void;
  onOpenAppDownload: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenAdmin,
  onNavigateHome,
  onNavigatePage,
  currentPage,
  isAdminLoggedIn,
  heartbeat,
  currentUser,
  onOpenGoogleAuth,
  onOpenAppDownload
}) => {
  const { lang, setLang, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const now = new Date();
  const dateFormatted = lang === 'hi' 
    ? now.toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });

  const siteName = lang === 'hi' ? settings.site_name_hi : settings.site_name_en;
  const tagline = lang === 'hi' ? settings.tagline_hi : settings.tagline_en;

  const handleCategoryClick = (slug: string) => {
    onSelectCategory(slug);
    setMobileMenuOpen(false);
    if (currentPage !== 'home') {
      onNavigateHome();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Top Utility Bar */}
      <div className="bg-[#0B1B3D] text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Date + Live Active Visitors Stats */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="font-medium flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {dateFormatted}
            </span>

            <span className="hidden sm:inline-block text-slate-500">|</span>

            {/* Strictly Genuine Real-time Visitor Stats */}
            <div className="inline-flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-2 py-0.5 rounded-full text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-300 font-bold">
                {heartbeat.onlineNow} {lang === 'hi' ? 'लाइव पाठक' : 'Online Now'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300">
                {heartbeat.totalEver.toLocaleString('en-IN')} {lang === 'hi' ? 'कुल जुड़े थे' : 'Total Visited'}
              </span>
            </div>

            <span className="hidden md:inline-block text-slate-500">|</span>

            <a 
              href="https://biharboardonline.bihar.gov.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 transition-colors underline decoration-amber-400/50"
            >
              <span>BSEB Official Website</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Right: App/APK Download, Google Sign In, Language, Dark Mode & Admin */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Android App / APK Download Button */}
            <button
              onClick={onOpenAppDownload}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black shadow-xs transition-colors"
              title={lang === 'hi' ? 'Android App / APK डाउनलोड करें' : 'Download Android App / APK'}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'ऐप / APK' : 'App / APK'}</span>
            </button>

            {/* Google Sign-in / User Button */}
            <button
              onClick={onOpenGoogleAuth}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white text-slate-800 hover:bg-slate-100 text-[11px] font-bold shadow-xs transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{currentUser ? currentUser.name.split(' ')[0] : (lang === 'hi' ? 'पाठक लॉगिन' : 'Reader Login')}</span>
            </button>

            {/* Language Switcher */}
            <div className="inline-flex items-center bg-slate-800/80 rounded-md p-0.5 border border-slate-700">
              <button
                onClick={() => setLang('hi')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  lang === 'hi' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-300 hover:text-white'
                }`}
                title="हिन्दी"
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  lang === 'en' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-300 hover:text-white'
                }`}
                title="English"
              >
                EN
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title={isDark ? t('lightMode') : t('darkMode')}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Separate Admin Portal Link - Only visible when Admin is logged in */}
            {isAdminLoggedIn && (
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs ring-1 ring-emerald-400"
              >
                <Shield className="w-3 h-3" />
                <span>एडमिन पोर्टल (Admin)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Branding Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
          {settings.logo_url ? (
            <img 
              src={settings.logo_url} 
              alt={siteName} 
              className="h-12 w-auto object-contain rounded-md" 
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 flex items-center justify-center text-white font-black text-xl shadow-md tracking-tighter">
              UB
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {siteName}
              </h1>
              <span className="hidden sm:inline-block bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                EDUCATION PORTAL
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-md line-clamp-1">
              {tagline}
            </p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
          </div>

          <button
            onClick={onOpenAppDownload}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-extrabold shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'ऐप डाउनलोड' : 'Get App'}</span>
          </button>

          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Expansion */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>
        </div>
      )}

      {/* Primary Category Navigation Bar */}
      <nav className="bg-[#123B7A] dark:bg-slate-950 text-white overflow-x-auto shadow-inner">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 sm:gap-2 whitespace-nowrap text-sm font-semibold">
          <button
            onClick={() => handleCategoryClick('all')}
            className={`px-3 py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              selectedCategory === 'all' && currentPage === 'home'
                ? 'border-amber-400 text-amber-300 bg-blue-900/50'
                : 'border-transparent text-slate-200 hover:text-white hover:bg-blue-900/30'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t('home')}</span>
          </button>

          {categories.map((cat) => {
            const catName = lang === 'hi' ? cat.name_hi : cat.name_en;
            const isSelected = selectedCategory.toLowerCase() === cat.name_en.toLowerCase() || 
                               selectedCategory.toLowerCase() === cat.slug.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name_en)}
                className={`px-3 py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
                  isSelected && currentPage === 'home'
                    ? 'border-amber-400 text-amber-300 bg-blue-900/50 font-bold'
                    : 'border-transparent text-slate-200 hover:text-white hover:bg-blue-900/30'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{catName}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            {t('categories')}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleCategoryClick('all')}
              className={`p-2.5 text-left rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                selectedCategory === 'all' 
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>{t('allCategories')}</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name_en)}
                className={`p-2.5 text-left rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                  selectedCategory.toLowerCase() === cat.name_en.toLowerCase() 
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="truncate">{lang === 'hi' ? cat.name_hi : cat.name_en}</span>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            <button onClick={() => { onNavigatePage('about'); setMobileMenuOpen(false); }} className="hover:text-blue-600 p-1">
              {t('aboutUs')}
            </button>
            <button onClick={() => { onNavigatePage('contact'); setMobileMenuOpen(false); }} className="hover:text-blue-600 p-1">
              {t('contactUs')}
            </button>
            <button onClick={() => { onNavigatePage('disclaimer'); setMobileMenuOpen(false); }} className="hover:text-blue-600 p-1">
              {t('disclaimer')}
            </button>
            <button onClick={() => { onNavigatePage('privacy'); setMobileMenuOpen(false); }} className="hover:text-blue-600 p-1">
              {t('privacyPolicy')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
