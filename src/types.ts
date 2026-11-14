export interface NewsItem {
  id: string;
  title_hi: string;
  title_en: string;
  summary_hi: string;
  summary_en: string;
  body_hi: string;
  body_en: string;
  category: string;
  subcategory?: string;
  status: 'published' | 'draft' | 'archived';
  featured: boolean;
  breaking: boolean;
  image_url: string;
  video_url?: string;
  source_name: string;
  source_url: string;
  is_official_verified: boolean;
  views: number;
  important_dates?: { label: string; date: string }[];
  action_link?: { text_hi: string; text_en: string; url: string };
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface PendingNewsItem {
  id: string;
  title: string;
  summary: string;
  source_name: string;
  source_url: string;
  category: string;
  fetched_at: string;
  raw_content?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface CategoryItem {
  id: string;
  name_hi: string;
  name_en: string;
  slug: string;
  icon: string;
  description_hi?: string;
  description_en?: string;
  order: number;
}

export interface SiteSettings {
  site_name_hi: string;
  site_name_en: string;
  tagline_hi: string;
  tagline_en: string;
  logo_url: string;
  primary_color: string;
  accent_color: string;
  ticker_text_hi: string;
  ticker_text_en: string;
  ticker_enabled: boolean;
  ticker_speed: number;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  office_address_hi: string;
  office_address_en: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  google_site_verification?: string;
  google_adsense_client_id?: string;
  google_adsense_enabled?: boolean;
  about_text_hi: string;
  about_text_en: string;
  privacy_policy_hi: string;
  privacy_policy_en: string;
  disclaimer_hi: string;
  disclaimer_en: string;
  terms_hi: string;
  terms_en: string;
  sections_enabled: {
    hero_slider: boolean;
    quick_categories: boolean;
    science_corner: boolean;
    video_gallery: boolean;
    official_verification: boolean;
    trending_sidebar: boolean;
    ads: boolean;
  };
}

export interface Advertisement {
  id: string;
  placement: 'header_top' | 'sidebar' | 'in_article' | 'footer_above';
  title: string;
  image_url: string;
  target_url: string;
  alt_text: string;
  active: boolean;
  impressions: number;
  clicks: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  created_at: string;
  status: 'unread' | 'read';
}

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  feed_type: 'rss' | 'bseb_portal' | 'official_gov';
  category: string;
  last_checked?: string;
  active: boolean;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  provider: 'google' | 'email';
  picture?: string;
  joined_at: string;
  last_active: string;
}

export interface AnalyticsData {
  total_views: number;
  unique_visitors: number;
  daily_stats: { date: string; views: number; visitors: number }[];
  category_views: Record<string, number>;
}

export interface HeartbeatStats {
  onlineNow: number;
  totalEver: number;
  totalRegistered: number;
}



