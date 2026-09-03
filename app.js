const state={lang:"ko",data:null};
const t=(ko,en)=>state.lang==="en"?en:ko;
async function load(){
  const res=await fetch("./content.json",{cache:"no-store"});
  if(!res.ok) throw new Error(res.status);
  state.data=await res.json(); render();
}
function render(){
  const d=state.data,p=d.person,m=d.metrics;
  document.documentElement.lang=state.lang;
  document.getElementById("statusBadge").textContent=d.meta.status;
  document.getElementById("name").textContent=t(p.nameKo,p.nameEn);
  document.getElementById("titleLine").textContent=t(p.titleKo,p.titleEn);
  document.getElementById("tagline").textContent=t(d.taglineKo,d.taglineEn);
  document.getElementById("affiliation").textContent=t(p.affiliationKo,p.affiliationEn);
  const links=[];
  if(p.scholar) links.push(`<a href="${p.scholar}">Scholar</a>`);
  if(p.orcid) links.push(`<a href="${p.orcid}">ORCID</a>`);
  if(p.group) links.push(`<a href="${p.group}">UW group page</a>`);
  document.getElementById("links").innerHTML=links.join(" · ");
  document.getElementById("metrics").textContent=t(
    `인용 ${m.citations} · h-index ${m.hIndex} · i10 ${m.i10} (${m.asOf} Scholar 스냅샷). ${m.noteKo}`,
    `Citations ${m.citations} · h-index ${m.hIndex} · i10 ${m.i10} (Scholar snapshot ${m.asOf}). ${m.noteEn}`
  );
  document.getElementById("aboutH").textContent=t("소개","About");
  document.getElementById("researchH").textContent=t("연구","Research");
  document.getElementById("pubsH").textContent=t("논문","Selected papers");
  document.getElementById("newsH").textContent=t("소식","News");
  document.getElementById("aboutBody").innerHTML=t(d.aboutKo,d.aboutEn).map(x=>`<p>${x}</p>`).join("");
  document.getElementById("researchList").innerHTML=d.research.map(i=>`<li>${t(i.ko,i.en)}</li>`).join("");
  document.getElementById("pubList").innerHTML=d.publications.map(pub=>{
    const title=pub.url?`<a href="${pub.url}">${pub.title}</a>`:pub.title;
    const role=pub.role?` <small>(${pub.role})</small>`:"";
    return `<li><span class="year">${pub.year}</span>${title}. ${pub.authors}. <em>${pub.venue}</em>${role}</li>`;
  }).join("");
  document.getElementById("newsList").innerHTML=d.news.map(n=>`<li><strong>${n.date}</strong> — ${t(n.ko,n.en)}</li>`).join("");
  document.getElementById("updated").textContent="Updated "+d.meta.updated;
  document.getElementById("langBtn").textContent=state.lang==="ko"?"EN":"한";
}
document.getElementById("langBtn").addEventListener("click",()=>{state.lang=state.lang==="ko"?"en":"ko";render();});
load().catch(err=>{document.querySelector("main").innerHTML=`<p>content.json load failed: ${err.message}</p>`;});
