"use strict";
/* ---------- pages/results.js ---------- */
const Results = {
  filters:{ category:"", status:"" },
  async render(){
    const profile = Store.get("profile", null);
    const preCat = Router.query.get("category") || "";
    this.filters = { category: preCat, status:"" };
    return `<div class="container">
      <div class="results-head">
        <div>
          <span class="eyebrow"><span class="pulse-dot"></span>Eligibility results</span>
          <h1 class="h1" style="margin-top:.5rem">Potential matches for you</h1>
          <p class="small" style="color:var(--muted-foreground);margin-top:.4rem">Based on the information provided — not a guarantee of eligibility. Demo dataset.</p>
          ${profile ? `<div class="profile-chip" style="margin-top:.9rem">
            <svg class="ic" style="width:14px;height:14px;color:var(--primary)"><use href="#i-users"/></svg>
            <span><b>${profile.age ?? "?"} yrs</b> · ${esc(profile.state || "—")}${profile.occupation ? " · " + esc(profile.occupation.replace("_"," ")) : ""}${profile.category ? " · " + esc(profile.category) : ""}${profile.annualIncome ? " · ≤ " + Utils.inr(profile.annualIncome) + "/yr" : ""}</span>
            <a class="btn btn-ghost btn-sm" href="#/profile" style="padding:.25rem .6rem">Edit</a>
          </div>`
          : `<a class="btn btn-secondary btn-sm" style="margin-top:.9rem" href="#/profile"><svg class="ic" style="width:14px;height:14px"><use href="#i-users"/></svg>Add a profile for personalised matches</a>`}
        </div>
        <button class="btn btn-secondary btn-sm" id="printReport"><svg class="ic" style="width:15px;height:15px"><use href="#i-doc"/></svg>Download report (PDF-ready)</button>
      </div>
      <div class="filter-bar card">
        <svg class="ic" style="width:16px;height:16px;color:var(--muted-foreground)"><use href="#i-search"/></svg>
        <select class="input" id="fltCat" aria-label="Filter by category">
          <option value="">All categories</option>
          ${Object.entries(CATEGORIES).map(([k,c]) => `<option value="${k}" ${k === this.filters.category ? "selected" : ""}>${c.label}</option>`).join("")}
        </select>
        <select class="input" id="fltStatus" aria-label="Filter by eligibility">
          <option value="">Any eligibility</option>
          ${Object.values(STATUS).map(s => `<option value="${s.key}">${s.label}</option>`).join("")}
        </select>
        <span class="caption" id="resCount" style="margin-left:auto"></span>
      </div>
      <div class="results-grid" id="resGrid">${Array(4).fill(Cmp.schemeCardSkeleton()).join("")}</div>
    </div>`;
  },
  async after(){
    const profile = Store.get("profile", null);
    const grid = $("#resGrid");
    let ranked;
    try { ranked = await Api.checkEligibility(profile); }
    catch { grid.innerHTML = `<div class="err-card" style="grid-column:1/-1"><svg class="ic"><use href="#i-alert"/></svg><div><strong>We couldn't load results right now.</strong><br/><span class="small">Check your connection and try again.</span></div></div>`; return; }
    this.ranked = ranked;
    const draw = () => {
      let list = this.ranked;
      if (this.filters.category) list = list.filter(r => r.scheme.category === this.filters.category);
      if (this.filters.status) list = list.filter(r => r.status.key === this.filters.status);
      $("#resCount").textContent = list.length + " scheme" + (list.length === 1 ? "" : "s");
      grid.innerHTML = list.length
        ? list.map(r => Cmp.schemeCard(r)).join("")
        : `<div class="empty" style="grid-column:1/-1"><svg class="ic"><use href="#i-search"/></svg><strong>No schemes found</strong><p class="small" style="color:var(--muted-foreground)">Try adding more information or asking your question differently.</p><a class="btn btn-secondary btn-sm" href="#/assistant">Ask Bharat Sahay</a></div>`;
      Cmp.bindCardEvents(grid);
    };
    draw();
    $("#fltCat").addEventListener("change", e => { this.filters.category = e.target.value; draw(); });
    $("#fltStatus").addEventListener("change", e => { this.filters.status = e.target.value; draw(); });
    $("#printReport").addEventListener("click", () => {
      if (!this.ranked){ Toast.show("Results are still loading…", "i-info"); return; }
      let list = this.ranked;
      if (this.filters.category) list = list.filter(r => r.scheme.category === this.filters.category);
      if (this.filters.status) list = list.filter(r => r.status.key === this.filters.status);
      Report.eligibility(list, Store.get("profile", null));
      Toast.show("Report opened in a new tab — print or save as PDF", "i-doc");
    });
  },
};
