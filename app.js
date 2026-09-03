const state = {
  lang: localStorage.getItem("enermaker-lang") || "ko",
  theme: localStorage.getItem("enermaker-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
  data: null,
  year: "all",
  query: "",
  firstOnly: false
};
const t = (ko, en) => (state.lang === "en" ? en : ko);
const arr = (v) => (Array.isArray(v) ? v : []);
const el = (id) => document.getElementById(id);
const setText = (id, v) => { const n = el(id); if (n) n.textContent = v || ""; };
const setHtml = (id, v) => { const n = el(id); if (n) n.innerHTML = v || ""; };

async function load() {
  const res = await fetch("./content.json", { cache: "no-store" });
  if (!res.ok) throw new Error("HTTP " + res.status);
  state.data = await res.json();
  applyTheme();
  bind();
  render();
  route();
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme === "dark" ? "dark" : "light";
  const btn = el("themeBtn");
  if (btn) btn.innerHTML = state.theme === "dark" ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon"></i>';
}

function bind() {
  el("langBtn").addEventListener("click", () => {
    state.lang = state.lang === "ko" ? "en" : "ko";
    localStorage.setItem("enermaker-lang", state.lang);
    render();
  });
  el("themeBtn").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem("enermaker-theme", state.theme);
    applyTheme();
  });
  el("menuBtn").addEventListener("click", () => el("menu").classList.toggle("open"));
  const q = el("pubQuery");
  if (q) q.addEventListener("input", (e) => { state.query = e.target.value.toLowerCase(); renderPubs(); });
  const f = el("firstOnly");
  if (f) f.addEventListener("change", (e) => { state.firstOnly = e.target.checked; renderPubs(); });
  addEventListener("hashchange", route);
}

function currentPath() {
  const raw = (location.hash || "#/").replace(/^#/, "") || "/";
  return raw.startsWith("/") ? raw : "/" + raw;
}

function route() {
  const path = currentPath();
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("on", v.dataset.view === path));
  if (!document.querySelector(".view.on")) {
    const home = document.querySelector('.view[data-view="/"]');
    if (home) home.classList.add("on");
  }
  document.querySelectorAll("nav a[data-route]").forEach((a) => a.classList.toggle("on", a.dataset.route === path));
  el("menu").classList.remove("open");
  window.scrollTo(0, 0);
}

function highlightAuthors(authors) {
  return String(authors || "").replace(/J\.?-K\.?\s*Kim/gi, '<span class="me">J.-K. Kim</span>');
}

function badges(p) {
  const out = [];
  if (p.url && p.url.includes("doi.org")) out.push('<a class="badge-a" href="' + p.url + '"><i class="ai ai-doi"></i> DOI</a>');
  else if (p.url) out.push('<a class="badge-a" href="' + p.url + '"><i class="bi bi-link-45deg"></i> Link</a>');
  if (typeof p.cites === "number") out.push('<span class="badge-a"><i class="ai ai-google-scholar"></i> ' + p.cites + '</span>');
  return '<div class="badges">' + out.join("") + '</div>';
}

function pubItem(p) {
  const role = p.role ? '<span class="role">' + p.role + '</span>' : "";
  return '<li><a class="title" href="' + (p.url || "#/work") + '">' + p.title + '</a>' + role + '<div class="meta">' + highlightAuthors(p.authors) + '. <em>' + p.venue + '</em> (' + p.year + ')</div>' + badges(p) + '</li>';
}

function render() {
  const d = state.data || {};
  const p = d.person || {};
  const m = d.metrics || {};
  document.documentElement.lang = state.lang;
  el("langBtn").textContent = state.lang === "ko" ? "EN" : "한";
  setText("piName", t(p.nameKo, p.nameEn));
  setText("piRank", t(p.titleKo, p.titleEn) + " \u00b7 EnerMAKER Lab");
  setText("piAffil", t(p.deptKo, p.deptEn));
  setHtml("social", [
    '<a href="' + p.scholar + '" title="Google Scholar"><i class="ai ai-google-scholar"></i></a>',
    '<a href="' + p.orcid + '" title="ORCID"><i class="ai ai-orcid"></i></a>',
    '<a href="' + p.facultyPage + '" title="KMOU"><i class="bi bi-mortarboard"></i></a>',
    '<a href="mailto:jingyeom0825@kmou.ac.kr" title="Email"><i class="bi bi-envelope"></i></a>'
  ].join(""));
  const facts = arr(t(d.factsKo, d.factsEn));
  setHtml("facts", facts.map((x) => '<li>' + x + '</li>').join("") +
    '<li class="metrics"><span><b>' + (m.citations ?? "\u2013") + '</b> ' + t("인용","citations") + '</span> \u00b7 <span><b>' + (m.hIndex ?? "\u2013") + '</b> h</span> \u00b7 <span><b>' + (m.i10 ?? "\u2013") + '</b> i10</span></li>');
  setHtml("aboutBody", arr(t(d.aboutKo, d.aboutEn)).map((x) => '<p>' + x + '</p>').join(""));
  setHtml("piAbout", arr(t(d.aboutKo, d.aboutEn)).map((x) => '<p>' + x + '</p>').join(""));
  setText("newsH", t("소식", "News"));
  setText("selH", t("대표 논문", "Selected publications"));
  setText("researchH", t("연구", "Research"));
  setText("researchSub", t("공식 교수소개에 적힌 네 축.", "Four pillars from the official KMOU faculty profile."));
  setText("workH", t("논문", "Publications"));
  setText("workSub", t("공개 Scholar\u00b7DOI 기록. 인용 수는 스냅샷입니다.", "Public Scholar and DOI record. Citation counts are a snapshot."));
  setText("piH", t("책임교수", "Principal investigator"));
  setText("piSub", t(p.nameKo, p.nameEn) + " \u00b7 " + t(p.titleKo, p.titleEn));
  setText("eduH", t("학력", "Education"));
  setText("careerH", t("경력", "Appointments"));
  setText("joinH", t("합류", "Join the lab"));
  setText("joinSub", t("학위과정\u00b7학부연구\u00b7박사후 문의.", "Graduate, undergraduate, and postdoctoral inquiries."));
  setText("newsPageH", t("소식", "News"));
  setText("contactH", t("연락", "Contact"));
  setText("patentH", t("특허", "Patents"));
  setText("firstLabel", t("1저자만", "First author only"));
  setHtml("eduList", arr(d.education).map((e) => '<li><span class="year">' + e.year + '</span>' + t(e.ko, e.en) + '</li>').join(""));
  setHtml("careerList", arr(d.career).map((e) => '<li><span class="year">' + e.year + '</span>' + t(e.ko, e.en) + '</li>').join(""));
  const join = arr(d.join).length ? d.join : [
    { ko: "대학원생", en: "Graduate students", detailKo: "하베스팅\u00b7나노소재\u00b7바이오전자\u00b7디지털 트윈.", detailEn: "Harvesting, nanomaterials, bioelectronics, digital twins." },
    { ko: "학부연구생", en: "Undergraduates", detailKo: "제작\u00b7측정\u00b7시뮬레이션.", detailEn: "Fabrication, measurement, simulation." },
    { ko: "박사후연구원", en: "Postdocs", detailKo: "공개 실적 기준 논의.", detailEn: "Discussed from the public record." }
  ];
  setHtml("joinBody", join.map((j) => '<article class="join-card"><h3>' + t(j.ko, j.en) + '</h3><p>' + t(j.detailKo, j.detailEn) + '</p><p><a href="mailto:jingyeom0825@kmou.ac.kr">' + t("메일 보내기","Email the PI") + '</a></p></article>').join(""));
  const newsHtml = arr(d.news).map((n) => {
    const body = n.url ? '<a href="' + n.url + '">' + t(n.ko, n.en) + '</a>' : t(n.ko, n.en);
    return '<li><time>' + n.date + '</time><span>' + body + '</span></li>';
  }).join("");
  setHtml("homeNews", newsHtml);
  setHtml("newsList", newsHtml);
  setHtml("contactBody", arr(t(d.contactKo, d.contactEn)).map((x) => '<p>' + x + '</p>').join(""));
  setHtml("patentList", arr(d.patents).map(pubItem).join(""));
  setHtml("pillarGrid", arr(d.research).map((item, i) =>
    '<article class="project"><div class="idx">0' + (i + 1) + '</div><h3>' + t(item.ko, item.en) + '</h3><p>' + t(item.detailKo, item.detailEn) + '</p></article>'
  ).join(""));
  const featured = arr(d.publications).filter((x) => x.role && String(x.role).includes("first"));
  const selected = (featured.length ? featured : arr(d.publications)).slice(0, 4);
  setHtml("homePubs", selected.map(pubItem).join(""));
  setText("updated", "Updated " + ((d.meta && d.meta.updated) || "") + " \u00b7 " + t(m.noteKo, m.noteEn));
  renderYearChips();
  renderPubs();
}

function renderYearChips() {
  const years = ["all", ...new Set(arr(state.data.publications).map((p) => String(p.year)))];
  setHtml("yearChips", years.map((y) =>
    '<button class="chip' + (state.year === y ? " on" : "") + '" type="button" data-y="' + y + '">' + (y === "all" ? t("전체", "All") : y) + '</button>'
  ).join(""));
  document.querySelectorAll(".chip").forEach((btn) => btn.addEventListener("click", () => {
    state.year = btn.dataset.y;
    renderYearChips();
    renderPubs();
  }));
}

function renderPubs() {
  const list = arr(state.data.publications).filter((p) => {
    if (state.year !== "all" && String(p.year) !== state.year) return false;
    if (state.firstOnly && !(p.role || "").toLowerCase().includes("first")) return false;
    if (state.query && !(p.title + " " + p.authors + " " + p.venue).toLowerCase().includes(state.query)) return false;
    return true;
  });
  const years = [...new Set(list.map((p) => p.year))];
  const html = years.map((y) =>
    '<section class="year-block"><h2>' + y + '</h2><ol class="pub-list">' + list.filter((p) => p.year === y).map(pubItem).join("") + '</ol></section>'
  ).join("");
  setHtml("pubList", html || ('<p>' + t("없음", "None.") + '</p>'));
}

load().catch((err) => {
  const main = document.querySelector("main");
  if (main) main.innerHTML = '<p>content.json load failed: ' + err.message + '</p>';
});
