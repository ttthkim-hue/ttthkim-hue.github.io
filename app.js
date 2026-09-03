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
  bind(); render(); route(); field();
}
function bind() {
  el("langBtn").addEventListener("click", () => {
    state.lang = state.lang === "ko" ? "en" : "ko";
    localStorage.setItem("enermaker-lang", state.lang);
    render();
  });
  el("menuBtn").addEventListener("click", () => el("menu").classList.toggle("open"));
  const q = el("pubQuery"); if (q) q.addEventListener("input", (e) => { state.query = e.target.value.toLowerCase(); renderPubs(); });
  const f = el("firstOnly"); if (f) f.addEventListener("change", (e) => { state.firstOnly = e.target.checked; renderPubs(); });
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
  const menu = el("menu"); if (menu) menu.classList.remove("open");
  window.scrollTo(0, 0);
}
function render() {
  const d = state.data || {}, p = d.person || {}, m = d.metrics || {};
  document.documentElement.lang = state.lang;
  setText("deptLine", t(p.deptKo, p.deptEn));
  setText("heroTitle", t("전하가 버티는 소재.", "Materials that keep charge."));
  setText("heroLede", t("해양·습도·생체 안에서도 출력이 죽지 않는 마찰전기 소재와, 그 소자를 예측하는 디지털 트윈.", "Triboelectric materials that hold output in marine, humid, and in-body settings — and a digital twin that predicts the device."));
  setText("spinLabel", t("지금 다루는 축", "Now staging"));
  setText("stageCap", t("접촉-분리 TENG 모식. 장식 애니메이션.", "Contact-separation TENG schematic. Decorative."));
  spinWords(t(["자가발전 하베스팅","지능형 바이오전자","기능성 나노소재","AI 디지털 트윈"],["self-powered harvesting","intelligent bioelectronics","functional nanomaterials","AI digital twin"]));
  setText("ctaResearch", t("연구 보기", "Research"));
  setText("ctaJoin", t("합류", "Join"));
  setText("piName", t(p.nameKo, p.nameEn));
  setText("piRole", t((p.titleKo||"") + " · EnerMAKER Lab", (p.titleEn||"") + " · EnerMAKER Lab"));
  setHtml("metrics", metric(m.citations, t("인용","citations")) + metric(m.hIndex,"h-index") + metric(m.i10,"i10-index") + `<p class="metric-note">${t(m.noteKo,m.noteEn)} (${m.asOf||""})</p>`);
  [["researchH","연구","Research"],["researchSub","공식 교수소개 네 축.","Four official pillars."],["workH","성과","Work"],["workSub","공개 Scholar 목록.","Public Scholar record."],["piH","책임교수","Principal investigator"],["piSub", t(p.nameKo,p.nameEn)+" · "+t(p.titleKo,p.titleEn), ""],["eduH","학력","Education"],["careerH","경력","Appointments"],["joinH","합류","Join"],["joinSub","학위·학부·박사후 문의.","Graduate, undergraduate, postdoc inquiries."],["newsH","소식","News"],["patentH","특허","Patents"],["firstLabel","1저자만","First author only"]].forEach(([id,ko,en]) => setText(id, t(ko,en)));
  el("langBtn").textContent = state.lang === "ko" ? "EN" : "한";
  setHtml("aboutBody", arr(t(d.aboutKo,d.aboutEn)).map((x)=>`<p>${x}</p>`).join(""));
  setHtml("eduList", arr(d.education).map((e)=>`<li><span class="year">${e.year}</span>${t(e.ko,e.en)}</li>`).join(""));
  setHtml("careerList", arr(d.career).map((e)=>`<li><span class="year">${e.year}</span>${t(e.ko,e.en)}</li>`).join(""));
  const join = arr(d.join).length ? d.join : [{ko:"대학원생",en:"Graduate students",detailKo:"하베스팅·나노소재·바이오전자·디지털 트윈.",detailEn:"Harvesting, nanomaterials, bioelectronics, digital twins."},{ko:"학부연구생",en:"Undergraduates",detailKo:"제작·측정·시뮬레이션.",detailEn:"Fabrication, measurement, simulation."},{ko:"박사후연구원",en:"Postdocs",detailKo:"공개 실적 기준 논의.",detailEn:"From the public record."}];
  setHtml("joinBody", join.map((j)=>`<article class="join-card"><h3>${t(j.ko,j.en)}</h3><p>${t(j.detailKo,j.detailEn)}</p></article>`).join(""));
  setHtml("newsList", arr(d.news).map((n)=>{const body=n.url?`<a href="${n.url}">${t(n.ko,n.en)}</a>`:t(n.ko,n.en);return `<li><strong>${n.date}</strong> — ${body}</li>`;}).join(""));
  setHtml("contactBody", arr(t(d.contactKo,d.contactEn)).map((x)=>`<p>${x}</p>`).join(""));
  setHtml("patentList", arr(d.patents).map(itemLine).join(""));
  setText("updated", "Updated " + ((d.meta && d.meta.updated) || ""));
  renderPillars(); renderFeatured(); renderHomeSelected(); renderYearChips(); renderPubs();
}
let spinTimer=null;
function spinWords(words){const node=el("spinWord");if(!node||!arr(words).length)return;let i=0;node.textContent=words[0];clearInterval(spinTimer);spinTimer=setInterval(()=>{i=(i+1)%words.length;node.style.opacity="0";setTimeout(()=>{node.textContent=words[i];node.style.opacity="1";},180);},2200);}
function metric(v,label){return `<div class="metric"><b>${v??"–"}</b><span>${label}</span></div>`;}
function renderPillars(){const items=arr(state.data.research);setHtml("pillarNav", items.map((item,i)=>`<button class="pillar${i===state.pillar?" active":""}" type="button" data-i="${i}"><small>0${i+1}</small><b>${t(item.ko,item.en)}</b></button>`).join(""));document.querySelectorAll(".pillar").forEach((btn)=>btn.addEventListener("click",()=>{state.pillar=Number(btn.dataset.i);renderPillars();}));const cur=items[state.pillar];if(cur)setHtml("pillarStage", `<h3>${t(cur.ko,cur.en)}</h3><p>${t(cur.detailKo,cur.detailEn)}</p>`);}
function renderFeatured(){const feats=arr(state.data.publications).filter((p)=>p.featured);const pool=feats.length?feats:arr(state.data.publications).slice(0,3);setHtml("featured", pool.map((p)=>`<article class="feat"><div class="yr">${p.year}${p.role?" · "+p.role:""}</div><a href="${p.url||"#"}">${p.title}</a><p>${p.venue}</p></article>`).join(""));}
function renderHomeSelected(){const node=el("homeSelected");if(!node)return;const pool=arr(state.data.publications).filter((p)=>p.featured);const list=(pool.length?pool:arr(state.data.publications)).slice(0,3);node.innerHTML=list.map((p)=>`<article class="feat"><div class="yr">${p.year}</div><a href="${p.url||"#/work"}">${p.title}</a><p>${p.venue}</p></article>`).join("");}
function renderYearChips(){const years=["all",...new Set(arr(state.data.publications).map((p)=>String(p.year)))];setHtml("yearChips", years.map((y)=>`<button class="chip${state.year===y?" on":""}" type="button" data-y="${y}">${y==="all"?t("전체","All"):y}</button>`).join(""));document.querySelectorAll(".chip").forEach((btn)=>btn.addEventListener("click",()=>{state.year=btn.dataset.y;renderYearChips();renderPubs();}));}
function itemLine(item){const title=item.url?`<a href="${item.url}">${item.title}</a>`:item.title;const role=item.role?`<span class="role">${item.role}</span>`:"";const cites=typeof item.cites==="number"?`<span class="cites"> · ${t("피인용","cited")} ${item.cites}</span>`:"";return `<li><span class="year">${item.year}</span>${title}${role}<br>${item.authors}. <em>${item.venue}</em>${cites}</li>`;}
function renderPubs(){const list=arr(state.data.publications).filter((p)=>{if(state.year!=="all"&&String(p.year)!==state.year)return false;if(state.firstOnly&&!(p.role||"").toLowerCase().includes("first"))return false;if(state.query&&!((p.title+" "+p.authors+" "+p.venue).toLowerCase().includes(state.query)))return false;return true;});setHtml("pubList", list.map(itemLine).join("")||`<li>${t("없음","None.")}</li>`);}
function field(){const c=el("field");if(!c)return;const ctx=c.getContext("2d");const dots=[];const resize=()=>{c.width=innerWidth;c.height=innerHeight;};resize();addEventListener("resize",resize);const mouse={x:innerWidth/2,y:innerHeight/2};addEventListener("pointermove",(e)=>{mouse.x=e.clientX;mouse.y=e.clientY;});for(let i=0;i<72;i++)dots.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35});const tick=()=>{ctx.clearRect(0,0,c.width,c.height);ctx.strokeStyle="rgba(110,231,197,.22)";ctx.fillStyle="rgba(240,215,160,.8)";dots.forEach((a,i)=>{a.vx+=(mouse.x-a.x)*0.00003;a.vy+=(mouse.y-a.y)*0.00003;a.x+=a.vx;a.y+=a.vy;if(a.x<0||a.x>c.width)a.vx*=-1;if(a.y<0||a.y>c.height)a.vy*=-1;ctx.beginPath();ctx.arc(a.x,a.y,1.4,0,Math.PI*2);ctx.fill();for(let j=i+1;j<dots.length;j++){const b=dots[j];const dist=Math.hypot(a.x-b.x,a.y-b.y);if(dist<170){ctx.globalAlpha=1-dist/170;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.globalAlpha=1;}}});requestAnimationFrame(tick);};tick();}
load().catch((err)=>{const main=document.querySelector("main");if(main)main.innerHTML=`<p>content.json load failed: ${err.message}</p>`;});
