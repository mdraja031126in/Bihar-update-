import React from 'react';
import { ShieldCheck, Heart, ExternalLink, ArrowUp, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SiteSettings, CategoryItem } from '../types';

interface FooterProps {
  settings: SiteSettings;
  categories: CategoryItem[];
  onSelectCategory: (cat: string) => void;
  onNavigatePage: (page: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  categories,
  onSelectCategory,
  onNavigatePage,
  onOpenAdmin
}) => {
  const { lang, t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0B1B3D] text-slate-300 pt-12 pb-8 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Brand & Mission */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-black text-lg shadow-md">
                UB
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  {lang === 'hi' ? settings.site_name_hi : settings.site_name_en}
                </h3>
                <p className="text-[11px] text-slate-400 tracking-wider uppercase font-semibold">
                  BIHAR EDUCATION & NEWS PORTAL
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {lang === 'hi' 
                ? 'बिहार बोर्ड (BSEB), मैट्रिक, इंटर, छात्रवृत्ति, प्रतियोगी परीक्षाओं और सरकारी नौकरी के समाचारों का सबसे विश्वसनीय स्वतंत्र डिजिटल मंच।' 
                : 'Bihar’s most trusted independent educational digital news bulletin for board exams, scholarships and state employment.'}
            </p>

            {/* Helpline quick badge */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-1">
              <div className="text-amber-400 font-bold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>हेल्पलाइन एवं समाचार कक्ष: {settings.contact_phone}</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                ईमेल: {settings.contact_email}
              </div>
            </div>
          </div>

          {/* Quick Category Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-700 pb-2">
              {t('categories')}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {categories.slice(0, 8).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.name_en)}
                  className="text-left text-slate-400 hover:text-white transition-colors truncate"
                >
                  • {lang === 'hi' ? cat.name_hi : cat.name_en}
                </button>
              ))}
            </div>
          </div>

          {/* Official Portals Direct */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-700 pb-2">
              {lang === 'hi' ? 'आधिकारिक सरकारी लिंक' : 'Official Portals'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a 
                  href="https://biharboardonline.bihar.gov.in/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-slate-300 hover:text-cyan-300 transition-colors"
                >
                  <span>BSEB बिहार बोर्ड ↗</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a 
                  href="http://medhasoft.bih.nic.in/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-slate-300 hover:text-cyan-300 transition-colors"
                >
                  <span>मेधासॉफ्ट छात्रवृत्ति ↗</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.bpsc.bih.nic.in/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-slate-300 hover:text-cyan-300 transition-colors"
                >
                  <span>BPSC आधिकारिक ↗</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a 
                  href="https://state.bihar.gov.in/educationbihar/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-slate-300 hover:text-cyan-300 transition-colors"
                >
                  <span>शिक्षा विभाग बिहार ↗</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal and Admin */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-700 pb-2">
              {lang === 'hi' ? 'महत्वपूर्ण पृष्ठ' : 'Important Pages'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigatePage('about')} className="hover:text-white transition-colors">
                  {t('aboutUs')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigatePage('contact')} className="hover:text-white transition-colors">
                  {t('contactUs')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigatePage('disclaimer')} className="hover:text-white transition-colors">
                  {t('disclaimer')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigatePage('privacy')} className="hover:text-white transition-colors">
                  {t('privacyPolicy')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigatePage('terms')} className="hover:text-white transition-colors">
                  {t('termsConditions')}
                </button>
              </li>
              <li className="pt-2">
                <button 
                  onClick={onOpenAdmin} 
                  className="text-amber-400 hover:text-amber-300 font-bold transition-colors"
                >
                  🔒 {t('adminLogin')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Warning Strip */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex-1 text-center sm:text-left">
            <strong className="text-slate-300">अस्वीकरण (Disclaimer):</strong> {t('independentDisclaimer')}
          </p>
          <button
            onClick={scrollToTop}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex-shrink-0"
            title="Scroll to top"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © {currentYear} <strong>UPDATE BIHAR</strong>. {t('allRightsReserved')}
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Dedicated to the students of Bihar</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
