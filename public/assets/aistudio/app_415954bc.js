(() => {
  const cfg = window.APP_CONFIG || {};
  const configured = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.startsWith("PASTE_") && !cfg.SUPABASE_ANON_KEY.startsWith("PASTE_");
  const db = configured && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  const $ = id => document.getElementById(id);
  const fallbackNews = [
    {id:"demo1",title:"UPDATE BIHAR में आपका स्वागत है",category:"News",summary:"यह वेबसाइट का डेमो आर्टिकल है। अपना Supabase कनेक्शन सेट करने के बाद Admin Panel से असली खबरें प्रकाशित करें।",body:"यह एक डेमो खबर है। इसे बदलने या हटाने के लिए Supabase कनेक्ट करके Admin Login करें।",status:"published",featured:true,created_at:new Date().toISOString()},
    {id:"demo2",title:"Bihar Board की आधिकारिक सूचना कहाँ देखें?",category:"Bihar Board",summary:"परीक्षा, रिजल्ट और नोटिस की पुष्टि हमेशा बिहार बोर्ड की आधिकारिक वेबसाइट से करें।",body:"बिहार विद्यालय परीक्षा समिति की आधिकारिक वेबसाइट पर जारी नोटिस और अपडेट देखें।",source_url:"https://biharboardonline.bihar.gov.in/",status:"published",created_at:new Date().toISOString()}
  ];
  let news = [...fallbackNews], editing = false;
  const showToast = msg => { const t=$("toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2600); };
  const dateText = d => new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
  const safe = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function render(items=news) {
    const grid=$("newsGrid");
    if(!items.length){grid.innerHTML='<div class="empty-state">इस कैटेगरी में अभी कोई खबर उपलब्ध नहीं है।</div>';return;}
    grid.innerHTML=items.map(n=>`<article class="news-card"><div class="news-image">${n.image_url?`<img src="${safe(n.image_url)}" alt="" loading="lazy" onerror="this.parentElement.textContent='📰'">`:"📰"}</div><div class="news-content"><div class="news-meta"><span class="category-pill">${safe(n.category)}</span><span>${dateText(n.created_at)}</span>${n.featured?'<span>★ Featured</span>':''}</div><h3>${safe(n.title)}</h3><p>${safe(n.summary)}</p><a class="read-more" href="#" data-read="${safe(n.id)}">पूरी खबर पढ़ें →</a></div></article>`).join("");
    $("trendingList").innerHTML=items.slice(0,5).map(n=>`<a class="trend-item" href="#" data-read="${safe(n.id)}">${safe(n.title)}</a>`).join("") || "<p>अभी कोई ट्रेंडिंग खबर नहीं।</p>";
    grid.querySelectorAll("[data-read]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();openArticle(a.dataset.read)}));
    $("trendingList").querySelectorAll("[data-read]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();openArticle(a.dataset.read)}));
  }
  function openArticle(id){
    const n=news.find(x=>String(x.id)===String(id)); if(!n)return;
    const source=n.source_url?`<p><a target="_blank" rel="noopener" href="${safe(n.source_url)}">आधिकारिक स्रोत देखें ↗</a></p>`:"";
    const w=window.open("","_blank");
    if(!w){showToast("Popup blocked. Browser में popups allow करें।");return;}
    w.document.write(`<!doctype html><html lang="hi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${safe(n.title)}</title><body style="font:16px/1.9 system-ui,'Noto Sans Devanagari',sans-serif;max-width:760px;margin:35px auto;padding:0 18px;color:#17243a"><a href="javascript:history.back()" style="color:#1769d2">← वापस</a><p style="color:#1769d2">${safe(n.category)} · ${dateText(n.created_at)}</p><h1 style="color:#102d5e;line-height:1.35">${safe(n.title)}</h1>${n.image_url?`<img src="${safe(n.image_url)}" style="max-width:100%;border-radius:12px">`:""}<p>${safe(n.summary)}</p><hr><div style="white-space:pre-wrap">${safe(n.body)}</div>${source}<p style="color:#8793a5;font-size:12px">UPDATE BIHAR · सूचना की आधिकारिक पुष्टि संबंधित विभाग से करें।</p></body></html>`);
    w.document.close();
  }
  function fillCategories(){
    const cats=[...new Set(news.map(n=>n.category))]; $("categoryFilter").innerHTML='<option value="">सभी कैटेगरी</option>'+cats.map(c=>`<option>${safe(c)}</option>`).join("");
  }
  function applyFilters(){
    const q=$("searchInput").value.toLowerCase(),c=$("categoryFilter").value;
    render(news.filter(n=>(!c||n.category===c)&&(!q||(n.title+" "+n.summary+" "+n.body).toLowerCase().includes(q))));
  }
  async function loadNews(){
    if(!db){render();fillCategories();$("tickerText").textContent += " (Demo mode — Supabase setup बाकी है)";return;}
    const {data,error}=await db.from("news").select("*").eq("status","published").order("featured",{ascending:false}).order("created_at",{ascending:false});
    if(error){console.error(error);showToast("डेटा लोड नहीं हुआ। Supabase setup जाँचें।");render();return;}
    news=data||[];render();fillCategories();
  }
  async function loadSettings(){
    if(!db)return;
    const {data}=await db.from("site_settings").select("*").eq("id",1).maybeSingle();
    if(data){document.title=data.site_name+" | "+data.tagline;$("tickerText").textContent=data.ticker||"";document.querySelectorAll(".brand b").forEach(x=>x.textContent=data.site_name);document.querySelectorAll(".brand small").forEach(x=>x.textContent=data.tagline);$("settingName").value=data.site_name;$("settingTagline").value=data.tagline;$("settingTicker").value=data.ticker;$("settingEmail").value=data.contact_email||"";}
  }
  function openAdmin(){$("adminModal").hidden=false;document.body.style.overflow="hidden";if(db)checkSession();}
  function closeAdmin(){$("adminModal").hidden=true;document.body.style.overflow="";}
  async function checkSession(){
    if(!db)return;
    const {data}=await db.auth.getSession();
    if(data.session){$("loginPanel").hidden=true;$("dashboardPanel").hidden=false;loadAdminNews();}
    else{$("loginPanel").hidden=false;$("dashboardPanel").hidden=true;}
  }
  async function loadAdminNews(){
    if(!db)return;
    const {data,error}=await db.from("news").select("*").order("created_at",{ascending:false});
    if(error){showToast("Admin data load error: "+error.message);return;}
    const list=$("adminNewsList");list.innerHTML=(data||[]).map(n=>`<div class="admin-news-item"><div><b>${safe(n.title)}</b><small>${safe(n.category)} · ${safe(n.status)} · ${dateText(n.created_at)}</small></div><div class="admin-actions"><button data-edit="${n.id}">Edit</button><button class="delete" data-delete="${n.id}">Delete</button></div></div>`).join("")||"<p class='muted'>अभी कोई खबर नहीं है।</p>";
    list.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>editNews(data.find(n=>String(n.id)===b.dataset.edit)));
    list.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>deleteNews(b.dataset.delete));
  }
  function editNews(n){
    $("newsId").value=n.id;$("newsTitle").value=n.title;$("newsCategory").value=n.category;$("newsStatus").value=n.status;$("newsSummary").value=n.summary;$("newsBody").value=n.body;$("newsImage").value=n.image_url||"";$("newsSource").value=n.source_url||"";$("newsFeatured").checked=!!n.featured;$("editorHeading").textContent="खबर Edit करें";switchTab("editor");
  }
  function clearNews(){$("newsForm").reset();$("newsId").value="";$("editorHeading").textContent="नई खबर प्रकाशित करें";}
  async function deleteNews(id){
    if(!confirm("क्या आप इस खबर को स्थायी रूप से Delete करना चाहते हैं?"))return;
    const {error}=await db.from("news").delete().eq("id",id);if(error){showToast(error.message);return;}showToast("खबर delete हो गई।");await loadAdminNews();await loadNews();
  }
  function switchTab(name){
    ["editor","manage","settings"].forEach(t=>{$(t+"Tab").hidden=t!==name;document.querySelector(`[data-tab="${t}"]`).classList.toggle("active",t===name);});
    if(name==="manage")loadAdminNews();
  }
  $("adminOpen").onclick=openAdmin;$("closeAdmin").onclick=closeAdmin;$("adminModal").addEventListener("click",e=>{if(e.target===$("adminModal"))closeAdmin();});
  $("menuToggle").onclick=()=>$("mainNav").classList.toggle("open");
  $("searchInput").addEventListener("input",applyFilters);$("categoryFilter").addEventListener("change",applyFilters);
  document.querySelectorAll(".quick-card").forEach(b=>b.onclick=()=>{$("categoryFilter").value=[...$("categoryFilter").options].some(o=>o.value===b.dataset.category)?b.dataset.category:"";applyFilters();$("latest").scrollIntoView({behavior:"smooth"});});
  document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
  $("resetNews").onclick=clearNews;
  $("loginForm").onsubmit=async e=>{e.preventDefault();if(!db){$("loginMessage").textContent="पहले config.js में Supabase URL और anon key सेट करें।";return;}
    const {error}=await db.auth.signInWithPassword({email:$("adminEmail").value,password:$("adminPassword").value});
    $("loginMessage").textContent=error?error.message:"Login successful";if(!error)checkSession();};
  $("logoutBtn").onclick=async()=>{await db.auth.signOut();$("loginPanel").hidden=false;$("dashboardPanel").hidden=true;showToast("Logout हो गया।");};
  $("newsForm").onsubmit=async e=>{e.preventDefault();if(!db){showToast("पहले Supabase configure करें।");return;}
    const item={title:$("newsTitle").value.trim(),category:$("newsCategory").value,status:$("newsStatus").value,summary:$("newsSummary").value.trim(),body:$("newsBody").value.trim(),image_url:$("newsImage").value.trim()||null,source_url:$("newsSource").value.trim()||null,featured:$("newsFeatured").checked,updated_at:new Date().toISOString()};
    const id=$("newsId").value;const query=id?db.from("news").update(item).eq("id",id):db.from("news").insert(item);
    const {error}=await query;if(error){$("saveMessage").textContent=error.message;return;}
    $("saveMessage").textContent="सफलतापूर्वक सेव हुआ।";clearNews();await loadNews();await loadAdminNews();showToast("खबर सेव हो गई।");};
  $("settingsForm").onsubmit=async e=>{e.preventDefault();if(!db){showToast("पहले Supabase configure करें।");return;}
    const item={id:1,site_name:$("settingName").value.trim(),tagline:$("settingTagline").value.trim(),ticker:$("settingTicker").value.trim(),contact_email:$("settingEmail").value.trim()||null,updated_at:new Date().toISOString()};
    const {error}=await db.from("site_settings").upsert(item);if(error){showToast(error.message);return;}await loadSettings();showToast("Settings सेव हो गईं।");};
  $("today").textContent=new Date().toLocaleDateString("hi-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});$("year").textContent=new Date().getFullYear();
  loadNews();loadSettings();
})();