"use strict";
/* ---------- pages/compare.js ---------- */
const ComparePage = {
  render(){
    const cmp = Store.get("compare", []).map(slug => SCHEMES.find(s => s.slug === slug)).filter(Boolean);
    const profile = Store.get("profile", null);
    const rows = cmp.map(s => ({ s, r: Eligibility.evaluate(s, profile) }));
    const row = (label, fn) => `<tr><th>${label}</th>${rows.map(({s,r}) => `<td>${fn(s,r)}</td>`).join("")}</tr>`;
    return `<div class="container" style="padding-block:2.4rem 0">
      <span class="eyebrow"><span class="pulse-dot"></span>Comparison</span>
      <h1 class="h1" style="margin:.5rem 0 .4rem">Compare schemes side by side</h1>
      <p class="small" style="color:var(--muted-foreground);margin-bottom:1.4rem">Pick up to three schemes. Illustrative demo data.</p>
      <div class="q-chips" style="margin-bottom:1.6rem">
        ${SCHEMES.map(s => {
          const on = cmp.some(c => c.slug === s.slug);
          return `<button class="chip" data-cmp="${s.slug}" aria-pressed="${on}" style="${on ? "background:var(--primary-soft);border-color:var(--primary);color:var(--primary-deep)" : ""}">${on ? "✓ " : ""}${esc(Utils.truncate(s.name, 30))}</button>`;
        }).join("")}
      </div>
      ${rows.length < 2
        ? `<div class="empty"><svg class="ic"><use href="#i-columns"/></svg><strong>Nothing to compare yet</strong><p class="small" style="color:var(--muted-foreground)">Select at least two schemes above, or add them from any scheme page.</p><a class="btn btn-primary btn-sm" href="#/results">Explore schemes</a></div>`
        : `<div class="compare-wrap"><table class="compare-table">
          <thead><tr><th>Scheme</th>${rows.map(({s}) => `<td><b style="font-size:1rem">${esc(s.name)}</b><br/><span class="caption">${esc(s.authority)}</span><br/><button class="caption" data-cmp="${s.slug}" style="color:var(--danger);margin-top:.3rem;text-decoration:underline">remove</button></td>`).join("")}</tr></thead>
          <tbody>
            ${row("Eligibility", (s,r) => Cmp.statusPill(r.status))}
            ${row("Category", s => CATEGORIES[s.category].label)}
            ${row("Benefits", s => s.benefits.map(b => `<span style="display:block;margin-bottom:.3rem"><strong>${esc(b.title)}</strong><br/>${esc(b.amount)}</span>`).join(""))}
            ${row("Income requirement", s => { const c = s.criteria.find(c => c.type === "income_max"); return c ? "Up to " + Utils.inr(c.value) + "/year" : "Not income-gated"; })}
            ${row("Age requirement", s => { const mn = s.criteria.find(c => c.type === "age_min"), mx = s.criteria.find(c => c.type === "age_max"); return mn || mx ? [mn && "min " + mn.value, mx && "max " + mx.value].filter(Boolean).join(" · ") : "No age limit"; })}
            ${row("Documents", s => s.documents.length + " listed (" + s.documents.filter(d => d.mandatory).length + " mandatory)")}
            ${row("Application", s => esc(s.apply[0]))}
            ${row("Source", s => `<a href="${esc(s.official_url)}" target="_blank" rel="noopener noreferrer" style="color:var(--primary-deep);font-weight:600;display:inline-flex;gap:.3rem;align-items:center">${esc(s.sources[0].title.split("—")[0].trim())}<svg class="ic" style="width:12px;height:12px"><use href="#i-ext"/></svg></a>`)}
          </tbody>
        </table></div>`}
    </div>`;
  },
  after(){
    $$("[data-cmp]").forEach(b => b.addEventListener("click", () => {
      let cmp = Store.get("compare", []);
      const slug = b.dataset.cmp;
      if (cmp.includes(slug)) cmp = cmp.filter(x => x !== slug);
      else if (cmp.length >= 3){ Toast.show("You can compare up to 3 schemes", "i-alert"); return; }
      else cmp.push(slug);
      Store.set("compare", cmp);
      Router.render();
    }));
  },
};
