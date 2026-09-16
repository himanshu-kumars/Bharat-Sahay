"use strict";
/* ============================================================
   pages/wallet.js — NEW: Document Readiness Wallet
   Tick the papers you already have; Bharat Sahay computes
   how "application-ready" you are for every scheme and tells
   you the single next document that unlocks the most schemes.
   100% local — nothing is uploaded anywhere.
   ============================================================ */
const Wallet = {
  key:"docs",
  have(){ return Store.get(this.key, []); },
  set(list){ Store.set(this.key, list); },
  toggle(name){
    const l = this.have();
    this.set(l.includes(name) ? l.filter(d => d !== name) : [...l, name]);
  },
  /* canonicalise document names so "Aadhaar Card" and
     "Aadhaar Card (age proof)" count as the same paper */
  canon(name){
    const n = String(name).toLowerCase();
    if (n.includes("aadhaar") && !n.includes("mobile") && !n.includes("seed")) return "Aadhaar Card";
    if (n.includes("aadhaar") && n.includes("mobile")) return "Aadhaar-linked mobile number";
    if (n.includes("income certificate") || n.includes("income proof")) return "Income Certificate";
    if (n.includes("caste") || n.includes("community")) return "Caste / Community Certificate";
    if (n.includes("bank")) return "Bank passbook (Aadhaar-linked)";
    if (n.includes("ration")) return "Ration card";
    if (n.includes("pan")) return "PAN Card";
    if (n.includes("land record") || n.includes("khatauni") || n.includes("khasra")) return "Land records";
    if (n.includes("photograph") || n.includes("photo")) return "Passport-size photograph";
    if (n.includes("birth certificate") || n.includes("age proof")) return "Birth certificate / age proof";
    if (n.includes("udid") || n.includes("disability certificate")) return "UDID / Disability certificate";
    if (n.includes("mark sheet") || n.includes("marksheet")) return "Previous mark sheet";
    if (n.includes("admission") || n.includes("enrol")) return "Admission / enrolment proof";
    if (n.includes("bpl")) return "BPL card";
    if (n.includes("residence") || n.includes("domicile") || n.includes("address")) return "Residence / domicile proof";
    if (n.includes("death certificate")) return "Death certificate";
    if (n.includes("electricity")) return "Latest electricity bill";
    return name;
  },
  universe(){
    const m = {};
    SCHEMES.forEach(s => (s.documents || []).forEach(d => {
      const c = this.canon(d.name);
      m[c] = m[c] || { name:c, schemes:new Set(), mandatory:0 };
      m[c].schemes.add(s.slug);
      if (d.mandatory) m[c].mandatory++;
    }));
    return Object.values(m).map(x => ({ name:x.name, count:x.schemes.size, mandatory:x.mandatory, slugs:[...x.schemes] }))
      .sort((a,b) => b.count - a.count);
  },
  readiness(scheme){
    const have = this.have().map(d => this.canon(d));
    const need = (scheme.documents || []).filter(d => d.mandatory).map(d => this.canon(d.name));
    if (!need.length) return { pct:100, missing:[] };
    const missing = need.filter(d => !have.includes(d));
    return { pct: Math.round(((need.length - missing.length) / need.length) * 100), missing };
  },
  /* which single document unlocks the most additional schemes? */
  nextBestDoc(){
    const have = this.have().map(d => this.canon(d));
    let best = null;
    this.universe().forEach(doc => {
      if (have.includes(doc.name)) return;
      const unlocks = SCHEMES.filter(s => {
        const r = this.readiness(s);
        return r.missing.length === 1 && r.missing[0] === doc.name;
      }).length;
      if (!best || unlocks > best.unlocks || (unlocks === best.unlocks && doc.count > best.count))
        best = { ...doc, unlocks };
    });
    return best;
  },
};

const WalletPage = {
  async render(){ return `<div class="container" id="walletRoot"></div>`; },

  build(){
    const universe = Wallet.universe();
    const have = Wallet.have();
    const ready = SCHEMES.map(s => ({ s, r:Wallet.readiness(s) }));
    const fullyReady = ready.filter(x => x.r.pct === 100);
    const oneAway = ready.filter(x => x.r.missing.length === 1);
    const next = Wallet.nextBestDoc();
    const overall = Math.round(ready.reduce((n,x) => n + x.r.pct, 0) / (ready.length || 1));

    return `
      <div class="results-head">
        <div>
          <span class="eyebrow"><span class="pulse-dot"></span>Document wallet</span>
          <h1 class="h1" style="margin-top:.5rem">How application-ready are you?</h1>
          <p class="small" style="color:var(--muted-foreground);margin-top:.4rem">
            Tick the papers you already have. Nothing is uploaded — the list lives only in this browser.
          </p>
        </div>
        <button class="btn btn-secondary btn-sm" id="walletPrint"><svg class="ic" style="width:15px;height:15px"><use href="#i-doc"/></svg>Print checklist</button>
      </div>

      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(215px,1fr));margin-bottom:1.3rem">
        <div class="card" style="padding:1.2rem 1.3rem">
          <div class="caption">Overall readiness</div>
          <div style="font-family:var(--font-display);font-size:2.2rem;font-weight:800;color:var(--primary-deep);line-height:1.1">${overall}%</div>
          <div style="height:8px;border-radius:99px;background:var(--muted);overflow:hidden;margin-top:.5rem">
            <div style="height:100%;width:${overall}%;background:linear-gradient(90deg,var(--primary),var(--accent));border-radius:99px;transition:width .5s var(--ease)"></div>
          </div>
        </div>
        <div class="card" style="padding:1.2rem 1.3rem">
          <div class="caption">Documents held</div>
          <div style="font-family:var(--font-display);font-size:2.2rem;font-weight:800;line-height:1.1">${have.length}<span style="font-size:1rem;opacity:.5"> / ${universe.length}</span></div>
          <div class="caption" style="margin-top:.4rem">distinct papers in the corpus</div>
        </div>
        <div class="card" style="padding:1.2rem 1.3rem">
          <div class="caption">Ready to apply now</div>
          <div style="font-family:var(--font-display);font-size:2.2rem;font-weight:800;color:var(--success);line-height:1.1">${fullyReady.length}</div>
          <div class="caption" style="margin-top:.4rem">schemes with every mandatory doc ticked</div>
        </div>
        <div class="card" style="padding:1.2rem 1.3rem">
          <div class="caption">One document away</div>
          <div style="font-family:var(--font-display);font-size:2.2rem;font-weight:800;color:var(--warning);line-height:1.1">${oneAway.length}</div>
          <div class="caption" style="margin-top:.4rem">schemes needing just one more paper</div>
        </div>
      </div>

      ${next ? `<div class="card" style="padding:1.15rem 1.3rem;display:flex;gap:1rem;align-items:center;flex-wrap:wrap;border-color:var(--accent);background:var(--accent-soft);margin-bottom:1.3rem">
        <svg class="ic" style="width:22px;height:22px;color:var(--accent-deep);flex:none"><use href="#i-wand"/></svg>
        <div style="flex:1;min-width:220px">
          <strong>Get this next: ${esc(next.name)}</strong>
          <div class="small" style="color:var(--muted-foreground)">It appears in ${next.count} scheme${next.count===1?"":"s"} and would immediately complete ${next.unlocks} more application${next.unlocks===1?"":"s"}.</div>
        </div>
        <button class="btn btn-accent btn-sm" data-doc="${esc(next.name)}">I have it</button>
      </div>` : ""}

      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(310px,1fr))">
        <section class="card detail-sec">
          <h3 class="h3"><svg class="ic"><use href="#i-doc"/></svg>Your documents</h3>
          <p class="caption" style="margin-bottom:.8rem">Sorted by how many schemes each unlocks.</p>
          <div class="doc-list" id="docList">
            ${universe.map(d => `<label class="doc-check ${d.mandatory ? "mandatory" : ""}">
              <input type="checkbox" data-doc="${esc(d.name)}" ${have.includes(d.name) ? "checked" : ""}/>
              <span class="box"><svg class="ic" style="width:11px;height:11px"><use href="#i-check"/></svg></span>
              <span style="flex:1">${esc(d.name)}</span>
              <span class="tag" style="flex:none">${d.count} scheme${d.count===1?"":"s"}</span>
            </label>`).join("")}
          </div>
        </section>

        <section class="card detail-sec">
          <h3 class="h3"><svg class="ic"><use href="#i-check"/></svg>Application readiness by scheme</h3>
          <p class="caption" style="margin-bottom:.8rem">Highest readiness first — green bars are ready to submit.</p>
          <ul style="display:grid;gap:.6rem;max-height:520px;overflow:auto;padding-right:.3rem">
            ${ready.sort((a,b) => b.r.pct - a.r.pct || a.s.name.localeCompare(b.s.name)).map(x => `
              <li>
                <a href="#/schemes/${x.s.slug}" style="display:block">
                  <div style="display:flex;justify-content:space-between;gap:.6rem;align-items:baseline">
                    <span class="small" style="font-weight:600">${esc(Utils.truncate(x.s.name, 40))}</span>
                    <span class="caption" style="flex:none;font-family:var(--font-mono)">${x.r.pct}%</span>
                  </div>
                  <div style="height:6px;border-radius:99px;background:var(--muted);overflow:hidden;margin-top:.25rem">
                    <div style="height:100%;width:${x.r.pct}%;border-radius:99px;background:${x.r.pct===100?"var(--success)":x.r.pct>=50?"var(--accent)":"var(--border-strong)"}"></div>
                  </div>
                  ${x.r.missing.length ? `<div class="caption" style="margin-top:.2rem">Still needed: ${esc(x.r.missing.slice(0,2).join(", "))}${x.r.missing.length>2?` +${x.r.missing.length-2} more`:""}</div>` : `<div class="caption" style="margin-top:.2rem;color:var(--success)">All mandatory documents ready ✓</div>`}
                </a>
              </li>`).join("")}
          </ul>
        </section>
      </div>`;
  },

  async after(){
    const root = $("#walletRoot");
    const paint = () => {
      root.innerHTML = this.build();
      $$("[data-doc]", root).forEach(el => el.addEventListener("click", e => {
        if (el.tagName === "INPUT") { Wallet.toggle(el.dataset.doc); paint(); }
        else { e.preventDefault(); Wallet.toggle(el.dataset.doc); paint(); Toast.show("Added to your document wallet", "i-check"); }
      }));
      const pb = $("#walletPrint"); if (pb) pb.addEventListener("click", () => { Report.documents(); Toast.show("Checklist opened — print or save as PDF", "i-doc"); });
    };
    paint();
  },
};
