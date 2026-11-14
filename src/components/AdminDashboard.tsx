import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Edit3, Trash2, Save, RefreshCw, Upload, Video, 
  BarChart3, Settings, Shield, FileText, Image as ImageIcon, 
  Layers, Megaphone, Globe, CheckCircle, AlertCircle, LogOut,
  Download, UploadCloud, Search, Eye, ExternalLink, Inbox, Check,
  Key, UserCheck, Users, Radio, Maximize2, Minimize2, Sparkles, Smartphone, Zap, ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { 
  NewsItem, CategoryItem, SiteSettings, Advertisement, 
  NewsSource, PendingNewsItem, AnalyticsData, ContactMessage,
  RegisteredUser, HeartbeatStats
} from '../types';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  onLogin: (token: string) => void;
  onLogout: () => void;
  settings: SiteSettings;
  onUpdateSettings: (settings: SiteSettings) => void;
  categories: CategoryItem[];
  onRefreshData: () => void;
  heartbeat: HeartbeatStats;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  token,
  onLogin,
  onLogout,
  settings,
  onUpdateSettings,
  categories,
  onRefreshData,
  heartbeat
}) => {
  const { lang, t } = useLanguage();

  // Navigation tabs: dedicated 'add_news' tab requested by user
  const [activeTab, setActiveTab] = useState<
    'add_news' | 'news' | 'pending' | 'visitors' | 'profile' | 'categories' | 'settings' | 'ads' | 'seo' | 'apk' | 'messages' | 'backup'
  >('add_news');

  // Full-screen toggle
  const [isFullScreen, setIsFullScreen] = useState(true);

  // Login form state (no hardcoded credentials)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin dynamic credentials modification state
  const [currentAdminInfo, setCurrentAdminInfo] = useState<{ id: string; email: string; name: string }>({
    id: 'admin-primary',
    email: 'mdraja031126@gmail.com',
    name: 'Update Bihar Admin'
  });
  const [newAdminUserId, setNewAdminUserId] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [credentialStatus, setCredentialStatus] = useState<string | null>(null);

  // Registered Google users
  const [registeredUsersList, setRegisteredUsersList] = useState<RegisteredUser[]>([]);

  // News list and editor state
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [searchAdminNews, setSearchAdminNews] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isEditingNews, setIsEditingNews] = useState(false);
  const [currentNewsId, setCurrentNewsId] = useState<string | null>(null);

  // News form state
  const [newsForm, setNewsForm] = useState({
    title_hi: '',
    title_en: '',
    summary_hi: '',
    summary_en: '',
    body_hi: '',
    body_en: '',
    category: 'Bihar Board',
    subcategory: '',
    status: 'published' as 'published' | 'draft',
    featured: false,
    breaking: false,
    image_url: '',
    video_url: '',
    source_name: 'BSEB Official Bulletin',
    source_url: 'https://biharboardonline.bihar.gov.in/',
    is_official_verified: true,
    action_text_hi: '',
    action_url: '',
    important_date_label: '',
    important_date_val: '',
  });

  // Settings form state
  const [localSettings, setLocalSettings] = useState<SiteSettings>(settings);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Categories management state
  const [categoryList, setCategoryList] = useState<CategoryItem[]>(categories);
  const [newCatNameHi, setNewCatNameHi] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📚');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Advertisements state
  const [adList, setAdList] = useState<Advertisement[]>([]);
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdPlacement, setNewAdPlacement] = useState<'header_top' | 'sidebar' | 'in_article' | 'footer_above'>('header_top');
  const [newAdImageUrl, setNewAdImageUrl] = useState('');
  const [newAdTargetUrl, setNewAdTargetUrl] = useState('');
  const [isUploadingAdImage, setIsUploadingAdImage] = useState(false);

  // News automation and pending sources state
  const [pendingNewsList, setPendingNewsList] = useState<PendingNewsItem[]>([]);
  const [isFetchingFeeds, setIsFetchingFeeds] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Contact messages state
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Image upload handling
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    setCategoryList(categories);
  }, [categories]);

  useEffect(() => {
    if (token && isOpen) {
      loadAllAdminData();
    }
  }, [token, isOpen, activeTab]);

  const loadAllAdminData = async () => {
    if (!token) return;
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Load admin info
      const meRes = await fetch('/api/auth/me', { headers });
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.admin) {
          setCurrentAdminInfo(meData.admin);
          setNewAdminUserId(meData.admin.email);
        }
      }

      // Load all news
      const newsRes = await fetch('/api/news/all', { headers });
      if (newsRes.ok) setNewsList(await newsRes.json());

      // Load pending news
      const pendingRes = await fetch('/api/pending-news', { headers });
      if (pendingRes.ok) setPendingNewsList(await pendingRes.json());

      // Load ads
      const adsRes = await fetch('/api/ads');
      if (adsRes.ok) setAdList(await adsRes.json());

      // Load analytics
      const anaRes = await fetch('/api/analytics', { headers });
      if (anaRes.ok) setAnalytics(await anaRes.json());

      // Load users
      const usrRes = await fetch('/api/admin/users', { headers });
      if (usrRes.ok) setRegisteredUsersList(await usrRes.json());

      // Load messages
      const msgRes = await fetch('/api/contact', { headers });
      if (msgRes.ok) setMessages(await msgRes.json());
    } catch (e) {
      console.error('Error fetching admin details', e);
    }
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      onLogin(data.token);
      loadAllAdminData();
    } catch (err: any) {
      setLoginError(err.message || 'लॉगिन असफल रहा। कृपया पासवर्ड जांचें।');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Google 1-Click Login for Admin
  const handleGoogleAdminLogin = async () => {
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'mdraja031126@gmail.com',
          name: 'Md Raja (Admin)'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed');
      if (data.adminToken) {
        onLogin(data.adminToken);
        loadAllAdminData();
      } else {
        throw new Error('This Google account does not have Admin access');
      }
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Image file upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            filename: file.name,
            base64Data
          })
        });
        const data = await res.json();
        if (data.url) {
          setNewsForm(prev => ({ ...prev, image_url: data.url }));
        }
      } catch (err) {
        console.error('Upload failed', err);
      } finally {
        setIsUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save or Edit News
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const payload: any = {
      title_hi: newsForm.title_hi,
      title_en: newsForm.title_en || newsForm.title_hi,
      summary_hi: newsForm.summary_hi,
      summary_en: newsForm.summary_en || newsForm.summary_hi,
      body_hi: newsForm.body_hi,
      body_en: newsForm.body_en || newsForm.body_hi,
      category: newsForm.category,
      subcategory: newsForm.subcategory,
      status: newsForm.status,
      featured: newsForm.featured,
      breaking: newsForm.breaking,
      image_url: newsForm.image_url,
      video_url: newsForm.video_url,
      source_name: newsForm.source_name,
      source_url: newsForm.source_url,
      is_official_verified: newsForm.is_official_verified,
    };

    if (newsForm.action_text_hi && newsForm.action_url) {
      payload.action_link = {
        text_hi: newsForm.action_text_hi,
        text_en: newsForm.action_text_hi,
        url: newsForm.action_url
      };
    }

    if (newsForm.important_date_label && newsForm.important_date_val) {
      payload.important_dates = [
        { label: newsForm.important_date_label, date: newsForm.important_date_val }
      ];
    }

    try {
      const url = currentNewsId ? `/api/news/${currentNewsId}` : '/api/news';
      const method = currentNewsId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save news');

      setSaveStatus('खबर सफलतापूर्वक लाइव सुरक्षित (Save & Published) हो गई!');
      setTimeout(() => setSaveStatus(null), 3500);
      setIsEditingNews(false);
      setCurrentNewsId(null);
      resetNewsForm();
      loadAllAdminData();
      onRefreshData();
      setActiveTab('news');
    } catch (err: any) {
      setSaveStatus('त्रुटि: ' + err.message);
    }
  };

  const handleEditNewsClick = (item: NewsItem) => {
    setCurrentNewsId(item.id);
    setNewsForm({
      title_hi: item.title_hi,
      title_en: item.title_en,
      summary_hi: item.summary_hi,
      summary_en: item.summary_en,
      body_hi: item.body_hi,
      body_en: item.body_en,
      category: item.category,
      subcategory: item.subcategory || '',
      status: item.status === 'archived' ? 'draft' : item.status,
      featured: item.featured,
      breaking: item.breaking,
      image_url: item.image_url || '',
      video_url: item.video_url || '',
      source_name: item.source_name,
      source_url: item.source_url || '',
      is_official_verified: item.is_official_verified,
      action_text_hi: item.action_link?.text_hi || '',
      action_url: item.action_link?.url || '',
      important_date_label: item.important_dates?.[0]?.label || '',
      important_date_val: item.important_dates?.[0]?.date || '',
    });
    setIsEditingNews(true);
    setActiveTab('add_news');
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('क्या आप निश्चित रूप से इस खबर को हटाना चाहते हैं?')) return;
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadAllAdminData();
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetNewsForm = () => {
    setCurrentNewsId(null);
    setIsEditingNews(false);
    setNewsForm({
      title_hi: '',
      title_en: '',
      summary_hi: '',
      summary_en: '',
      body_hi: '',
      body_en: '',
      category: 'Bihar Board',
      subcategory: '',
      status: 'published',
      featured: false,
      breaking: false,
      image_url: '',
      video_url: '',
      source_name: 'BSEB Official Bulletin',
      source_url: 'https://biharboardonline.bihar.gov.in/',
      is_official_verified: true,
      action_text_hi: '',
      action_url: '',
      important_date_label: '',
      important_date_val: '',
    });
  };

  // Change Admin User ID & Password
  const handleUpdateAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialStatus(null);
    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newEmail: newAdminUserId,
          newPassword: newAdminPassword || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setCredentialStatus('एडमिन यूजर आईडी / ईमेल और पासवर्ड सफलतापूर्वक बदल दिए गए!');
      setCurrentAdminInfo(data.admin);
      setNewAdminPassword('');
      setTimeout(() => setCredentialStatus(null), 4000);
    } catch (err: any) {
      setCredentialStatus('त्रुटि: ' + err.message);
    }
  };

  // Automation / Sources Fetch
  const handleFetchOfficialFeeds = async () => {
    setIsFetchingFeeds(true);
    try {
      const res = await fetch('/api/sources/fetch', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadAllAdminData();
        setSaveStatus('आधिकारिक सूत्रों (BSEB / Medhasoft / BPSC) से ताज़ा नोटिस प्राप्त हुए!');
        setTimeout(() => setSaveStatus(null), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingFeeds(false);
    }
  };

  const handleApprovePending = async (id: string) => {
    try {
      const res = await fetch(`/api/pending-news/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadAllAdminData();
        onRefreshData();
        setSaveStatus('खबर स्वीकृत होकर होमपेज पर प्रकाशित हो गई!');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectPending = async (id: string) => {
    try {
      const res = await fetch(`/api/pending-news/${id}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Ad Active
  const handleToggleAd = async (ad: Advertisement) => {
    try {
      const res = await fetch(`/api/ads/${ad.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: !ad.active })
      });
      if (res.ok) {
        loadAllAdminData();
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create New Custom Ad
  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdTitle.trim() || !newAdImageUrl.trim() || !newAdTargetUrl.trim()) return;
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newAdTitle.trim(),
          placement: newAdPlacement,
          image_url: newAdImageUrl.trim(),
          target_url: newAdTargetUrl.trim(),
          alt_text: newAdTitle.trim(),
          active: true
        })
      });
      if (res.ok) {
        setNewAdTitle('');
        setNewAdImageUrl('');
        setNewAdTargetUrl('');
        loadAllAdminData();
        onRefreshData();
        setSaveStatus('नया विज्ञापन सफलतापूर्वक जोड़ दिया गया!');
        setTimeout(() => setSaveStatus(null), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Custom Ad
  const handleDeleteAd = async (id: string) => {
    try {
      const res = await fetch(`/api/ads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadAllAdminData();
        onRefreshData();
        setSaveStatus('विज्ञापन हटा दिया गया।');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Upload Ad Banner Image
  const handleAdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAdImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ filename: file.name, base64Data: reader.result as string })
        });
        const data = await res.json();
        if (res.ok && data.url) {
          setNewAdImageUrl(data.url);
        }
      } finally {
        setIsUploadingAdImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Settings & SEO
  const handleSaveSettings = async (customSettings?: Partial<SiteSettings>) => {
    const payload = customSettings ? { ...localSettings, ...customSettings } : localSettings;
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setLocalSettings(updated);
        onUpdateSettings(updated);
        setSaveStatus('सेटिंग्स व SEO सफलतापूर्वक अपडेट हो गए!');
        setTimeout(() => setSaveStatus(null), 3500);
      }
    } catch (err: any) {
      setSaveStatus('त्रुटि: ' + err.message);
    }
  };

  // Backup Export
  const handleDownloadBackup = () => {
    window.open('/api/backup/export', '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center ${
      isFullScreen ? 'p-0' : 'p-2 sm:p-4'
    }`}>
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-2xl transition-all ${
        isFullScreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl max-h-[92vh] rounded-3xl'
      }`}>
        {/* Top Header Bar */}
        <div className="bg-[#0B1B3D] text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg tracking-tight">
                  UPDATE BIHAR — एडमिन पोर्टल (Admin Portal)
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE DATABASE
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                रियल-टाइम समाचार प्रकाशन, लाइव पाठक गणना एवं एडमिन क्रेडेंशियल कंट्रोल
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real-time Online Pill on Admin Bar */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{heartbeat.onlineNow} लाइव पाठक</span>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {token && (
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">लॉगआउट</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Save Alert */}
        {saveStatus && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 flex items-center gap-2 shadow-xs">
            <CheckCircle className="w-4 h-4" />
            <span>{saveStatus}</span>
          </div>
        )}

        {/* State A: Login Panel */}
        {!token ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
            <div className="bg-white dark:bg-slate-900 max-w-md w-full p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 mx-auto flex items-center justify-center shadow-md">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  एडमिन पोर्टल लॉगिन (Admin Login)
                </h3>
                <p className="text-xs text-slate-500">
                  अपना यूजर आईडी और पासवर्ड दर्ज करें।
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-300 text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Standard Admin Login Form (No private account exposure) */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email / Admin User ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="अपना एडमिन ईमेल या यूजर आईडी दर्ज करें"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Password (पासवर्ड)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="पासवर्ड दर्ज करें"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-md transition-colors"
                >
                  {isLoggingIn ? 'प्रमाणीकरण हो रहा है...' : 'Admin Portal में प्रवेश करें'}
                </button>
              </form>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl text-[11px] text-slate-500 text-center">
                🔒 केवल अधिकृत व्यवस्थापक (Admin) ही इस पोर्टल में प्रवेश कर सकते हैं।
              </div>
            </div>
          </div>
        ) : (
          /* State B: Authenticated Admin Portal */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-3 space-y-1 overflow-x-auto md:overflow-y-auto flex md:flex-col flex-shrink-0">
              {/* REQUESTED: Standalone Add News Option */}
              <button
                onClick={() => { resetNewsForm(); setActiveTab('add_news'); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition-all shadow-xs ${
                  activeTab === 'add_news'
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>✚ नई खबर जोड़ें (Add News)</span>
              </button>

              <button
                onClick={() => setActiveTab('news')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'news'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-850'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>सभी खबरें ({newsList.length})</span>
              </button>

              {/* REQUESTED: Real-time Live Visitors & Connected Members */}
              <button
                onClick={() => setActiveTab('visitors')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                  activeTab === 'visitors'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-850'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>लाइव पाठक व सदस्य</span>
                </span>
                <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                  {heartbeat.onlineNow}
                </span>
              </button>

              {/* REQUESTED: User ID and Password Changer */}
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-850'
                }`}
              >
                <Key className="w-4 h-4 text-amber-500" />
                <span>यूजर ID व पासवर्ड बदलें</span>
              </button>

              <button
                onClick={() => setActiveTab('pending')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-850'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <RefreshCw className="w-4 h-4" />
                  <span>ऑटोमेशन समीक्षा</span>
                </span>
                {pendingNewsList.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {pendingNewsList.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'categories'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-850'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>श्रेणियां ({categories.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-850'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>वेबसाइट सेटिंग्स व थीम</span>
              </button>

              <button
                onClick={() => setActiveTab('ads')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'ads'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-850'
                }`}
              >
                <Megaphone className="w-4 h-4 text-amber-500" />
                <span>विज्ञापन व AdSense कमाई</span>
              </button>

              <button
                onClick={() => setActiveTab('apk')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'apk'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-850'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span>Android ऐप / APK बनाएं</span>
              </button>

              <button
                onClick={() => setActiveTab('seo')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'seo'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-850'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Google SEO व साइटमैप</span>
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                  activeTab === 'messages'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-850'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4" />
                  <span>छात्र संदेश ({messages.length})</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab('backup')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'backup'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-850'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>डेटाबेस बैकअप (JSON)</span>
              </button>
            </div>

            {/* Main Tab View */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white dark:bg-slate-900">
              {/* TAB: DEDICATED ADD NEWS FORM (Requested specifically by user) */}
              {activeTab === 'add_news' && (
                <form onSubmit={handleSaveNews} className="space-y-5 max-w-4xl mx-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-500" />
                        <span>{isEditingNews ? 'खबर संपादित करें (Edit News)' : 'अपनी नई खबर जोड़ें व प्रकाशित करें'}</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        फोटो, शीर्षक, विवरण और आधिकारिक लिंक डालकर तुरंत लाइव करें।
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={resetNewsForm}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                    >
                      फ़ॉर्म साफ़ करें (Reset)
                    </button>
                  </div>

                  {/* Title Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        खबर का मुख्य शीर्षक (हिन्दी) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. बिहार बोर्ड मैट्रिक वार्षिक परीक्षा 2026 डमी एडमिट कार्ड जारी"
                        value={newsForm.title_hi}
                        onChange={(e) => setNewsForm({ ...newsForm, title_hi: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Title (English) (वैकल्पिक)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bihar Board Matric Exam 2026 Dummy Admit Card Out"
                        value={newsForm.title_en}
                        onChange={(e) => setNewsForm({ ...newsForm, title_en: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Category, Status & Pinned */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        श्रेणी (Category) *
                      </label>
                      <select
                        value={newsForm.category}
                        onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-bold"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.name_en}>{c.icon} {c.name_hi}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        प्रकाशन स्थिति *
                      </label>
                      <select
                        value={newsForm.status}
                        onChange={(e) => setNewsForm({ ...newsForm, status: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-emerald-600"
                      >
                        <option value="published">🟢 तुरंत लाइव प्रकाशित करें</option>
                        <option value="draft">🟡 ड्राफ्ट में रखें (Draft)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="chkFeatured"
                        checked={newsForm.featured}
                        onChange={(e) => setNewsForm({ ...newsForm, featured: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <label htmlFor="chkFeatured" className="text-xs font-bold cursor-pointer text-slate-800 dark:text-slate-200">
                        ⭐ मुख्य खबर (Featured)
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="chkBreaking"
                        checked={newsForm.breaking}
                        onChange={(e) => setNewsForm({ ...newsForm, breaking: e.target.checked })}
                        className="w-4 h-4 text-red-600 rounded"
                      />
                      <label htmlFor="chkBreaking" className="text-xs font-black cursor-pointer text-red-600">
                        🔴 ब्रेकिंग टिकर में डालें
                      </label>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      संक्षिप्त परिचय (Summary) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="खबर की 2 लाइनों में मुख्य बात..."
                      value={newsForm.summary_hi}
                      onChange={(e) => setNewsForm({ ...newsForm, summary_hi: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                  </div>

                  {/* Body Content */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      पूरी खबर (Full Article Details) *
                    </label>
                    <textarea
                      rows={6}
                      required
                      placeholder="विस्तारपूर्वक विवरण, दिशानिर्देश और सूचना यहाँ लिखें..."
                      value={newsForm.body_hi}
                      onChange={(e) => setNewsForm({ ...newsForm, body_hi: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                  </div>

                  {/* Photo & Video Upload */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span>फोटो और वीडियो जोड़ें (Media Upload)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          डिवाइस से फ़ोटो अपलोड करें या Image URL दें
                        </label>
                        <div className="space-y-2">
                          <input
                            type="url"
                            placeholder="https://..."
                            value={newsForm.image_url}
                            onChange={(e) => setNewsForm({ ...newsForm, image_url: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border rounded-lg"
                          />
                          <div className="flex items-center gap-2">
                            <label className="cursor-pointer px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isUploadingImage ? 'अपलोड हो रहा है...' : 'गैलरी/फ़ाइल से फोटो चुनें'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageFileUpload}
                                className="hidden"
                              />
                            </label>
                            {newsForm.image_url && (
                              <span className="text-xs text-emerald-600 font-bold">✓ फोटो संलग्न है</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          YouTube Video Embed Link (वैकल्पिक)
                        </label>
                        <input
                          type="url"
                          placeholder="https://www.youtube.com/embed/..."
                          value={newsForm.video_url}
                          onChange={(e) => setNewsForm({ ...newsForm, video_url: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Official Source & Action Link */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        आधिकारिक स्रोत का नाम
                      </label>
                      <input
                        type="text"
                        value={newsForm.source_name}
                        onChange={(e) => setNewsForm({ ...newsForm, source_name: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        आधिकारिक वेबसाइट URL
                      </label>
                      <input
                        type="url"
                        value={newsForm.source_url}
                        onChange={(e) => setNewsForm({ ...newsForm, source_url: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Important Dates & Direct Download link */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          तिथि का नाम
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. अंतिम तिथि"
                          value={newsForm.important_date_label}
                          onChange={(e) => setNewsForm({ ...newsForm, important_date_label: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          तारीख
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 15 नवंबर 2026"
                          value={newsForm.important_date_val}
                          onChange={(e) => setNewsForm({ ...newsForm, important_date_val: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        डायरेक्ट डाउनलोड / आवेदन लिंक (URL)
                      </label>
                      <input
                        type="url"
                        placeholder="https://biharboardonline.bihar.gov.in/..."
                        value={newsForm.action_url}
                        onChange={(e) => setNewsForm({ ...newsForm, action_url: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg transition-transform hover:-translate-y-0.5"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>{isEditingNews ? 'संशोधन सुरक्षित करें' : 'तुरंत खबर प्रकाशित करें (Publish Live)'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB: REAL-TIME VISITORS & MEMBERS (Requested by user) */}
              {activeTab === 'visitors' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-500" />
                      <span>वेबसाइट दर्शक एवं जुड़े हुए छात्र (Live Visitors & Members)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      देखें कि अभी वेबसाइट पर कितने लोग जुड़े हैं और कुल कितने लोग जुड़े थे।
                    </p>
                  </div>

                  {/* 3 Real-time Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 shadow-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          अभी लाइव जुड़े हैं (Online Right Now)
                        </span>
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                      </div>
                      <div className="text-3xl font-black text-emerald-900 dark:text-white">
                        {heartbeat.onlineNow}
                      </div>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        सक्रिय पाठक अभी खबरें पढ़ रहे हैं।
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 shadow-sm space-y-1">
                      <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
                        कुल कितने लोग जुड़े थे (Total Ever Visited)
                      </span>
                      <div className="text-3xl font-black text-blue-900 dark:text-white">
                        {heartbeat.totalEver.toLocaleString('en-IN')}
                      </div>
                      <p className="text-[11px] text-blue-700 dark:text-blue-400">
                        वेबसाइट पर आए कुल अनूठे पाठक।
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 shadow-sm space-y-1">
                      <span className="text-xs font-bold text-purple-800 dark:text-purple-300">
                        Google से जुड़े पंजीकृत सदस्य
                      </span>
                      <div className="text-3xl font-black text-purple-900 dark:text-white">
                        {registeredUsersList.length}
                      </div>
                      <p className="text-[11px] text-purple-700 dark:text-purple-400">
                        सत्यापित Google खाते से जुड़े छात्र।
                      </p>
                    </div>
                  </div>

                  {/* Registered Users Table */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs uppercase text-slate-700 dark:text-slate-300">
                      जुड़े हुए सदस्यों की सूची (Registered Community):
                    </h4>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-bold">
                          <tr>
                            <th className="p-3">सदस्य (Member)</th>
                            <th className="p-3">ईमेल आईडी</th>
                            <th className="p-3">साइनअप माध्यम</th>
                            <th className="p-3">जुड़ने का समय</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {registeredUsersList.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                              <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <img
                                  src={u.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
                                  alt={u.name}
                                  className="w-6 h-6 rounded-full"
                                />
                                <span>{u.name}</span>
                              </td>
                              <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                                {u.email}
                              </td>
                              <td className="p-3">
                                <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-bold">
                                  Google Account
                                </span>
                              </td>
                              <td className="p-3 text-slate-400">
                                {new Date(u.joined_at).toLocaleDateString('hi-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CHANGE USER ID & PASSWORD (Requested by user) */}
              {activeTab === 'profile' && (
                <div className="max-w-md mx-auto space-y-6">
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Key className="w-5 h-5 text-amber-500" />
                      <span>एडमिन यूजर ID और पासवर्ड बदलें</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      आप जब चाहें तब अपना यूजर आईडी (Email) और पासवर्ड यहाँ से बदल सकते हैं।
                    </p>
                  </div>

                  {credentialStatus && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{credentialStatus}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateAdminCredentials} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        वर्तमान में सेट यूजर आईडी:
                      </label>
                      <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 p-2 bg-white dark:bg-slate-900 rounded-lg border">
                        {currentAdminInfo.email}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        नई यूजर आईडी / ईमेल (New User ID / Email)
                      </label>
                      <input
                        type="text"
                        required
                        value={newAdminUserId}
                        onChange={(e) => setNewAdminUserId(e.target.value)}
                        placeholder="e.g. mdraja031126@gmail.com या apna_naam"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        नया पासवर्ड (New Password)
                      </label>
                      <input
                        type="password"
                        placeholder="नया पासवर्ड दर्ज करें (खाली छोड़ने पर पुराना रहेगा)"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition-colors"
                    >
                      क्रेडेंशियल अपडेट करें (Save Credentials)
                    </button>
                  </form>
                </div>
              )}

              {/* TAB: NEWS LIST */}
              {activeTab === 'news' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        प्रकाशित खबरें ({newsList.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        अपनी सभी खबरों को देखें, एडिट करें या डिलीट करें।
                      </p>
                    </div>

                    <button
                      onClick={() => { resetNewsForm(); setActiveTab('add_news'); }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ नई खबर जोड़ें</span>
                    </button>
                  </div>

                  {/* Filter Search */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="खबर खोजें..."
                        value={searchAdminNews}
                        onChange={(e) => setSearchAdminNews(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>

                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    >
                      <option value="all">सभी श्रेणियां</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name_en}>{c.name_hi}</option>
                      ))}
                    </select>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold uppercase">
                        <tr>
                          <th className="p-3">शीर्षक</th>
                          <th className="p-3 hidden sm:table-cell">श्रेणी</th>
                          <th className="p-3">स्थिति</th>
                          <th className="p-3 hidden md:table-cell">व्यूज</th>
                          <th className="p-3 text-right">कार्रवाई</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {newsList
                          .filter(n => {
                            const matchQ = !searchAdminNews || (n.title_hi + n.title_en).toLowerCase().includes(searchAdminNews.toLowerCase());
                            const matchC = filterCategory === 'all' || n.category.toLowerCase() === filterCategory.toLowerCase();
                            return matchQ && matchC;
                          })
                          .map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                              <td className="p-3 max-w-xs sm:max-w-md truncate font-bold text-slate-900 dark:text-white">
                                {item.title_hi || item.title_en}
                                <div className="text-[10px] text-slate-400 font-normal">
                                  {new Date(item.created_at).toLocaleDateString('hi-IN')} {item.breaking ? '• 🔴 ब्रेकिंग' : ''} {item.featured ? '• ⭐ प्रमुख' : ''}
                                </div>
                              </td>
                              <td className="p-3 hidden sm:table-cell">
                                <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 px-2 py-0.5 rounded text-[11px] font-bold">
                                  {item.category}
                                </span>
                              </td>
                              <td className="p-3 font-bold text-[10px] uppercase">
                                <span className={item.status === 'published' ? 'text-emerald-600' : 'text-amber-600'}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="p-3 hidden md:table-cell font-mono text-slate-500">
                                {item.views}
                              </td>
                              <td className="p-3 text-right space-x-1 whitespace-nowrap">
                                <button
                                  onClick={() => handleEditNewsClick(item)}
                                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                                  title="Edit"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteNews(item.id)}
                                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: AUTOMATION & SOURCES */}
              {activeTab === 'pending' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        आधिकारिक स्रोतों से ऑटोमेशन (Automation & Feeds)
                      </h3>
                      <p className="text-xs text-slate-500">
                        BSEB, Medhasoft और BPSC के ताज़ा नोटिस स्वतः प्राप्त करें।
                      </p>
                    </div>

                    <button
                      onClick={handleFetchOfficialFeeds}
                      disabled={isFetchingFeeds}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md"
                    >
                      <RefreshCw className={`w-4 h-4 ${isFetchingFeeds ? 'animate-spin' : ''}`} />
                      <span>{isFetchingFeeds ? 'जांच हो रही है...' : 'आधिकारिक स्रोतों से ताज़ा अपडेट लाएं'}</span>
                    </button>
                  </div>

                  {pendingNewsList.length === 0 ? (
                    <div className="p-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-3xl border">
                      कोई लंबित खबर नहीं है। ऊपर दिए गए बटन से नए अपडेट प्राप्त करें।
                    </div>
                  ) : (
                    pendingNewsList.map(item => (
                      <div key={item.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-amber-300 dark:border-amber-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                          <span className="text-slate-400">
                            प्राप्त: {new Date(item.fetched_at).toLocaleTimeString('hi-IN')}
                          </span>
                        </div>
                        <h5 className="font-black text-sm text-slate-900 dark:text-white">
                          {item.title}
                        </h5>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {item.summary}
                        </p>
                        <div className="text-[11px] text-slate-400">
                          स्रोत: {item.source_name} ({item.source_url})
                        </div>
                        <div className="pt-2 border-t flex justify-end gap-2">
                          <button
                            onClick={() => handleRejectPending(item.id)}
                            className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg"
                          >
                            खारिज करें
                          </button>
                          <button
                            onClick={() => handleApprovePending(item.id)}
                            className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-xs"
                          >
                            स्वीकृत कर प्रकाशित करें
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB: CATEGORIES */}
              {activeTab === 'categories' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
                    श्रेणी प्रबंधन (Category Management)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {categoryList.map(cat => (
                      <div key={cat.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{cat.icon}</span>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white">{cat.name_hi}</div>
                            <div className="text-[10px] text-slate-400">{cat.name_en}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: SETTINGS & ADS & BACKUP */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white pb-3 border-b">
                    वेबसाइट सेटिंग्स (Website Customization)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">वेबसाइट नाम (हिन्दी)</label>
                      <input
                        type="text"
                        value={localSettings.site_name_hi}
                        onChange={(e) => setLocalSettings({ ...localSettings, site_name_hi: e.target.value })}
                        className="w-full px-3 py-2 text-xs border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Tagline</label>
                      <input
                        type="text"
                        value={localSettings.tagline_hi}
                        onChange={(e) => setLocalSettings({ ...localSettings, tagline_hi: e.target.value })}
                        className="w-full px-3 py-2 text-xs border rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ads' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-amber-500" />
                      <span>विज्ञापन एवं Google AdSense कमाई प्रबंधन (Ads &amp; Monetization)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      वेबसाइट लाइव होने के बाद यहाँ से Google AdSense या अपने स्पॉन्सर/कोचिंग बैनर विज्ञापन लगाएं।
                    </p>
                  </div>

                  {/* Section 1: Google AdSense Setup */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-300 dark:border-emerald-800 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="font-black text-sm text-emerald-900 dark:text-emerald-300">
                          💰 1. Google AdSense ऑटोमैटिक विज्ञापन (कमाई शुरू करें)
                        </h4>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                          Google AdSense से स्वीकृति मिलने के बाद बस अपना Publisher ID (ca-pub-...) यहाँ डालें।
                        </p>
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-700">
                        <input
                          type="checkbox"
                          checked={!!localSettings.google_adsense_enabled}
                          onChange={(e) => setLocalSettings({ ...localSettings, google_adsense_enabled: e.target.checked })}
                          className="w-4 h-4 accent-emerald-600"
                        />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          AdSense चालू करें
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Google AdSense Publisher ID
                        </label>
                        <input
                          type="text"
                          placeholder="ca-pub-1234567890123456"
                          value={localSettings.google_adsense_client_id || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, google_adsense_client_id: e.target.value })}
                          className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSaveSettings()}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Save className="w-4 h-4" />
                        <span>AdSense सेव करें</span>
                      </button>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                      <div className="font-black text-emerald-700 dark:text-emerald-400">
                        📌 AdSense से विज्ञापन कैसे लगाएं (Step-by-Step Guide):
                      </div>
                      <p>1. वेबसाइट पर कम से कम <strong>15 से 25 असली शिक्षा खबरें</strong> प्रकाशित करें। (About, Contact, Privacy, Disclaimer पेज पहले से बने हैं।)</p>
                      <p>2. <strong>google.com/adsense</strong> पर जाएं, अपनी वेबसाइट का लिंक डालें और Auto Ads चालू करें।</p>
                      <p>3. AdSense से मिला <code>ca-pub-XXXXXXXXXXXX</code> नंबर ऊपर बॉक्स में डालकर सेव करें — पूरे पोर्टल पर Google Ads अपने-आप चलने लगेंगे!</p>
                    </div>
                  </div>

                  {/* Section 2: Add Custom Direct Sponsor / Coaching Banner Ad */}
                  <form onSubmit={handleCreateAd} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-4">
                    <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-blue-600" />
                      <span>2. अपना कस्टम / डायरेक्ट स्पॉन्सर बैनर विज्ञापन जोड़ें (No Approval Needed)</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">विज्ञापन का नाम / शीर्षक (Ad Title)*</label>
                        <input
                          type="text"
                          required
                          placeholder="जैसे: पटना सुपर-30 एडमिशन 2026"
                          value={newAdTitle}
                          onChange={(e) => setNewAdTitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">कहाँ दिखाना है (Placement)*</label>
                        <select
                          value={newAdPlacement}
                          onChange={(e) => setNewAdPlacement(e.target.value as Advertisement['placement'])}
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                        >
                          <option value="header_top">सबसे ऊपर हेडर बैनर (Header Top)</option>
                          <option value="sidebar">दाईं तरफ साइडबार (Sidebar)</option>
                          <option value="in_article">खबर के बीच में (In-Article)</option>
                          <option value="footer_above">फुटर के ऊपर (Footer Above)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">बैनर फोटो URL या अपलोड करें*</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder="https://... या बगल से फोटो चुनें"
                            value={newAdImageUrl}
                            onChange={(e) => setNewAdImageUrl(e.target.value)}
                            className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                          />
                          <label className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer hover:bg-blue-500 flex items-center gap-1 flex-shrink-0">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isUploadingAdImage ? '...' : 'अपलोड'}</span>
                            <input type="file" accept="image/*" onChange={handleAdImageUpload} className="hidden" />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">क्लिक करने पर खुलने वाला लिंक (Target URL)*</label>
                        <input
                          type="url"
                          required
                          placeholder="https://example.com"
                          value={newAdTargetUrl}
                          onChange={(e) => setNewAdTargetUrl(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>नया बैनर विज्ञापन लाइव करें</span>
                    </button>
                  </form>

                  {/* Section 3: Existing Ads List */}
                  <div className="space-y-2.5">
                    <h4 className="font-black text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      सक्रिय व सेव किए गए विज्ञापन ({adList.length})
                    </h4>
                    {adList.map(ad => (
                      <div key={ad.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img src={ad.image_url} alt={ad.title} className="w-20 h-12 object-cover rounded-lg border" />
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white">{ad.title}</div>
                            <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold">
                                {ad.placement}
                              </span>
                              <span>Clicks: <strong>{ad.clicks}</strong></span>
                              <span>Views: <strong>{ad.impressions}</strong></span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleAd(ad)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${ad.active ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                          >
                            {ad.active ? 'Active' : 'Paused'}
                          </button>
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                            title="विज्ञापन हटाएं"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: ANDROID APP / APK DOWNLOAD & GENERATION */}
              {activeTab === 'apk' && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-emerald-500" />
                      <span>Android मोबाइल ऐप व .APK फाइल निर्माण (APK Generator)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      आपकी वेबसाइट पहले से ही PWA (Progressive Web App) मानकों पर 100% तैयार है।
                    </p>
                  </div>

                  {/* PWA Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span>Web Manifest तैयार ✅</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span>Service Worker सक्रिय ✅</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span>HD App Icons (512px) ✅</span>
                    </div>
                  </div>

                  {/* 1-Click PWABuilder APK Generator */}
                  <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3">
                    <div className="flex items-center gap-2 font-black text-sm text-amber-900 dark:text-amber-300">
                      <Zap className="w-5 h-5 text-amber-600" />
                      <span>1-क्लिक में साइन की हुई .APK फाइल डाउनलोड करें (PWABuilder)</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      नीचे दिए गए बटन पर क्लिक करते ही Google व Microsoft का आधिकारिक <strong>PWABuilder</strong> टूल आपकी वेबसाइट का विश्लेषण करेगा और Play Store व WhatsApp पर शेयर करने लायक असली <strong>.APK</strong> पैकेज डाउनलोड के लिए तैयार कर देगा।
                    </p>
                    <a
                      href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(window.location.origin)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-md transition-all"
                    >
                      <span>📦 PWABuilder से .APK बनाएं व डाउनलोड करें ↗</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Direct Downloadable Android Studio / TWA Source ZIP */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
                      <Download className="w-5 h-5 text-blue-600" />
                      <span>सीधा डाउनलोड: Android Studio / TWA APK प्रोजेक्ट किट (.ZIP)</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      यदि आप खुद Android Studio या Bubblewrap CLI से कस्टम .apk कम्पाइल करना चाहते हैं, तो पूरा रेडीमेड सोर्स कोड पैकेज (.zip) यहाँ से सीधे डाउनलोड करें (इसमें आपका लाइव URL पहले से सेट है)।
                    </p>
                    <a
                      href="/api/android/download-source"
                      download="update-bihar-android-apk-kit.zip"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-black text-xs shadow-md transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>📥 update-bihar-android-apk-kit.zip डाउनलोड करें</span>
                    </a>
                  </div>
                </div>
              )}

              {/* TAB: GOOGLE SEARCH CONSOLE & SEO MANAGEMENT */}
              {activeTab === 'seo' && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-600" />
                      <span>Google सर्च एवं SEO प्रबंधन (Google Search Console & SEO)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      गूगल सर्च इंजन में वेबसाइट को इंडेक्स कराएं और मेटा टैग्स नियंत्रित करें।
                    </p>
                  </div>

                  {/* Why website doesn't show immediately on Google Guide */}
                  <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-sm">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>गूगल सर्च व Ownership Verification के लिए जरूरी जानकारी (Important)</span>
                    </div>
                    <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                      <strong>⚠️ ध्यान दें:</strong> यदि आप <code>ais-pre-...run.app</code> या <code>ais-dev-...run.app</code> लिंक को Google Search Console में डाल रहे हैं, तो <strong>Ownership Failed</strong> दिखेगा क्योंकि यह AI Studio का प्रीव्यू सर्वर है जिसके आगे <code>/__cookie_check</code> सुरक्षा गेट लगा होता है। Googlebot केवल <strong>पब्लिक होस्टिंग (Public Cloud Run / Render / Railway)</strong> या आपके <strong>कस्टम डोमेन (जैसे updatebihar.in)</strong> को ही Verify और Index करता है।
                    </p>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                      <div className="font-black text-blue-600 dark:text-blue-400">
                        🚀 पब्लिक वेबसाइट लाइव होने के बाद गूगल में जोड़ने के 4 चरण:
                      </div>
                      <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
                        <li>
                          अपने कोड को पब्लिक सर्वर (Render / Railway / Public Cloud Run) व अपने डोमेन (जैसे <code>updatebihar.in</code>) पर Deploy करें।
                        </li>
                        <li>
                          <a
                            href="https://search.google.com/search-console"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-blue-600 underline inline-flex items-center gap-1"
                          >
                            <span>Google Search Console खोलें ↗</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          {' '}और अपना पब्लिक डोमेन/URL डालें।
                        </li>
                        <li>
                          सत्यापन (Verification) के लिए <strong>HTML Tag</strong> चुनें, उस कोड को नीचे दिए गए <em>Google Site Verification Code</em> बॉक्स में पेस्ट करके सेव करें और <strong>Verify</strong> दबाएं।
                        </li>
                        <li>
                          Search Console के <strong>Sitemaps</strong> में <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono font-bold">sitemap.xml</code> व <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono font-bold">news-sitemap.xml</code> सबमिट करें।
                        </li>
                      </ol>
                    </div>
                  </div>

                  {/* Live Sitemap Links */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      लाइव साइटमैप व क्रॉलर लिंक (Googlebot Ready XML Sitemaps):
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <a
                        href="/sitemap.xml"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border hover:border-blue-500 transition-colors flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
                      >
                        <span>📄 General Sitemap</span>
                        <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                      </a>
                      <a
                        href="/news-sitemap.xml"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border hover:border-blue-500 transition-colors flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
                      >
                        <span>📰 Google News Sitemap</span>
                        <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                      </a>
                      <a
                        href="/robots.txt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border hover:border-blue-500 transition-colors flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
                      >
                        <span>🤖 Robots.txt</span>
                        <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                      </a>
                    </div>
                  </div>

                  {/* SEO Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveSettings();
                    }}
                    className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Google Search Console Verification Code (गूगल वेरिफिकेशन कोड)
                      </label>
                      <input
                        type="text"
                        placeholder="जैसे: google-site-verification कोड या HTML Tag की content वैल्यू"
                        value={localSettings.google_site_verification || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, google_site_verification: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        गूगल सर्च कंसोल से मिला HTML टैग कोड यहाँ डालें। यह स्वतः वेबसाइट के हेड में जुड़ जाएगा।
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Google SEO Title (सर्च में दिखने वाला मुख्य शीर्षक)
                      </label>
                      <input
                        type="text"
                        value={localSettings.seo_title}
                        onChange={(e) => setLocalSettings({ ...localSettings, seo_title: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Google SEO Description (गूगल सर्च स्निपेट विवरण)
                      </label>
                      <textarea
                        rows={3}
                        value={localSettings.seo_description}
                        onChange={(e) => setLocalSettings({ ...localSettings, seo_description: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        SEO Keywords (कीवर्ड्स — अल्पविराम से अलग करें)
                      </label>
                      <input
                        type="text"
                        value={localSettings.seo_keywords}
                        onChange={(e) => setLocalSettings({ ...localSettings, seo_keywords: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>SEO सेटिंग्स सुरक्षित करें (Save SEO Settings)</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB: CONTACT MESSAGES */}
              {activeTab === 'messages' && (
                <div className="space-y-4">
                  <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        पाठकों के संदेश (Reader Inquiries)
                      </h3>
                      <p className="text-xs text-slate-500">
                        पाठकों द्वारा Contact Us फॉर्म के माध्यम से भेजे गए संदेश।
                      </p>
                    </div>
                  </div>

                  {messages.length === 0 ? (
                    <div className="p-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-3xl border">
                      अभी कोई नया संदेश प्राप्त नहीं हुआ है।
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map(msg => (
                        <div key={msg.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-blue-600">{msg.name}</span>
                            <span className="text-slate-400">{new Date(msg.created_at).toLocaleDateString('hi-IN')}</span>
                          </div>
                          <div className="text-xs font-mono text-slate-500">{msg.email} • {msg.phone || 'No phone'}</div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{msg.subject}</div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border">
                            {msg.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'backup' && (
                <div className="space-y-4 max-w-md mx-auto">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white pb-3 border-b">
                    डेटाबेस बैकअप (Database JSON Export)
                  </h3>
                  <button
                    onClick={handleDownloadBackup}
                    className="w-full py-3 rounded-2xl bg-blue-600 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>संपूर्ण बैकअप फ़ाइल डाउनलोड करें (.json)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
