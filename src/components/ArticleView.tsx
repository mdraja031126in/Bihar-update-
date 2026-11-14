import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Eye, Share2, Volume2, VolumeX, 
  Printer, Copy, Check, ExternalLink, ShieldCheck, 
  Clock, AlertTriangle, Download, MessageSquare, Send
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { NewsItem } from '../types';

interface ArticleViewProps {
  article: NewsItem;
  allNews: NewsItem[];
  onBack: () => void;
  onSelectRelated: (item: NewsItem) => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  article,
  allNews,
  onBack,
  onSelectRelated
}) => {
  const { lang, t } = useLanguage();
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userComment, setUserComment] = useState('');
  const [userName, setUserName] = useState('');
  const [commentList, setCommentList] = useState<{ name: string; text: string; time: string }[]>([
    {
      name: 'रोहित कुमार (पटना)',
      text: 'बहुत ही उपयोगी जानकारी। मैंने डमी एडमिट कार्ड चेक कर लिया है और विवरण सही है।',
      time: '2 घंटे पहले'
    }
  ]);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Stop speech when unmounting or article changes
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [article.id]);

  const title = lang === 'hi' ? article.title_hi : article.title_en;
  const summary = lang === 'hi' ? article.summary_hi : article.summary_en;
  const body = lang === 'hi' ? article.body_hi : article.body_en;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support text-to-speech audio.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${title}. ${summary}. ${body.slice(0, 1000)}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleCopyLink = () => {
    const url = window.location.origin + '?article=' + article.id;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShareWhatsApp = () => {
    const url = window.location.origin + '?article=' + article.id;
    const text = `*${title}*\n\n${summary}\n\n👉 पूरी खबर यहाँ पढ़ें: ${url}\n\n_अपडेट बिहार (UPDATE BIHAR) - सबसे पहले और सटीक_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim()) return;
    const newEntry = {
      name: userName.trim() || (lang === 'hi' ? 'छात्र (बिहार)' : 'Student'),
      text: userComment.trim(),
      time: lang === 'hi' ? 'अभी-अभी' : 'Just now'
    };
    setCommentList([newEntry, ...commentList]);
    setUserComment('');
    setCommentSuccess(true);
    setTimeout(() => setCommentSuccess(false), 3000);
  };

  const relatedNews = allNews
    .filter(n => n.id !== article.id && (n.category === article.category || n.subcategory === article.subcategory))
    .slice(0, 4);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large': return 'text-lg leading-relaxed';
      case 'xlarge': return 'text-xl leading-loose';
      default: return 'text-base leading-relaxed';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back Button & Tools Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'hi' ? '← वापस जाएं' : 'Back to News'}</span>
        </button>

        {/* Action Controls: Audio, Font, Share, Print */}
        <div className="flex items-center gap-2">
          {/* Audio Reader */}
          <button
            onClick={toggleSpeech}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors ${
              isSpeaking 
                ? 'bg-amber-600 text-white animate-pulse' 
                : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
            }`}
            title={isSpeaking ? t('stopListening') : t('listenArticle')}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSpeaking ? t('stopListening') : t('listenArticle')}</span>
          </button>

          {/* Font Resizer */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 rounded-md p-0.5 text-xs font-bold">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded ${fontSize === 'normal' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-500'}`}
              title="Normal text size"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded ${fontSize === 'large' ? 'bg-white dark:bg-slate-700 shadow-xs text-blue-600' : 'text-slate-500'}`}
              title="Large text size"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-1 rounded ${fontSize === 'xlarge' ? 'bg-white dark:bg-slate-700 shadow-xs text-blue-600' : 'text-slate-500'}`}
              title="Extra large text size"
            >
              A++
            </button>
          </div>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
            title="Print Article"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* WhatsApp Share */}
          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
            title={t('copyLink')}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Article Header */}
      <article className="space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-blue-600 text-white font-extrabold px-3 py-1 rounded-md">
              {article.category}
            </span>
            {article.subcategory && (
              <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-1 rounded-md">
                {article.subcategory}
              </span>
            )}
            {article.is_official_verified && (
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-md flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('verified')}</span>
              </span>
            )}
            <span className="text-slate-400 flex items-center gap-1 ml-auto">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(article.created_at)}
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {article.views} {t('views')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
            {title}
          </h1>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 border-l-4 border-blue-600 rounded-r-lg text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base leading-relaxed">
            {summary}
          </div>
        </div>

        {/* Article Image / Media */}
        {article.image_url && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
            <img 
              src={article.image_url} 
              alt={title}
              className="w-full h-auto max-h-[500px] object-cover" 
            />
            <div className="p-2 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900">
              फोटो: UPDATE BIHAR शिक्षा समाचार डेस्क
            </div>
          </div>
        )}

        {/* Video Embed if present */}
        {article.video_url && (
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
            <iframe
              src={article.video_url}
              title={title}
              className="w-full h-full"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Important Dates Callout Box if available */}
        {article.important_dates && article.important_dates.length > 0 && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-black text-sm text-amber-900 dark:text-amber-200 uppercase tracking-wide">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{t('importantDates')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {article.important_dates.map((d, i) => (
                <div key={i} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded border border-amber-200 dark:border-amber-900">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{d.label}:</span>
                  <span className="font-bold text-amber-700 dark:text-amber-300">{d.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Direct Action Link if present */}
        {article.action_link && (
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-extrabold text-sm sm:text-base">
                {lang === 'hi' ? article.action_link.text_hi : article.action_link.text_en}
              </div>
              <div className="text-xs text-blue-100">
                {lang === 'hi' ? 'सीधे आधिकारिक सर्वर से डाउनलोड करें' : 'Direct download from authentic server'}
              </div>
            </div>
            <a
              href={article.action_link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-blue-800 font-extrabold text-xs shadow-md hover:bg-blue-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{lang === 'hi' ? 'यहाँ क्लिक करें' : 'Click Here'}</span>
            </a>
          </div>
        )}

        {/* Full Article Body */}
        <div className={`prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-100 ${getFontSizeClass()}`}>
          <div className="whitespace-pre-line leading-relaxed font-normal">
            {body}
          </div>
        </div>

        {/* Official Source & Independent Disclaimer Box */}
        <div className="p-4 bg-slate-100 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'hi' ? 'आधिकारिक सूचना स्रोत:' : 'Official Information Source:'}{' '}
              <span className="text-blue-600 dark:text-blue-400">{article.source_name}</span>
            </div>
            {article.source_url && (
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>{t('officialLink')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p>
              {t('independentDisclaimer')}
            </p>
          </div>
        </div>

        {/* Share Buttons Bottom */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-blue-50 dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-slate-800 no-print">
          <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {lang === 'hi' ? 'यह जानकारी अपने दोस्तों और सहपाठियों के साथ साझा करें:' : 'Share this update with classmates:'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t('linkCopied') : t('copyLink')}</span>
            </button>
          </div>
        </div>

        {/* Student Comments / Q&A Section */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4 no-print">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span>{lang === 'hi' ? 'छात्र चर्चा एवं प्रश्नोत्तरी' : 'Student Discussion & Questions'}</span>
          </h3>

          <form onSubmit={handleAddComment} className="space-y-3 bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={lang === 'hi' ? 'आपका नाम (वैकल्पिक)' : 'Your Name (Optional)'}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <textarea
              rows={2}
              placeholder={lang === 'hi' ? 'इस खबर से जुड़ा अपना सवाल या सुझाव लिखें...' : 'Ask a question or share advice about this update...'}
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div className="flex items-center justify-between">
              {commentSuccess && (
                <span className="text-xs text-emerald-600 font-bold">
                  {lang === 'hi' ? 'आपकी टिप्पणी जुड़ गई!' : 'Comment posted successfully!'}
                </span>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs ml-auto transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'टिप्पणी भेजें' : 'Post Question'}</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {commentList.map((c, i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{c.name}</span>
                  <span className="text-slate-400 text-[11px]">{c.time}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{c.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related News Section */}
        {relatedNews.length > 0 && (
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4 no-print">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span>
              <span>{t('relatedNews')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedNews.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectRelated(rel)}
                  className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                    {rel.category}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-blue-600">
                    {lang === 'hi' ? rel.title_hi : rel.title_en}
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-1">
                    {lang === 'hi' ? rel.summary_hi : rel.summary_en}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};
