"use strict";
/* ---------- store.js ---------- */
const Store = {
  get(key, fallback){ try { const v = localStorage.getItem("bs_" + key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set(key, val){ try { localStorage.setItem("bs_" + key, JSON.stringify(val)); } catch {} },
};
