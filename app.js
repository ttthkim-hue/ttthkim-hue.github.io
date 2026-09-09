const state = {
  lang: localStorage.getItem("enermaker-lang") || "ko",
  theme: localStorage.getItem("enermaker-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
  data: null,
  year: "all",
  query: "",
  firstOnly: false,
  fieldStarted: false
};

const externalAttrs = { target: "_blank", rel: "noopener noreferrer" };
const byId = (id) => document.getElementById(id);
const arr = (value) => Array.isArray(value) ? value : [];
const t = (ko, en) => state.lang === "en" ? (en || ko || "") : (ko || en || "");
const clear = (node) => { if (node) node.replaceChildren(); return node; };
const text = (id, value) => { const node = byId(id); if (node) node.textContent = value || ""; return node; };

function make(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined && value !== null) node.textContent = value;
  return node;
}

function icon(className) {
  const node = document.createElement("i");
  node.className = className;
  node.setAttribute("aria-hidden", "true");
  return node;
}

function link(label, href, className) {
  const rawHref = String(href || "#/");
  const node = make("a", className || "", label);
  node.href = rawHref;
  if (/^https?:\/\//i.test(rawHref)) {
    node.target = externalAttrs.target;
    node.rel = externalAttrs.rel;
  }
  return node;
}

function renderLinkButton(label, href, variant) {
  if (variant === "text") {
    return link(label, href, "text-link");
  }
  const className = variant === "primary" ? "primary-link" : variant === "secondary" ? "secondary-link" : "ghost-link";
  const node = link(label, href, className);
  node.appendChild(icon("bi bi-arrow-up-right"));
  return node;
}

async function load() {
  const res = await fetch("./content.json", { cache: "no-store" });
  if (!res.ok) throw new Error("HTTP " + res.status);
  state.data = await res.json();
  applyTheme();
  bind();
  render();
  route();
  startField();
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme === "dark" ? "dark" : "light";
  const btn = byId("themeBtn");
  if (btn) {
    btn.replaceChildren(icon(state.theme === "dark" ? "bi bi-sun" : "bi bi-moon"));
  }
}

function bind() {
  const langBtn = byId("langBtn");
  const themeBtn = byId("themeBtn");
  const menuBtn = byId("menuBtn");
  const pubQuery = byId("pubQuery");
  const firstOnly = byId("firstOnly");

  if (langBtn) {
    langBtn.addEventListener("click", () => {
      state.lang = state.lang === "ko" ? "en" : "ko";
      localStorage.setItem("enermaker-lang", state.lang);
      render();
      route();
    });
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("enermaker-theme", state.theme);
      applyTheme();
    });
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      const menu = byId("menu");
      if (!menu) return;
      const open = menu.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  if (pubQuery) {
    pubQuery.addEventListener("input", (event) => {
      state.query = String(event.target.value || "").toLowerCase();
      renderPubs();
    });
  }

  if (firstOnly) {
    firstOnly.addEventListener("change", (event) => {
      state.firstOnly = Boolean(event.target.checked);
      renderPubs();
    });
  }

  addEventListener("hashchange", route);

  addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const menu = byId("menu");
    const menuBtn = byId("menuBtn");
    if (!menu?.classList.contains("open")) return;
    menu.classList.remove("open");
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Open menu");
      menuBtn.focus();
    }
  });
}

function currentPath() {
  const raw = (location.hash || "#/").replace(/^#/, "") || "/";
  return raw.startsWith("/") ? raw : "/" + raw;
}

function route() {
  const path = currentPath();
  let matched = false;
  document.querySelectorAll(".view").forEach((view) => {
    const on = view.dataset.view === path;
    view.classList.toggle("on", on);
    if (on) matched = true;
  });
  if (!matched) {
    const home = document.querySelector('.view[data-view="/"]');
    if (home) home.classList.add("on");
  }
  document.querySelectorAll("nav a[data-route]").forEach((item) => {
    item.classList.toggle("on", item.dataset.route === path);
  });
  const menu = byId("menu");
  const menuBtn = byId("menuBtn");
  if (menu) menu.classList.remove("open");
  if (menuBtn) {
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
  }
  window.scrollTo(0, 0);
}

function render() {
  const d = state.data || {};
  const p = d.person || {};
  const m = d.metrics || {};
  document.documentElement.lang = state.lang;
  text("langBtn", state.lang === "ko" ? "EN" : "한");
  text("statusLine", `${t(p.nameKo, p.nameEn)} · ${p.labShort || "EnerMAKER Lab"} · KMOU`);
  text("heroTitle", t(d.heroTitleKo, d.heroTitleEn));
  text("heroWhy", state.lang === "ko" ? (d.heroTitleEn || d.taglineEn) : (d.taglineEn || d.heroTitleEn));
  text("heroLead", t(d.heroLeadKo, d.heroLeadEn));
  text("approachEyebrow", t("연구 접근", "Our Approach"));
  text("loopH", t("실험실 운영 루프", "The lab operating loop"));
  text("loopSub", t("Design → Fabricate → Measure → Model → Deploy 흐름으로 소재·소자·AI 모델링을 하나의 연구 사이클로 연결합니다.", "Design → Fabricate → Measure → Model → Deploy connects materials, devices, and AI modeling into one research cycle."));
  text("pillarsEyebrow", t("연구 축", "Research Pillars"));
  text("focusH", t("핵심 연구 영역", "Core research areas"));
  text("focusSub", t("공식 교수소개 전공과 공개 논문 기록을 바탕으로 정리한 네 가지 연구 축입니다.", "Four research pillars derived from the official faculty profile and public publication record."));
  text("demoH", t("동적 데모와 관리 산출물", "Dynamic demos and managed artifacts"));
  text("homeNewsH", t("최근 소식", "Latest updates"));
  text("selectedPubH", t("최근 연구 신호", "Recent research signals"));
  text("selectedPubSub", t(
    "홈은 랜딩 페이지입니다. 대표 1저자 논문 2편만 미리 보여줍니다.",
    "Home stays a landing page — only two lead-author highlights are shown here."
  ));
  text("researchH", t("무엇을 연구하는가", "What we study"));
  text("researchSub", t("TENG·바이오전자·나노소재·AI 디지털 트윈을 하나의 설계 루프로 연결합니다.", "TENGs, bioelectronics, nanomaterials, and AI digital twins are connected into one design loop."));
  text("pipelineH", t("Design → Fabricate → Measure → Model → Deploy", "Design → Fabricate → Measure → Model → Deploy"));
  text("pubsH", t("논문과 특허", "Publications and patents"));
  text("pubsSub", t("공개 Scholar·DOI 기록. 인용 수는 스냅샷이며 공식 평가 점수가 아닙니다.", "Public Scholar and DOI records. Citation counts are a snapshot, not an official evaluation score."));
  text("firstLabel", t("주요/1저자", "Lead/first author"));
  text("patentH", t("특허", "Patents"));
  text("piH", t("책임교수", "Principal investigator"));
  text("piSub", `${t(p.nameKo, p.nameEn)} · ${t(p.titleKo, p.titleEn)}`);
  text("piName", t(p.nameKo, p.nameEn));
  text("piRank", `${t(p.titleKo, p.titleEn)} · ${t(p.deptKo, p.deptEn)}`);
  text("eduH", t("학력", "Education"));
  text("careerH", t("경력", "Appointments"));
  text("joinH", t("연구·협력 문의", "Research & collaboration inquiries"));
  text("joinSub", t(
    "연구 협력, 학술 교류, 공동 연구에 관심이 있으시면 공개 연락처로 문의해 주세요. 본 페이지는 현재 모집 공고를 대신하지 않습니다.",
    "For research collaboration, academic exchange, or joint projects, use the public contact channels below. This page is not an active recruitment notice."
  ));
  text("joinProtocolH", t("문의 메일에는 무엇을 넣어야 하나", "What to include in the first email"));
  text("joinProtocolBody", t(
    "관심 연구축, 관련 논문 1편, 가능한 협력 형태, 본인 배경·기술스택을 짧게 정리해 주시면 됩니다.",
    "Briefly include your research interests, one relevant paper, a possible collaboration format, and your background or technical stack."
  ));
  text("joinMail", t("문의 메일 보내기", "Email the PI"));
  text("newsH", t("소식", "News"));
  text("contactH", t("연락처", "Contact"));
  text("contactSub", t("공개 교수소개와 연구자 식별자 기준으로 관리합니다.", "Managed from public faculty and researcher identity records."));
  text("sourceH", t("출처 ledger", "Source ledger"));
  text("updated", `Updated ${d.meta?.updated || ""} · ${t(m.noteKo, m.noteEn)}`);
  text("sourceNote", t("공개 가능한 기관·논문·식별자 정보만 사용합니다.", "Only public institution, publication, and identifier-level information is used."));

  const portrait = byId("portrait");
  if (portrait && p.portrait) {
    portrait.src = p.portrait;
    portrait.alt = `${t(p.nameKo, p.nameEn)} portrait`;
  }

  renderHeroActions();
  renderHeroLoopRibbon();
  renderMetrics();
  renderJoinTeaser();
  renderSignalCards();
  renderLoop();
  renderResearch();
  renderDemos();
  renderNews();
  renderSelectedPubs();
  renderProfile();
  renderJoin();
  renderContact();
  renderFooter();
  renderYearChips();
  renderPubs();
}

function renderHeroActions() {
  const node = clear(byId("heroActions"));
  if (!node) return;
  node.append(
    renderLinkButton(t("연구 보기", "Explore research"), "#/research", "primary"),
    renderLinkButton(t("연구·협력 문의", "Contact & collaboration"), "#/join", "secondary"),
    link(t("논문 검색", "Search publications"), "#/publications", "text-link")
  );
}

function renderHeroLoopRibbon() {
  const node = clear(byId("heroLoopRibbon"));
  if (!node) return;
  const steps = arr(state.data?.labLoop);
  if (!steps.length) return;
  steps.forEach((item, index) => {
    const step = make("span", "ribbon-step", t(item.stepKo, item.stepEn));
    node.appendChild(step);
    if (index < steps.length - 1) {
      node.appendChild(make("span", "ribbon-arrow", "→"));
    }
  });
}

function renderMetrics() {
  const node = clear(byId("metricStrip"));
  const d = state.data || {};
  const m = d.metrics || {};
  if (!node) return;
  [
    [String(m.citations ?? "–"), t("인용", "citations")],
    [String(m.hIndex ?? "–"), "h-index"],
    [String(arr(d.publications).length), t("공개 논문", "public records")],
    [String(arr(d.research).length), t("연구축", "pillars")]
  ].forEach(([value, label]) => {
    const item = make("div", "metric-item");
    item.setAttribute("role", "listitem");
    const pair = make("dl", "metric-pair");
    pair.append(make("dt", "", value), make("dd", "", label));
    item.appendChild(pair);
    node.appendChild(item);
  });
}

function renderJoinTeaser() {
  text("joinTeaserH", t("연구·협력 문의", "Contact & collaboration"));
  text("joinTeaserSub", t(
    "연구 협력·학술 교류에 대한 문의 방법과 공개 연락처를 안내합니다.",
    "How to reach the lab for research collaboration and academic inquiries."
  ));
  const node = clear(byId("joinTeaserActions"));
  if (!node) return;
  node.append(
    renderLinkButton(t("문의 안내 보기", "View inquiry guidance"), "#/join", "primary"),
    renderLinkButton(t("연락처", "Contact"), "#/contact", "ghost")
  );
}

function renderSignalCards() {
  const node = clear(byId("signalCards"));
  const cards = arr(state.data?.heroCards);
  if (!node) return;
  cards.forEach((card, index) => {
    const article = make("article", "signal-card");
    const top = make("div", "signal-top");
    top.append(make("span", "card-index", `0${index + 1}`), make("span", "card-kicker", t(card.eyebrowKo, card.eyebrowEn)));
    article.append(top, make("h3", "", t(card.titleKo, card.titleEn)), make("p", "", t(card.bodyKo, card.bodyEn)));
    node.appendChild(article);
  });
}

function renderLoop() {
  const node = clear(byId("labLoop"));
  if (!node) return;
  arr(state.data?.labLoop).forEach((item, index) => {
    const li = make("li", "");
    li.append(make("span", "loop-num", String(index + 1).padStart(2, "0")));
    const box = make("div", "");
    box.append(make("strong", "", t(item.stepKo, item.stepEn)), make("p", "", t(item.bodyKo, item.bodyEn)));
    li.appendChild(box);
    node.appendChild(li);
  });
  const pipeline = clear(byId("pipelineList"));
  if (pipeline) {
    arr(state.data?.labLoop).forEach((item) => {
      const li = make("li", "");
      li.append(make("strong", "", t(item.stepKo, item.stepEn)), make("p", "", t(item.bodyKo, item.bodyEn)));
      pipeline.appendChild(li);
    });
  }
}

function renderResearch() {
  const focus = clear(byId("focusGrid"));
  const pillars = clear(byId("pillarGrid"));
  arr(state.data?.research).forEach((item, index) => {
    const compact = make("article", "pillar-card");
    compact.append(
      make("span", "card-index", `0${index + 1}`),
      make("h3", "", t(item.ko, item.en)),
      make("p", "pillar-signal", t(item.signalKo, item.signalEn))
    );
    const tags = make("div", "tag-row");
    arr(item.keywords).slice(0, 4).forEach((keyword) => tags.appendChild(make("span", "", keyword)));
    compact.appendChild(tags);
    const explore = link(t("연구축 보기", "View pillar"), "#/research", "focus-link");
    explore.appendChild(icon("bi bi-arrow-right"));
    compact.appendChild(explore);
    if (focus) focus.appendChild(compact);

    const article = make("article", "project");
    article.append(make("span", "card-index", `0${index + 1}`), make("h2", "", t(item.ko, item.en)), make("p", "signal", t(item.signalKo, item.signalEn)), make("p", "", t(item.detailKo, item.detailEn)));
    const kw = make("div", "tag-row");
    arr(item.keywords).forEach((keyword) => kw.appendChild(make("span", "", keyword)));
    article.appendChild(kw);
    if (pillars) pillars.appendChild(article);
  });
}

function renderDemos() {
  const node = clear(byId("demoDeck"));
  if (!node) return;
  arr(state.data?.demos).forEach((demo) => {
    const article = make("article", "demo-card");
    article.append(make("span", "pill", demo.tag || "demo"), make("h3", "", t(demo.titleKo, demo.titleEn)), make("p", "", t(demo.bodyKo, demo.bodyEn)));
    node.appendChild(article);
  });
}

function renderNews() {
  const home = clear(byId("homeNews"));
  const full = clear(byId("newsList"));
  const renderItem = (item, compact) => {
    const li = make("li", compact ? "" : "news-item");
    const time = make("time", "", item.date || "");
    if (item.date) time.dateTime = item.date;
    const body = item.url ? link(t(item.ko, item.en), item.url, "") : make("span", "", t(item.ko, item.en));
    li.append(time, body);
    return li;
  };
  arr(state.data?.news).slice(0, 4).forEach((item) => { if (home) home.appendChild(renderItem(item, true)); });
  arr(state.data?.news).forEach((item) => { if (full) full.appendChild(renderItem(item, false)); });
}

function renderSelectedPubs() {
  const node = clear(byId("homePubs"));
  if (!node) return;
  const pubs = arr(state.data?.publications);
  const featured = pubs.filter((pub) => /first|lead/i.test(String(pub.role || "")));
  (featured.length ? featured : pubs).slice(0, 2).forEach((pub) => node.appendChild(pubItem(pub)));
  text("homePubCta", t("전체 논문 보기", "View all publications"));
}

function renderProfile() {
  const d = state.data || {};
  const p = d.person || {};
  const social = clear(byId("social"));
  if (social) {
    [
      ["Google Scholar", p.scholar, "ai ai-google-scholar"],
      ["ORCID", p.orcid, "ai ai-orcid"],
      ["KMOU", p.facultyPage, "bi bi-mortarboard"],
      ["Email", `mailto:${p.email}`, "bi bi-envelope"]
    ].forEach(([label, href, iconClass]) => {
      const item = link("", href, "round-icon");
      item.title = label;
      item.setAttribute("aria-label", label);
      item.appendChild(icon(iconClass));
      social.appendChild(item);
    });
  }

  const facts = clear(byId("facts"));
  if (facts) {
    arr(d.facts).forEach((fact) => {
      facts.append(make("dt", "", t(fact.labelKo, fact.labelEn)), make("dd", "", t(fact.valueKo, fact.valueEn)));
    });
  }

  const about = clear(byId("aboutBody"));
  if (about) {
    arr(t(d.aboutKo, d.aboutEn)).forEach((para) => about.appendChild(make("p", "", para)));
  }

  const edu = clear(byId("eduList"));
  arr(d.education).forEach((item) => {
    const li = make("li", "");
    li.append(make("span", "year", item.year), make("p", "", t(item.ko, item.en)));
    if (edu) edu.appendChild(li);
  });

  const career = clear(byId("careerList"));
  arr(d.career).forEach((item) => {
    const li = make("li", "");
    li.append(make("span", "year", item.year), make("p", "", t(item.ko, item.en)));
    if (career) career.appendChild(li);
  });
}

function renderJoin() {
  const paths = clear(byId("studentPaths"));
  const items = arr(state.data?.studentPaths);
  if (items.length && paths) {
    paths.appendChild(make("p", "join-context-note", t(
      "아래는 연구실이 다루는 협력 맥락입니다. 공식 입학·채용·장학 안내는 대학 및 학과 공지를 확인해 주세요.",
      "The items below describe collaboration contexts the lab works in. For official admission, hiring, or funding notices, refer to university and department announcements."
    )));
  }
  items.forEach((item, index) => {
    const article = make("article", "student-card");
    article.append(
      make("span", "card-index", `0${index + 1}`),
      make("h2", "", t(item.ko, item.en)),
      make("p", "", t(item.detailKo, item.detailEn)),
      make("p", "join-context-cta", t(item.ctaKo, item.ctaEn))
    );
    if (paths) paths.appendChild(article);
  });

  const joinBody = arr(state.data?.join);
  if (joinBody.length && paths) {
    const details = make("div", "join-details");
    joinBody.forEach((item) => {
      const block = make("section", "");
      block.append(make("h3", "", t(item.titleKo, item.titleEn)), make("p", "", t(item.bodyKo, item.bodyEn)));
      details.appendChild(block);
    });
    paths.appendChild(details);
  }
}

function renderContact() {
  const grid = clear(byId("contactGrid"));
  const d = state.data || {};
  if (grid) {
    arr(d.facts).forEach((fact) => {
      const article = make("article", "contact-card");
      article.append(make("span", "eyebrow", t(fact.labelKo, fact.labelEn)), make("p", "", t(fact.valueKo, fact.valueEn)));
      grid.appendChild(article);
    });
  }

  const sources = clear(byId("sourceList"));
  if (sources) {
    arr(d.sources).forEach((source) => {
      const li = make("li", "");
      const labelNode = source.url ? link(source.label, source.url, "") : make("strong", "", source.label);
      li.append(labelNode, make("span", "", ` — ${t(source.noteKo, source.noteEn)}`));
      sources.appendChild(li);
    });
  }
}

function renderFooter() {
  const d = state.data || {};
  const p = d.person || {};
  text("footerDept", t(p.deptKo, p.deptEn));

  const nav = clear(byId("footerNav"));
  if (nav) {
    [
      [t("연구", "Research"), "#/research"],
      [t("논문", "Publications"), "#/publications"],
      [t("책임교수", "PI"), "#/pi"],
      [t("문의", "Inquiries"), "#/join"],
      [t("연락처", "Contact"), "#/contact"]
    ].forEach(([label, href]) => nav.appendChild(link(label, href, "")));
  }

  const contact = clear(byId("footerContact"));
  if (contact) {
    const email = link(p.email || "", `mailto:${p.email}`, "");
    const faculty = link(t("교수소개", "Faculty page"), p.facultyPage, "");
    contact.append(
      make("span", "", t(p.labKo, p.labEn)),
      email,
      faculty
    );
  }
}

function highlightAuthors(authors) {
  const frag = document.createDocumentFragment();
  const parts = String(authors || "").split(/(J\.-K\. Kim|Jin-Kyeom Kim|J\. K\. Kim)/g);
  parts.forEach((part) => {
    if (/^(J\.-K\. Kim|Jin-Kyeom Kim|J\. K\. Kim)$/.test(part)) {
      frag.appendChild(make("span", "me", part));
    } else {
      frag.appendChild(document.createTextNode(part));
    }
  });
  return frag;
}

function pubItem(pub) {
  const li = make("li", "");
  const titleRow = make("div", "pub-title-row");
  titleRow.appendChild(link(pub.title || "Untitled", pub.url || "#/publications", "pub-title"));
  if (pub.role) titleRow.appendChild(make("span", "role", pub.role));
  const meta = make("p", "pub-meta");
  meta.append(highlightAuthors(pub.authors), document.createTextNode(`. ${pub.venue || ""} (${pub.year || ""})`));
  li.append(titleRow, meta);

  const badges = make("div", "badges");
  if (pub.url) {
    const isDoi = /doi\.org/i.test(pub.url);
    const badge = link(isDoi ? "DOI" : "Link", pub.url, "badge-a");
    badge.prepend(icon(isDoi ? "ai ai-doi" : "bi bi-link-45deg"));
    badges.appendChild(badge);
  }
  if (typeof pub.cites === "number") {
    const cite = make("span", "badge-a");
    cite.append(icon("ai ai-google-scholar"), document.createTextNode(` ${pub.cites}`));
    badges.appendChild(cite);
  }
  li.appendChild(badges);
  return li;
}

function renderYearChips() {
  const node = clear(byId("yearChips"));
  if (!node) return;
  const years = ["all", ...new Set(arr(state.data?.publications).map((pub) => String(pub.year)))];
  years.forEach((year) => {
    const btn = make("button", "chip", year === "all" ? t("전체", "All") : year);
    btn.type = "button";
    btn.dataset.y = year;
    btn.classList.toggle("on", state.year === year);
    btn.addEventListener("click", () => {
      state.year = year;
      renderYearChips();
      renderPubs();
    });
    node.appendChild(btn);
  });
}

function renderPubs() {
  const container = clear(byId("pubList"));
  if (!container) return;
  const list = arr(state.data?.publications).filter((pub) => {
    if (state.year !== "all" && String(pub.year) !== state.year) return false;
    if (state.firstOnly && !/(first|lead)/i.test(String(pub.role || ""))) return false;
    const haystack = `${pub.title || ""} ${pub.authors || ""} ${pub.venue || ""}`.toLowerCase();
    return !state.query || haystack.includes(state.query);
  });
  if (!list.length) {
    container.appendChild(make("p", "empty", t("검색 결과가 없습니다.", "No matching records.")));
    return;
  }
  [...new Set(list.map((pub) => pub.year))].forEach((year) => {
    const section = make("section", "year-block");
    section.appendChild(make("h2", "", String(year)));
    const ol = make("ol", "pub-list");
    list.filter((pub) => pub.year === year).forEach((pub) => ol.appendChild(pubItem(pub)));
    section.appendChild(ol);
    container.appendChild(section);
  });

  const patents = clear(byId("patentList"));
  if (patents) arr(state.data?.patents).forEach((patent) => patents.appendChild(pubItem(patent)));
}

function startField() {
  if (state.fieldStarted) return;
  state.fieldStarted = true;
  const canvas = byId("fieldCanvas");
  if (!canvas) return;
  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const particles = [];
  const labels = ["TENG", "Bio", "Nano", "AI", "Twin", "Ocean"];
  let width = 0;
  let height = 0;
  let tick = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 2);
    width = Math.max(320, Math.floor(rect.width));
    height = Math.max(320, Math.floor(rect.height));
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (!particles.length) {
      for (let i = 0; i < 68; i += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          r: 1.2 + Math.random() * 2.4
        });
      }
    }
  }

  function draw() {
    tick += 0.008;
    ctx.clearRect(0, 0, width, height);
    const grad = ctx.createRadialGradient(width * 0.62, height * 0.35, 20, width * 0.55, height * 0.45, Math.max(width, height) * 0.8);
    grad.addColorStop(0, "rgba(59, 184, 232, 0.28)");
    grad.addColorStop(0.45, "rgba(0, 102, 161, 0.14)");
    grad.addColorStop(1, "rgba(7, 18, 40, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    particles.forEach((p, i) => {
      if (!prefersReduced) {
        p.x += p.vx + Math.sin(tick + i) * 0.05;
        p.y += p.vy + Math.cos(tick * 0.75 + i) * 0.05;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));
      }
      for (let j = i + 1; j < particles.length; j += 1) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.globalAlpha = (1 - dist / 110) * 0.22;
          ctx.strokeStyle = "rgba(59, 184, 232, 0.75)";
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    });
    ctx.globalAlpha = 1;
    particles.forEach((p, i) => {
      ctx.fillStyle = i % 6 === 0 ? "rgba(240, 180, 41, 0.85)" : "rgba(140, 220, 255, 0.82)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!prefersReduced) {
      ctx.font = "600 11px IBM Plex Mono, monospace";
      labels.forEach((label, index) => {
        const angle = tick * 0.6 + index * (Math.PI * 2 / labels.length);
        const x = width * 0.58 + Math.cos(angle) * width * 0.32;
        const y = height * 0.42 + Math.sin(angle) * height * 0.22;
        ctx.fillStyle = "rgba(200, 230, 255, 0.45)";
        ctx.fillText(label, x, y);
      });
    }

    if (!prefersReduced) requestAnimationFrame(draw);
  }

  resize();
  addEventListener("resize", resize);
  draw();
}

load().catch((err) => {
  const main = document.querySelector("main");
  if (main) {
    main.replaceChildren(make("p", "empty", `content.json load failed: ${err.message}`));
  }
});
