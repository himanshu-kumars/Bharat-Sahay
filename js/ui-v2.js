"use strict";
/* ============================================================
   ui-v2.js — non-destructive UI upgrades applied at load time.
   Wraps existing renderers instead of rewriting them, so the
   original design stays exactly as it was and only gains detail.
   ============================================================ */

/* ---- 1. scheme cards gain a level badge + confidence meter ---- */
const _schemeCard = Cmp.schemeCard.bind(Cmp);
Cmp.schemeCard = function(result, opts){
  let html = _schemeCard(result, opts);
  const s = result.scheme;
  const badge = s.level === "state"
    ? `<span class="tag tag-state">${esc(s.state)} state scheme</span>`
    : `<span class="tag tag-central">Central scheme</span>`;
  html = html.replace('<div class="scheme-meta">', `<div class="scheme-meta">${badge}`);
  if (typeof result.score === "number" && Store.get("profile", null)){
    const conf = `<div class="conf" title="How confidently your profile matches this scheme's criteria">
      <span class="conf-num">match</span><span class="conf-bar"><i style="width:${result.score}%"></i></span><span class="conf-num">${result.score}%</span>
    </div>`;
    html = html.replace('<div class="why-card"', conf + '<div class="why-card"');
  }
  return html;
};

/* ---- 2. results page gains a portfolio summary + gap nudge ---- */
const _resultsAfter = Results.after.bind(Results);
Results.after = async function(){
  await _resultsAfter();
  if (!this.ranked) return;
  const folio = Eligibility.portfolio(this.ranked);
  const profile = Store.get("profile", null);
  const head = $(".results-head");
  if (!head || $("#folioStrip")) return;

  const strip = document.createElement("div");
  strip.id = "folioStrip";
  strip.className = "folio";
  strip.innerHTML = `
    <div class="card"><b style="color:var(--success)">${folio.likely}</b><span class="small">Likely eligible</span></div>
    <div class="card"><b style="color:var(--primary-deep)">${folio.possible}</b><span class="small">Possibly eligible</span></div>
    <div class="card"><b style="color:var(--warning)">${folio.moreInfo}</b><span class="small">Need more detail</span></div>
    <div class="card"><b>${folio.docsNeeded.length}</b><span class="small">Documents to gather</span>
      <a class="caption" href="#/wallet" style="color:var(--primary-deep);font-weight:650">Open wallet →</a></div>
    ${folio.estimatedValue > 0 ? `<div class="card"><b style="color:var(--accent-deep)">${Utils.inr(folio.estimatedValue)}</b><span class="small">Indicative annual value</span>
      <span class="caption">headline figures, not a guarantee</span></div>` : ""}`;
  head.insertAdjacentElement("afterend", strip);

  if (folio.topGaps.length && profile){
    const nudge = document.createElement("div");
    nudge.className = "nudge";
    nudge.innerHTML = `<svg class="ic" style="width:19px;height:19px;color:var(--primary-deep);flex:none;margin-top:.15rem"><use href="#i-wand"/></svg>
      <div><strong class="small">Sharpen your matches</strong>
      <div class="small" style="color:var(--muted-foreground)">Adding ${folio.topGaps.map(g => `<b>${esc(g[0])}</b> (${g[1]} schemes)`).join(", ")} would resolve the most open questions.</div>
      <a class="btn btn-secondary btn-sm" href="#/profile" style="margin-top:.6rem">Update profile</a></div>`;
    strip.insertAdjacentElement("afterend", nudge);
  }
};

/* ---- 3. scheme detail gains state badge, FAQs, related schemes,
          document-readiness bar and a one-scheme PDF brief ---- */
const _schemeBuild = SchemePage.build.bind(SchemePage);
SchemePage.build = function(){
  let html = _schemeBuild();
  const s = this.scheme;

  const badge = s.level === "state"
    ? `<span class="tag tag-state">${esc(s.state)} state scheme</span>`
    : `<span class="tag tag-central">Central scheme</span>`;
  html = html.replace('<span class="tag tag-cat">', badge + '<span class="tag tag-cat">');

  const rd = Wallet.readiness(s);
  const readyBlock = `<div style="margin:.85rem 0 .2rem">
    <div style="display:flex;justify-content:space-between;align-items:baseline">
      <span class="small" style="font-weight:650">Your document readiness</span>
      <span class="caption" style="font-family:var(--font-mono)">${rd.pct}%</span>
    </div>
    <div class="conf-bar" style="margin-top:.3rem"><i style="width:${rd.pct}%"></i></div>
    <p class="caption" style="margin-top:.35rem">${rd.missing.length ? "Still needed: " + esc(rd.missing.join(", ")) : "Every mandatory document is already in your wallet ✓"}
      · <a href="#/wallet" style="color:var(--primary-deep);font-weight:650">Manage wallet →</a></p>
  </div>`;

  const extras = `
    ${(s.faqs || []).length ? `<section class="card detail-sec">
      <h3 class="h3"><svg class="ic"><use href="#i-quote"/></svg>Questions people ask</h3>
      <div style="display:grid;gap:.9rem">
        ${s.faqs.map(f => `<div><strong class="small">${esc(f.q)}</strong><p class="small" style="color:var(--muted-foreground);margin-top:.2rem">${esc(f.a)}</p></div>`).join("")}
      </div></section>` : ""}
    ${(s.related || []).length ? `<section class="card detail-sec">
      <h3 class="h3"><svg class="ic"><use href="#i-layers"/></svg>People also look at</h3>
      <div style="display:grid;gap:.55rem">
        ${s.related.map(slug => { const r = SchemeIndex.get(slug); return r ? `<a class="convo-item" href="#/schemes/${r.slug}" style="display:flex;gap:.6rem;align-items:center;padding:.6rem .75rem;border:1px solid var(--border);border-radius:var(--r-md)">
          <svg class="ic" style="width:15px;height:15px;color:var(--primary)"><use href="#${CATEGORIES[r.category] ? CATEGORIES[r.category].icon : "i-doc"}"/></svg>
          <span style="flex:1;min-width:0"><span class="small" style="font-weight:600;display:block">${esc(r.name)}</span><span class="caption">${esc(r.authority)}</span></span>
          <svg class="ic" style="width:14px;height:14px;opacity:.5"><use href="#i-arrow"/></svg></a>` : ""; }).join("")}
      </div></section>` : ""}
    <section class="card detail-sec">
      <h3 class="h3"><svg class="ic"><use href="#i-doc"/></svg>Take it with you</h3>
      <p class="small" style="color:var(--muted-foreground);margin-bottom:.8rem">A one-page brief with your match, the benefit table, the document checklist and the application steps.</p>
      <button class="btn btn-secondary btn-sm" id="schemeBrief"><svg class="ic" style="width:15px;height:15px"><use href="#i-doc"/></svg>Download application brief</button>
    </section>`;

  // readiness bar goes inside the Documents section, just before it closes
  const docsIdx = html.indexOf('<use href="#i-doc"/></svg>Documents');
  if (docsIdx > -1){
    const secEnd = html.indexOf("</section>", docsIdx);
    if (secEnd > -1) html = html.slice(0, secEnd) + readyBlock + html.slice(secEnd);
  }

  // extras go at the end of the main column, right before the sidebar
  const asideIdx = html.indexOf('<aside class="detail-rail">');
  if (asideIdx > -1){
    const cut = html.lastIndexOf("</div>", asideIdx); // closes .detail-main
    html = cut > -1 ? html.slice(0, cut) + extras + html.slice(cut) : html;
  }
  return html;
};

const _schemeAfter = SchemePage.after ? SchemePage.after.bind(SchemePage) : null;
SchemePage.after = async function(){
  if (_schemeAfter) await _schemeAfter();
  const b = $("#schemeBrief");
  if (b) b.addEventListener("click", () => { Report.scheme(this.scheme); Toast.show("Brief opened — print or save as PDF", "i-doc"); });
};

/* ---- 4. chat suggestions know about the new schemes ---- */
if (typeof Chat === "object" && Chat.extraSuggestions !== undefined){ /* reserved */ }
