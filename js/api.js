"use strict";
/* ---------- api.js (centralised; honours DEMO_MODE) ---------- */
const Api = {
  async _sim(){ await Utils.wait(Utils.latency()); },
  async getSchemes(filters = {}){
    if (CONFIG.DEMO_MODE){
      await this._sim();
      let items = SCHEMES.slice();
      if (filters.category) items = items.filter(s => s.category === filters.category);
      return { items, total: items.length };
    }
    const q = new URLSearchParams(filters).toString();
    const r = await fetch(`${CONFIG.API_BASE}/schemes?${q}`);
    if (!r.ok) throw new Error("schemes_unavailable");
    return r.json();
  },
  async getScheme(slug){
    if (CONFIG.DEMO_MODE){ await this._sim(); const s = SCHEMES.find(x => x.slug === slug); if (!s) throw new Error("scheme_not_found"); return s; }
    const r = await fetch(`${CONFIG.API_BASE}/schemes/${slug}`);
    if (!r.ok) throw new Error("scheme_not_found");
    return (await r.json()).scheme;
  },
  async checkEligibility(profile){
    if (CONFIG.DEMO_MODE){ await this._sim(); return Eligibility.rank(profile); }
    const r = await fetch(`${CONFIG.API_BASE}/eligibility/check`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ profile }) });
    if (!r.ok) throw new Error("eligibility_unavailable");
    return r.json();
  },
  async chat(message, language, profile){
    if (CONFIG.DEMO_MODE){ await Utils.wait(650 + Math.random()*500); return Brain.respond(message, language, profile); }
    const r = await fetch(`${CONFIG.API_BASE}/chat`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ message, language, profile }) });
    if (!r.ok) throw new Error("assistant_unavailable");
    return r.json();
  },
};
