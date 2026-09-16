"use strict";
/* ============================================================
   router-v2.js — registers the new routes and nav highlighting
   without touching the original router definition.
   ============================================================ */
Router.routes.splice(Router.routes.length - 1, 0,
  { re:/^#\/explore/,  page:ExplorePage,  title:"Explore schemes — Bharat Sahay", app:true },
  { re:/^#\/wallet/,   page:WalletPage,   title:"Document wallet — Bharat Sahay", app:true },
  { re:/^#\/insights/, page:InsightsPage, title:"Database insights — Bharat Sahay", app:true },
);

const _updateNav = Router.updateNav.bind(Router);
Router.updateNav = function(r){
  _updateNav(r);
  const path = location.hash || "#/";
  const map = {
    results: /^#\/(results|schemes|compare|saved|explore)/.test(path),
    wallet: path.startsWith("#/wallet"),
    insights: path.startsWith("#/insights"),
  };
  $$(".nav-link").forEach(a => { if (a.dataset.nav in map) a.classList.toggle("active", map[a.dataset.nav]); });
  $$("#bottomNav a").forEach(a => {
    if (a.dataset.bn === "wallet") a.classList.toggle("active", path.startsWith("#/wallet"));
  });
};

/* the landing page's "Explore schemes" CTAs now go to the catalogue */
document.addEventListener("click", e => {
  const a = e.target.closest && e.target.closest('a[href="#/results"]');
  if (a && a.dataset.keepResults === undefined && !Store.get("profile", null)){
    e.preventDefault(); location.hash = "#/explore";
  }
}, true);
