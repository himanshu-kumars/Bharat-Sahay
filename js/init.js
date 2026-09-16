"use strict";
/* ---------- init ---------- */
(function init(){
  document.documentElement.lang = LANGS[Lang.current].html;
  $("#langLabel").textContent = Lang.current.toUpperCase();
  $$(".lang-opt").forEach(b => b.setAttribute("aria-current", b.dataset.lang === Lang.current));
  document.querySelectorAll("[data-i18n]").forEach(el => { const v = Lang.t(el.dataset.i18n); if (v) el.textContent = v; });
  if (!CONFIG.DEMO_MODE) $("#demoPill").style.display = "none";
  initNav();
  Router.render();
  // Footer is injected once (outside routed views)
  const footer = document.createElement("footer");
  footer.className = "footer";
  footer.innerHTML = `<div class="container">
    <div class="footer-grid">
      <div>
        <a class="brand" href="#/"><span class="brand-mark"><svg class="ic" style="width:20px;height:20px;color:var(--primary-foreground)"><use href="#i-spark"/></svg></span><span>Bharat Sahay<small style="color:#7d8c82">citizen assistance</small></span></a>
        <p style="font-size:.85rem;margin-top:1rem;max-width:44ch">Understand government services. Discover what you may be eligible for — in the language you prefer, with every answer traceable to an official source.</p>
      </div>
      <nav aria-label="Footer product"><h5>Product</h5>
        <a href="#/assistant">AI Assistant</a><a href="#/profile">Eligibility check</a><a href="#/results">Explore schemes</a><a href="#/compare">Compare schemes</a><a href="#/saved">Saved schemes</a>
      </nav>
      <nav aria-label="Footer project"><h5>Developer </h5>
        <a href="https://github.com/himanshu-kumars" target="_blank" rel="noopener noreferrer">Github ↗</a><a href="https://www.instagram.com/fz_himanshu/?hl=en" target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href="https://www.linkedin.com/in/himanshu-kumar-singh-0b2b3b1b3/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
      </nav>
    </div>
    <div class="footer-legal">
      <span id="footDisclaimer"></span>
      <span>Bharat AI Innovation Arena · Hackathon · 
    </div>
  </div>`;
  document.body.insertBefore(footer, $(".toast-stack"));
  const setDisclaimer = () => { $("#footDisclaimer").textContent = Lang.t("foot_disclaimer"); };
  setDisclaimer();
  const origRender = Router.render.bind(Router);
  Router.render = async function(){ await origRender(); setDisclaimer(); };
})();

/* ---------- init-v2: new subsystems ---------- */
(function initV2(){
  Palette.init();
  const pb = document.getElementById("palBtn");
  if (pb) pb.addEventListener("click", () => Palette.show());
  console.info(`[Bharat Sahay] corpus ready — ${SCHEMES.length} schemes, ${Object.keys(CATEGORIES).length} categories, ${SchemeIndex.stats().ministries} authorities`);
})();
