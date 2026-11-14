import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'hi' | 'en';

interface Translations {
  [key: string]: {
    hi: string;
    en: string;
  };
}

export const TRANSLATIONS: Translations = {
  breaking: { hi: 'ब्रेकिंग', en: 'BREAKING' },
  latestNews: { hi: 'ताज़ा खबरें', en: 'Latest Updates' },
  trending: { hi: 'ट्रेंडिंग न्यूज़', en: 'Trending Topics' },
  readMore: { hi: 'पूरी खबर पढ़ें', en: 'Read Full Story' },
  searchPlaceholder: { hi: 'खबर, परीक्षा या रिजल्ट खोजें...', en: 'Search news, exams, results...' },
  allCategories: { hi: 'सभी कैटेगरी', en: 'All Categories' },
  officialVerification: { hi: 'आधिकारिक स्रोत सत्यापन', en: 'Official Source Verification' },
  officialNotice: { hi: 'आधिकारिक सूचना', en: 'Official Notice' },
  verified: { hi: 'सत्यापित', en: 'Verified' },
  independentDisclaimer: { 
    hi: 'UPDATE BIHAR एक स्वतंत्र निजी समाचार पोर्टल है, यह बिहार बोर्ड (BSEB) या किसी सरकारी विभाग की आधिकारिक वेबसाइट नहीं है।', 
    en: 'UPDATE BIHAR is an independent news portal and NOT an official government website of BSEB or any govt department.' 
  },
  adminLogin: { hi: 'एडमिन लॉगिन', en: 'Admin Portal' },
  adminDashboard: { hi: 'एडमिन डैशबोर्ड', en: 'Admin Dashboard' },
  logout: { hi: 'लॉगआउट', en: 'Logout' },
  darkMode: { hi: 'डार्क मोड', en: 'Dark Mode' },
  lightMode: { hi: 'लाइट मोड', en: 'Light Mode' },
  home: { hi: 'होम', en: 'Home' },
  categories: { hi: 'कैटेगरी', en: 'Categories' },
  aboutUs: { hi: 'हमारे बारे में', en: 'About Us' },
  contactUs: { hi: 'संपर्क करें', en: 'Contact Us' },
  disclaimer: { hi: 'अस्वीकरण', en: 'Disclaimer' },
  privacyPolicy: { hi: 'गोपनीयता नीति', en: 'Privacy Policy' },
  termsConditions: { hi: 'नियम एवं शर्तें', en: 'Terms & Conditions' },
  importantDates: { hi: 'महत्वपूर्ण तिथियां', en: 'Important Dates' },
  officialLink: { hi: 'आधिकारिक पोर्टल लिंक ↗', en: 'Official Portal Link ↗' },
  directAction: { hi: 'सीधा डाउनलोड / आवेदन लिंक', en: 'Direct Download / Apply Link' },
  views: { hi: 'देखा गया', en: 'views' },
  shareWhatsApp: { hi: 'व्हाट्सएप पर शेयर करें', en: 'Share on WhatsApp' },
  copyLink: { hi: 'लिंक कॉपी करें', en: 'Copy Link' },
  linkCopied: { hi: 'लिंक कॉपी हो गया!', en: 'Link copied!' },
  listenArticle: { hi: 'खबर सुनें (ऑडियो)', en: 'Listen to Article' },
  stopListening: { hi: 'ऑडियो रोकें', en: 'Stop Audio' },
  scienceCorner: { hi: 'विज्ञान एवं जैविकी शिक्षा', en: 'Science & Biotech Education' },
  scienceSubtitle: { hi: '12वीं साइंस स्ट्रीम, प्रैक्टिकल गाइड, NEET तैयारी और इंस्पायर स्कॉलरशिप', en: '12th Science stream, practical blueprints, NEET guidelines & INSPIRE scholarships' },
  noNewsFound: { hi: 'इस कैटेगरी या खोज के अनुसार कोई खबर उपलब्ध नहीं है।', en: 'No news found matching this category or search query.' },
  quickLinks: { hi: 'त्वरित लिंक', en: 'Quick Links' },
  allRightsReserved: { hi: 'सर्वाधिकार सुरक्षित।', en: 'All rights reserved.' },
  contactPrompt: { hi: 'किसी भी प्रश्न, सुझाव या सुधार के लिए हमसे संपर्क करें।', en: 'For inquiries, suggestions, or corrections, get in touch.' },
  sendFeedback: { hi: 'संदेश भेजें', en: 'Send Message' },
  name: { hi: 'आपका नाम', en: 'Your Name' },
  email: { hi: 'ईमेल आईडी', en: 'Email Address' },
  phone: { hi: 'मोबाइल नंबर (वैकल्पिक)', en: 'Mobile Number (Optional)' },
  message: { hi: 'आपका संदेश', en: 'Your Message' },
  relatedNews: { hi: 'संबंधित खबरें', en: 'Related News' },
  bsebPortalNotice: { hi: 'बिहार बोर्ड की आधिकारिक वेबसाइट पर जाने के लिए यहाँ क्लिक करें', en: 'Click here to visit the official Bihar Board website' },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof TRANSLATIONS) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('updatebihar_lang') as Language) || 'hi';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('updatebihar_lang', newLang);
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: keyof typeof TRANSLATIONS): string => {
    if (!TRANSLATIONS[key]) return String(key);
    return TRANSLATIONS[key][lang] || TRANSLATIONS[key]['hi'] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
