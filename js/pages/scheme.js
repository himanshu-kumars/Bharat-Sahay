"use strict";
/* ---------- pages/scheme.js ---------- */
const SchemePage = {
  async render(){
    const slug = Router.params.slug;
    try { this.scheme = await Api.getScheme(slug); }
    catch { return `<div class="container" style="padding-block:4rem"><div class="empty"><svg class="ic"><use href="#i-alert"/></svg><strong>We couldn't find that scheme</strong><p class="small" style="color:var(--muted-foreground)">It may have moved. Browse the catalogue instead.</p><a class="btn btn-primary btn-sm" href="#/results">Explore schemes</a></div></div>`; }
    return `<div id="schemeDetail" style="min-height:200px"></div>`;
  },
  build(){
    const s = this.scheme;
    const profile = Store.get("profile", null);
    const result = Eligibility.evaluate(s, profile);
    const compare = Store.get("compare", []);
    const inCompare = compare.includes(s.slug);
    return `<div class="container detail-shell">
      <div class="detail-main">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span>›</span><a href="#/results">Schemes</a><span>›</span><span>${esc(Utils.truncate(s.name, 34))}</span></nav>
        <div>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.7rem">
            <span class="tag tag-cat">${CATEGORIES[s.category].label}</span>
            <span class="tag">${esc(s.authority)}</span>
            <span class="tag">Last verified ${esc(s.last_verified_at)}</span>
          </div>
          <h1 class="h1">${esc(s.name)}</h1>
          ${s.names[Lang.current] ? `<p class="small" style="color:var(--muted-foreground);margin-top:.35rem">${esc(s.names[Lang.current])} <span class="tag" style="margin-left:.3rem">translated name</span></p>` : ""}
        </div>

        ${profile ? `<div class="card" style="padding:1.1rem 1.3rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap">
          <div><strong class="small">Your match</strong><div class="caption">Based on the information provided</div></div>
          ${Cmp.statusPill(result.status)}
        </div>` : `<div class="card" style="padding:1.1rem 1.3rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap">
          <div><strong class="small">Want to know if this fits you?</strong><div class="caption">Add a short profile and Bharat Sahay will explain the match.</div></div>
          <a class="btn btn-primary btn-sm" href="#/profile">Check eligibility</a>
        </div>`}

        <section class="card detail-sec">
          <h3 class="h3"><svg class="ic"><use href="#i-info"/></svg>Overview</h3>
          <p style="color:var(--muted-foreground)">${esc(s.description)}</p>
        </section>

        <section class="card detail-sec">
          <h3 class="h3"><svg class="ic"><use href="#i-spark"/></svg>Benefits</h3>
          <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(210px,1fr))">
            ${s.benefits.map(b => `<div style="border:1px solid var(--border);border-radius:var(--r-md);padding:.9rem 1rem;background:var(--surface)">
              <strong class="small">${esc(b.title)}</strong>
              <div style="font-family:var(--font-display);font-weight:800;font-size:1.15rem;color:var(--primary-deep);margin:.25rem 0">${esc(b.amount)}</div>
              <p class="caption">${esc(b.detail)}</p>
            </div>`).join("")}
          </div>
        </section>

        <section class="card detail-sec">
          <h3 class="h3"><svg class="ic"><use href="#i-scale"/></svg>Who may qualify</h3>
          <div class="crit-chips">
            ${s.criteria.map(c => {
              if (c.type === "unknown_note") return `<span class="chip" style="background:var(--warning-soft);border-color:#EAD9AC;color:var(--warning)"><svg class="ic" style="width:13px;height:13px"><use href="#i-alert"/></svg>${esc(c.text)}</span>`;
              if (!profile) return `<span class="chip">${esc(c.text)}</span>`;
              const r = Eligibility.evaluate({ ...s, criteria:[c] }, profile);
              const state = r.matched.length ? "met" : r.unmet.length ? "unmet" : "unknown";
              const map = { met:["var(--success-soft)","var(--success)","i-check"], unmet:["var(--danger-soft)","var(--danger)","i-x"], unknown:["var(--warning-soft)","var(--warning)","i-alert"] };
              return `<span class="chip" style="background:${map[state][0]};border-color:transparent;color:${map[state][1]}"><svg class="ic" style="width:13px;height:13px"><use href="#${map[state][2]}"/></svg>${esc(c.text)}</span>`;
            }).join("")}
          </div>
        </section>

        <section class="why-card" data-why id="whyBlock">
          <button class="why-head" aria-expanded="false" style="padding:1rem 1.2rem"><strong class="small" style="font-size:.95rem">Why did this result appear?</strong><svg class="ic chev" style="width:16px;height:16px"><use href="#i-chev"/></svg></button>
          <div class="why-body"><div><ul class="why-list" style="padding:0 1.2rem 1.1rem">${Cmp.whyRows(result)}</ul></div></div>
        </section>

        <section class="card detail-sec">
          <h3 class="h3"><svg class="ic"><use href="#i-doc"/></svg>Documents</h3>
          <div style="display:flex;flex-direction:column">
            ${s.documents.map(d => `<label class="doc-check ${d.mandatory ? "mandatory" : ""}"><input type="checkbox"/><span class="box"><svg class="ic" style="width:11px;height:11px"><use href="#i-check"/></svg></span><span>${esc(d.name)}${d.mandatory ? ` <span class="tag" style="margin-left:.3rem">mandatory</span>` : ` <span class="caption">(optional)</span>`}</span></label>`).join("")}
          </div>
        </section>

        <section class="card detail-sec">
          <h3 class="h3"><svg class="ic"><use href="#i-wand"/></svg>How to apply</h3>
          <ol class="apply-steps">${s.apply.map((st,i) => `<li><b>${i+1}</b><span>${esc(st)}</span></li>`).join("")}</ol>
        </section>

        <section class="card detail-sec">
          <h3 class="h3"><svg class="ic"><use href="#i-shield"/></svg>Source</h3>
          ${s.sources.map(src => Cmp.sourceCard(src)).join("")}
        </section>

        <div class="verify-banner">
          <svg class="ic"><use href="#i-alert"/></svg>
          <span><strong>Verification notice.</strong> This is general information from curated public sources (demo data), not legal advice. Always confirm current details and apply through the official portal.</span>
        </div>
      </div>

      <aside class="detail-rail">
        <div class="card" style="padding:1.2rem;display:flex;flex-direction:column;gap:.7rem">
          <strong class="small">Actions</strong>
          <a class="btn btn-primary" href="${esc(s.official_url)}" target="_blank" rel="noopener noreferrer">Open official website<svg class="ic" style="width:15px;height:15px"><use href="#i-ext"/></svg></a>
          ${Cmp.saveBtn(s.slug, true)}
          <button class="btn btn-secondary" data-compare="${s.slug}"><svg class="ic" style="width:16px;height:16px"><use href="#i-columns"/></svg>${inCompare ? "Added to compare" : "Add to compare"}</button>
          <a class="btn btn-ghost" href="#/assistant?q=${encodeURIComponent("Explain " + s.name + " simply")}"><svg class="ic" style="width:16px;height:16px"><use href="#i-chat"/></svg>Ask about this scheme</a>
        </div>
        <div class="card" style="padding:1.2rem">
          <strong class="small" style="display:block;margin-bottom:.5rem">Quick facts</strong>
          <dl class="caption" style="display:grid;grid-template-columns:auto 1fr;gap:.35rem .8rem">
            <dt style="color:var(--muted-foreground)">Category</dt><dd style="font-weight:600;color:var(--foreground)">${CATEGORIES[s.category].label}</dd>
            <dt style="color:var(--muted-foreground)">Authority</dt><dd style="font-weight:600;color:var(--foreground)">${esc(s.authority)}</dd>
            <dt style="color:var(--muted-foreground)">Verified</dt><dd style="font-weight:600;color:var(--foreground)">${esc(s.last_verified_at)}</dd>
            <dt style="color:var(--muted-foreground)">Documents</dt><dd style="font-weight:600;color:var(--foreground)">${s.documents.filter(d => d.mandatory).length} mandatory</dd>
          </dl>
        </div>
      </aside>
    </div>`;
  },
  after(){
    if (!this.scheme) return;
    $("#schemeDetail").outerHTML = this.build();
    Cmp.bindCardEvents(document);
    $$("[data-compare]").forEach(b => b.addEventListener("click", () => {
      let cmp = Store.get("compare", []);
      const slug = b.dataset.compare;
      if (cmp.includes(slug)){ cmp = cmp.filter(x => x !== slug); Toast.show("Removed from comparison"); }
      else if (cmp.length >= 3){ Toast.show("You can compare up to 3 schemes", "i-alert"); return; }
      else { cmp.push(slug); Toast.show("Added to comparison"); }
      Store.set("compare", cmp);
      b.textContent = cmp.includes(slug) ? "Added to compare" : "Add to compare";
    }));
  },
};
