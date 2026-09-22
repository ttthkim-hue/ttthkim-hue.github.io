const state = {
  lang: localStorage.getItem("enermaker-lang") || "ko",
  data: null,
  year: "all",
  query: "",
  leadOnly: false,
  newsCategory: "All",
  adminToken: "",
  adminData: null,
  adminFileSha: ""
};

const $ = (id) => document.getElementById(id);
const arr = (v) => Array.isArray(v) ? v : [];
const pick = (ko, en) => state.lang === "en" ? (en || ko || "") : (ko || en || "");
const clear = (node) => { if (node) node.replaceChildren(); return node; };
const el = (tag, className, value) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined && value !== null) node.textContent = value;
  return node;
};
const extLink = (label, href, className) => {
  const node = el("a", className || "", label);
  node.href = href || "#/";
  if (/^https?:\/\//i.test(node.href)) {
    node.target = "_blank";
    node.rel = "noopener noreferrer";
  }
  return node;
};
const setText = (id, value) => { const node = $(id); if (node) node.textContent = value || ""; };

const labels = {
  ko: {
    home:"\ud648", research:"\uc5f0\uad6c", publications:"\ub17c\ubb38", pi:"\uc5f0\uad6c\ucc45\uc784\uc790", news:"\uc18c\uc2dd", students:"\ud559\uc0dd", contact:"\uc5f0\ub77d\ucc98",
    researchMore:"\uc804\uccb4 \ubcf4\uae30 \u2192", pubMore:"\ub17c\ubb38 \uc804\uccb4 \u2192", newsMore:"\uc18c\uc2dd \uc804\uccb4 \u2192",
    heroResearch:"\uc5f0\uad6c\ubd84\uc57c", heroStudents:"\ub300\ud559\uc6d0\u00b7\ud559\uc0dd",
    researchTitle:"\uc8fc\uc694 \uc5f0\uad6c\ubd84\uc57c", researchSub:"\uc5d0\ub108\uc9c0 \ud558\ubca0\uc2a4\ud305 \u00b7 \uc13c\uc2f1 \u00b7 \ub098\ub178\uc18c\uc7ac \u00b7 \uacc4\uc0b0\u00b7AI \uc124\uacc4\ub97c \uc911\uc2ec\uc73c\ub85c \uc5f0\uad6c\ud569\ub2c8\ub2e4.",
    pubOverview:"\uc5f0\uad6c\uc2e4\uc801 \ud55c\ub208\uc5d0", pubTitle:"\ub17c\ubb38", pubSub:"TENG, \uae30\ub2a5\uc131 \uc18c\uc7ac, \uc790\uac00\ubc1c\uc804 \uc13c\uc2f1\uacfc \ubc14\uc774\uc624\uc804\uc790\uc18c\uc790 \uad00\ub828 \uc8fc\uc694 \ub17c\ubb38\uc744 \uc18c\uac1c\ud569\ub2c8\ub2e4.",
    latest:"\ucd5c\uadfc \uc18c\uc2dd", newsTitle:"\uc18c\uc2dd", newsSub:"\uc5f0\uad6c \uc131\uacfc, \ud559\uacfc \uc18c\uc2dd, \ud559\uc0dd\u00b7\uc9c4\ud559 \uad00\ub828 \uc18c\uc2dd\uc744 \uc804\ud569\ub2c8\ub2e4.",
    studentsTitle:"\ud559\uc0dd \u00b7 \uc9c4\ud559", studentStatusNote:"\ub300\ud559\uc6d0\uc0dd\u00b7\ud559\ubd80\uc5f0\uad6c\uc0dd \ubb38\uc758\ub97c \ud658\uc601\ud569\ub2c8\ub2e4.", studentTracks:"\uc5b4\ub5a4 \uc5f0\uad6c\ub97c \ud558\ub098\uc694?", studentStart:"\uc9c4\ud559\u00b7\ud559\ubd80\uc5f0\uad6c \ubb38\uc758 3\ub2e8\uacc4", email:"\uc774\uba54\uc77c \ubb38\uc758",
    contactTitle:"\uc5f0\ub77d\ucc98 \u00b7 \uc704\uce58", contactSub:"\uc5f0\uad6c\uc2e4 \uc704\uce58\uc640 \uc5f0\ub77d\ucc98\ub97c \uc548\ub0b4\ud569\ub2c8\ub2e4.", mapOpen:"\uc9c0\ub3c4\uc5d0\uc11c \uc5f4\uae30 \u2192",
    piResearch:"\uc5f0\uad6c \ud0a4\uc6cc\ub4dc", piCareer:"\ud559\ub825 \u00b7 \uacbd\ub825", education:"\ud559\ub825", career:"\uacbd\ub825",
    search:"\uc81c\ubaa9 \u00b7 \uc800\ub110 \u00b7 \uc800\uc790 \uac80\uc0c9", allYears:"\uc804\uccb4 \uc5f0\ub3c4", leadOnly:"\uc8fc\uc800\uc790 \ub17c\ubb38\ub9cc",
    totalPubs:"\uc804\uccb4 \ub17c\ubb38", latestYear:"\ucd5c\uc2e0 \uc5f0\ub3c4", leadTagged:"\uc8fc\uc800\uc790", topJif:"\ucd5c\uace0 JIF",
    verifiedJif:"\uc800\ub110 \uc9c0\ud45c", source:"\uc800\ub110 \uc815\ubcf4",
    joinStudents:"\ud559\uc0dd\u00b7\uc9c4\ud559", joinContact:"\uc5f0\ub77d\ucc98",
    inquiry:"\uad00\uc2ec \uc5f0\uad6c \ud0a4\uc6cc\ub4dc, \uad00\ub828 \uacbd\ud5d8, \uac00\ub2a5\ud55c \uc2dc\uc791 \uc2dc\uc810\uc744 \uac04\ub2e8\ud788 \uc801\uc5b4 \ubb38\uc758\ud574 \uc8fc\uc138\uc694."
  },
  en: {
    home:"Home", research:"Research", publications:"Publications", pi:"PI", news:"News", students:"Students", contact:"Contact",
    researchMore:"View all \u2192", pubMore:"All publications \u2192", newsMore:"All news \u2192",
    heroResearch:"Research", heroStudents:"Graduate study",
    researchTitle:"Research areas", researchSub:"Energy harvesting, sensing, nanomaterials, and computational/AI design.",
    pubOverview:"Research output at a glance", pubTitle:"Publications", pubSub:"Selected publications in TENGs, functional materials, self-powered sensing, and bioelectronics.",
    latest:"Latest news", newsTitle:"News", newsSub:"Research, department, admissions, and student news.",
    studentsTitle:"Students & study", studentStatusNote:"Graduate and undergraduate research inquiries are welcome.", studentTracks:"Research tracks", studentStart:"Three steps to inquire", email:"Email the PI",
    contactTitle:"Contact & location", contactSub:"Lab, office, department office, and campus map in one view.", mapOpen:"Open map \u2192",
    piResearch:"Research keywords", piCareer:"Education & appointments", education:"Education", career:"Appointments",
    search:"Search title, journal, author", allYears:"All years", leadOnly:"Primary-author papers only",
    totalPubs:"Publications", latestYear:"Latest year", leadTagged:"Primary-author papers", topJif:"Top JIF",
    verifiedJif:"Journal metrics", source:"Journal info",
    joinStudents:"Students", joinContact:"Contact",
    inquiry:"Include a research keyword, relevant experience, and your possible start date."
  }
};

const L = (key) => labels[state.lang][key] || key;
const portal = () => state.data?.portal || {};

function route() {
  const p = (location.hash || "#/").slice(1) || "/";
  return new Set(["/","/research","/publications","/pi","/news","/students","/inquiry","/contact"]).has(p) ? p : "/";
}

function applyRoute() {
  const current = route();
  document.querySelectorAll(".view").forEach((view) => { view.hidden = view.dataset.view !== current; });
  document.querySelectorAll("[data-route]").forEach((node) => node.classList.toggle("active", node.dataset.route === current));
  $("navLinks")?.classList.remove("open");
  $("menuBtn")?.setAttribute("aria-expanded","false");
  window.scrollTo({top:0,behavior:"auto"});
}

function renderNav() {
  [["home","/"],["research","/research"],["publications","/publications"],["pi","/pi"],["news","/news"],["students","/students"],["contact","/contact"]]
    .forEach(([key]) => setText("nav-" + key, L(key)));
  setText("langBtn", state.lang === "ko" ? "EN" : "KO");
  setText("heroResearch",L("heroResearch")); setText("heroStudents",L("heroStudents"));
  setText("researchSectionTitle",L("researchTitle")); setText("researchMore",L("researchMore"));
  setText("pubOverviewTitle",L("pubOverview")); setText("pubMore",L("pubMore"));
  setText("latestTitle",L("latest")); setText("newsMore",L("newsMore"));
  setText("researchPageTitle",L("researchTitle")); setText("researchPageSub",L("researchSub"));
  setText("pubPageTitle",L("pubTitle")); setText("pubPageSub",L("pubSub")); setText("leadOnlyLabel",L("leadOnly"));
  setText("piPageTitle",state.lang === "ko" ? "\uae40\uc9c4\uacb8 \u00b7 Jin-Kyeom Kim" : "Jin-Kyeom Kim \u00b7 \uae40\uc9c4\uacb8");
  setText("piResearchTitle",L("piResearch")); setText("piCareerTitle",L("piCareer")); setText("educationTitle",L("education")); setText("careerTitle",L("career"));
  setText("newsPageTitle",L("newsTitle")); setText("newsPageSub",L("newsSub"));
  setText("studentsPageTitle",L("studentsTitle")); setText("studentStatusNote",L("studentStatusNote")); setText("studentTracksTitle",L("studentTracks")); setText("studentStartTitle",L("studentStart")); setText("studentEmail",L("email"));
  setText("contactPageTitle",L("contactTitle")); setText("contactPageSub",L("contactSub")); setText("mapLink",L("mapOpen"));
  setText("joinStudents",L("joinStudents")); setText("joinContact",L("joinContact")); setText("inquiryText",L("inquiry"));
  const q = $("pubSearch"); if (q) q.placeholder = L("search");
}

function renderHero() {
  const d = state.data, p = d.person;
  setText("heroKicker",pick(p.labKo,p.labEn) + " \u00b7 " + p.labShort);
  const title = clear($("heroTitle"));
  const parts = state.lang === "en" ? arr(d.heroTitlePartsEn) : arr(d.heroTitlePartsKo);
  (parts.length ? parts : [pick(d.heroTitleKo,d.heroTitleEn)]).forEach((part) => title?.append(el("span","title-part",part)));
  setText("heroLead",pick(d.heroLeadKo,d.heroLeadEn));
  const row = clear($("heroKeywords"));
  arr(d.heroKeywords).forEach((word) => row?.append(el("span","keyword",word)));
  setText("heroContact",L("contact"));
}

function researchItem(index) {
  const base = arr(state.data.research)[index] || {};
  return {...base,...(arr(portal().researchMedia)[index] || {})};
}

function researchVisual(item) {
  const box = el("div","research-visual research-keyword-visual");
  const stack = el("div","research-keyword-stack");
  arr(item.keywords).slice(0,4).forEach((word) => stack.append(el("span","research-keyword",word)));
  box.append(stack);
  return box;
}

function researchCard(item, detailed, index = 0) {
  const card = el("article",detailed ? "research-card" : "research-card home-research-card");
  card.classList.add("visual-" + (item.visual || "generic"));
  const body = el("div","research-body");
  if (!detailed) {
    body.append(el("span","research-index",String(index + 1).padStart(2,"0")));
    body.append(el("h2","",pick(item.ko,item.en)));
    const keys = el("div","keyword-row");
    arr(item.keywords).slice(0,4).forEach((word) => keys.append(el("span","keyword",word)));
    body.append(keys);
    const arrow = el("a","research-arrow","\u2197");
    arrow.href = "#/research";
    arrow.setAttribute("aria-label",L("researchMore"));
    body.append(arrow);
    card.append(body);
    return card;
  }
  card.append(researchVisual(item));
  body.append(el("p","kicker",item.visual === "model" ? "Modeling" : "Research"));
  body.append(el("h2","",pick(item.ko,item.en)));
  body.append(el("p","research-summary",pick(item.signalKo,item.signalEn)));
  const keys = el("div","keyword-row");
  arr(item.keywords).forEach((word) => keys.append(el("span","keyword",word)));
  body.append(keys);
  if (item.paperTitle) {
    const paper = el("div","paper-highlight");
    paper.append(el("small","",item.paperVenue || "Representative paper"));
    paper.append(extLink(item.paperTitle,item.paperUrl,"paper-link"));
    body.append(paper);
  }
  card.append(body);
  return card;
}

function renderResearch() {
  const home = clear($("homeResearch")), full = clear($("researchGrid"));
  arr(state.data.research).forEach((unused,index) => {
    const item = researchItem(index);
    home?.append(researchCard(item,false,index));
    full?.append(researchCard(item,true,index));
  });
}

function renderHomeOverview() {
  const d = state.data;
  setText("spotlightTitle",state.lang === "ko" ? "\uc8fc\uc694 \uc5f0\uad6c\uc131\uacfc" : "Selected Research");
  setText("spotlightMore",L("researchMore"));
  const spotlight = clear($("homeSpotlight"));
  const item = researchItem(0);
  if (item) {
    const card = el("article","spotlight-card");
    card.append(researchVisual(item));
    const body = el("div","spotlight-body");
    body.append(el("p","kicker",pick(item.ko,item.en)));
    if (item.paperTitle) body.append(extLink(item.paperTitle,item.paperUrl,"spotlight-paper"));
    body.append(el("p","spotlight-summary",pick(item.signalKo,item.signalEn)));
    card.append(body);
    spotlight?.append(card);
  }

  setText("collabTitle",state.lang === "ko" ? "\ud568\uaed8 \uc5f0\uad6c\ub97c \ud655\uc7a5\ud569\ub2c8\ub2e4" : "Build the next study with us");
  setText("homeRecruit",state.lang === "ko" ? "\ub300\ud559\uc6d0 \u00b7 \ud559\ubd80\uc5f0\uad6c \u00b7 \uacf5\ub3d9\uc5f0\uad6c" : "Graduate study \u00b7 Undergraduate research \u00b7 Collaboration");
  const pathways = clear($("homePathways"));
  arr(d.studentPaths).slice(0,3).forEach(path => {
    const card = el("article","home-pathway");
    card.append(el("h3","",pick(path.ko,path.en)));
    pathways?.append(card);
  });
}

function pubNode(pub) {
  const card = el("article","publication-item");
  const meta = el("div","pub-meta");
  meta.append(el("span","pub-year",String(pub.year)),el("span","pub-venue",pub.venue || ""));
  card.append(meta,extLink(pub.title,pub.url,"pub-title"),el("p","pub-authors",pub.authors || ""));
  if (pub.role) card.append(el("p","pub-role",pub.role));
  return card;
}

function yearCounts() {
  const counts = {};
  arr(state.data.publications).forEach((pub) => { counts[pub.year] = (counts[pub.year] || 0) + 1; });
  return Object.entries(counts).sort((a,b) => Number(b[0]) - Number(a[0]));
}

function isLead(pub) {
  return pub.lead === true;
}

function renderPubMetrics() {
  const pubs = arr(state.data.publications);
  const years = yearCounts();
  const metrics = arr(portal().journalMetrics);
  const topJif = metrics.reduce((m,x) => Math.max(m,Number(x.value) || 0),0);
  const leadCount = pubs.filter(isLead).length;
  const items = [
    [L("totalPubs"),String(pubs.length)],
    [L("latestYear"),years[0] ? years[0][0] : "-"],
    [L("leadTagged"),String(leadCount)],
    [L("topJif"),topJif ? topJif.toFixed(1) : "-"]
  ];
  ["homePubMetrics","pubMetricStrip"].forEach((id) => {
    const box = clear($(id));
    items.forEach(([label,value]) => {
      const card = el("div","metric-card");
      card.append(el("strong","",value),el("span","",label));
      box?.append(card);
    });
  });

  const ybox = clear($("yearSummary"));
  years.forEach(([year,count]) => {
    const row = el("div","year-row");
    row.append(el("strong","",year),el("span","",String(count) + " papers"));
    const bar = el("i"); bar.style.setProperty("--count",String(count)); row.append(bar);
    ybox?.append(row);
  });

  const ifbox = clear($("ifSummary"));
  const head = el("div","if-head");
  head.append(el("h2","",L("verifiedJif"))); const metricNote = pick(portal().metricNoteKo,portal().metricNoteEn); if (metricNote) head.append(el("p","",metricNote));
  ifbox?.append(head);
  metrics.forEach((metric) => {
    const row = el("div","if-row");
    row.append(el("strong","",metric.journal),el("span","",String(metric.value) + " \u00b7 " + metric.year),extLink(L("source"),metric.source));
    ifbox?.append(row);
  });

  const home = clear($("homePubs"));
  pubs.slice(0,2).forEach((pub) => home?.append(pubNode(pub)));
}

function setupPubFilters() {
  const select = $("yearFilter"); if (!select) return;
  select.replaceChildren();
  const all = document.createElement("option"); all.value = "all"; all.textContent = L("allYears"); select.append(all);
  yearCounts().forEach(([year]) => { const option = document.createElement("option"); option.value = year; option.textContent = year; select.append(option); });
  select.value = state.year;
}

function renderPubs() {
  const out = clear($("pubList")), q = state.query.trim().toLowerCase();
  arr(state.data.publications).filter((pub) => {
    const yearOK = state.year === "all" || String(pub.year) === state.year;
    const queryOK = !q || [pub.title,pub.authors,pub.venue].join(" ").toLowerCase().includes(q);
    return yearOK && queryOK && (!state.leadOnly || isLead(pub));
  }).forEach((pub) => out?.append(pubNode(pub)));
}

function renderPublicationGraphics() {
  setText("graphicTitle",state.lang === "ko" ? "\ub17c\ubb38 \uadf8\ub798\ud53d \ucd08\ub85d" : "Graphical abstracts");
  const box = clear($("publicationGraphics"));
  arr(portal().publicationGraphics).forEach((item) => {
    const card = el("article","publication-graphic-card");
    const link = el("a","publication-graphic-link");
    link.href = item.url || "#/publications";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    const img = el("img","publication-graphic-img");
    img.src = item.image || "";
    img.alt = pick(item.altKo,item.altEn) || item.title || "Graphical abstract";
    img.loading = "lazy";
    img.decoding = "async";
    link.append(img);
    const body = el("div","publication-graphic-body");
    body.append(el("small","",item.venue || ""),extLink(item.title,item.url,"publication-graphic-title"));
    card.append(link,body);
    box?.append(card);
  });
}

function renderPatents() {
  setText("patentTitle",state.lang === "ko" ? "\ud2b9\ud5c8" : "Patents");
  const out = clear($("patentList"));
  arr(state.data.patents).forEach((patent) => out?.append(pubNode(patent)));
}

function newsData() { return arr(portal().news).length ? arr(portal().news) : arr(state.data.news); }

function newsCard(item) {
  const card = el("article","news-card");
  const body = el("div","news-body");
  const meta = el("div","news-meta"); meta.append(el("span","",item.category || "News"),el("time","",item.date || ""));
  body.append(meta,extLink(pick(item.ko,item.en),item.url,"news-title"));
  if (item.noteKo || item.noteEn) body.append(el("p","",pick(item.noteKo,item.noteEn)));
  card.append(body); return card;
}

function renderNews() {
  const news = newsData();
  const home = clear($("homeNews")); news.slice(0,3).forEach((item) => home?.append(newsCard(item)));
  const cats = ["All",...new Set(news.map((item) => item.category).filter(Boolean))];
  if (!cats.includes(state.newsCategory)) state.newsCategory = "All";
  const tabs = clear($("newsFilters"));
  cats.forEach((cat) => {
    const button = el("button",cat === state.newsCategory ? "active" : "",cat);
    button.type = "button";
    button.addEventListener("click",() => { state.newsCategory = cat; renderNews(); });
    tabs?.append(button);
  });
  const full = clear($("newsList"));
  news.filter((item) => state.newsCategory === "All" || item.category === state.newsCategory).forEach((item) => full?.append(newsCard(item)));
}

function renderPI() {
  const p = state.data.person, portrait = $("portrait");
  if (portrait) { portrait.src = p.portrait; portrait.alt = pick(p.nameKo,p.nameEn); }
  setText("piName",pick(p.nameKo,p.nameEn));
  setText("piTitle",pick(p.titleKo,p.titleEn) + " \u00b7 " + pick(p.deptKo,p.deptEn));
  const links = clear($("profileList"));
  [["KMOU",p.facultyPage],["Google Scholar",p.scholar],["ORCID",p.orcid],["OpenAlex",p.openalex]].forEach(([name,url]) => links?.append(extLink(name,url)));
  const keys = clear($("piKeywords")); arr(state.data.heroKeywords).forEach((word) => keys?.append(el("span","keyword",word)));
  const board = clear($("piResearch"));
  arr(state.data.research).forEach((item) => {
    const card = el("div","keyword-card");
    card.append(el("strong","",pick(item.ko,item.en)),el("span","",arr(item.keywords).join(" \u00b7 ")));
    board?.append(card);
  });
  [["educationList",state.data.education],["careerList",state.data.career]].forEach(([id,list]) => {
    const target = clear($(id));
    arr(list).forEach((item) => {
      const row = el("li"); row.append(el("strong","",item.year || ""),el("span","",pick(item.ko,item.en))); target?.append(row);
    });
  });
}

function renderStudents() {
  const s = portal().students || {};
  setText("studentRecruiting",pick(s.recruitingKo,s.recruitingEn));
  setText("studentStatus",pick(s.statusKo,s.statusEn));
  const tracks = clear($("studentTracks"));
  arr(s.tracks).forEach((track) => {
    const card = el("article","track-card");
    card.append(el("h2","",pick(track.ko,track.en)));
    const keys = el("div","keyword-row"); arr(track.keywords).forEach((word) => keys.append(el("span","keyword",word)));
    card.append(keys); tracks?.append(card);
  });
  const steps = clear($("studentOnboarding"));
  arr(state.lang === "en" ? s.onboardingEn : s.onboardingKo).forEach((step) => steps?.append(el("li","",step)));
}

function renderContact() {
  const c = portal().contact || {}, map = $("campusMap");
  if (map && c.mapEmbed) map.src = c.mapEmbed;
  setText("mapAddress",pick(c.addressKo,c.addressEn));
  const mapLink = $("mapLink"); if (mapLink) mapLink.href = c.mapLink || "#";
  const box = clear($("contactGrid"));
  const rows = [
    [state.lang === "ko" ? "\uad50\uc218 \uc5f0\uad6c\uc2e4" : "Office",pick(c.officeKo,c.officeEn)],
    [state.lang === "ko" ? "\uc2e4\ud5d8\uc2e4" : "Lab",pick(c.labKo,c.labEn)],
    [state.lang === "ko" ? "\ud559\uacfc\uc0ac\ubb34\uc2e4" : "Department",pick(c.departmentOfficeKo,c.departmentOfficeEn)],
    ["Email",state.data.person.email],
    ["Phone","051-410-4355 \u00b7 051-410-4966"]
  ];
  rows.forEach(([label,value]) => {
    const row = el("div","contact-row"); row.append(el("span","",label));
    row.append(label === "Email" ? extLink(value,"mailto:" + value) : el("strong","",value)); box?.append(row);
  });
  box?.append(extLink("Google Scholar",state.data.person.scholar,"contact-action"));
  box?.append(extLink("ORCID",state.data.person.orcid,"contact-action"));
  box?.append(extLink("KMOU Faculty Profile",state.data.person.facultyPage,"contact-action"));
}

function applyReferenceVisuals() {
  const sprite = window.ENERMAKER_REFERENCE_SPRITE;
  if (!sprite) return;
  const hero = document.querySelector(".hero-visual");
  if (hero) {
    hero.classList.add("has-reference");
    hero.style.backgroundImage = 'url("' + sprite + '")';
    hero.style.backgroundPosition = "center 0%";
  }
  const positions = ["25%","50%","75%","100%"];
  document.querySelectorAll(".home-research-card").forEach((card,index) => {
    card.classList.add("has-reference");
    card.style.backgroundImage = 'url("' + sprite + '")';
    card.style.backgroundPosition = "center " + (positions[index] || "25%");
  });
}

function renderAll() {
  renderNav(); renderHero(); renderResearch(); renderHomeOverview(); renderPubMetrics(); setupPubFilters(); renderPublicationGraphics(); renderPubs(); renderPatents(); renderNews(); renderPI(); renderStudents(); renderContact(); applyReferenceVisuals(); applyRoute();
}

const ADMIN = {owner:"ttthkim-hue",repo:"kim-jingyeom-homepage",path:"site/content.json",branch:"main",publicRepo:"ttthkim-hue.github.io",publicPath:"content.json",publicAssetsPrefix:"assets/uploads/"};

function ghHeaders() {
  return {Accept:"application/vnd.github+json",Authorization:"Bearer " + state.adminToken,"X-GitHub-Api-Version":"2022-11-28"};
}

function repoApiUrl(repo) {
  return "https://api.github.com/repos/" + ADMIN.owner + "/" + repo;
}

function repoContentUrl(repo,path) {
  return repoApiUrl(repo) + "/contents/" + path;
}

async function requireRepoWritePermission(repo) {
  const response = await fetch(repoApiUrl(repo),{headers:ghHeaders()});
  if (!response.ok) throw new Error("Could not verify repository access for " + repo + ": HTTP " + response.status);
  const info = await response.json();
  const permissions = info.permissions || {};
  if (!(permissions.push || permissions.maintain || permissions.admin)) {
    throw new Error("Write permission is required for " + repo + ". Ask the repository owner to add this GitHub account as a collaborator with write access.");
  }
  return info;
}

async function readRepoFile(repo,path) {
  const response = await fetch(repoContentUrl(repo,path) + "?ref=" + ADMIN.branch,{headers:ghHeaders()});
  if (!response.ok) throw new Error("Could not read " + repo + "/" + path + ": HTTP " + response.status);
  return response.json();
}

async function writeRepoText(repo,path,text,message,sha) {
  const response = await fetch(repoContentUrl(repo,path),{
    method:"PUT",
    headers:{...ghHeaders(),"Content-Type":"application/json"},
    body:JSON.stringify({message,content:encode64(text),sha,branch:ADMIN.branch})
  });
  if (!response.ok) throw new Error("Could not write " + repo + "/" + path + ": HTTP " + response.status);
  return response.json();
}

async function createRepoBinary(repo,path,base64Content,message) {
  const response = await fetch(repoContentUrl(repo,path),{
    method:"PUT",
    headers:{...ghHeaders(),"Content-Type":"application/json"},
    body:JSON.stringify({message,content:base64Content,branch:ADMIN.branch})
  });
  if (!response.ok) throw new Error("Could not upload " + repo + "/" + path + ": HTTP " + response.status);
  return response.json();
}

function decode64(value) {
  const bytes = Uint8Array.from(atob(value.replace(/\n/g,"")),(c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encode64(value) {
  const bytes = new TextEncoder().encode(value); let binary = "";
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function adminMessage(message,error) {
  const node = $("adminStatus"); if (!node) return;
  node.textContent = message; node.classList.toggle("error",Boolean(error));
}

function fillAdmin() {
  const d = state.adminData; if (!d) return;
  $("editHero1").value = arr(d.heroTitlePartsKo)[0] || d.heroTitleKo || "";
  $("editHero2").value = arr(d.heroTitlePartsKo)[1] || "";
  $("editHeroLead").value = d.heroLeadKo || "";
  const select = $("editResearchIndex"); select.replaceChildren();
  arr(d.research).forEach((item,index) => {
    const option = document.createElement("option"); option.value = String(index); option.textContent = String(index + 1) + ". " + (item.ko || item.en || "Research"); select.append(option);
  });
  loadResearchEditor();
  $("adminJson").value = JSON.stringify(d,null,2);
}

function loadResearchEditor() {
  const index = Number($("editResearchIndex")?.value || 0);
  const image = arr(state.adminData?.portal?.researchMedia)[index]?.image || "";
  if ($("editResearchImage")) $("editResearchImage").value = image;
}

async function connectAdmin() {
  const token = $("adminToken")?.value.trim();
  if (!token) return adminMessage("Enter a repository-scoped token.",true);
  state.adminToken = token;
  try {
    const me = await fetch("https://api.github.com/user",{headers:ghHeaders()});
    if (!me.ok) throw new Error("GitHub authentication failed.");
    const profile = await me.json();
    await Promise.all([requireRepoWritePermission(ADMIN.repo),requireRepoWritePermission(ADMIN.publicRepo)]);
    const obj = await readRepoFile(ADMIN.repo,ADMIN.path);
    state.adminFileSha = obj.sha; state.adminData = JSON.parse(decode64(obj.content));
    $("adminUser").value = profile.login;
    $("adminToken").value = ""; $("adminLogin").hidden = true; $("adminPanel").hidden = false;
    fillAdmin(); adminMessage(profile.login + " verified for both repositories. Saves update the private source and the public Pages repository.");
  } catch (error) {
    state.adminToken = ""; adminMessage(error.message || String(error),true);
  }
}

async function commitAdmin(message) {
  const text = JSON.stringify(state.adminData,null,2) + "\n";
  const sourceResult = await writeRepoText(ADMIN.repo,ADMIN.path,text,message,state.adminFileSha);
  state.adminFileSha = sourceResult.content.sha;
  try {
    const publicFile = await readRepoFile(ADMIN.publicRepo,ADMIN.publicPath);
    await writeRepoText(ADMIN.publicRepo,ADMIN.publicPath,text,"Publish: " + message,publicFile.sha);
  } catch (error) {
    throw new Error("Private source saved, but public publish failed. Check token access to both repositories. " + (error.message || String(error)));
  }
  $("adminJson").value = JSON.stringify(state.adminData,null,2);
  state.data = JSON.parse(JSON.stringify(state.adminData));
  renderAll();
  adminMessage("Saved and published. GitHub Pages will refresh after its deployment workflow completes.");
}

async function saveAdmin(kind) {
  if (!state.adminData || !state.adminToken) return adminMessage("Connect an administrator first.",true);
  try {
    if (kind === "hero") {
      const one = $("editHero1").value.trim(), two = $("editHero2").value.trim();
      state.adminData.heroTitlePartsKo = [one,two].filter(Boolean);
      state.adminData.heroTitleKo = state.adminData.heroTitlePartsKo.join(", ");
      state.adminData.heroLeadKo = $("editHeroLead").value.trim();
    }
    if (kind === "research") {
      const index = Number($("editResearchIndex").value);
      state.adminData.portal = state.adminData.portal || {};
      state.adminData.portal.researchMedia = arr(state.adminData.portal.researchMedia);
      state.adminData.portal.researchMedia[index] = state.adminData.portal.researchMedia[index] || {};
      state.adminData.portal.researchMedia[index].image = $("editResearchImage").value.trim();
    }
    if (kind === "news") {
      const item = {
        date:$("editNewsDate").value.trim(),
        category:$("editNewsCategory").value.trim() || "News",
        ko:$("editNewsTitle").value.trim(),
        en:$("editNewsTitle").value.trim(),
        noteKo:$("editNewsNote").value.trim(),
        noteEn:$("editNewsNote").value.trim(),
        url:$("editNewsUrl").value.trim()
      };
      if (!item.date || !item.ko || !item.url) throw new Error("Date, title and source URL are required.");
      state.adminData.portal = state.adminData.portal || {};
      state.adminData.portal.news = arr(state.adminData.portal.news);
      state.adminData.portal.news.unshift(item);
    }
    if (kind === "json") state.adminData = JSON.parse($("adminJson").value);
    if (state.adminData.meta) state.adminData.meta.updated = new Date().toISOString().slice(0,10);
    await commitAdmin("Admin content update: " + kind);
  } catch (error) {
    adminMessage(error.message || String(error),true);
  }
}

async function uploadResearchImage() {
  if (!state.adminToken || !state.adminData) return adminMessage("Connect an administrator first.",true);
  const file = $("researchImageFile")?.files?.[0];
  if (!file) return adminMessage("Choose an image file.",true);
  if (file.size > 5 * 1024 * 1024) return adminMessage("Use an image smaller than 5 MB.",true);
  try {
    const bytes = new Uint8Array(await file.arrayBuffer()); let binary = "";
    bytes.forEach((b) => { binary += String.fromCharCode(b); });
    const safe = file.name.replace(/[^A-Za-z0-9._-]/g,"-");
    const filename = Date.now() + "-" + safe;
    const encoded = btoa(binary);
    const sourcePath = "site/assets/uploads/" + filename;
    const publicPath = ADMIN.publicAssetsPrefix + filename;
    await createRepoBinary(ADMIN.repo,sourcePath,encoded,"Admin research image upload");
    try {
      await createRepoBinary(ADMIN.publicRepo,publicPath,encoded,"Publish research image");
    } catch (error) {
      throw new Error("Private image saved, but public image publish failed. Check token access to both repositories. " + (error.message || String(error)));
    }
    $("editResearchImage").value = "./assets/uploads/" + filename;
    adminMessage("Image uploaded to source and public site. Click Save research image to attach it to the selected area.");
  } catch (error) {
    adminMessage(error.message || String(error),true);
  }
}

function inquiryCopy() {
  return state.lang === "ko" ? {
    title:"\ud559\uc0dd \u00b7 \uc9c4\ud559 \ubb38\uc758",
    name:"\uc774\ub984",
    affiliation:"\uc18c\uc18d",
    affiliationPlaceholder:"\ud559\uad50 \u00b7 \ud559\uacfc \u00b7 \ud559\ub144",
    email:"\uc774\uba54\uc77c",
    topic:"\uad00\uc2ec \ubd84\uc57c",
    message:"\ubb38\uc758 \ub0b4\uc6a9",
    messagePlaceholder:"\uad00\uc2ec \uc5f0\uad6c, \uad00\ub828 \uacbd\ud5d8, \uac00\ub2a5\ud55c \uc2dc\uc791 \uc2dc\uc810\uc744 \uac04\ub2e8\ud788 \uc801\uc5b4\uc8fc\uc138\uc694.",
    privacy:"\uc785\ub825 \ub0b4\uc6a9\uc740 \uc0ac\uc774\ud2b8\uc5d0 \uc800\uc7a5\ub418\uc9c0 \uc54a\uc73c\uba70, \uba54\uc77c \uc571\uc5d0 \uc791\uc131 \ub0b4\uc6a9\ub9cc \ucc44\uc6cc\uc9d1\ub2c8\ub2e4.",
    cancel:"\ucde8\uc18c",
    submit:"\uba54\uc77c \uc791\uc131",
    topics:["\uc18c\uc7ac\u00b7\uc18c\uc790 \uc81c\uc791","\uce21\uc815\u00b7\uc13c\uc2f1\u00b7\ub370\uc774\ud130","\ubaa8\ub378\ub9c1\u00b7AI\u00b7\uacf5\ub3d9\uc5f0\uad6c","\ub300\ud559\uc6d0 \uc9c4\ud559","\uae30\ud0c0"]
  } : {
    title:"Student & graduate inquiry",
    name:"Name",
    affiliation:"Affiliation",
    affiliationPlaceholder:"University / department / year",
    email:"Email",
    topic:"Topic",
    message:"Message",
    messagePlaceholder:"Briefly describe your research interests, relevant experience, and possible start date.",
    privacy:"Nothing is stored on this site. The form only prepares a message in your default mail app.",
    cancel:"Cancel",
    submit:"Compose email",
    topics:["Materials & device fabrication","Measurement, sensing & data","Modeling, AI & collaboration","Graduate study","Other"]
  };
}

function renderStudentInquiryLabels() {
  const c = inquiryCopy();
  setText("studentInquiryTitle",c.title);
  setText("studentInquiryNameLabel",c.name);
  setText("studentInquiryAffiliationLabel",c.affiliation);
  setText("studentInquiryEmailLabel",c.email);
  setText("studentInquiryTopicLabel",c.topic);
  setText("studentInquiryMessageLabel",c.message);
  setText("studentInquiryPrivacy",c.privacy);
  setText("studentInquiryCancel",c.cancel);
  setText("studentInquirySubmit",c.submit);
  const affiliation = $("studentInquiryAffiliation"); if (affiliation) affiliation.placeholder = c.affiliationPlaceholder;
  const message = $("studentInquiryMessage"); if (message) message.placeholder = c.messagePlaceholder;
  const select = $("studentInquiryTopic");
  if (select) {
    const current = select.value;
    select.replaceChildren();
    const blank = document.createElement("option"); blank.value = ""; blank.textContent = state.lang === "ko" ? "\uc120\ud0dd" : "Select"; select.append(blank);
    c.topics.forEach((topic) => { const option = document.createElement("option"); option.value = topic; option.textContent = topic; select.append(option); });
    if ([...select.options].some((o) => o.value === current)) select.value = current;
  }
}

function openStudentInquiry(event) {
  event?.preventDefault();
  renderStudentInquiryLabels();
  const modal = $("studentInquiryModal");
  if (!modal) return;
  modal.hidden = false;
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
  window.setTimeout(() => $("studentInquiryName")?.focus(),0);
}

function closeStudentInquiry() {
  const modal = $("studentInquiryModal");
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}

function submitStudentInquiry(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const values = Object.fromEntries(new FormData(form).entries());
  const subject = state.lang === "ko"
    ? "[EnerMAKER \ud559\uc0dd\ubb38\uc758] " + values.name + " / " + values.affiliation + " / " + values.topic
    : "[EnerMAKER student inquiry] " + values.name + " / " + values.affiliation + " / " + values.topic;
  const body = state.lang === "ko"
    ? ["\uc548\ub155\ud558\uc138\uc694.","","\uc774\ub984: " + values.name,"\uc18c\uc18d: " + values.affiliation,"\uc5f0\ub77d \uc774\uba54\uc77c: " + values.email,"\uad00\uc2ec \ubd84\uc57c: " + values.topic,"","\ubb38\uc758 \ub0b4\uc6a9:",values.message].join("\n")
    : ["Hello,","","Name: " + values.name,"Affiliation: " + values.affiliation,"Reply email: " + values.email,"Topic: " + values.topic,"","Message:",values.message].join("\n");
  const recipient = state.data?.person?.email || "jingyeom0825@kmou.ac.kr";
  closeStudentInquiry();
  window.location.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
}

function bind() {
  $("langBtn")?.addEventListener("click",() => {
    state.lang = state.lang === "ko" ? "en" : "ko";
    localStorage.setItem("enermaker-lang",state.lang);
    renderAll();
  });
  $("menuBtn")?.addEventListener("click",() => {
    const open = $("navLinks")?.classList.toggle("open");
    $("menuBtn")?.setAttribute("aria-expanded",String(Boolean(open)));
  });
  window.addEventListener("hashchange",applyRoute);
  $("pubSearch")?.addEventListener("input",(event) => { state.query = event.target.value; renderPubs(); });
  $("yearFilter")?.addEventListener("change",(event) => { state.year = event.target.value; renderPubs(); });
  $("leadOnly")?.addEventListener("change",(event) => { state.leadOnly = event.target.checked; renderPubs(); });
  $("adminConnect")?.addEventListener("click",connectAdmin);
  $("editResearchIndex")?.addEventListener("change",loadResearchEditor);
  $("uploadResearchImage")?.addEventListener("click",uploadResearchImage);
  document.querySelectorAll(".admin-save").forEach((button) => button.addEventListener("click",() => saveAdmin(button.dataset.adminSave)));
  document.querySelectorAll("[data-student-inquiry]").forEach((node) => node.addEventListener("click",openStudentInquiry));
  document.querySelectorAll("[data-close-student-inquiry]").forEach((node) => node.addEventListener("click",closeStudentInquiry));
  $("studentInquiryForm")?.addEventListener("submit",submitStudentInquiry);
  $("studentInquiryModal")?.addEventListener("click",(event) => { if (event.target === $("studentInquiryModal")) closeStudentInquiry(); });
  document.addEventListener("keydown",(event) => { if (event.key === "Escape" && !$("studentInquiryModal")?.hidden) closeStudentInquiry(); });
  renderStudentInquiryLabels();
}

async function load() {
  const response = await fetch("./content.json",{cache:"no-store"});
  if (!response.ok) throw new Error("content load failed");
  state.data = await response.json();
  renderAll();
}

bind();
load().catch((error) => document.body.append(el("p","load-error","Content load failed: " + error.message)));
