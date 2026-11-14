import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, ShieldAlert, CheckCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SiteSettings } from '../types';

interface LegalPagesProps {
  page: 'about' | 'contact' | 'privacy' | 'disclaimer' | 'terms';
  settings: SiteSettings;
  onBack: () => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ page, settings, onBack }) => {
  const { lang, t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      setSubmitSuccess(data.message || 'आपका संदेश सफलतापूर्वक भेजा गया!');
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setSubmitError(err.message || 'संदेश भेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const titles = {
    about: { hi: 'हमारे बारे में (About Us)', en: 'About UPDATE BIHAR' },
    contact: { hi: 'संपर्क करें (Contact Us)', en: 'Contact Us' },
    privacy: { hi: 'गोपनीयता नीति (Privacy Policy)', en: 'Privacy Policy' },
    disclaimer: { hi: 'अस्वीकरण (Disclaimer)', en: 'Disclaimer & Official Sources' },
    terms: { hi: 'नियम एवं शर्तें (Terms & Conditions)', en: 'Terms and Conditions' },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{lang === 'hi' ? '← मुख्य पृष्ठ पर जाएं' : 'Back to Home'}</span>
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-10 shadow-sm space-y-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white pb-4 border-b border-slate-200 dark:border-slate-700">
          {titles[page][lang]}
        </h1>

        {/* Page Content */}
        {page === 'about' && (
          <div className="space-y-4 text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
            <p>
              {lang === 'hi' ? settings.about_text_hi : settings.about_text_en}
            </p>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-2">
              <h3 className="font-bold text-blue-900 dark:text-blue-300">
                {lang === 'hi' ? 'हमारा मुख्य ध्येय:' : 'Our Core Mission:'}
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li>बिहार के सुदूर ग्रामीण क्षेत्रों तक बोर्ड परीक्षा एवं रोजगार से जुड़ी सटीक सूचनाएं पहुंचाना।</li>
                <li>इंटरनेट पर फैल रही फर्जी रिजल्ट और तारीखों की अफवाहों का खंडन करना।</li>
                <li>छात्रवृत्ति एवं सरकारी योजनाओं के आवेदन हेतु आसान और व्यावहारिक मार्गदर्शिका उपलब्ध कराना।</li>
              </ul>
            </div>
          </div>
        )}

        {page === 'disclaimer' && (
          <div className="space-y-4 text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/60 rounded-2xl border border-amber-300 dark:border-amber-800 flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-extrabold text-amber-950 dark:text-amber-200 text-base">
                  महत्वपूर्ण वैधानिक स्पष्टीकरण (Official Legal Notice)
                </h3>
                <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-300 mt-1">
                  UPDATE BIHAR एक गैर-सरकारी एवं स्वतंत्र शिक्षा समाचार पोर्टल है। इसका संचालन किसी सरकारी विभाग या बिहार बोर्ड द्वारा नहीं किया जाता है।
                </p>
              </div>
            </div>
            <p className="whitespace-pre-line">
              {lang === 'hi' ? settings.disclaimer_hi : settings.disclaimer_en}
            </p>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                आधिकारिक पुष्टि हेतु संपर्क सूत्र:
              </h4>
              <p className="text-xs text-slate-500">
                बिहार विद्यालय परीक्षा समिति (BSEB) आधिकारिक वेबसाइट:{' '}
                <a href="https://biharboardonline.bihar.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  biharboardonline.bihar.gov.in
                </a>
              </p>
            </div>
          </div>
        )}

        {page === 'privacy' && (
          <div className="space-y-4 text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
            <p className="whitespace-pre-line">
              {lang === 'hi' ? settings.privacy_policy_hi : settings.privacy_policy_en}
            </p>
            <p className="text-xs text-slate-500">
              अंतिम अद्यतन (Last Updated): नवंबर 2026
            </p>
          </div>
        )}

        {page === 'terms' && (
          <div className="space-y-4 text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
            <p className="whitespace-pre-line">
              {lang === 'hi' ? settings.terms_hi : settings.terms_en}
            </p>
          </div>
        )}

        {page === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-5">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t('contactPrompt')}
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Email Address</div>
                    <a href={`mailto:${settings.contact_email}`} className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600">
                      {settings.contact_email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Helpline / Support</div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {settings.contact_phone}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Head Office</div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {lang === 'hi' ? settings.office_address_hi : settings.office_address_en}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Form */}
            <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-750 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="font-black text-lg text-slate-900 dark:text-white mb-4">
                {t('sendFeedback')}
              </h3>

              {submitSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              {submitError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-300 text-red-800 rounded-xl text-xs font-bold">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('name')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('email')} *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('phone')}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      विषय / Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. खबर में सुधार या सुझाव"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('message')} *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'भेज रहे हैं...' : t('sendFeedback')}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
