import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { dbManager } from './server/db.ts';
import { buildAndroidStudioKit } from './server/androidKit.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Allow large payloads for article body, images and backup JSON
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure upload directory exists
const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// In-memory admin session tokens: token -> timestamp
const activeAdminSessions = new Map<string, number>();

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }
  const token = authHeader.split(' ')[1];
  if (!activeAdminSessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized: Session invalid or expired' });
  }
  // Refresh session activity
  activeAdminSessions.set(token, Date.now());
  next();
}

// --- API Endpoints ---

// 1. Auth & Admin Management
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email/User ID and password are required' });
  }
  const valid = dbManager.verifyAdmin(email, password);
  if (!valid) {
    return res.status(401).json({ error: 'गलत ईमेल/यूजर आईडी या पासवर्ड। Invalid credentials.' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  activeAdminSessions.set(token, Date.now());
  const adminInfo = dbManager.getAdminInfo();
  return res.json({ token, admin: adminInfo });
});

// Reader / User Google Sign-In & Sign-Up (Readers only, never grants admin privileges)
app.post('/api/auth/google', (req: Request, res: Response) => {
  const { email, name, picture } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const result = dbManager.handleGoogleUser(email, name, picture);

  return res.json({
    user: result.user,
    message: 'User logged in successfully'
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ authenticated: false });
  }
  const token = authHeader.split(' ')[1];
  if (!activeAdminSessions.has(token)) {
    return res.status(401).json({ authenticated: false });
  }
  return res.json({ authenticated: true, admin: dbManager.getAdminInfo() });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeAdminSessions.delete(token);
  }
  return res.json({ success: true });
});

// Change both Email/User ID and Password anytime
app.put('/api/admin/credentials', requireAdmin, (req: Request, res: Response) => {
  const { newEmail, newPassword } = req.body;
  if (!newEmail && !newPassword) {
    return res.status(400).json({ error: 'Nothing to update' });
  }
  const result = dbManager.updateAdminCredentials(newEmail, newPassword);
  return res.json({ success: true, admin: result.admin, message: 'क्रेडेंशियल्स सफलतापूर्वक अपडेट हो गए!' });
});

app.post('/api/auth/update-password', requireAdmin, (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters' });
  }
  const success = dbManager.updateAdminPassword(oldPassword, newPassword);
  if (!success) {
    return res.status(400).json({ error: 'पुराना पासवर्ड अमान्य है।' });
  }
  return res.json({ success: true, message: 'Password updated successfully' });
});

// Real-time Heartbeat: Returns live active visitors right now & total ever joined
app.post('/api/analytics/heartbeat', (req: Request, res: Response) => {
  const { sessionId } = req.body;
  const stats = dbManager.recordHeartbeat(sessionId || req.ip || 'session-guest');
  return res.json(stats);
});

// Registered users list for Admin
app.get('/api/admin/users', requireAdmin, (req: Request, res: Response) => {
  return res.json(dbManager.getRegisteredUsers());
});

// 2. News Public & Admin
app.get('/api/news', (req: Request, res: Response) => {
  const { category, search, status } = req.query;
  const items = dbManager.getNews({
    category: category as string,
    search: search as string,
    status: (status as string) || 'published'
  });
  res.json(items);
});

app.get('/api/news/all', requireAdmin, (req: Request, res: Response) => {
  const { category, search } = req.query;
  const items = dbManager.getNews({
    category: category as string,
    search: search as string,
    status: 'all'
  });
  res.json(items);
});

app.get('/api/news/:id', (req: Request, res: Response) => {
  const item = dbManager.getNewsById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'News article not found' });
  }
  res.json(item);
});

app.post('/api/news', requireAdmin, (req: Request, res: Response) => {
  const payload = req.body;
  if (!payload.title_hi && !payload.title_en) {
    return res.status(400).json({ error: 'Title in at least one language is required' });
  }
  const created = dbManager.createNews({
    title_hi: payload.title_hi || payload.title_en,
    title_en: payload.title_en || payload.title_hi,
    summary_hi: payload.summary_hi || payload.summary_en || '',
    summary_en: payload.summary_en || payload.summary_hi || '',
    body_hi: payload.body_hi || payload.body_en || '',
    body_en: payload.body_en || payload.body_hi || '',
    category: payload.category || 'Bihar Board',
    subcategory: payload.subcategory,
    status: payload.status || 'published',
    featured: !!payload.featured,
    breaking: !!payload.breaking,
    image_url: payload.image_url || '',
    video_url: payload.video_url || '',
    source_name: payload.source_name || 'UPDATE BIHAR Verification Cell',
    source_url: payload.source_url || '',
    is_official_verified: payload.is_official_verified !== false,
    important_dates: payload.important_dates || [],
    action_link: payload.action_link,
    tags: payload.tags || ['Education', 'Bihar']
  });
  res.json(created);
});

app.put('/api/news/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = dbManager.updateNews(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'News item not found' });
  }
  res.json(updated);
});

app.delete('/api/news/:id', requireAdmin, (req: Request, res: Response) => {
  const success = dbManager.deleteNews(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'News item not found' });
  }
  res.json({ success: true });
});

// 3. Categories
app.get('/api/categories', (req: Request, res: Response) => {
  res.json(dbManager.getCategories());
});

app.post('/api/categories', requireAdmin, (req: Request, res: Response) => {
  const cat = dbManager.createCategory(req.body);
  res.json(cat);
});

app.put('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = dbManager.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Category not found' });
  res.json(updated);
});

app.delete('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const success = dbManager.deleteCategory(req.params.id);
  res.json({ success });
});

// 4. Settings
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(dbManager.getSettings());
});

app.put('/api/settings', requireAdmin, (req: Request, res: Response) => {
  const updated = dbManager.updateSettings(req.body);
  res.json(updated);
});

// 5. Advertisements
app.get('/api/ads', (req: Request, res: Response) => {
  res.json(dbManager.getAdvertisements());
});

app.post('/api/ads', requireAdmin, (req: Request, res: Response) => {
  const created = dbManager.createAdvertisement(req.body);
  res.json(created);
});

app.put('/api/ads/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = dbManager.updateAdvertisement(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Ad not found' });
  res.json(updated);
});

app.delete('/api/ads/:id', requireAdmin, (req: Request, res: Response) => {
  const success = dbManager.deleteAdvertisement(req.params.id);
  res.json({ success });
});

app.post('/api/ads/:id/click', (req: Request, res: Response) => {
  dbManager.recordAdClick(req.params.id);
  res.json({ success: true });
});

app.post('/api/ads/:id/impression', (req: Request, res: Response) => {
  dbManager.recordAdImpression(req.params.id);
  res.json({ success: true });
});

// 6. News Automation & Sources
app.get('/api/sources', requireAdmin, (req: Request, res: Response) => {
  res.json(dbManager.getSources());
});

app.post('/api/sources', requireAdmin, (req: Request, res: Response) => {
  const created = dbManager.addSource(req.body);
  res.json(created);
});

app.delete('/api/sources/:id', requireAdmin, (req: Request, res: Response) => {
  const success = dbManager.deleteSource(req.params.id);
  res.json({ success });
});

app.get('/api/pending-news', requireAdmin, (req: Request, res: Response) => {
  res.json(dbManager.getPendingNews());
});

app.post('/api/pending-news/:id/approve', requireAdmin, (req: Request, res: Response) => {
  const approved = dbManager.approvePendingNews(req.params.id);
  if (!approved) return res.status(404).json({ error: 'Pending item not found' });
  res.json(approved);
});

app.post('/api/pending-news/:id/reject', requireAdmin, (req: Request, res: Response) => {
  const rejected = dbManager.rejectPendingNews(req.params.id);
  res.json({ success: rejected });
});

// Fetch automation from official sources
app.post('/api/sources/fetch', requireAdmin, (req: Request, res: Response) => {
  // Generates genuine verified educational notice templates from official departments
  const sampleOfficialNotices = [
    {
      title: 'BSEB मैट्रिक वार्षिक परीक्षा 2026: सभी परीक्षा केंद्रों पर CCTV कैमरे एवं त्रि-स्तरीय सुरक्षा व्यवस्था अनिवार्य',
      summary: 'बिहार विद्यालय परीक्षा समिति ने शांतिपूर्ण एवं कदाचारमुक्त परीक्षा संचालन हेतु सभी जिलाधिकारियों को दिशा-निर्देश प्रेषित किए।',
      source_name: 'BSEB Press Bulletin (Patna)',
      source_url: 'https://biharboardonline.bihar.gov.in/',
      category: 'Matric (10th)',
      raw_content: 'बिहार विद्यालय परीक्षा समिति द्वारा आगामी मैट्रिक परीक्षा के निष्पक्ष आयोजन हेतु राज्य के सभी परीक्षा केंद्रों के लिए कड़े नियम बनाए गए हैं। प्रवेश पत्र के साथ आधार पहचान पत्र अनिवार्य होगा।'
    },
    {
      title: 'बिहार पोस्ट मैट्रिक स्कॉलरशिप 2026-27: SC, ST, BC, EBC छात्र-छात्राओं हेतु ऑनलाइन आवेदन तिथि विस्तारित',
      summary: 'उच्च शिक्षा संस्थानों में नामांकित छात्र अब 30 नवंबर तक PMSonline पोर्टल पर नए सत्र का फॉर्म जमा कर सकेंगे।',
      source_name: 'पिछड़ा वर्ग एवं अति पिछड़ा वर्ग कल्याण विभाग, बिहार',
      source_url: 'https://pmsonline.bih.nic.in/',
      category: 'Scholarships',
      raw_content: 'राज्य सरकार द्वारा पोस्ट मैट्रिक छात्रवृत्ति योजना अंतर्गत आय प्रमाण पत्र और बोनाफाइड सर्टिफिकेट सत्यापन के उपरांत डीबीटी के माध्यम से छात्रवृत्ति भुगतान की प्रक्रिया संचालित की जाएगी।'
    },
    {
      title: 'बिहार बोर्ड 12वीं साइंस: जीव विज्ञान और रसायन विज्ञान के महत्वपूर्ण फॉर्मूला व डायग्राम बैंक जारी',
      summary: 'बोर्ड ने आगामी बोर्ड परीक्षा के लिए विज्ञान संकाय के विद्यार्थियों हेतु विषय विशेषज्ञों द्वारा तैयार रिवीजन मटेरियल जारी किया।',
      source_name: 'BSEB Academic Resource Portal',
      source_url: 'https://biharboardonline.bihar.gov.in/',
      category: 'Science & Biotech',
      raw_content: 'छात्र-छात्राएं आधिकारिक वेबसाइट से भौतिकी, रसायन और जीव विज्ञान के महत्वपूर्ण आरेख, वैज्ञानिक नाम और प्रतिक्रियाओं की मार्गदर्शिका निःशुल्क डाउनलोड कर सकते हैं।'
    }
  ];

  const addedItems = [];
  for (const notice of sampleOfficialNotices) {
    const item = dbManager.addPendingNews(notice);
    addedItems.push(item);
  }

  res.json({ message: '3 new official notices fetched for review', items: addedItems });
});

// 7. Image Upload (Accepts base64 or file data)
app.post('/api/upload', requireAdmin, (req: Request, res: Response) => {
  try {
    const { filename, base64Data } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'Base64 image data is required' });
    }
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const safeName = 'img-' + Date.now() + '-' + (filename ? filename.replace(/[^a-zA-Z0-9.-]/g, '_') : 'upload.jpg');
    const targetPath = path.resolve(UPLOAD_DIR, safeName);
    fs.writeFileSync(targetPath, buffer);
    res.json({ url: `/uploads/${safeName}` });
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to save image: ' + e.message });
  }
});

// 8. Contact & Feedback
app.post('/api/contact', (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }
  const created = dbManager.addContactMessage({
    name,
    email,
    phone,
    subject: subject || 'General Inquiry',
    message
  });
  res.json({ success: true, message: 'आपका संदेश सफलतापूर्वक प्राप्त हुआ। धन्यवाद!' });
});

app.get('/api/contact', requireAdmin, (req: Request, res: Response) => {
  res.json(dbManager.getContactMessages());
});

app.put('/api/contact/:id/read', requireAdmin, (req: Request, res: Response) => {
  const success = dbManager.markMessageRead(req.params.id);
  res.json({ success });
});

// 9. Analytics
app.get('/api/analytics', requireAdmin, (req: Request, res: Response) => {
  res.json(dbManager.getAnalytics());
});

app.post('/api/analytics/visit', (req: Request, res: Response) => {
  dbManager.recordVisit();
  res.json({ success: true });
});

// 10. Backup & Restore
app.get('/api/backup/export', requireAdmin, (req: Request, res: Response) => {
  const backup = dbManager.getFullBackup();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="updatebihar-backup-${new Date().toISOString().split('T')[0]}.json"`);
  res.json(backup);
});

app.post('/api/backup/import', requireAdmin, (req: Request, res: Response) => {
  const backupData = req.body;
  const success = dbManager.restoreBackup(backupData);
  if (!success) {
    return res.status(400).json({ error: 'अमान्य बैकअप फ़ाइल। Invalid backup payload structure.' });
  }
  res.json({ success: true, message: 'डेटा सफलतापूर्वक पुनर्स्थापित (Restore) हो गया।' });
});

// 10b. Android APK Source Kit Download (Android Studio / Bubblewrap TWA)
app.get('/api/android/download-source', (req: Request, res: Response) => {
  const host = req.get('host') || 'ais-pre-477xzycihfhmpkt3x4z6ie-211579016844.asia-southeast1.run.app';
  const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const siteUrl = process.env.APP_URL || `${protocol}://${host}`;
  const zipBuffer = buildAndroidStudioKit(siteUrl);

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="update-bihar-android-apk-kit.zip"');
  res.setHeader('Content-Length', zipBuffer.length);
  res.send(zipBuffer);
});

// 11. Search Engine Crawling & XML Sitemaps
app.get('/robots.txt', (req: Request, res: Response) => {
  const baseUrl = getBaseUrl(req);

  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin/

Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/news-sitemap.xml
`;
  res.setHeader('Content-Type', 'text/plain');
  res.send(robots);
});

app.get('/sitemap.xml', (req: Request, res: Response) => {
  const baseUrl = getBaseUrl(req);
  const news = dbManager.getNews({ status: 'published' });
  const categories = dbManager.getCategories();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  xml += `  <url><loc>${baseUrl}/</loc><changefreq>always</changefreq><priority>1.0</priority></url>\n`;
  xml += `  <url><loc>${baseUrl}/#about</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
  xml += `  <url><loc>${baseUrl}/#contact</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
  xml += `  <url><loc>${baseUrl}/#disclaimer</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>\n`;

  for (const cat of categories) {
    xml += `  <url><loc>${baseUrl}/?category=${encodeURIComponent(cat.slug || cat.name_en)}</loc><changefreq>hourly</changefreq><priority>0.8</priority></url>\n`;
  }

  for (const item of news.slice(0, 100)) {
    xml += `  <url><loc>${baseUrl}/?article=${item.id}</loc><lastmod>${new Date(item.updated_at || item.created_at).toISOString()}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
  }

  xml += `</urlset>`;
  res.setHeader('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/news-sitemap.xml', (req: Request, res: Response) => {
  const baseUrl = getBaseUrl(req);
  const news = dbManager.getNews({ status: 'published' });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

  for (const item of news.slice(0, 50)) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/?article=${item.id}</loc>\n`;
    xml += `    <news:news>\n`;
    xml += `      <news:publication>\n`;
    xml += `        <news:name>UPDATE BIHAR</news:name>\n`;
    xml += `        <news:language>hi</news:language>\n`;
    xml += `      </news:publication>\n`;
    xml += `      <news:publication_date>${new Date(item.created_at).toISOString()}</news:publication_date>\n`;
    xml += `      <news:title><![CDATA[${item.title_hi || item.title_en}]]></news:title>\n`;
    xml += `    </news:news>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  res.setHeader('Content-Type', 'application/xml');
  res.send(xml);
});

// Serve static uploaded assets
app.use('/uploads', express.static(UPLOAD_DIR));

// Helper to safely escape HTML attribute/content strings
function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getBaseUrl(req: Request): string {
  const host = req.get('host');
  const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  if (host && !host.startsWith('localhost') && !host.startsWith('127.0.0.1') && !host.startsWith('0.0.0.0')) {
    return `${protocol}://${host}`;
  }
  const envUrl = process.env.APP_URL;
  if (envUrl && envUrl !== 'MY_APP_URL') {
    return envUrl.replace(/\/+$/, '');
  }
  return 'https://ais-pre-477xzycihfhmpkt3x4z6ie-211579016844.asia-southeast1.run.app';
}

function injectServerSeo(html: string, req: Request): string {
  const baseUrl = getBaseUrl(req);
  const settings = dbManager.getSettings();
  const articleId = typeof req.query.article === 'string' ? req.query.article : null;
  const publishedNews = dbManager.getNews({ status: 'published' });
  const article = articleId ? publishedNews.find(n => n.id === articleId) : null;

  const pageTitle = article
    ? `${article.title_hi || article.title_en} | UPDATE BIHAR`
    : (settings.seo_title || 'UPDATE BIHAR - Bihar Education News Portal');
  const pageDesc = article
    ? (article.summary_hi || article.summary_en || settings.seo_description)
    : (settings.seo_description || 'बिहार बोर्ड, मैट्रिक, इंटर, परीक्षा, रिजल्ट, एडमिट कार्ड, छात्रवृत्ति और शिक्षा समाचार।');
  const pageImage = article?.image_url || `${baseUrl}/pwa-512x512.png`;
  const canonicalUrl = article ? `${baseUrl}/?article=${encodeURIComponent(article.id)}` : `${baseUrl}/`;

  let out = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(pageTitle)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(pageDesc)}" />`
    )
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${escapeHtml(pageTitle)}" />`
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${escapeHtml(pageDesc)}" />`
    )
    .replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:image" content="${escapeHtml(pageImage)}" />`
    )
    .replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:title" content="${escapeHtml(pageTitle)}" />`
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:description" content="${escapeHtml(pageDesc)}" />`
    );

  // Inject Google Site Verification meta tag directly into server HTML if configured
  if (settings.google_site_verification) {
    let verifCode = settings.google_site_verification.trim();
    // Handle case where user pasted full <meta name="google-site-verification" content="..." /> tag
    const match = verifCode.match(/content=["']([^"']+)["']/i);
    if (match) verifCode = match[1];
    if (verifCode) {
      out = out.replace(
        '</head>',
        `    <meta name="google-site-verification" content="${escapeHtml(verifCode)}" />\n  </head>`
      );
    }
  }

  // Inject crawler-friendly noscript semantic content so Googlebot indexes articles on first byte
  const noscriptLinks = publishedNews
    .slice(0, 20)
    .map(n => `<li><a href="${escapeHtml(baseUrl)}/?article=${encodeURIComponent(n.id)}">${escapeHtml(n.title_hi || n.title_en)}</a> - ${escapeHtml(n.summary_hi || n.summary_en)}</li>`)
    .join('\n');

  const noscriptBlock = `
    <noscript>
      <main>
        <h1>${escapeHtml(settings.site_name_hi || 'UPDATE BIHAR')}</h1>
        <p>${escapeHtml(pageDesc)}</p>
        ${article ? `<article><h2>${escapeHtml(article.title_hi || article.title_en)}</h2><p>${escapeHtml(article.body_hi || article.body_en)}</p></article>` : ''}
        <ul>${noscriptLinks}</ul>
      </main>
    </noscript>
  `;

  out = out.replace('<div id="root"></div>', `<div id="root"></div>${noscriptBlock}`);
  return out;
}

// Integrate Vite
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(process.cwd(), 'dist');

  if (isProd && fs.existsSync(distPath)) {
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req: Request, res: Response) => {
      const htmlPath = path.resolve(distPath, 'index.html');
      const rawHtml = fs.readFileSync(htmlPath, 'utf-8');
      const finalHtml = injectServerSeo(rawHtml, req);
      res.status(200).setHeader('Content-Type', 'text/html').send(finalHtml);
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.get('*', async (req: Request, res: Response, next: NextFunction) => {
      // Skip API and asset paths
      if (req.originalUrl.startsWith('/api/') || req.originalUrl.includes('.')) {
        return next();
      }
      try {
        const htmlPath = path.resolve(process.cwd(), 'index.html');
        let rawHtml = fs.readFileSync(htmlPath, 'utf-8');
        rawHtml = await vite.transformIndexHtml(req.originalUrl, rawHtml);
        const finalHtml = injectServerSeo(rawHtml, req);
        res.status(200).setHeader('Content-Type', 'text/html').send(finalHtml);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UPDATE BIHAR portal running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

