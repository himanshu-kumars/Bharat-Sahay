"use strict";
/* ============================================================
   pages/explore.js — NEW: full scheme catalogue browser
   Live text search · category · level (central/state) · state ·
   sort by relevance / value / recency · URL-synced filters
   ============================================================ */
const ExplorePage = {
  f:{ q:"", category:"", level:"", state:"", sort:"relevance" },

  async render(){
    this.f = {
      q: Router.query.get("q") || "",
      category: Router.query.get("category") || "",
      level: Router.query.get("level") || "",
      state: Router.query.get("state") || "",
      sort: Router.query.get("sort") || "relevance",
    };
    const st = SchemeIndex.stats();
    return `<div class="container">
      <div class="results-head">
        <div>
          <span class="eyebrow"><span class="pulse-dot"></span>Scheme catalogue</span>
          <h1 class="h1" style="margin-top:.5rem">Explore all ${st.total} schemes</h1>
          <p class="small" style="color:var(--muted-foreground);margin-top:.4rem">
            ${st.central} central · ${st.state} state-level across ${st.statesCovered} states ·
            ${st.categories} categories · ${st.ministries} ministries and departments.
          </p>
        </div>
        <a class="btn btn-secondary btn-sm" href="#/insights"><svg class="ic" style="width:15px;height:15px"><use href="#i-layers"/></svg>Database insights</a>
      </div>

      <div class="card filter-bar" style="flex-wrap:wrap">
        <svg class="ic" style="width:16px;height:16px;color:var(--muted-foreground)"><use href="#i-search"/></svg>
        <input class="input" id="exQ" type="search" placeholder="Search scheme, ministry, benefit or document…" value="${esc(this.f.q)}" style="flex:1 1 240px" aria-label="Search schemes"/>
        <select class="input" id="exCat" aria-label="Category">
          <option value="">All categories</option>
          ${Object.entries(CATEGORIES).map(([k,c]) => `<option value="${k}" ${k===this.f.category?"selected":""}>${c.label}</option>`).join("")}
        </select>
        <select class="input" id="exLevel" aria-label="Level">
          <option value="">Central + State</option>
          <option value="central" ${this.f.level==="central"?"selected":""}>Central only</option>
          <option value="state" ${this.f.level==="state"?"selected":""}>State only</option>
        </select>
        <select class="input" id="exState" aria-label="State">
          <option value="">Any state</option>
          ${SchemeIndex.states().map(s => `<option value="${esc(s)}" ${s===this.f.state?"selected":""}>${esc(s)}</option>`).join("")}
        </select>
        <select class="input" id="exSort" aria-label="Sort">
          <option value="relevance" ${this.f.sort==="relevance"?"selected":""}>Sort: relevance</option>
          <option value="value" ${this.f.sort==="value"?"selected":""}>Sort: highest benefit</option>
          <option value="recent" ${this.f.sort==="recent"?"selected":""}>Sort: recently verified</option>
          <option value="az" ${this.f.sort==="az"?"selected":""}>Sort: A–Z</option>
        </select>
        <button class="btn btn-ghost btn-sm" id="exClear">Clear</button>
      </div>

      <div id="exChips" style="display:flex;gap:.45rem;flex-wrap:wrap;margin:.9rem 0"></div>
      <p class="caption" id="exCount" style="margin-bottom:.8rem"></p>
      <div class="results-grid" id="exGrid"></div>
    </div>`;
  },

  match(s){
    const f = this.f;
    if (f.category && s.category !== f.category) return false;
    if (f.level && s.level !== f.level) return false;
    if (f.state && s.state && s.state !== f.state) return false;
    if (f.state && !s.state && f.level === "state") return false;
    if (f.q){
      const hay = [
        s.name, s.summary, s.description, s.authority, s.category, s.state || "",
        ...(s.tags || []), ...Object.values(s.names || {}),
        ...(s.benefits || []).map(b => b.title + " " + b.amount),
        ...(s.documents || []).map(d => d.name),
      ].join(" ").toLowerCase();
      if (!f.q.toLowerCase().split(/\s+/).filter(Boolean).every(t => hay.includes(t))) return false;
    }
    return true;
  },

  list(){
    const profile = Store.get("profile", null);
    let items = SCHEMES.filter(s => this.match(s));
    const f = this.f;
    if (f.sort === "az") items.sort((a,b) => a.name.localeCompare(b.name));
    else if (f.sort === "value") items.sort((a,b) => Eligibility.annualValue(b) - Eligibility.annualValue(a));
    else if (f.sort === "recent") items.sort((a,b) => String(b.last_verified_at).localeCompare(String(a.last_verified_at)));
    else if (profile) items = Eligibility.rank(profile).map(r => r.scheme).filter(s => this.match(s));
    return items.map(s => Eligibility.evaluate(s, profile));
  },

  draw(){
    const rows = this.list();
    $("#exCount").textContent = `${rows.length} scheme${rows.length === 1 ? "" : "s"} match your filters`;
    $("#exGrid").innerHTML = rows.length
      ? rows.map(r => Cmp.schemeCard(r)).join("")
      : `<div class="empty" style="grid-column:1/-1"><svg class="ic"><use href="#i-search"/></svg><strong>Nothing matched</strong><p class="small" style="color:var(--muted-foreground)">Try fewer words, or clear a filter.</p><button class="btn btn-secondary btn-sm" id="exClear2">Clear filters</button></div>`;
    Cmp.bindCardEvents($("#exGrid"));
    const c2 = $("#exClear2"); if (c2) c2.addEventListener("click", () => this.clear());

    const chips = [];
    if (this.f.q) chips.push(["q", `"${this.f.q}"`]);
    if (this.f.category) chips.push(["category", CATEGORIES[this.f.category].label]);
    if (this.f.level) chips.push(["level", this.f.level === "central" ? "Central schemes" : "State schemes"]);
    if (this.f.state) chips.push(["state", this.f.state]);
    $("#exChips").innerHTML = chips.map(([k,l]) =>
      `<button class="tag" data-chip="${k}" style="cursor:pointer">${esc(l)} <span style="opacity:.6;margin-left:.2rem">✕</span></button>`).join("");
    $$("#exChips [data-chip]").forEach(b => b.addEventListener("click", () => {
      this.f[b.dataset.chip] = ""; this.sync(); this.rerenderControls(); this.draw();
    }));
  },

  rerenderControls(){
    $("#exQ").value = this.f.q; $("#exCat").value = this.f.category;
    $("#exLevel").value = this.f.level; $("#exState").value = this.f.state;
  },

  clear(){ this.f = { q:"", category:"", level:"", state:"", sort:"relevance" }; this.sync(); this.rerenderControls(); $("#exSort").value = "relevance"; this.draw(); },

  sync(){
    const p = new URLSearchParams();
    Object.entries(this.f).forEach(([k,v]) => { if (v && !(k === "sort" && v === "relevance")) p.set(k, v); });
    const qs = p.toString();
    history.replaceState(null, "", "#/explore" + (qs ? "?" + qs : ""));
  },

  async after(){
    this.draw();
    const upd = () => { this.sync(); this.draw(); };
    $("#exQ").addEventListener("input", Utils.debounce(e => { this.f.q = e.target.value; upd(); }, 220));
    $("#exCat").addEventListener("change", e => { this.f.category = e.target.value; upd(); });
    $("#exLevel").addEventListener("change", e => { this.f.level = e.target.value; upd(); });
    $("#exState").addEventListener("change", e => { this.f.state = e.target.value; upd(); });
    $("#exSort").addEventListener("change", e => { this.f.sort = e.target.value; upd(); });
    $("#exClear").addEventListener("click", () => this.clear());
  },
};
