import React, { useState } from 'react';
import { X, CheckCircle, Mail, User, LogOut, ArrowRight, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { RegisteredUser } from '../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: RegisteredUser | null;
  onGoogleSuccess: (user: RegisteredUser) => void;
  onLogoutUser: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onGoogleSuccess,
  onLogoutUser
}) => {
  const { lang, t } = useLanguage();
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim()) return;

    setIsSubmitting(true);
    setMessage(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail.trim().toLowerCase(),
          name: userName.trim() || userEmail.split('@')[0],
          picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName || userEmail)}`
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      onGoogleSuccess(data.user);
      setMessage(lang === 'hi' ? 'सफलतापूर्वक पाठक के रूप में लॉगिन हो गए!' : 'Successfully logged in as reader!');

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'लॉगिन में त्रुटि हुई।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-6 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Heading */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 mx-auto flex items-center justify-center text-white font-black text-xl shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {currentUser 
              ? (lang === 'hi' ? 'पाठक प्रोफ़ाइल' : 'Reader Profile') 
              : (lang === 'hi' ? 'पाठक लॉगिन / साइन अप' : 'Reader Login / Sign Up')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentUser 
              ? (lang === 'hi' ? 'आप UPDATE BIHAR के पंजीकृत पाठक हैं।' : 'You are a registered reader of UPDATE BIHAR.') 
              : (lang === 'hi' ? 'अपने ईमेल से लॉगिन करें और ताज़ा शिक्षा अलर्ट पाएं।' : 'Sign in with your email for education alerts.')}
          </p>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold text-center">
            {message}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-300 text-red-800 dark:text-red-200 rounded-xl text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {currentUser ? (
          /* Profile Details if signed in */
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <img
                src={currentUser.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full border border-blue-500"
              />
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {currentUser.email}
                </div>
                <div className="text-[11px] mt-1 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'सत्यापित पाठक (Reader)' : 'Verified Reader'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onLogoutUser();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 font-bold text-xs hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{lang === 'hi' ? 'लॉगआउट करें (Sign Out)' : 'Sign Out'}</span>
            </button>
          </div>
        ) : (
          /* Universal Clean Reader Login Form */
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'hi' ? 'ईमेल आईडी (Email Address) *' : 'Email Address *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder={lang === 'hi' ? 'अपना ईमेल दर्ज करें' : 'Enter your email'}
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'hi' ? 'आपका नाम (Name)' : 'Your Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={lang === 'hi' ? 'अपना नाम दर्ज करें' : 'Enter your name'}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isSubmitting ? (lang === 'hi' ? 'प्रमाणीकरण हो रहा है...' : 'Signing in...') : (lang === 'hi' ? 'पाठक लॉगिन / साइन अप' : 'Sign In as Reader')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'hi' 
                ? 'यह लॉगिन केवल पाठकों व छात्रवृत्ति/एग्जाम अलर्ट प्राप्त करने के लिए है।' 
                : 'This login is strictly for readers and examination alerts.'}
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
