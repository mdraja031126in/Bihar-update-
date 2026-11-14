# UPDATE BIHAR — वेबसाइट प्रोजेक्ट

यह responsive bilingual (Hindi + English) Bihar education/news portal starter है। इसमें public homepage, news search/filter, article view, Supabase-powered admin login, news create/edit/delete, draft/publish और site settings शामिल हैं।

## जरूरी सच
- वेबसाइट का frontend और Supabase का शुरुआती free tier मुफ्त में शुरू किया जा सकता है। Free tier की limits होती हैं; unlimited traffic/storage या हमेशा मुफ्त रहने की गारंटी नहीं है।
- यह प्रोजेक्ट demo mode में Supabase के बिना homepage दिखाता है। वास्तविक Admin Dashboard और खबरें सेव करने के लिए Supabase सेटअप जरूरी है।
- यह अपने-आप हर पल खबरें नहीं खोजता। खबरें Admin द्वारा प्रकाशित होंगी। बाद में भरोसेमंद आधिकारिक स्रोतों के RSS/API से moderation वाला importer जोड़ा जा सकता है।
- UPDATE BIHAR स्वतंत्र वेबसाइट है, बिहार बोर्ड की आधिकारिक वेबसाइट नहीं।

## 1) Supabase सेटअप
1. https://supabase.com पर free project बनाएं।
2. Project Settings → API से Project URL और `anon` / publishable key कॉपी करें।
3. `config.js` में `SUPABASE_URL` और `SUPABASE_ANON_KEY` भरें। `service_role` key कभी भी यहाँ न डालें।
4. Supabase → SQL Editor खोलें और `schema.sql` की पूरी SQL चलाएं।
5. Authentication → Providers में Email provider enabled रखें।
6. Authentication → Users में अपने लिए एक user बनाएं। यही single admin login होगा। Public signup बंद रखें।
7. `index.html` को local server या hosting पर खोलें। Supabase config के बाद Admin Login से लॉगिन करें।

## 2) Free hosting
- GitHub पर project की files upload करें।
- Cloudflare Pages में GitHub repository connect करें।
- Framework preset: None; Build command खाली; Build output directory `/` (या project root) रखें।
- Deploy करें। Cloudflare आपको free `pages.dev` address देगा।
- अपना custom `.com` domain वैकल्पिक है और आम तौर पर paid होता है।

## 3) Admin Dashboard
- Admin Login → Supabase में बनाए गए email/password से login।
- नई खबर: Title, Category, Summary, Full Article, optional Image URL और Official Source URL भरें।
- Status `Published` करने पर public homepage पर खबर दिखेगी; `Draft` केवल admin list में रहेगी।
- Manage News से Edit/Delete।
- Settings से site name, tagline और breaking ticker बदलें।

## 4) सुरक्षा और संचालन
- `anon` key browser में रखना सामान्य है; database सुरक्षा RLS policies से आती है। `service_role` key कभी frontend में न रखें।
- केवल अपने admin user को Supabase Auth में बनाएं; sign-up बंद रखें।
- Password मजबूत रखें और किसी के साथ साझा न करें।
- Official source URL जोड़ें और रिजल्ट/तारीख जैसे दावों को प्रकाशित करने से पहले आधिकारिक नोटिस से verify करें।
- कानूनी पेजों के नमूने दिए गए हैं; अपनी वास्तविक contact और privacy जानकारी के अनुसार अपडेट करें।
- अभी image URL field है; direct image upload/storage manager, multi-admin, analytics, automated RSS ingestion, push notification और custom domain इस starter में शामिल नहीं हैं।

## Files
- `index.html` — website structure + admin UI
- `style.css` — responsive styling
- `app.js` — news, filters, Supabase auth and CRUD
- `config.js` — Supabase public configuration
- `schema.sql` — database tables and Row Level Security
