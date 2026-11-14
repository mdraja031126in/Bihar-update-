import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, ExternalLink, MessageCircle, AlertCircle, 
  Sparkles, Filter, RefreshCw, FileText, Plus, Users, Shield, Smartphone, Download 
} from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Header } from './components/Header';
import { BreakingTicker } from './components/BreakingTicker';
import { HeroFeatured } from './components/HeroFeatured';
import { QuickGrid } from './components/QuickGrid';
import { NewsCard } from './components/NewsCard';
import { ArticleView } from './components/ArticleView';
import { ScienceEducationSection } from './components/ScienceEducationSection';
import { OfficialVerificationWidget } from './components/OfficialVerificationWidget';
import { AdBanner } from './components/AdBanner';
import { LegalPages } from './components/LegalPages';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { AppDownloadModal } from './components/AppDownloadModal';
import { NewsItem, CategoryItem, SiteSettings, Advertisement, RegisteredUser, HeartbeatStats } from './types';
import { updateArticleMetaTags, updateAdSenseScript } from './utils/seo';

function MainApp() {
  const { lang, t } = useLanguage();
  const { setPrimaryColor } = useTheme();

  // Primary Data States
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation & Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'contact' | 'privacy' | 'disclaimer' | 'terms'>('home');

  // Real-time Heartbeat & Visitor counter
  const [heartbeat, setHeartbeat] = useState<HeartbeatStats>({
    onlineNow: 12,
    totalEver: 1290,
    totalRegistered: 43
  });

  // Google User / Member State & App Download Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isAppDownloadOpen, setIsAppDownloadOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(() => {
    try {
      const saved = localStorage.getItem('updatebihar_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Admin States
  const [isAdminOpen, setIsAdminOpen] = useState(() => {
    // Check if URL ends with /admin or has ?page=admin
    const url = new URL(window.location.href);
    return window.location.pathname === '/admin' || url.searchParams.get('page') === 'admin';
  });

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('updatebihar_admin_token');
  });

  // Generate / retrieve unique browser session ID for heartbeat
  const [sessionId] = useState<string>(() => {
    let s = sessionStorage.getItem('ub_session_id');
    if (!s) {
      s = 'sess-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();
      sessionStorage.setItem('ub_session_id', s);
    }
    return s;
  });

  // Heartbeat function to get live real-time visitor counts
  const sendHeartbeat = async () => {
    try {
      const res = await fetch('/api/analytics/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      if (res.ok) {
        const data = await res.json();
        setHeartbeat(data);
      }
    } catch {
      // offline fallback
    }
  };

  // Heartbeat interval (every 20s)
  useEffect(() => {
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 20000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // Dynamic SEO meta tags per article load (OpenGraph, Twitter cards, category social cards)
  useEffect(() => {
    updateArticleMetaTags(selectedArticle, settings, lang);
    updateAdSenseScript(settings);
  }, [selectedArticle, settings, lang]);

  // Browser back/forward navigation listener for /admin and ?article=
  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(window.location.href);
      if (window.location.pathname === '/admin' || url.searchParams.get('page') === 'admin') {
        setIsAdminOpen(true);
      } else {
        setIsAdminOpen(false);
      }
      const articleParam = url.searchParams.get('article');
      if (articleParam) {
        const found = news.find(n => n.id === articleParam);
        setSelectedArticle(found || null);
      } else {
        setSelectedArticle(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [news]);

  // Load initial portal data
  useEffect(() => {
    loadPortalData();
    // Record visit analytics
    fetch('/api/analytics/visit', { method: 'POST' }).catch(() => {});
  }, []);

  const loadPortalData = async () => {
    try {
      setLoading(true);
      const [newsRes, catsRes, settingsRes, adsRes] = await Promise.all([
        fetch('/api/news'),
        fetch('/api/categories'),
        fetch('/api/settings'),
        fetch('/api/ads'),
      ]);

      if (newsRes.ok) {
        const newsData: NewsItem[] = await newsRes.json();
        setNews(newsData);

        // Check if URL has ?article= parameter
        const params = new URLSearchParams(window.location.search);
        const articleParam = params.get('article');
        if (articleParam) {
          const found = newsData.find(n => n.id === articleParam);
          if (found) setSelectedArticle(found);
        }
      }

      if (catsRes.ok) {
        setCategories(await catsRes.json());
      }

      if (settingsRes.ok) {
        const s: SiteSettings = await settingsRes.json();
        setSettings(s);
        if (s.primary_color) setPrimaryColor(s.primary_color);
      }

      if (adsRes.ok) {
        setAdvertisements(await adsRes.json());
      }
    } catch (err) {
      console.error('Error fetching portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (token: string) => {
    setAdminToken(token);
    localStorage.setItem('updatebihar_admin_token', token);
  };

  const handleAdminLogout = () => {
    if (adminToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      }).catch(() => {});
    }
    setAdminToken(null);
    localStorage.removeItem('updatebihar_admin_token');
  };

  const handleGoogleSuccess = (user: RegisteredUser) => {
    setCurrentUser(user);
    localStorage.setItem('updatebihar_user', JSON.stringify(user));
    sendHeartbeat();
  };

  const handleLogoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('updatebihar_user');
  };

  const handleSelectArticle = (article: NewsItem) => {
    setSelectedArticle(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const url = new URL(window.location.href);
    url.searchParams.set('article', article.id);
    window.history.pushState({}, '', url.toString());

    // Record server view
    fetch(`/api/news/${article.id}`).catch(() => {});
  };

  const handleBackFromArticle = () => {
    setSelectedArticle(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('article');
    window.history.pushState({}, '', url.toString());
  };

  const handleShareWhatsApp = (item: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const title = lang === 'hi' ? item.title_hi : item.title_en;
    const url = `${window.location.origin}?article=${item.id}`;
    const text = `*${title}*\n\n👉 पूरी खबर यहाँ पढ़ें: ${url}\n\n_UPDATE BIHAR शिक्षा समाचार पोर्टल_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleNavigatePage = (pageName: string) => {
    setSelectedArticle(null);
    setCurrentPage(pageName as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setSelectedArticle(null);
    setCurrentPage('home');
    setSelectedCategory('all');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    setIsAdminOpen(true);
    const url = new URL(window.location.href);
    url.pathname = '/admin';
    window.history.pushState({}, '', url.toString());
  };

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.pathname === '/admin') {
      window.history.pushState({}, '', '/');
    }
  };

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white font-black text-xl animate-pulse">
            UB
          </div>
          <div className="text-sm font-bold text-slate-300">UPDATE BIHAR लोड हो रहा है...</div>
        </div>
      </div>
    );
  }

  // Filtered News
  const filteredNews = news.filter((item) => {
    const matchCategory =
      selectedCategory === 'all' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase() ||
      (item.subcategory && item.subcategory.toLowerCase() === selectedCategory.toLowerCase()) ||
      (item.tags && item.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase()));

    const title = (item.title_hi + ' ' + item.title_en).toLowerCase();
    const summary = (item.summary_hi + ' ' + item.summary_en).toLowerCase();
    const body = (item.body_hi + ' ' + item.body_en).toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchSearch = !query || title.includes(query) || summary.includes(query) || body.includes(query);

    return matchCategory && matchSearch;
  });

  const featuredNews = news.filter(n => n.featured);
  const breakingNews = news.filter(n => n.breaking);
  const scienceNews = news.filter(n => 
    n.category === 'Science & Biotech' || 
    (n.tags && n.tags.some(t => t.toLowerCase().includes('science') || t.toLowerCase().includes('biology')))
  );
  const trendingNews = [...news].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      {/* 1. Top Header with Live Active Visitor Count */}
      <Header
        settings={settings}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedArticle(null);
          setCurrentPage('home');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAdmin={handleOpenAdmin}
        onNavigateHome={handleNavigateHome}
        onNavigatePage={handleNavigatePage}
        currentPage={currentPage}
        isAdminLoggedIn={!!adminToken}
        heartbeat={heartbeat}
        currentUser={currentUser}
        onOpenGoogleAuth={() => setIsGoogleModalOpen(true)}
        onOpenAppDownload={() => setIsAppDownloadOpen(true)}
      />

      {/* 2. Breaking News Ticker */}
      <BreakingTicker
        settings={settings}
        breakingNews={breakingNews}
        onSelectArticle={handleSelectArticle}
      />

      {/* 3. Header Top Advertisement Banner */}
      {settings.sections_enabled.ads && (
        <AdBanner placement="header_top" advertisements={advertisements} />
      )}

      {/* 4. Quick Sticky Action Bar for Admin / Add News */}
      <div className="max-w-7xl mx-auto px-4 w-full pt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            {heartbeat.onlineNow} {lang === 'hi' ? 'लोग अभी लाइव जुड़े हैं' : 'people online now'}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">
            {heartbeat.totalEver.toLocaleString('en-IN')} {lang === 'hi' ? 'कुल पाठक जुड़े थे' : 'total visitors'}
          </span>
        </div>

        {/* Dedicated Quick Action: Add News Button - ONLY visible to authenticated Admin */}
        {adminToken && (
          <button
            onClick={handleOpenAdmin}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-black text-xs shadow-md transition-all hover:scale-102"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? '✚ खबर जोड़ें (एडमिन)' : '✚ Add News (Admin)'}</span>
          </button>
        )}
      </div>

      {/* 5. Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4">
        {/* Render Single Article View */}
        {selectedArticle ? (
          <ArticleView
            article={selectedArticle}
            allNews={news}
            onBack={handleBackFromArticle}
            onSelectRelated={handleSelectArticle}
          />
        ) : currentPage !== 'home' ? (
          /* Render Informational/Legal Pages */
          <LegalPages
            page={currentPage}
            settings={settings}
            onBack={handleNavigateHome}
          />
        ) : (
          /* Render Homepage */
          <div className="space-y-8">
            {/* Spotlight Hero Section (Shown on 'all' categories) */}
            {selectedCategory === 'all' && !searchQuery && settings.sections_enabled.hero_slider && (
              <HeroFeatured
                featuredNews={featuredNews.length > 0 ? featuredNews : news.slice(0, 3)}
                onSelectArticle={handleSelectArticle}
              />
            )}

            {/* Quick 8 Category Filter Grid */}
            {settings.sections_enabled.quick_categories && (
              <QuickGrid
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            )}

            {/* Main News Layout: 2 Columns (Content + Sidebar) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Main Stream (8 cols) */}
              <div className="lg:col-span-8 space-y-8">
                {/* Section Header & Active Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                      <span>
                        {selectedCategory === 'all' 
                          ? t('latestNews') 
                          : `${selectedCategory} ${lang === 'hi' ? 'अपडेट्स' : 'Updates'}`}
                      </span>
                    </h2>
                    {searchQuery && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1">
                        खोज परिणाम: &quot;{searchQuery}&quot; ({filteredNews.length} समाचार पाए गए)
                      </p>
                    )}
                  </div>

                  {selectedCategory !== 'all' && (
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>← {t('allCategories')}</span>
                    </button>
                  )}
                </div>

                {/* News Grid */}
                {filteredNews.length === 0 ? (
                  <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                    <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                      {t('noNewsFound')}
                    </h3>
                    <button
                      onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs"
                    >
                      सभी खबरें देखें
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {filteredNews.map((item) => (
                      <NewsCard
                        key={item.id}
                        news={item}
                        onSelect={handleSelectArticle}
                        onShareWhatsApp={handleShareWhatsApp}
                      />
                    ))}
                  </div>
                )}

                {/* Dedicated Science & Bioscience Section */}
                {settings.sections_enabled.science_corner && selectedCategory === 'all' && (
                  <ScienceEducationSection
                    scienceNews={scienceNews}
                    onSelectArticle={handleSelectArticle}
                    onViewCategory={() => setSelectedCategory('Science & Biotech')}
                  />
                )}

                {/* Official Source Direct Verification Widget */}
                {settings.sections_enabled.official_verification && (
                  <OfficialVerificationWidget />
                )}
              </div>

              {/* Right Sidebar (4 cols) */}
              <aside className="lg:col-span-4 space-y-6">
                {/* Trending News Card */}
                {settings.sections_enabled.trending_sidebar && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
                      <TrendingUp className="w-4 h-4 text-red-500" />
                      <span>{t('trending')}</span>
                    </div>

                    <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-700">
                      {trendingNews.map((trend, i) => (
                        <div
                          key={trend.id}
                          onClick={() => handleSelectArticle(trend)}
                          className="pt-3 first:pt-0 group cursor-pointer flex items-start gap-3"
                        >
                          <span className="font-black text-lg text-slate-300 dark:text-slate-600 group-hover:text-blue-600 font-mono">
                            0{i + 1}
                          </span>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                              {trend.category}
                            </span>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 leading-snug transition-colors">
                              {lang === 'hi' ? trend.title_hi : trend.title_en}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sidebar Advertisement */}
                {settings.sections_enabled.ads && (
                  <AdBanner placement="sidebar" advertisements={advertisements} />
                )}

                {/* Official Bihar Board Notice Box */}
                <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl p-5 border border-blue-800 shadow-md space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>{lang === 'hi' ? 'आधिकारिक विज्ञप्ति' : 'Official Press Bulletin'}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">
                    {lang === 'hi' 
                      ? 'बिहार विद्यालय परीक्षा समिति (BSEB)' 
                      : 'Bihar School Examination Board'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'hi' 
                      ? 'वार्षिक माध्यमिक (10th) एवं उच्च माध्यमिक (12th) परीक्षा के मॉडल पेपर व प्रवेश पत्र biharboardonline.bihar.gov.in पर उपलब्ध हैं।' 
                      : 'Annual secondary and senior secondary model papers and credentials are hosted on the state portal.'}
                  </p>
                  <a
                    href="https://biharboardonline.bihar.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-xs transition-colors"
                  >
                    <span>{t('bsebPortalNotice')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Android App / APK Download Card */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-slate-900 rounded-2xl p-5 border border-amber-300 dark:border-amber-800 space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-black text-xs">
                    <Smartphone className="w-4 h-4 text-amber-600" />
                    <span>{lang === 'hi' ? 'UPDATE BIHAR मोबाइल ऐप (APK)' : 'UPDATE BIHAR Android App (APK)'}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {lang === 'hi'
                      ? 'अपने फोन में 1-क्लिक में ऐप इंस्टॉल करें या .APK फाइल डाउनलोड करें।'
                      : 'Install the portal directly on your Android phone or download the APK package.'}
                  </p>
                  <button
                    onClick={() => setIsAppDownloadOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{lang === 'hi' ? '📲 ऐप / APK डाउनलोड करें' : '📲 Download App / APK'}</span>
                  </button>
                </div>

                {/* WhatsApp Channel Card */}
                <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>व्हाट्सएप शिक्षा अलर्ट (WhatsApp Alerts)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    बिहार बोर्ड, रिजल्ट और छात्रवृत्ति की महत्वपूर्ण सूचनाएं सीधे अपने व्हाट्सएप पर प्राप्त करें।
                  </p>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent('UPDATE BIHAR - बिहार की शिक्षा से जुड़ी हर ताज़ा खबर सबसे पहले!')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xs transition-colors"
                  >
                    <span>व्हाट्सएप से जुड़ें</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      {/* 6. Footer Above Advertisement */}
      {settings.sections_enabled.ads && (
        <AdBanner placement="footer_above" advertisements={advertisements} />
      )}

      {/* 7. Footer */}
      <Footer
        settings={settings}
        categories={categories}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedArticle(null);
          setCurrentPage('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigatePage={handleNavigatePage}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* 8. Comprehensive Admin Control Dashboard / Separate Portal */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
        token={adminToken}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        settings={settings}
        onUpdateSettings={setSettings}
        categories={categories}
        onRefreshData={loadPortalData}
        heartbeat={heartbeat}
      />

      {/* 9. Google Sign-in / Member Sign-up Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        currentUser={currentUser}
        onGoogleSuccess={handleGoogleSuccess}
        onLogoutUser={handleLogoutUser}
      />

      {/* 10. Android App / APK Download Modal */}
      <AppDownloadModal
        isOpen={isAppDownloadOpen}
        onClose={() => setIsAppDownloadOpen(false)}
        lang={lang}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </ThemeProvider>
  );
}
