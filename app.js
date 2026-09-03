const state = { lang: "ko", data: null };
const t = (ko, en) => (state.lang === "en" ? en : ko);

async function load() {
  const res = await fetch("./content.json", { cache: "no-store" });
  if (!res.ok) throw new Error(res.status);
  state.data = await res.json();
  render();
}

function render() {
  const d = state.data;
  const p = d.person;
  const m = d.metrics;
  document.documentElement.lang = state.lang;
  document.getElementById("statusBadge").textContent = d.meta.status;
  document.getElementById("name").textContent = t(p.nameKo, p.nameEn);
  document.getElementById("titleLine").textContent = t(p.titleKo, p.titleEn);
  document.getElementById("tagline").textContent = t(d.taglineKo, d.taglineEn);
  document.getElementById("affiliation").textContent = t(p.affiliationKo, p.affiliationEn);

  const links = [];
  if (p.scholar) links.push(`<a href="${p.scholar}">Google Scholar</a>`);
  if (p.orcid) links.push(`<a href="${p.orcid}">ORCID</a>`);
  if (p.openalex) links.push(`<a href="${p.openalex}">OpenAlex</a>`);
  if (p.group) links.push(`<a href="${p.group}">Wang Lab</a>`);
  document.getElementById("links").innerHTML = links.join("");

  document.getElementById("metrics").innerHTML = `
    <div class="metric"><b>${m.citations}</b><span>${t("인용", "citations")}</span></div>
    <div class="metric"><b>${m.hIndex}</b><span>h-index</span></div>
    <div class="metric"><b>${m.i10}</b><span>i10-index</span></div>
    <p class="metric-note">${t(m.noteKo, m.noteEn)} (${m.asOf})</p>
  `;

  document.getElementById("aboutH").textContent = t("소개", "About");
  document.getElementById("researchH").textContent = t("연구", "Research");
  document.getElementById("pubsH").textContent = t("논문", "Papers");
  document.getElementById("patentsH").textContent = t("특허", "Patents");
  document.getElementById("newsH").textContent = t("소식", "News");
  document.getElementById("pubsHint").textContent = t(
    "공개 Scholar 목록 기준. 인용수는 2026-09-03 스냅샷.",
    "From the public Scholar list. Citation counts are a 2026-09-03 snapshot."
  );

  document.querySelector('[data-i="navAbout"]').textContent = t("소개", "About");
  document.querySelector('[data-i="navResearch"]').textContent = t("연구", "Research");
  document.querySelector('[data-i="navPubs"]').textContent = t("논문", "Papers");
  document.querySelector('[data-i="navPatents"]').textContent = t("특허", "Patents");
  document.querySelector('[data-i="navNews"]').textContent = t("소식", "News");

  document.getElementById("aboutBody").innerHTML = t(d.aboutKo, d.aboutEn)
    .map((x) => `<p>${x}</p>`)
    .join("");

  document.getElementById("researchList").innerHTML = d.research
    .map(
      (i) =>
        `<article class="card"><h3>${t(i.ko, i.en)}</h3><p>${t(i.detailKo, i.detailEn)}</p></article>`
    )
    .join("");

  const pubItem = (pub) => {
    const title = pub.url ? `<a href="${pub.url}">${pub.title}</a>` : pub.title;
    const role = pub.role ? `<span class="role">${pub.role}</span>` : "";
    const cites =
      typeof pub.cites === "number"
        ? `<span class="cites"> · ${t("피인용", "cited")} ${pub.cites}</span>`
        : "";
    return `<li><span class="year">${pub.year}</span>${title}${role}<br>${pub.authors}. <em>${pub.venue}</em>${cites}</li>`;
  };

  document.getElementById("pubList").innerHTML = d.publications.map(pubItem).join("");
  document.getElementById("patentList").innerHTML = (d.patents || []).map(pubItem).join("");
  document.getElementById("newsList").innerHTML = d.news
    .map((n) => {
      const body = n.url ? `<a href="${n.url}">${t(n.ko, n.en)}</a>` : t(n.ko, n.en);
      return `<li><strong>${n.date}</strong> — ${body}</li>`;
    })
    .join("");

  document.getElementById("updated").textContent = "Updated " + d.meta.updated;
  document.getElementById("langBtn").textContent = state.lang === "ko" ? "EN" : "한";
}

document.getElementById("langBtn").addEventListener("click", () => {
  state.lang = state.lang === "ko" ? "en" : "ko";
  render();
});

load().catch((err) => {
  document.querySelector("main").innerHTML = `<p>content.json load failed: ${err.message}</p>`;
});
