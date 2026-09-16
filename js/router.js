"use strict";
/* ---------- router.js ---------- */
const Router = {
  params:{}, query:new URLSearchParams(),
  routes:[
    { re:/^#?\/?$/, page:Landing, title:"Bharat Sahay — Government services, explained for you", landing:true },
    { re:/^#\/profile/, page:ProfilePage, title:"Profile — Bharat Sahay" },
    { re:/^#\/assistant/, page:Chat, title:"Assistant — Bharat Sahay", app:true },
    { re:/^#\/results/, page:Results, title:"Eligibility results — Bharat Sahay", app:true },
    { re:/^#\/schemes\/([\w-]+)/, page:SchemePage, title:"Scheme — Bharat Sahay", app:true, param:"slug" },
    { re:/^#\/compare/, page:ComparePage, title:"Compare — Bharat Sahay", app:true },
    { re:/^#\/saved/, page:SavedPage, title:"Saved — Bharat Sahay", app:true },
    { re:/^#\/about/, page:AboutPage, title:"About — Bharat Sahay" },
  ],
  go(hash){ location.hash = hash; },
  match(){
    const h = location.hash || "#/";
    const [path, qs] = h.split("?");
    this.query = new URLSearchParams(qs || "");
    for (const r of this.routes){
      const m = path.match(r.re);
      if (m){ this.params = r.param ? { [r.param]: m[1] } : {}; return r; }
    }
    return this.routes[0];
  },
  async render(){
    const r = this.match();
    document.title = r.title;
    const view = $("#view");
    view.innerHTML = "";
    window.scrollTo({ top:0, behavior:"auto" });
    /* A throw inside page.render/after used to abort this function before
       Fx.initReveal() ran, leaving every .reveal element stuck at opacity:0 —
       i.e. a blank page. Nav setup and reveal must always run. */
    try {
      const html = await r.page.render({ params:this.params });
      if (typeof html === "string") view.innerHTML = html;
      r.page.after && await r.page.after();
    } catch (err) {
      console.error("[router] page render failed:", err);
      if (!view.innerHTML.trim()){
        view.innerHTML = `<section class="section"><div class="container"><div class="err-card">`
          + `<svg class="ic"><use href="#i-alert"/></svg><div><strong>This page could not be loaded.</strong>`
          + `<br/><span class="small">Please try again, or go back to the home page.</span></div></div></div></section>`;
      }
    }
    this.updateNav(r);
    if (!r.landing) Fx.initReveal();
    view.focus({ preventScroll:true });
  },
  updateNav(r){
    const path = location.hash || "#/";
    const isChat = path.startsWith("#/assistant");
    document.body.classList.toggle("chat-active", isChat);
    const footer = $(".footer");
    if (footer) footer.style.display = isChat ? "none" : "";
    const navActive = { how: r.landing, results: /^#\/(results|schemes|compare|saved)/.test(path), about: path.startsWith("#/about") };
    $$(".nav-link").forEach(a => a.classList.toggle("active", !!navActive[a.dataset.nav]));
    $("#bottomNav").style.display = isChat ? "none" : "";
    $("#bottomNav").style.visibility = r.landing ? "hidden" : "visible";
    $$("#bottomNav a").forEach(a => a.classList.toggle("active",
      (a.dataset.bn === "home" && r.landing) || (a.dataset.bn === "assistant" && isChat) || (a.dataset.bn === "saved" && path.startsWith("#/saved"))));
  },
};
