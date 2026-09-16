"use strict";
/* ---------- utils.js ---------- */
const Utils = {
  $: (s, r = document) => r.querySelector(s),
  $$: (s, r = document) => [...r.querySelectorAll(s)],
  esc(s){ return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); },
  uid(){ return (crypto.randomUUID ? crypto.randomUUID() : "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36)); },
  wait(ms){ return new Promise(r => setTimeout(r, ms)); },
  latency(){ const [a,b] = CONFIG.LATENCY; return a + Math.random() * (b - a); },
  inr(n){ return "₹" + Number(n).toLocaleString("en-IN"); },
  reduced(){ return matchMedia("(prefers-reduced-motion: reduce)").matches; },
  truncate(s, n){ s = String(s); return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s; },
  debounce(fn, ms){ let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; },
};
const { $, $$, esc } = Utils;
