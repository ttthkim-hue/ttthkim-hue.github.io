(() => {
  const SOURCES = {
    hero: "./assets/hires/hero.b64",
    energy: "./assets/hires/energy.b64",
    bio: "./assets/hires/bio.b64",
    nano: "./assets/hires/nano.b64",
    ai: "./assets/hires/ai.b64"
  };
  const CARD_KEYS = ["energy","bio","nano","ai"];
  let assets = null;
  let observer = null;

  async function loadAsset(path) {
    const response = await fetch(path,{cache:"force-cache"});
    if (!response.ok) throw new Error("hires_asset_http_" + response.status + ":" + path);
    const b64 = (await response.text()).replace(/\s+/g,"");
    if (!b64.startsWith("UklG")) throw new Error("hires_asset_invalid_webp:" + path);
    return "data:image/webp;base64," + b64;
  }

  function apply() {
    if (!assets) return false;
    const hero = document.querySelector(".hero");
    if (hero) {
      hero.style.setProperty("--enermaker-hero-hires",'url("' + assets.hero + '")');
      hero.classList.add("has-hires");
    }
    document.querySelectorAll(".home-research-card").forEach((card,index) => {
      const key = CARD_KEYS[index];
      if (!key || !assets[key]) return;
      card.classList.remove("has-reference");
      card.style.backgroundPosition = "";
      card.style.setProperty("--enermaker-card-hires",'url("' + assets[key] + '")');
      card.classList.add("has-hires");
    });
    document.documentElement.classList.add("hires-assets-ready");
    return true;
  }

  async function boot() {
    const entries = await Promise.all(Object.entries(SOURCES).map(async ([key,path]) => [key,await loadAsset(path)]));
    assets = Object.fromEntries(entries);
    window.ENERMAKER_HIRES = assets;
    window.applyEnermakerHires = apply;
    apply();
    if (!observer) {
      observer = new MutationObserver(() => apply());
      observer.observe(document.body,{subtree:true,childList:true});
    }
    window.addEventListener("hashchange",() => queueMicrotask(apply));
    window.dispatchEvent(new CustomEvent("enermaker:hires-ready"));
    return assets;
  }

  window.ENERMAKER_HIRES_READY = boot().catch((error) => {
    console.warn("EnerMAKER hi-res assets unavailable; reference fallback remains active.",error);
    return null;
  });
})();