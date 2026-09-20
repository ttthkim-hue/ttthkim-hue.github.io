const state = {
  lang: localStorage.getItem("enermaker-lang") || "ko",
  data: null,
  year: "all",
  query: "",
  firstOnly: false
};

const $ = (id) => document.getElementById(id);
const arr = (v) => Array.isArray(v) ? v : [];
const pick = (ko, en) => state.lang === "en" ? (en || ko || "") : (ko || en || "");
const clear = (node) => { if (node) node.replaceChildren(); return node; };
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
};
const a = (label, href, className) => {
  const node = el("a", className || "", label);
  const target = href || "#/";
  node.href = target;
  if (/^https?:\/\//i.test(target)) {
    node.target = "_blank";
    node.rel = "noopener noreferrer";
  }
  return node;
};

const labels = {
  ko: {
    home:"\ud648", research:"\uc5f0\uad6c", publications:"\ub17c\ubb38", pi:"\uc5f0\uad6c\ucc45\uc784\uc790", news:"\uc18c\uc2dd", inquiry:"\uc5f0\uad6c\u00b7\ud611\ub825 \ubb38\uc758", contact:"\uc5f0\ub77d\ucc98",
    explore:"\uc5f0\uad6c\ubd84\uc57c \ubcf4\uae30", papers:"\ub17c\ubb38 \ubcf4\uae30", selected:"\uc8fc\uc694 \ub17c\ubb38", latest:"\ucd5c\uadfc \uc18c\uc2dd", allPapers:"\uc804\uccb4 \ub17c\ubb38",
    core:"\uc8fc\uc694 \uc5f0\uad6c\ubd84\uc57c", coreSub:"\uc5d0\ub108\uc9c0 \ud558\ubca0\uc2a4\ud305\uacfc \uae30\ub2a5\uc131 \uc18c\uc7ac\u00b7\uc18c\uc790\ub97c \uc911\uc2ec\uc73c\ub85c \uc5f0\uad6c\ud569\ub2c8\ub2e4.",
    researchTitle:"\uc5f0\uad6c\ubd84\uc57c", researchSub:"\uc18c\uc7ac\uc758 \uacc4\uba74\uacfc \uc804\ud558 \uac70\ub3d9\uc5d0\uc11c \uc2dc\uc791\ud574 \uc13c\uc2f1\u00b7\ubc14\uc774\uc624\uc18c\uc790\uc640 \uacc4\uc0b0 \ubaa8\ub378\ub9c1\uc73c\ub85c \ud655\uc7a5\ud569\ub2c8\ub2e4.",
    pubTitle:"\ub17c\ubb38", pubSub:"Google Scholar, DOI \ubc0f \ucd9c\ud310\uc0ac \uacf5\uac1c \uae30\ub85d\uc744 \uae30\uc900\uc73c\ub85c \uc815\ub9ac\ud55c \uc5f0\uad6c \uc2e4\uc801\uc785\ub2c8\ub2e4.",
    search:"\uc81c\ubaa9, \uc800\ub110, \uc800\uc790 \uac80\uc0c9", allYears:"\uc804\uccb4", leadOnly:"1\uc800\uc790\u00b7\uc8fc\uc800\uc790\ub9cc",
    piTitle:"\uae40\uc9c4\uacb8", piKicker:"\uc5f0\uad6c\ucc45\uc784\uc790", education:"\ud559\ub825", appointments:"\uacbd\ub825",
    newsTitle:"\uc18c\uc2dd", inquiryTitle:"\uc5f0\uad6c\u00b7\ud611\ub825 \ubb38\uc758",
    inquirySub:"\uc5f0\uad6c \ud611\ub825, \ud559\uc220 \uad50\ub958 \ubc0f \ud559\uc0dd \uc5f0\uad6c \ubb38\uc758\ub294 \uc544\ub798 \uacf5\uac1c \uc774\uba54\uc77c\ub85c \uc5f0\ub77d\ud574 \uc8fc\uc138\uc694.",
    email:"\uc774\uba54\uc77c \ubcf4\ub0b4\uae30", contactTitle:"\uc5f0\ub77d\ucc98", profiles:"\ud559\uc220 \ud504\ub85c\ud544",
    readMore:"\uc790\uc138\ud788 \ubcf4\uae30", updated:"\uc5c5\ub370\uc774\ud2b8", noResults:"\uac80\uc0c9 \uacb0\uacfc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."
  },
  en: {
    home:"Home", research:"Research", publications:"Publications", pi:"PI", news:"News", inquiry:"Inquiries", contact:"Contact",
    explore:"Explore research", papers:"View publications", selected:"Selected publications", latest:"Latest news", allPapers:"All publications",
    core:"Research areas", coreSub:"Research centered on energy harvesting, functional materials, and self-powered devices.",
    researchTitle:"Research", researchSub:"From interfaces and charge transport to sensing, bioelectronics, and computational materials design.",
    pubTitle:"Publications", pubSub:"Research output curated from public Google Scholar, DOI, and publisher records.",
    search:"Search title, journal, author", allYears:"All", leadOnly:"Lead / first author",
    piTitle:"Jin-Kyeom Kim", piKicker:"Principal Investigator", education:"Education", appointments:"Appointments",
    newsTitle:"News", inquiryTitle:"Research & collaboration inquiries",
    inquirySub:"For research collaboration, academic exchange, or student research inquiries, please use the public email below.",
    email:"Email the PI", contactTitle:"Contact", profiles:"Academic profiles",
    readMore:"Read more", updated:"Updated", noResults:"No matching records."
  }
};
const L = (key) => labels[state.lang][key] || key;

const visuals = {
  energy:"./assets/visuals/pillar-energy-wave.jpg",
  bio:"./assets/visuals/pillar-bio-neuron.png",
  nano:"./assets/visuals/pillar-nano-nist.jpg"
};

async function load() {
  const res = await fetch("./content.json", {cache:"no-store"});
  if (!res.ok) throw new Error("content load failed");
  state.data = await res.json();
  bind();
  render();
  route();
  reveal();
}

function bind() {
  $("langBtn")?.addEventListener("click", () => {
    state.lang = state.lang === "ko" ? "en" : "ko";
    localStorage.setItem("enermaker-lang", state.lang);
    render();
    requestAnimationFrame(reveal);
  });
  $("menuBtn")?.addEventListener("click", () => {
    const nav = $("navLinks");
    const open = nav?.classList.toggle("open");
    $("menuBtn")?.setAttribute("aria-expanded", String(Boolean(open)));
  });
  window.addEventListener("hashchange", route);
  $("pubSearch")?.addEventListener("input", (e) => {
    state.query = e.target.value.trim().toLowerCase();

    renderPublications();
  });
  $("leadOnly")?.addEventListener("change", (e) => {
    state.firstOnly = e.target.checked;
    renderPublications();
  });
}

function route() {
  const valid = new Set(["/","/research","/publications","/pi","/news","/inquiry","/contact"]);
  let path = location.hash.replace(/^#/, "") || "/";
  if (!valid.has(path)) path = "/";
  document.querySelectorAll("[data-view]").forEach((node) => {
    node.hidden = node.dataset.view !== path;
  });
  document.querySelectorAll("[data-route]").forEach((node) => {
    node.classList.toggle("active", node.dataset.route === path);
  });
  $("navLinks")?.classList.remove("open");
  window.scrollTo({top:0, behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
  document.title = path === "/" ? "EnerMAKER Lab \u00b7 Jin-Kyeom Kim \u00b7 KMOU" : "EnerMAKER Lab \u00b7 " + path.slice(1);
}

function setText(id, value) {
  const node = $(id);
  if (node) node.textContent = value || "";
}

function render() {
  const d = state.data || {};
  const p = d.person || {};
  document.documentElement.lang = state.lang;
  setText("langBtn", state.lang === "ko" ? "EN" : "\ud55c");
  [["home","/"],["research","/research"],["publications","/publications"],["pi","/pi"],["news","/news"],["inquiry","/inquiry"],["contact","/contact"]]
    .forEach(([key,route]) => setText("nav-"+key, L(key)));

  setText("heroKicker", pick(p.labKo, p.labEn));
  setText("heroTitle", pick(d.heroTitleKo, d.heroTitleEn));
  setText("heroLead", pick(d.heroLeadKo, d.heroLeadEn));
  setText("heroAffiliation", pick(p.deptKo, p.deptEn));
  setText("heroExplore", L("explore"));
  setText("heroPapers", L("papers"));
  setText("researchSectionTitle", L("core"));
  setText("researchSectionSub", L("coreSub"));
  setText("selectedTitle", L("selected"));
  setText("latestTitle", L("latest"));
  setText("allPapersHome", L("allPapers"));
  setText("researchPageTitle", L("researchTitle"));
  setText("researchPageSub", L("researchSub"));
  setText("pubPageTitle", L("pubTitle"));
  setText("pubPageSub", L("pubSub"));
  if ($("pubSearch")) $("pubSearch").placeholder = L("search");
  setText("leadLabel", L("leadOnly"));
  setText("piKicker", L("piKicker"));
  setText("piTitle", pick(p.nameKo, p.nameEn));
  setText("piRank", pick(p.titleKo, p.titleEn) + " \u00b7 " + pick(p.deptKo, p.deptEn));
  setText("educationTitle", L("education"));
  setText("appointmentsTitle", L("appointments"));
  setText("newsPageTitle", L("newsTitle"));
  setText("inquiryPageTitle", L("inquiryTitle"));
  setText("inquiryPageSub", L("inquirySub"));
  setText("inquiryEmail", L("email"));
  setText("contactPageTitle", L("contactTitle"));
  setText("profilesTitle", L("profiles"));
  setText("footerTagline", pick(d.taglineKo, d.taglineEn));
  setText("footerDept", pick(p.deptKo, p.deptEn));
  setText("footerUpdated", L("updated") + " \u00b7 " + (d.meta?.updated || ""));

  const mail = $("inquiryEmail");
  if (mail) mail.href = "mailto:" + (p.email || "");
  const portrait = $("portrait");
  if (portrait && p.portrait) {
    portrait.src = p.portrait;
    portrait.alt = pick(p.nameKo, p.nameEn);
  }

  renderResearch();
  renderHomePubs();
  renderNews();
  renderProfile();
  renderInquiry();
  renderContact();
  renderYearFilter();
  renderPublications();
}

function researchVisual(item) {
  const box = el("div", "research-visual");
  const key = item.visual || "";
  if (visuals[key]) {

    const img = el("img");
    img.src = visuals[key];
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    box.appendChild(img);
  } else {
    box.classList.add("model-visual");
    ["flow-a","flow-b","flow-c","particle-a","particle-b","particle-c"].forEach((c) => box.appendChild(el("span", c)));
  }
  return box;
}

function researchCard(item, detailed) {
  const article = el("article", detailed ? "research-card detailed reveal" : "research-card reveal");
  article.appendChild(researchVisual(item));
  const body = el("div", "research-card-body");
  body.append(el("h3","",pick(item.ko,item.en)));
  if (detailed) {
    body.append(el("p","research-signal",pick(item.signalKo,item.signalEn)));
    body.append(el("p","",pick(item.detailKo,item.detailEn)));
    const keys = el("p","keyword-line",arr(item.keywords).join(" \u00b7 "));
    body.append(keys);
  } else {
    body.append(el("p","",pick(item.detailKo,item.detailEn)));
  }
  article.appendChild(body);
  return article;
}

function renderResearch() {
  const items = arr(state.data?.research);
  const home = clear($("homeResearch"));
  const full = clear($("researchGrid"));
  items.forEach((item) => {
    home?.appendChild(researchCard(item,false));
    full?.appendChild(researchCard(item,true));
  });
}

function pubItem(pub, compact) {
  const li = el("li", compact ? "pub-item compact" : "pub-item");
  const year = el("span","pub-year",String(pub.year || ""));
  const body = el("div","pub-body");
  const title = a(pub.title || "", pub.url || "#/publications", "pub-title");
  const meta = el("p","pub-meta",(pub.authors || "") + ". " + (pub.venue || ""));
  body.append(title, meta);
  if (pub.role) body.appendChild(el("span","pub-role",pub.role));
  li.append(year,body);
  return li;
}

function renderHomePubs() {
  const node = clear($("homePubs"));
  if (!node) return;
  const pubs = arr(state.data?.publications);
  const preferred = pubs.filter((p) => /first/i.test(String(p.role || "")));
  const picks = preferred.slice(0,3);
  (picks.length >= 3 ? picks : pubs.slice(0,3)).forEach((p) => node.appendChild(pubItem(p,true)));
}

function renderNews() {
  const home = clear($("homeNews"));
  const full = clear($("newsList"));
  arr(state.data?.news).forEach((item, index) => {
    const makeItem = (compact) => {
      const li = el("li",compact ? "news-item compact" : "news-item");
      li.appendChild(el("time","",item.date || ""));
      const textNode = item.url ? a(pick(item.ko,item.en),item.url,"news-link") : el("p","",pick(item.ko,item.en));
      li.appendChild(textNode);
      return li;
    };
    if (index < 3) home?.appendChild(makeItem(true));
    full?.appendChild(makeItem(false));
  });
}

function renderProfile() {
  const d = state.data || {};
  const about = clear($("aboutBody"));
  arr(state.lang === "en" ? d.aboutEn : d.aboutKo).forEach((p) => about?.appendChild(el("p","",p)));
  const facts = clear($("piFacts"));
  arr(d.facts).forEach((f) => {
    const row = el("div","fact-row");
    row.append(el("dt","",pick(f.labelKo,f.labelEn)),el("dd","",pick(f.valueKo,f.valueEn)));
    facts?.appendChild(row);
  });
  const edu = clear($("educationList"));
  arr(d.education).forEach((x) => edu?.appendChild(timelineItem(x)));
  const career = clear($("appointmentsList"));

  arr(d.career).forEach((x) => career?.appendChild(timelineItem(x)));

  const links = clear($("piLinks"));
  const p = d.person || {};
  [["Scholar",p.scholar],["ORCID",p.orcid],["KMOU",p.facultyPage],["Email","mailto:"+p.email]]
    .forEach(([name,url]) => { if (url) links?.appendChild(a(name,url,"profile-link")); });
}

function timelineItem(item) {
  const li = el("li","timeline-item");
  li.append(el("span","timeline-year",item.year || ""),el("p","",pick(item.ko,item.en)));
  return li;
}

function renderInquiry() {
  const node = clear($("inquiryCards"));
  arr(state.data?.studentPaths).forEach((item) => {
    const card = el("article","inquiry-card");
    card.append(el("h3","",pick(item.ko,item.en)),el("p","",pick(item.detailKo,item.detailEn)));
    node?.appendChild(card);
  });
}

function renderContact() {
  const d = state.data || {};
  const grid = clear($("contactGrid"));
  arr(d.facts).forEach((f) => {
    const row = el("div","contact-row");
    row.append(el("strong","",pick(f.labelKo,f.labelEn)),el("span","",pick(f.valueKo,f.valueEn)));
    grid?.appendChild(row);
  });
  const profiles = clear($("profileList"));
  arr(d.sources).forEach((s) => {
    const li = el("li","");
    li.appendChild(a(s.label,s.url || "#","profile-source"));
    const note = pick(s.noteKo,s.noteEn);
    if (note) li.appendChild(el("span","",note));
    profiles?.appendChild(li);
  });
}

function renderYearFilter() {
  const node = clear($("yearFilter"));
  if (!node) return;
  const years = ["all", ...new Set(arr(state.data?.publications).map((p) => String(p.year)))];
  years.forEach((year) => {
    const btn = el("button","year-button",year === "all" ? L("allYears") : year);
    btn.type = "button";
    btn.classList.toggle("active",state.year === year);
    btn.addEventListener("click",() => {
      state.year = year;
      renderYearFilter();
      renderPublications();
    });
    node.appendChild(btn);
  });
}

function renderPublications() {
  const node = clear($("pubList"));
  if (!node) return;
  const q = state.query;
  const pubs = arr(state.data?.publications).filter((p) => {
    if (state.year !== "all" && String(p.year) !== state.year) return false;
    if (state.firstOnly && !/first|lead/i.test(String(p.role || ""))) return false;
    if (!q) return true;
    return [p.title,p.authors,p.venue,String(p.year)].join(" ").toLowerCase().includes(q);
  });
  if (!pubs.length) {
    node.appendChild(el("p","empty",L("noResults")));
    return;
  }
  pubs.forEach((p) => node.appendChild(pubItem(p,false)));
}

function reveal() {
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal").forEach((n) => n.classList.add("shown"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("shown");
        io.unobserve(entry.target);
      }
    });
  }, {threshold:0.08});
  document.querySelectorAll(".reveal").forEach((n) => io.observe(n));
}


load().catch(() => {
  const main = document.querySelector("main");
  if (main) main.textContent = "Unable to load site content.";
});
