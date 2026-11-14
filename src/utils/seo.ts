import { NewsItem, SiteSettings } from '../types';

export const CATEGORY_SOCIAL_IMAGES: Record<string, string> = {
  'Bihar Board': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80',
  'Matric (10th)': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80',
  'Inter (12th)': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80',
  'Results': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80',
  'Admit Cards': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&auto=format&fit=crop&q=80',
  'Exam Updates': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80',
  'Scholarships': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
  'Govt Jobs': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80',
  'Science & Biotech': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop&q=80',
  'Universities': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80',
  'default': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80'
};

function setMetaTag(selector: string, attributeName: string, content: string) {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    const [attr, val] = selector.replace(/[\[\]]/g, '').split('=');
    element.setAttribute(attr, val.replace(/["']/g, ''));
    document.head.appendChild(element);
  }
  element.setAttribute(attributeName, content);
}

export function updateArticleMetaTags(article: NewsItem | null, settings: SiteSettings | null, lang: 'hi' | 'en' = 'hi') {
  if (!article) {
    // Reset to portal defaults
    const title = settings?.seo_title || 'UPDATE BIHAR - Bihar Education News Portal';
    const description = settings?.seo_description || 'बिहार बोर्ड, मैट्रिक, इंटर, परीक्षा, रिजल्ट, एडमिट कार्ड, छात्रवृत्ति और शिक्षा समाचार।';
    const fallbackImage = CATEGORY_SOCIAL_IMAGES.default;

    document.title = title;
    setMetaTag('meta[name="description"]', 'content', description);
    setMetaTag('meta[property="og:title"]', 'content', title);
    setMetaTag('meta[property="og:description"]', 'content', description);
    setMetaTag('meta[property="og:image"]', 'content', fallbackImage);
    setMetaTag('meta[property="og:url"]', 'content', window.location.origin);
    setMetaTag('meta[name="twitter:title"]', 'content', title);
    setMetaTag('meta[name="twitter:description"]', 'content', description);
    setMetaTag('meta[name="twitter:image"]', 'content', fallbackImage);
    if (settings?.google_site_verification) {
      setMetaTag('meta[name="google-site-verification"]', 'content', settings.google_site_verification);
    }
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `${window.location.origin}/`);
    }
    return;
  }

  // Article-specific dynamic metadata
  const articleTitle = lang === 'hi' ? (article.title_hi || article.title_en) : (article.title_en || article.title_hi);
  const articleDesc = lang === 'hi' ? (article.summary_hi || article.summary_en) : (article.summary_en || article.summary_hi);
  const pageTitle = `${articleTitle} | UPDATE BIHAR`;
  
  // Pick image: article image OR category-specific social card image
  const categoryImage = CATEGORY_SOCIAL_IMAGES[article.category] || CATEGORY_SOCIAL_IMAGES.default;
  const metaImage = article.image_url || categoryImage;
  const currentUrl = `${window.location.origin}?article=${article.id}`;

  // Update DOM Title and Meta Tags dynamically
  document.title = pageTitle;
  setMetaTag('meta[name="description"]', 'content', articleDesc);
  
  // OpenGraph (Facebook / WhatsApp / Telegram)
  setMetaTag('meta[property="og:type"]', 'content', 'article');
  setMetaTag('meta[property="og:title"]', 'content', articleTitle);
  setMetaTag('meta[property="og:description"]', 'content', articleDesc);
  setMetaTag('meta[property="og:image"]', 'content', metaImage);
  setMetaTag('meta[property="og:url"]', 'content', currentUrl);

  // Twitter Card
  setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'content', articleTitle);
  setMetaTag('meta[name="twitter:description"]', 'content', articleDesc);
  setMetaTag('meta[name="twitter:image"]', 'content', metaImage);

  // Canonical
  let canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute('href', currentUrl);
  }
}

export function updateAdSenseScript(settings: SiteSettings | null) {
  const existingScript = document.getElementById('ub-google-adsense');
  if (settings?.google_adsense_enabled && settings?.google_adsense_client_id) {
    const clientId = settings.google_adsense_client_id.trim();
    if (clientId.startsWith('ca-pub-') || clientId.length > 5) {
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'ub-google-adsense';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
        document.head.appendChild(script);
      } else {
        (existingScript as HTMLScriptElement).src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
      }
    }
  } else if (existingScript) {
    existingScript.remove();
  }
}

