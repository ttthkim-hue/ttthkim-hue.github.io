const state = { lang: "ko", data: null };
const t = (ko, en) => (state.lang === "en" ? en : ko);
const arr = (v) => (Array.isArray(v) ? v : []);
const el = (id) => document.getElementById(id);
const setText = (id, value) => {
  const node = el(id);
  if (node) node.textContent = value || "";
};
const setHtml = (id, value) => {
  const node = el(id);
  if (node) node.innerHTML = value || "";
};

async function load() {
  const res = await fetch("./content.json", { cache: "no-store" });
  if (!res.ok) throw new Error("HTTP " + res.status);
  state.data = await res.json();
  render();
}

function itemLine(item) {
  const title = item.url ? `<a href="${item.url}">${item.title}</a>` : item.title;
  const role = item.role ? `<span class="role">${item.role}</span>` : "";
  const cites = typeof item.cites === "number" ? `<span class="cites"> · ${t("피인용", "cited")} ${item.cites}</span>` : "";
  return `<li><span class="year">${item.year}</span>${title}${role}<br>${item.authors}. <em>${item.venue}</em>${cites}</li>`;
}

function render() {
  const d = state.data || {};
  const p = d.person || {};
  const m = d.metrics || {};
  document.documentElement.lang = state.lang;
  setText("deptLine", t(p.deptKo, p.deptEn));
  setText("name", t(p.nameKo, p.nameEn));
  setText("hanja", p.hanja);
  setText("titleLine", t(p.titleKo, p.titleEn));
  setText("tagline", t(d.taglineKo, d.taglineEn));
  setHtml(
    "links",
    [
      p.facultyPage ? `<a href="${p.facultyPage}">${t("해양대 교수소개", "KMOU profile")}</a>` : "",
      p.scholar ? `<a href="${p.scholar}">Google Scholar</a>` : "",
      p.orcid ? `<a href="${p.orcid}">ORCID</a>` : "",
      p.group ? `<a href="${p.group}">${t("Wang Lab (협업)", "Wang Lab (collab.)")}</a>` : ""
    ]
      .filter(Boolean)
      .join("")
  );
  setHtml(
    "metrics",
    `<div class="metric"><b>${m.citations ?? "–"}</b><span>${t("인용", "citations")}</span></div>` +
      `<div class="metric"><b>${m.hIndex ?? "–"}</b><span>h-index</span></div>` +
      `<div class="metric"><b>${m.i10 ?? "–"}</b><span>i10-index</span></div>` +
      `<p class="metric-note">${t(m.noteKo, m.noteEn)} (${m.asOf || ""})</p>`
  );
  [
    ["aboutH", "소개", "About"],
    ["cvH", "학력·경력", "Education & Appointments"],
    ["eduH", "학력", "Education"],
    ["careerH", "경력", "Appointments"],
    ["researchH", "연구", "Research"],
    ["pubsH", "논문", "Papers"],
    ["patentsH", "특허", "Patents"],
    ["newsH", "소식", "News"],
    ["contactH", "연락", "Contact"]
  ].forEach(([id, ko, en]) => setText(id, t(ko, en)));
  const nav = [
    ["navAbout", "소개", "About"],
    ["navCv", "학력·경력", "CV"],
    ["navResearch", "연구", "Research"],
    ["navPubs", "논문", "Papers"],
    ["navPatents", "특허", "Patents"],
    ["navContact", "연락", "Contact"]
  ];
  nav.forEach(([key, ko, en]) => {
    const node = document.querySelector(`[data-i="${key}"]`);
    if (node) node.textContent = t(ko, en);
  });
  setText("pubsHint", t("공개 Scholar 목록 기준. 인용수는 2026-09-03 스냅샷.", "From the public Scholar list. Citation counts are a 2026-09-03 snapshot."));
  setHtml("aboutBody", arr(t(d.aboutKo, d.aboutEn)).map((x) => `<p>${x}</p>`).join(""));
  setHtml("factcard", arr(t(d.factsKo, d.factsEn)).map((x) => `<p>${x}</p>`).join(""));
  setHtml("eduList", arr(d.education).map((e) => `<li><span class="year">${e.year}</span>${t(e.ko, e.en)}</li>`).join(""));
  setHtml("careerList", arr(d.career).map((e) => `<li><span class="year">${e.year}</span>${t(e.ko, e.en)}</li>`).join(""));
  setHtml(
    "researchList",
    arr(d.research)
      .map((i) => `<article class="card"><h3>${t(i.ko, i.en)}</h3><p>${t(i.detailKo, i.detailEn)}</p></article>`)
      .join("")
  );
  setHtml("pubList", arr(d.publications).map(itemLine).join(""));
  setHtml("patentList", arr(d.patents).map(itemLine).join(""));
  setHtml(
    "newsList",
    arr(d.news)
      .map((n) => {
        const body = n.url ? `<a href="${n.url}">${t(n.ko, n.en)}</a>` : t(n.ko, n.en);
        return `<li><strong>${n.date}</strong> — ${body}</li>`;
      })
      .join("")
  );
  setHtml("contactBody", arr(t(d.contactKo, d.contactEn)).map((x) => `<p>${x}</p>`).join(""));
  setText("updated", "Updated " + ((d.meta && d.meta.updated) || ""));
  const langBtn = el("langBtn");
  if (langBtn) langBtn.textContent = state.lang === "ko" ? "EN" : "한";
}

const langBtn = el("langBtn");
if (langBtn) {
  langBtn.addEventListener("click", () => {
    state.lang = state.lang === "ko" ? "en" : "ko";
    render();
  });
}

load().catch((err) => {
  const main = document.querySelector("main");
  if (main) main.innerHTML = `<p>content.json load failed: ${err.message}</p>`;
});
