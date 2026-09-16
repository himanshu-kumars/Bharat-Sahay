"use strict";
/* ---------- navigation.js ---------- */
const Theme = {
  get(){ return Store.get("theme", "light"); },
  apply(t){
    if (t === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    Store.set("theme", t);
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = t === "dark" ? "#0D1512" : "#F4F3EB";
    const b = $("#themeBtn");
    if (b) b.setAttribute("aria-pressed", String(t === "dark"));
  },
  toggle(){ const next = this.get() === "dark" ? "light" : "dark"; this.apply(next); Toast.show(next === "dark" ? "Dark mode on" : "Light mode on", "i-spark"); },
};

function initNav(){
  const nav = $("#navbar");
  addEventListener("scroll", Utils.debounce(() => nav.classList.toggle("scrolled", scrollY > 8), 10), { passive:true });
  nav.classList.toggle("scrolled", scrollY > 8);

  Theme.apply(Theme.get());
  $("#themeBtn").addEventListener("click", () => Theme.toggle());

  const dd = $("#langDd"), btn = $("#langBtn");
  btn.addEventListener("click", e => { e.stopPropagation(); dd.classList.toggle("open"); btn.setAttribute("aria-expanded", dd.classList.contains("open")); });
  document.addEventListener("click", e => { if (!dd.contains(e.target)) dd.classList.remove("open"); });
  $$(".lang-opt").forEach(o => o.addEventListener("click", () => { dd.classList.remove("open"); Lang.set(o.dataset.lang); Toast.show("Language: " + LANGS[o.dataset.lang].native, "i-globe"); }));

  addEventListener("hashchange", () => Router.render());
}
