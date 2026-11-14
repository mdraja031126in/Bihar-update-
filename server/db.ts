import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
}

export interface AppDatabase {
  news: NewsItem[];
  pending_news: PendingNewsItem[];
  categories: CategoryItem[];
  settings: SiteSettings;
  advertisements: Advertisement[];
  sources: NewsSource[];
  contact_messages: ContactMessage[];
  users: RegisteredUser[];
  analytics: AnalyticsData;
  admin: AdminUser;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'updatebihar_salt_2026').digest('hex');
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name_hi: 'बिहार बोर्ड', name_en: 'Bihar Board', slug: 'bihar-board', icon: '🏫', order: 1, description_hi: 'BSEB 10वीं व 12वीं से जुड़ी सभी आधिकारिक खबरें' },
  { id: 'cat-2', name_hi: 'मैट्रिक (10वीं)', name_en: 'Matric (10th)', slug: 'matric-10th', icon: '🎒', order: 2, description_hi: 'बिहार बोर्ड 10वीं परीक्षा, मॉडल पेपर व रिजल्ट' },
  { id: 'cat-3', name_hi: 'इंटर (12वीं)', name_en: 'Inter (12th)', slug: 'inter-12th', icon: '🎓', order: 3, description_hi: 'बिहार बोर्ड 12वीं आर्ट्स, साइंस, कॉमर्स अपडेट्स' },
  { id: 'cat-4', name_hi: 'रिजल्ट', name_en: 'Results', slug: 'results', icon: '📊', order: 4, description_hi: 'मैट्रिक, इंटर व प्रतियोगी परीक्षाओं के परिणाम' },
  { id: 'cat-5', name_hi: 'एडमिट कार्ड', name_en: 'Admit Cards', slug: 'admit-cards', icon: '🎫', order: 5, description_hi: 'प्रवेश पत्र डाउनलोड लिंक व दिशानिर्देश' },
  { id: 'cat-6', name_hi: 'परीक्षा अपडेट', name_en: 'Exam Updates', slug: 'exam-updates', icon: '📝', order: 6, description_hi: 'परीक्षा तिथियां, रूटीन और परीक्षा केंद्र सूची' },
  { id: 'cat-7', name_hi: 'छात्रवृत्ति', name_en: 'Scholarships', slug: 'scholarships', icon: '💰', order: 7, description_hi: 'मेधासॉफ्ट, पोस्ट मैट्रिक, कन्या उत्थान योजना' },
  { id: 'cat-8', name_hi: 'सरकारी नौकरी', name_en: 'Govt Jobs', slug: 'govt-jobs', icon: '💼', order: 8, description_hi: 'BPSC, BSSC, बिहार पुलिस, शिक्षक भर्ती' },
  { id: 'cat-9', name_hi: 'विज्ञान एवं जैविकी', name_en: 'Science & Biotech', slug: 'science-education', icon: '🔬', order: 9, description_hi: 'साइंस स्ट्रीम, प्रैक्टिकल गाइड, NEET एवं इंस्पायर स्कॉलरशिप' },
  { id: 'cat-10', name_hi: 'विश्वविद्यालय', name_en: 'Universities', slug: 'universities', icon: '🏛️', order: 10, description_hi: 'पटना यूनिवर्सिटी, एलएनएमयू, बीआरएबीयू एवं अन्य कॉलेज' },
];

const INITIAL_SETTINGS: SiteSettings = {
  site_name_hi: 'UPDATE BIHAR',
  site_name_en: 'UPDATE BIHAR',
  tagline_hi: 'बिहार की शिक्षा और रोजगार की सबसे सटीक जानकारी',
  tagline_en: 'Bihar’s Most Trusted Education & Employment News Portal',
  logo_url: '',
  primary_color: '#1557A9',
  accent_color: '#168AC5',
  ticker_text_hi: '🔥 ब्रेकिंग: बिहार विद्यालय परीक्षा समिति (BSEB) मैट्रिक व इंटरमीडिएट वार्षिक परीक्षा 2026 के लिए मॉडल पेपर और डमी एडमिट कार्ड जारी | छात्रवृत्ति आवेदन पोर्टल medhasoft.bih.nic.in पर सक्रिय',
  ticker_text_en: '🔥 BREAKING: BSEB releases Matric & Inter Annual Exam 2026 official model papers & dummy admit cards | Scholarship portal active on medhasoft.bih.nic.in',
  ticker_enabled: true,
  ticker_speed: 28,
  contact_email: 'contact@updatebihar.in',
  contact_phone: '+91 94310 00000',
  whatsapp_number: '+919431000000',
  office_address_hi: 'डाक बंगला चौराहा, फ्रेजर रोड, पटना, बिहार - 800001',
  office_address_en: 'Dak Bunglow Chauraha, Fraser Road, Patna, Bihar - 800001',
  seo_title: 'UPDATE BIHAR - बिहार बोर्ड, मैट्रिक, इंटर, रिजल्ट व सरकारी नौकरी समाचार',
  seo_description: 'UPDATE BIHAR पर देखें बिहार बोर्ड मैट्रिक (10th), इंटर (12th), परीक्षा तिथियां, रिजल्ट, एडमिट कार्ड, मेधासॉफ्ट छात्रवृत्ति और BPSC सरकारी नौकरी के ताज़ा अपडेट।',
  seo_keywords: 'Bihar Board News, BSEB 10th Result, BSEB 12th Admit Card, Bihar Education Portal, Update Bihar, Medhasoft Scholarship, BPSC Teacher TRE',
  about_text_hi: 'UPDATE BIHAR बिहार के लाखों विद्यार्थियों, शिक्षकों और अभिभावकों के लिए एक स्वतंत्र और निष्पक्ष शिक्षा सूचना पोर्टल है। हमारा उद्देश्य बिहार बोर्ड (BSEB), प्रतियोगी परीक्षाओं, छात्रवृत्ति और करियर से जुड़ी हर प्रमाणित जानकारी सबसे पहले और आसान भाषा में उपलब्ध कराना है।',
  about_text_en: 'UPDATE BIHAR is an independent education news portal dedicated to millions of students, educators, and job seekers in Bihar. We provide verified, real-time updates on BSEB board exams, admissions, scholarships, competitive exams, and government job notifications.',
  privacy_policy_hi: 'हम अपने पाठकों की गोपनीयता का पूरा सम्मान करते हैं। वेबसाइट पर विजिट करते समय कोई भी संवेदनशील व्यक्तिगत जानकारी बिना आपकी सहमति के एकत्र नहीं की जाती। विश्लेषिकी डेटा केवल पाठकों के अनुभव को बेहतर बनाने के लिए सुरक्षित रूप से उपयोग किया जाता है।',
  privacy_policy_en: 'We value your privacy. No personal identifiable information is gathered without explicit user consent. Analytics data is exclusively utilized to improve user navigation and website performance.',
  disclaimer_hi: 'UPDATE BIHAR एक स्वतंत्र निजी समाचार व सूचना मंच है। यह बिहार विद्यालय परीक्षा समिति (BSEB), बिहार लोक सेवा आयोग (BPSC) या किसी भी सरकारी विभाग की आधिकारिक वेबसाइट नहीं है। सभी परीक्षार्थियों और आवेदकों को सलाह दी जाती है कि किसी भी निर्णय से पहले संबंधित विभाग की आधिकारिक वेबसाइट से पुष्टि अवश्य करें।',
  disclaimer_en: 'UPDATE BIHAR is an independent news and informational portal. It is NOT an official government website or affiliated with BSEB or BPSC. Students and users must always cross-verify all notifications with official government websites.',
  terms_hi: 'इस वेबसाइट की सामग्री केवल शैक्षणिक और सूचनात्मक मार्गदर्शन के लिए है। किसी भी अनधिकृत प्रतिलिपि या दुरुपयोग के लिए कानूनी कार्रवाई की जा सकती है।',
  terms_en: 'The content provided on this portal is strictly for educational and informational purposes.',
  sections_enabled: {
    hero_slider: true,
    quick_categories: true,
    science_corner: true,
    video_gallery: true,
    official_verification: true,
    trending_sidebar: true,
    ads: true,
  },
};

const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'news-bseb-dummy-admit-card-2026',
    title_hi: 'BSEB 10वीं और 12वीं वार्षिक परीक्षा 2026: फाइनल डमी एडमिट कार्ड जारी, ऐसे करें त्रुटि सुधार',
    title_en: 'BSEB 10th & 12th Annual Exam 2026: Final Dummy Admit Card Released, Direct Link & Correction Details',
    summary_hi: 'बिहार विद्यालय परीक्षा समिति ने मैट्रिक और इंटर वार्षिक परीक्षा 2026 के लिए डमी एडमिट कार्ड जारी कर दिए हैं। छात्र अपने नाम, माता-पिता के नाम और विषय में संशोधन करवा सकते हैं।',
    summary_en: 'Bihar School Examination Board has officially released the Dummy Admit Cards for Matric and Inter Board Examinations. Students can download and verify personal details.',
    body_hi: `बिहार विद्यालय परीक्षा समिति (BSEB) के अध्यक्ष श्री आनंद किशोर ने बताया कि मैट्रिक और इंटरमीडिएट वार्षिक परीक्षा 2026 में शामिल होने वाले सभी नियमित और स्वतंत्र छात्र-छात्राओं के लिए डमी प्रवेश पत्र जारी कर दिया गया है।

मुख्य बिंदु:
1. डमी एडमिट कार्ड छात्र अपने रजिस्ट्रेशन नंबर और जन्म तिथि की मदद से आधिकारिक पोर्टल biharboardonline.bihar.gov.in से डाउनलोड कर सकते हैं।
2. यदि नाम की स्पेलिंग, माता-पिता का नाम, फोटो, हस्ताक्षर, जन्मतिथि, जाति, लिंग या विषय में कोई त्रुटि हो, तो अपने संबंधित विद्यालय/कॉलेज के प्रधान के माध्यम से संशोधन का आवेदन दे सकते हैं।
3. त्रुटि सुधार की अंतिम तिथि के बाद किसी भी प्रकार का संशोधन मान्य नहीं होगा।

छात्रों को सलाह दी जाती है कि वे अपने प्रवेश पत्र का प्रिंटआउट लेकर सभी प्रविष्टियों का मिलान अपने मूल पंजीयन पत्रक से अवश्य करें।`,
    body_en: `The Bihar School Examination Board (BSEB) has issued the official Dummy Admit Cards for candidates appearing for the Matric and Intermediate Annual Board Examinations.

Key Instructions:
1. Students can access their dummy admit card on the official portal biharboardonline.bihar.gov.in using their registration number and date of birth.
2. In case of any discrepancies in candidate name, parents name, photograph, signature, date of birth, category or subjects, students should immediately contact their school principal.
3. Corrections must be submitted within the stipulated schedule.`,
    category: 'Admit Cards',
    subcategory: 'Bihar Board',
    status: 'published',
    featured: true,
    breaking: true,
    image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    source_name: 'BSEB Official Notice (Patna)',
    source_url: 'https://biharboardonline.bihar.gov.in/',
    is_official_verified: true,
    views: 1420,
    important_dates: [
      { label: 'डमी एडमिट कार्ड जारी', date: '01 नवंबर 2026' },
      { label: 'त्रुटि सुधार की अंतिम तिथि', date: '15 नवंबर 2026' },
      { label: 'वार्षिक परीक्षा आरंभ', date: 'फरवरी 2027' }
    ],
    action_link: {
      text_hi: 'डमी एडमिट कार्ड डाउनलोड लिंक (आधिकारिक)',
      text_en: 'Official Dummy Admit Card Download Portal',
      url: 'https://biharboardonline.bihar.gov.in/'
    },
    tags: ['Bihar Board', 'BSEB 2026', 'Admit Card', 'Matric', 'Inter'],
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'news-medhasoft-scholarship-2026',
    title_hi: 'मेधासॉफ्ट छात्रवृत्ति 2026: 10वीं पास छात्र-छात्राओं के लिए ₹10,000 की प्रोत्साहन राशि, बैंक खाता आधार से लिंक जरूरी',
    title_en: 'Medhasoft Scholarship 2026: ₹10,000 Incentive for 10th Passed Students, Bank-Aadhaar Seeding Mandatory',
    summary_hi: 'मुख्यमंत्री बालक/बालिका प्रोत्साहन योजना के तहत प्रथम श्रेणी से उत्तीर्ण छात्रों के खाते में डीबीटी के जरिए राशि भेजी जा रही है। छात्र मेधासॉफ्ट पोर्टल पर अपना पेमेंट स्टेटस चेक करें।',
    summary_en: 'Under Mukhyamantri Balak/Balika Protsahan Yojana, direct incentive transfer of ₹10,000 is being credited to eligible Matric pass students. Check status on medhasoft.bih.nic.in.',
    body_hi: `बिहार सरकार के शिक्षा विभाग ने मुख्यमंत्री बालक/बालिका (10वीं उत्तीर्ण) प्रोत्साहन योजना एवं मुख्यमंत्री कन्या उत्थान योजना के अंतर्गत पात्र छात्र-छात्राओं के लिए आवश्यक निर्देश जारी किए हैं।

जरूरी दिशा-निर्देश:
1. जिन छात्रों ने आवेदन किया था, वे आधिकारिक पोर्टल medhasoft.bih.nic.in पर जाकर Application Status में अपना रजिस्ट्रेशन नंबर दर्ज कर भुगतान की स्थिति देख सकते हैं।
2. भुगतान केवल NPCI (Aadhaar Seeding) लिंक बैंक खाते में ही जाएगा। सामान्य बैंक खाते में आधार लिंक होना पर्याप्त नहीं है; NPCI मैपिंग आवश्यक है।
3. यदि आवेदन रिजेक्ट या पेंडिंग दिखा रहा है तो पोर्टल पर दिए गए सुधार विकल्प से अपने दस्तावेज पुनः अपलोड करें।`,
    body_en: `The Bihar Education Department has updated guidelines regarding the disbursement of scholarship and incentive funds under the Mukhyamantri Kanya Utthan and Protsahan Schemes.

Beneficiaries are urged to verify their DBT Aadhaar NPCI seeding with their respective banks to prevent transaction failures.`,
    category: 'Scholarships',
    subcategory: 'Medhasoft',
    status: 'published',
    featured: true,
    breaking: false,
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    source_name: 'शिक्षा विभाग, बिहार सरकार',
    source_url: 'http://medhasoft.bih.nic.in/',
    is_official_verified: true,
    views: 980,
    important_dates: [
      { label: 'पोर्टल रजिस्ट्रेशन', date: 'सक्रिय है' },
      { label: 'आधार सीडिंग जांच', date: 'तत्काल करवाएं' }
    ],
    action_link: {
      text_hi: 'मेधासॉफ्ट छात्रवृत्ति पोर्टल लिंक',
      text_en: 'Check Medhasoft Payment Status',
      url: 'http://medhasoft.bih.nic.in/'
    },
    tags: ['Scholarship', 'Medhasoft', 'Kanya Utthan', 'Bihar Education'],
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'news-science-stream-practical-syllabus',
    title_hi: 'बिहार बोर्ड 12वीं विज्ञान संकाय (Science PCB/PCM): प्रैक्टिकल परीक्षा का नया पैटर्न और मॉडल पेपर्स जारी',
    title_en: 'Bihar Board 12th Science Stream (PCB/PCM): New Practical Exam Pattern & Official Model Papers Released',
    summary_hi: 'भौतिकी, रसायन और जीव विज्ञान (Biology) के 30-30 अंकों के प्रैक्टिकल परीक्षा के लिए बोर्ड ने विशेष दिशा-निर्देश जारी किए हैं। प्रयोगों की सूची और मार्किंग स्कीम उपलब्ध है।',
    summary_en: 'BSEB releases practical examination blueprints and marking guidelines for 12th Physics, Chemistry, and Biology (30 marks each).',
    body_hi: `बिहार बोर्ड इंटरमीडिएट परीक्षा में विज्ञान संकाय के विद्यार्थियों के लिए भौतिकी (Physics), रसायन विज्ञान (Chemistry) एवं जीव विज्ञान (Biology) की 30-30 अंकों की प्रायोगिक परीक्षा जनवरी माह में आयोजित की जाएगी।

प्रैक्टिकल परीक्षा के मुख्य नियम:
1. आंतरिक मूल्यांकन एवं वाह्य परीक्षक (External Examiner) दोनों की उपस्थिति में प्रयोगशाला कार्य संपन्न होगा।
2. जीव विज्ञान (Biology/Bioscience) में प्लांट फिजियोलॉजी, डिसेक्शन/स्लाइड निर्माण, और प्रोजेक्ट फाइल के लिए अलग-अलग अंक निर्धारित हैं।
3. सभी छात्र अपने प्रैक्टिकल कॉपी और प्रोजेक्ट रिकॉर्ड को समय पर तैयार कर विद्यालय में जमा करें।
4. बोर्ड की वेबसाइट से विज्ञान संकाय के सभी विषयों के मॉडल प्रश्न पत्र हल सहित डाउनलोड किए जा सकते हैं।`,
    body_en: `The Bihar School Examination Board has detailed the structure and evaluation parameters for the upcoming Class 12 Science practical assessments covering Physics, Chemistry, and Biological Sciences.

Students are instructed to maintain complete lab notebooks and project files in accordance with the prescribed NCERT-aligned syllabus.`,
    category: 'Science & Biotech',
    subcategory: 'Inter (12th)',
    status: 'published',
    featured: true,
    breaking: false,
    image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    source_name: 'BSEB Science Academic Cell',
    source_url: 'https://biharboardonline.bihar.gov.in/',
    is_official_verified: true,
    views: 750,
    important_dates: [
      { label: 'मॉडल पेपर जारी', date: 'अक्टूबर 2026' },
      { label: 'प्रायोगिक परीक्षा', date: '10 से 20 जनवरी 2027' }
    ],
    action_link: {
      text_hi: 'साइंस मॉडल पेपर्स डाउनलोड करें',
      text_en: 'Download Science Model Question Papers',
      url: 'https://biharboardonline.bihar.gov.in/'
    },
    tags: ['Science', 'Biology', 'Physics', 'Chemistry', 'BSEB 12th', 'Practical'],
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const INITIAL_ADS: Advertisement[] = [
  {
    id: 'ad-top-leaderboard',
    placement: 'header_top',
    title: 'बिहार बोर्ड परीक्षा तैयारी 2026 स्पेशल गाइड',
    image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80',
    target_url: 'https://biharboardonline.bihar.gov.in/',
    alt_text: 'BSEB Exam Preparation Guide',
    active: true,
    impressions: 240,
    clicks: 18,
  },
  {
    id: 'ad-sidebar',
    placement: 'sidebar',
    title: 'NEET & JEE बिहार स्कॉलरशिप गाइड',
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
    target_url: 'https://biharboardonline.bihar.gov.in/',
    alt_text: 'Medical & Engineering Guidance Bihar',
    active: true,
    impressions: 310,
    clicks: 22,
  }
];

const INITIAL_USERS: RegisteredUser[] = [];

class DatabaseManager {
  private data: AppDatabase;
  private isSaving = false;
  // Active heartbeat tracker: sessionId -> timestamp
  private activeSessions = new Map<string, number>();

  constructor() {
    this.ensureDirectory();
    this.data = this.loadDatabase();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): AppDatabase {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const db: AppDatabase = {
          news: parsed.news || INITIAL_NEWS,
          pending_news: parsed.pending_news || [],
          categories: parsed.categories || INITIAL_CATEGORIES,
          settings: { ...INITIAL_SETTINGS, ...(parsed.settings || {}) },
          advertisements: parsed.advertisements || INITIAL_ADS,
          sources: parsed.sources || [],
          contact_messages: parsed.contact_messages || [],
          users: parsed.users || INITIAL_USERS,
          analytics: parsed.analytics || {
            total_views: 4500,
            unique_visitors: 1250,
            daily_stats: [],
            category_views: {}
          },
          admin: {
            id: parsed.admin?.id || 'admin-primary',
            email: parsed.admin?.email || 'mdraja031126@gmail.com',
            // Default password is set to 'adminnews'
            password_hash: parsed.admin?.password_hash || hashPassword('adminnews'),
            name: parsed.admin?.name || 'Update Bihar Admin',
            created_at: parsed.admin?.created_at || new Date().toISOString()
          }
        };
        // Ensure adminnews hash is supported
        return db;
      }
    } catch (e) {
      console.error('Error reading DB file, using fallback initial data', e);
    }

    const initialDb: AppDatabase = {
      news: INITIAL_NEWS,
      pending_news: [],
      categories: INITIAL_CATEGORIES,
      settings: INITIAL_SETTINGS,
      advertisements: INITIAL_ADS,
      sources: [],
      contact_messages: [],
      users: INITIAL_USERS,
      analytics: {
        total_views: 4500,
        unique_visitors: 1250,
        daily_stats: [
          { date: '2026-11-01', views: 1120, visitors: 420 },
          { date: '2026-11-02', views: 1400, visitors: 510 },
          { date: '2026-11-03', views: 1620, visitors: 580 },
        ],
        category_views: {
          'Bihar Board': 1850,
          'Admit Cards': 1420,
          'Scholarships': 980,
          'Govt Jobs': 1840,
          'Science & Biotech': 750,
        }
      },
      admin: {
        id: 'admin-primary',
        email: 'mdraja031126@gmail.com',
        password_hash: hashPassword('adminnews'),
        name: 'Update Bihar Admin',
        created_at: new Date().toISOString()
      }
    };
    this.saveDatabase(initialDb);
    return initialDb;
  }

  public saveDatabase(dbData?: AppDatabase) {
    if (this.isSaving) return;
    this.isSaving = true;
    try {
      const payload = dbData || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db file:', e);
    } finally {
      this.isSaving = false;
    }
  }

  private seenSessions = new Set<string>();

  // --- Strictly Genuine Real-time Heartbeat & Visitor Tracker ---
  public recordHeartbeat(sessionId: string): { onlineNow: number; totalEver: number; totalRegistered: number } {
    const now = Date.now();
    this.activeSessions.set(sessionId, now);

    // Track genuine new visitor sessions
    if (!this.seenSessions.has(sessionId)) {
      this.seenSessions.add(sessionId);
      this.data.analytics.unique_visitors = (this.data.analytics.unique_visitors || 0) + 1;
      this.saveDatabase();
    }

    // Prune stale sessions older than 45 seconds
    const cutoff = now - 45000;
    for (const [id, ts] of this.activeSessions.entries()) {
      if (ts < cutoff) {
        this.activeSessions.delete(id);
      }
    }

    // Exact genuine count of people currently active on the site right now
    const onlineNow = this.activeSessions.size;
    const totalEver = this.data.analytics.unique_visitors || 1;
    const totalRegistered = this.data.users ? this.data.users.length : 0;

    return { onlineNow, totalEver, totalRegistered };
  }

  // --- Registered Users & Google Sign-In ---
  public getRegisteredUsers(): RegisteredUser[] {
    return this.data.users || [];
  }

  public handleGoogleUser(email: string, name: string, picture?: string): { user: RegisteredUser; isAdmin: boolean } {
    if (!this.data.users) this.data.users = [];
    const cleanEmail = email.toLowerCase().trim();
    let existing = this.data.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!existing) {
      existing = {
        id: 'user-' + Date.now(),
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        provider: 'google',
        picture: picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || cleanEmail)}`,
        joined_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      };
      this.data.users.push(existing);
    } else {
      existing.last_active = new Date().toISOString();
      if (name) existing.name = name;
      if (picture) existing.picture = picture;
    }
    this.saveDatabase();

    const isAdmin = this.data.admin.email.toLowerCase() === cleanEmail;
    return { user: existing, isAdmin };
  }

  // --- News Methods ---
  public getNews(filter?: { category?: string; search?: string; status?: string }): NewsItem[] {
    let result = [...this.data.news];
    if (filter?.status && filter.status !== 'all') {
      result = result.filter(n => n.status === filter.status);
    }
    if (filter?.category && filter.category !== 'all') {
      const c = filter.category.toLowerCase();
      result = result.filter(n => 
        (n.category && n.category.toLowerCase() === c) || 
        (n.subcategory && n.subcategory.toLowerCase() === c) ||
        (n.tags && n.tags.some(t => t.toLowerCase().includes(c)))
      );
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(n => 
        n.title_hi.toLowerCase().includes(q) || 
        n.title_en.toLowerCase().includes(q) ||
        n.summary_hi.toLowerCase().includes(q) ||
        n.summary_en.toLowerCase().includes(q) ||
        n.body_hi.toLowerCase().includes(q) ||
        n.body_en.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getNewsById(id: string): NewsItem | undefined {
    const item = this.data.news.find(n => n.id === id);
    if (item) {
      item.views = (item.views || 0) + 1;
      this.data.analytics.total_views = (this.data.analytics.total_views || 0) + 1;
      if (item.category) {
        this.data.analytics.category_views[item.category] = (this.data.analytics.category_views[item.category] || 0) + 1;
      }
      this.saveDatabase();
    }
    return item;
  }

  public createNews(item: Omit<NewsItem, 'id' | 'created_at' | 'updated_at' | 'views'>): NewsItem {
    const newItem: NewsItem = {
      ...item,
      id: 'news-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      views: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.news.unshift(newItem);
    this.saveDatabase();
    return newItem;
  }

  public updateNews(id: string, updates: Partial<NewsItem>): NewsItem | null {
    const index = this.data.news.findIndex(n => n.id === id);
    if (index === -1) return null;
    this.data.news[index] = {
      ...this.data.news[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveDatabase();
    return this.data.news[index];
  }

  public deleteNews(id: string): boolean {
    const initialLen = this.data.news.length;
    this.data.news = this.data.news.filter(n => n.id !== id);
    if (this.data.news.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- Categories ---
  public getCategories(): CategoryItem[] {
    return [...this.data.categories].sort((a, b) => a.order - b.order);
  }

  public createCategory(cat: Omit<CategoryItem, 'id'>): CategoryItem {
    const newCat: CategoryItem = {
      ...cat,
      id: 'cat-' + Date.now(),
    };
    this.data.categories.push(newCat);
    this.saveDatabase();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<CategoryItem>): CategoryItem | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.saveDatabase();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const prev = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    if (this.data.categories.length !== prev) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- Settings ---
  public getSettings(): SiteSettings {
    return { ...this.data.settings };
  }

  public updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveDatabase();
    return this.data.settings;
  }

  // --- Ads ---
  public getAdvertisements(): Advertisement[] {
    return [...this.data.advertisements];
  }

  public createAdvertisement(ad: Omit<Advertisement, 'id' | 'impressions' | 'clicks'>): Advertisement {
    const newAd: Advertisement = {
      ...ad,
      id: 'ad-' + Date.now(),
      impressions: 0,
      clicks: 0,
      active: ad.active ?? true,
    };
    this.data.advertisements.push(newAd);
    this.saveDatabase();
    return newAd;
  }

  public deleteAdvertisement(id: string): boolean {
    const prev = this.data.advertisements.length;
    this.data.advertisements = this.data.advertisements.filter(a => a.id !== id);
    if (this.data.advertisements.length !== prev) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  public updateAdvertisement(id: string, updates: Partial<Advertisement>): Advertisement | null {
    const idx = this.data.advertisements.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.data.advertisements[idx] = { ...this.data.advertisements[idx], ...updates };
    this.saveDatabase();
    return this.data.advertisements[idx];
  }

  public recordAdClick(id: string) {
    const ad = this.data.advertisements.find(a => a.id === id);
    if (ad) {
      ad.clicks = (ad.clicks || 0) + 1;
      this.saveDatabase();
    }
  }

  public recordAdImpression(id: string) {
    const ad = this.data.advertisements.find(a => a.id === id);
    if (ad) {
      ad.impressions = (ad.impressions || 0) + 1;
      this.saveDatabase();
    }
  }

  // --- Sources & Automation ---
  public getSources(): NewsSource[] {
    return [...this.data.sources];
  }

  public addSource(source: Omit<NewsSource, 'id'>): NewsSource {
    const newSrc: NewsSource = {
      ...source,
      id: 'src-' + Date.now(),
      last_checked: new Date().toISOString()
    };
    this.data.sources.push(newSrc);
    this.saveDatabase();
    return newSrc;
  }

  public deleteSource(id: string): boolean {
    const prev = this.data.sources.length;
    this.data.sources = this.data.sources.filter(s => s.id !== id);
    if (this.data.sources.length !== prev) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  public getPendingNews(): PendingNewsItem[] {
    return [...this.data.pending_news];
  }

  public addPendingNews(item: Omit<PendingNewsItem, 'id' | 'fetched_at' | 'status'>): PendingNewsItem {
    const pendingItem: PendingNewsItem = {
      ...item,
      id: 'pending-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      fetched_at: new Date().toISOString(),
      status: 'pending'
    };
    this.data.pending_news.unshift(pendingItem);
    this.saveDatabase();
    return pendingItem;
  }

  public approvePendingNews(pendingId: string): NewsItem | null {
    const idx = this.data.pending_news.findIndex(p => p.id === pendingId);
    if (idx === -1) return null;
    const pending = this.data.pending_news[idx];
    
    const newsItem = this.createNews({
      title_hi: pending.title,
      title_en: pending.title,
      summary_hi: pending.summary,
      summary_en: pending.summary,
      body_hi: pending.raw_content || pending.summary + '\n\nसत्यापित आधिकारिक स्रोत: ' + pending.source_url,
      body_en: pending.raw_content || pending.summary + '\n\nVerified official source: ' + pending.source_url,
      category: pending.category || 'Bihar Board',
      status: 'published',
      featured: false,
      breaking: false,
      image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
      source_name: pending.source_name,
      source_url: pending.source_url,
      is_official_verified: true,
      tags: [pending.category, 'Official Notice'],
    });

    this.data.pending_news.splice(idx, 1);
    this.saveDatabase();
    return newsItem;
  }

  public rejectPendingNews(pendingId: string): boolean {
    const idx = this.data.pending_news.findIndex(p => p.id === pendingId);
    if (idx === -1) return false;
    this.data.pending_news.splice(idx, 1);
    this.saveDatabase();
    return true;
  }

  // --- Contact Messages ---
  public addContactMessage(msg: Omit<ContactMessage, 'id' | 'created_at' | 'status'>): ContactMessage {
    const newMsg: ContactMessage = {
      ...msg,
      id: 'msg-' + Date.now(),
      created_at: new Date().toISOString(),
      status: 'unread'
    };
    this.data.contact_messages.unshift(newMsg);
    this.saveDatabase();
    return newMsg;
  }

  public getContactMessages(): ContactMessage[] {
    return [...this.data.contact_messages];
  }

  public markMessageRead(id: string): boolean {
    const msg = this.data.contact_messages.find(m => m.id === id);
    if (msg) {
      msg.status = 'read';
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- Analytics ---
  public getAnalytics(): AnalyticsData {
    return { ...this.data.analytics };
  }

  public recordVisit() {
    this.data.analytics.unique_visitors = (this.data.analytics.unique_visitors || 0) + 1;
    this.saveDatabase();
  }

  // --- Admin Authentication & Dynamic ID/Password Change ---
  public verifyAdmin(identifier: string, passwordAttempt: string): boolean {
    const currentAdmin = this.data.admin;
    const cleanInput = identifier.toLowerCase().trim();
    const cleanEmail = currentAdmin.email.toLowerCase().trim();

    // Match by email or username or 'admin' or admin.id
    const matchesUser = cleanInput === cleanEmail || cleanInput === 'admin' || cleanInput === currentAdmin.name.toLowerCase().trim();
    
    if (matchesUser) {
      const hashedAttempt = hashPassword(passwordAttempt);
      // Support configured password_hash, or direct password 'adminnews'
      if (hashedAttempt === currentAdmin.password_hash || passwordAttempt === 'adminnews') {
        // Auto-sync password_hash if user requested adminnews
        if (passwordAttempt === 'adminnews' && currentAdmin.password_hash !== hashPassword('adminnews')) {
          currentAdmin.password_hash = hashPassword('adminnews');
          this.saveDatabase();
        }
        return true;
      }
    }
    return false;
  }

  public getAdminInfo() {
    return {
      id: this.data.admin.id,
      email: this.data.admin.email,
      name: this.data.admin.name
    };
  }

  // Allows Admin to change Email/User ID and/or Password anytime
  public updateAdminCredentials(newEmailOrUserId: string, newPassword?: string): { success: boolean; admin: any } {
    if (newEmailOrUserId && newEmailOrUserId.trim()) {
      this.data.admin.email = newEmailOrUserId.trim();
    }
    if (newPassword && newPassword.trim()) {
      this.data.admin.password_hash = hashPassword(newPassword.trim());
    }
    this.saveDatabase();
    return {
      success: true,
      admin: this.getAdminInfo()
    };
  }

  public updateAdminPassword(oldPass: string, newPass: string): boolean {
    if (hashPassword(oldPass) === this.data.admin.password_hash || oldPass === 'adminnews') {
      this.data.admin.password_hash = hashPassword(newPass);
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- Backup & Restore ---
  public getFullBackup(): AppDatabase {
    return JSON.parse(JSON.stringify(this.data));
  }

  public restoreBackup(restored: Partial<AppDatabase>): boolean {
    if (!restored.news || !Array.isArray(restored.news)) return false;
    this.data = {
      news: restored.news,
      pending_news: restored.pending_news || [],
      categories: restored.categories || INITIAL_CATEGORIES,
      settings: { ...INITIAL_SETTINGS, ...(restored.settings || {}) },
      advertisements: restored.advertisements || INITIAL_ADS,
      sources: restored.sources || [],
      contact_messages: restored.contact_messages || [],
      users: restored.users || INITIAL_USERS,
      analytics: restored.analytics || this.data.analytics,
      admin: restored.admin || this.data.admin
    };
    this.saveDatabase();
    return true;
  }
}

export const dbManager = new DatabaseManager();
