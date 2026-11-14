import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle,
  ExternalLink,
  X,
  Share2,
  ShieldCheck,
  Zap,
  Globe,
  Copy,
  Check
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'hi' | 'en';
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose, lang }) => {
  const { canPrompt, isInstalled, isIOS, isAndroid, promptInstall } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://updatebihar.in';
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentOrigin)}`;

  const handleInstallClick = async () => {
    const success = await promptInstall();
    if (success) {
      setInstallSuccess(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentOrigin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-900 font-black flex items-center justify-center shadow-lg text-lg flex-shrink-0">
              UB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">UPDATE BIHAR</h3>
                <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Android App / APK
                </span>
              </div>
              <p className="text-xs text-blue-200">
                {lang === 'hi' 
                  ? 'बिहार का सबसे तेज़ शिक्षा समाचार मोबाइल ऐप' 
                  : 'Fastest Bihar Education News Mobile Application'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          
          {/* Status if already installed */}
          {isInstalled && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>
                {lang === 'hi' 
                  ? 'UPDATE BIHAR ऐप आपके डिवाइस पर पहले से इंस्टॉल है!' 
                  : 'UPDATE BIHAR app is already installed on this device!'}
              </span>
            </div>
          )}

          {/* Option 1: 1-Tap Direct Mobile Install */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>तरीका 1: मोबाइल में तुरंत इंस्टॉल करें (1-Tap Direct App)</span>
              </span>
              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                सुझाव (Recommended)
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              बिना किसी प्ले स्टोर या भारी फाइल के, यह ऐप सीधे आपके मोबाइल होम स्क्रीन पर डाउनलोड हो जाएगा और बिना इंटरनेट लोड के एक नेटिव ऐप की तरह फुल-स्क्रीन चलेगा।
            </p>

            {canPrompt ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <Download className="w-5 h-5 animate-bounce" />
                <span>📲 मोबाइल में तुरंत इंस्टॉल करें (Install Now)</span>
              </button>
            ) : (
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-blue-900 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                <div className="font-bold text-blue-600 dark:text-blue-400">
                  📲 मोबाइल क्रोम ब्राउज़र में ऐसे इंस्टॉल करें:
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
                  <li>अपने मोबाइल में Chrome या कोई भी ब्राउज़र खोलें।</li>
                  <li>ऊपर दाईं ओर दिए गए <strong>तीन बिन्दुओं (⋮ Three Dots)</strong> पर क्लिक करें।</li>
                  <li>मेन्यू में <strong>&quot;Install app&quot;</strong> या <strong>&quot;Add to Home screen&quot; (ऐप इंस्टॉल करें)</strong> पर टैप करें।</li>
                  <li>ऐप का आइकॉन तुरंत आपके मोबाइल में आ जाएगा!</li>
                </ol>
              </div>
            )}
          </div>

          {/* Option 2: Standalone .APK File Generation & Download */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>तरीका 2: स्टैंडअलोन .APK फाइल डाउनलोड करें (.APK Download)</span>
              </span>
              <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                100% Free Tool
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              यदि आप अपने फोन में या व्हाट्सएप पर भेजने के लिए अलग से <strong>.apk फाइल</strong> डाउनलोड करना चाहते हैं, तो Google व Microsoft के आधिकारिक टूल <strong>PWABuilder</strong> से 1-क्लिक में साइन की हुई .apk फाइल जनरेट कर सकते हैं:
            </p>

            <div className="space-y-2">
              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all text-center"
              >
                <span>📦 PWABuilder से 1-क्लिक में APK जनरेट व डाउनलोड करें ↗</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <div className="font-bold text-amber-800 dark:text-amber-400">
                  APK फाइल प्राप्त करने के 3 आसान कदम:
                </div>
                <p>1. ऊपर दिए गए बटन पर क्लिक करें (आपकी वेबसाइट का लिंक पहले से भरा है)।</p>
                <p>2. स्कोर 100/100 आएगा, फिर नीचे <strong>&quot;Package for Android&quot;</strong> पर क्लिक करें।</p>
                <p>3. <strong>&quot;Download APK&quot;</strong> बटन दबाएं। आपकी <code>update-bihar.apk</code> फाइल तुरंत डाउनलोड हो जाएगी!</p>
              </div>

              <a
                href="/api/android/download-source"
                download="update-bihar-android-apk-kit.zip"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all text-center"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>🛠️ Android Studio / TWA APK प्रोजेक्ट किट डाउनलोड करें (.ZIP)</span>
              </a>
            </div>
          </div>

          {/* Quick Share Link */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
            <div className="truncate text-xs font-mono text-slate-600 dark:text-slate-400 select-all">
              {currentOrigin}
            </div>
            <button
              onClick={handleCopyLink}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-500 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'कॉपी हो गया' : 'लिंक कॉपी करें'}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% सुरक्षित एवं वायरस मुक्त (Safe & Verified)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
          >
            बंद करें (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
