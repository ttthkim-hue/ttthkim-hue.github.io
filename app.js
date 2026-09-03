const state = {
  lang: localStorage.getItem("enermaker-lang") || "ko",
  data: null,
  year: "all",
  query: "",
  firstOnly: false,
  pillar: 0
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
  bind();
  render();
  observe();
  field();
}

function bind() {
  el("langBtn").addEventListener("click", () => {
    state.lang = state.lang === "ko" ? "en" : "ko";
    localStorage.setItem("enermaker-lang", state.lang);
    render();
  });
  el("menuBtn").addEventListener("click", () => el("menu").classList.toggle("open"));
  el("pubQuery").addEventListener("input", (e) => { state.query = e.target.value.toLowerCase(); renderPubs(); });
  el("firstOnly").addEventListener("change", (e) => { state.firstOnly = e.target.checked; renderPubs(); });
}

function render() {
  const d = state.data || {};
  const p = d.person || {};
  const m = d.metrics || {};
  document.documentElement.lang = state.lang;
  setText("deptLine", t(p.deptKo, p.deptEn));
  setText("heroTitle", t(d.heroTitleKo || d.taglineKo || "EnerMAKER Lab", d.heroTitleEn || d.taglineEn || "EnerMAKER Lab"));
  setText("heroLede", t(d.heroLedeKo || (d.aboutKo||[])[0], d.heroLedeEn || (d.aboutEn||[])[0]));
  setText("ctaResearch", t("연구 축 보기", "See research"));
  setText("ctaJoin", t("연구실 합류", "Join the lab"));
  setText("piName", t(p.nameKo, p.nameEn));
  setText("piRole", t((p.titleKo || "") + " · EnerMAKER Lab", (p.titleEn || "") + " · EnerMAKER Lab"));
  setHtml("metrics",
    metric(m.citations, t("인용", "citations")) +
    metric(m.hIndex, "h-index") +
    metric(m.i10, "i10-index") +
    `<p class="metric-note">${t(m.noteKo, m.noteEn)} (${m.asOf || ""})</p>`
  );
  const labels = [
    ["researchH","연구","Research"],
    ["researchSub","공식 교수소개의 네 축. 클릭하면 상세가 바뀝니다.","Four official pillars. Click a card to stage the brief."],
    ["workH","성과","Selected work"],
    ["workSub","공개 Scholar 목록. 연도와 저자 역할로 걸러집니다.","Public Scholar record. Filter by year and authorship."],
    ["piH","책임교수","Principal investigator"],
    ["piSub", t(p.nameKo, p.nameEn) + " · " + t(p.titleKo, p.titleEn), ""],
    ["eduH","학력","Education"],
    ["careerH","경력","Appointments"],
    ["joinH","합류","Join"],
    ["joinSub","학위과정·박사후 과정 문의. 미공개 과제 설명은 메일로만.","Graduate and postdoctoral inquiries. Unpublished projects stay off this page."],
    ["newsH","소식","News"],
    ["contactH","연락","Contact"],
    ["patentH","특허","Patents"],
    ["firstLabel","1저자만","First author only"]
  ];
  labels.forEach(([id, ko, en]) => setText(id, t(ko, en)));
  [
    ["navResearch","연구","Research"],
    ["navWork","성과","Work"],
    ["navPi","PI","PI"],
    ["navJoin","합류","Join"],
    ["navContact","연락","Contact"]
  ].forEach(([k, ko, en]) => {
    const n = document.querySelector(`[data-i="${k}"]`);
    if (n) n.textContent = t(ko, en);
  });
  el("langBtn").textContent = state.lang === "ko" ? "EN" : "한";
  setHtml("aboutBody", arr(t(d.aboutKo, d.aboutEn)).map((x) => `<p>${x}</p>`).join(""));
  setHtml("eduList", arr(d.education).map((e) => `<li><span class="year">${e.year}</span>${t(e.ko, e.en)}</li>`).join(""));
  setHtml("careerList", arr(d.career).map((e) => `<li><span class="year">${e.year}</span>${t(e.ko, e.en)}</li>`).join(""));
  const join = arr(d.join).length ? d.join : [
    {ko:"대학원생",en:"Graduate students",detailKo:"에너지 하베스팅·나노소재·바이오전자·디지털 트윈.",detailEn:"Energy harvesting, nanomaterials, bioelectronics, digital twins."},
    {ko:"학부연구생",en:"Undergraduates",detailKo:"소자 제작·측정 또는 시뮬레이션.",detailEn:"Device fabrication, measurement, or simulation."},
    {ko:"박사후연구원",en:"Postdocs",detailKo:"공개 실적 기준으로 논의합니다.",detailEn:"Discussed from the public record."}
  ];
  setHtml("joinBody", join.map((j) => `<article class="join-card"><h3>${t(j.ko, j.en)}</h3><p>${t(j.detailKo, j.detailEn)}</p></article>`).join(""));
  setHtml("newsList", arr(d.news).map((n) => {
    const body = n.url ? `<a href="${n.url}">${t(n.ko, n.en)}</a>` : t(n.ko, n.en);
    return `<li><strong>${n.date}</strong> — ${body}</li>`;
  }).join(""));
  setHtml("contactBody", arr(t(d.contactKo, d.contactEn)).map((x) => `<p>${x}</p>`).join(""));
  setHtml("patentList", arr(d.patents).map(itemLine).join(""));
  setText("updated", "Updated " + ((d.meta && d.meta.updated) || ""));
  renderPillars();
  renderFeatured();
  renderYearChips();
  renderPubs();
}

function metric(v, label) {
  return `<div class="metric"><b data-count="${v ?? 0}">${v ?? "–"}</b><span>${label}</span></div>`;
}

function renderPillars() {
  const items = arr(state.data.research);
  setHtml("pillarNav", items.map((item, i) => `
    <button class="pillar${i === state.pillar ? " active" : ""}" type="button" data-i="${i}">
      <small>0${i + 1}</small>
      <b>${t(item.ko, item.en)}</b>
    </button>`).join(""));
  document.querySelectorAll(".pillar").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.pillar = Number(btn.dataset.i);
      renderPillars();
    });
  });
  const cur = items[state.pillar];
  if (cur) setHtml("pillarStage", `<h3>${t(cur.ko, cur.en)}</h3><p>${t(cur.detailKo, cur.detailEn)}</p>`);
}

function renderFeatured() {
  const feats = arr(state.data.publications).filter((p) => p.featured);
  const pool = feats.length ? feats : arr(state.data.publications).slice(0, 3);
  setHtml("featured", pool.map((p) => `
    <article class="feat">
      <div class="yr">${p.year}${p.role ? " · " + p.role : ""}</div>
      <a href="${p.url || "#"}">${p.title}</a>
      <p>${p.venue}${typeof p.cites === "number" ? " · cited " + p.cites : ""}</p>
    </article>`).join(""));
}

function renderYearChips() {
  const years = ["all", ...new Set(arr(state.data.publications).map((p) => String(p.year)))];
  setHtml("yearChips", years.map((y) =>
    `<button class="chip${state.year === y ? " on" : ""}" type="button" data-y="${y}">${y === "all" ? t("전체", "All") : y}</button>`
  ).join(""));
  document.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.year = btn.dataset.y;
      renderYearChips();
      renderPubs();
    });
  });
}

function itemLine(item) {
  const title = item.url ? `<a href="${item.url}">${item.title}</a>` : item.title;
  const role = item.role ? `<span class="role">${item.role}</span>` : "";
  const cites = typeof item.cites === "number" ? `<span class="cites"> · ${t("피인용", "cited")} ${item.cites}</span>` : "";
  return `<li><span class="year">${item.year}</span>${title}${role}<br>${item.authors}. <em>${item.venue}</em>${cites}</li>`;
}

function renderPubs() {
  const list = arr(state.data.publications).filter((p) => {
    if (state.year !== "all" && String(p.year) !== state.year) return false;
    if (state.firstOnly && !(p.role || "").toLowerCase().includes("first")) return false;
    if (state.query) {
      const blob = `${p.title} ${p.authors} ${p.venue}`.toLowerCase();
      if (!blob.includes(state.query)) return false;
    }
    return true;
  });
  setHtml("pubList", list.map(itemLine).join("") || `<li>${t("조건에 맞는 논문이 없습니다.","No matching papers.")}</li>`);
}

function observe() {
  const links = [...document.querySelectorAll("#menu a")];
  const map = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-40% 0px -50% 0px" });
  map.forEach((sec) => io.observe(sec));
}

function field() {
  const c = el("field");
  if (!c) return;
  const ctx = c.getContext("2d");
  const dots = [];
  const resize = () => { c.width = innerWidth; c.height = innerHeight; };
  resize();
  addEventListener("resize", resize);
  for (let i = 0; i < 48; i++) {
    dots.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 });
  }
  const tick = () => {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "rgba(110,231,197,.12)";
    ctx.fillStyle = "rgba(212,176,106,.55)";
    dots.forEach((a, i) => {
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > c.width) a.vx *= -1;
      if (a.y < 0 || a.y > c.height) a.vy *= -1;
      ctx.beginPath(); ctx.arc(a.x, a.y, 1.4, 0, Math.PI * 2); ctx.fill();
      for (let j = i + 1; j < dots.length; j++) {
        const b = dots[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 140) {
          ctx.globalAlpha = 1 - dist / 140;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    });
    requestAnimationFrame(tick);
  };
  tick();
}

load().catch((err) => {
  const main = document.querySelector("main");
  if (main) main.innerHTML = `<p>content.json load failed: ${err.message}</p>`;
});
