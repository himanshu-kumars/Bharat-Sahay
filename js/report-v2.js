"use strict";
/* ============================================================
   report-v2.js — extra printable outputs + shared open helper
   · Report.documents()  — document readiness checklist
   · Report.scheme(s)    — single-scheme application brief
   · Report.open(html)   — popup with graceful download fallback
   ============================================================ */

Report.css = `
  body{font-family:system-ui,sans-serif;max-width:820px;margin:0 auto;padding:2rem;color:#152420}
  h1{font-size:1.35rem;margin-bottom:.2rem}.muted{color:#68756c;font-size:.82rem}
  h2{font-size:1.05rem;margin:1.6rem 0 .4rem;border-bottom:1px solid #dfe4e0;padding-bottom:.25rem}
  h3{margin:1.2rem 0 .2rem;font-size:1rem}p,li,td,th{font-size:.9rem;line-height:1.55}
  ul{padding-left:1.1rem;margin:.3rem 0}.ok{color:#1E7B4F}.no{color:#BC4632}
  table{border-collapse:collapse;width:100%;margin:.5rem 0}
  th,td{text-align:left;padding:.4rem .5rem;border-bottom:1px solid #e6eae7}
  th{font-size:.74rem;text-transform:uppercase;letter-spacing:.06em;color:#68756c}
  .box{border:1px solid #9aa8a0;border-radius:3px;display:inline-block;width:11px;height:11px;margin-right:.5rem;vertical-align:-1px}
  .box.on{background:#0E7B5D;border-color:#0E7B5D}
  .bar{height:7px;background:#e6eae7;border-radius:99px;overflow:hidden;margin:.25rem 0}
  .bar>i{display:block;height:100%;background:#0E7B5D}
  .disc{border-top:1px solid #cfd6d0;margin-top:2rem;padding-top:.8rem;font-size:.75rem;color:#68756c}
  button{margin-top:1rem;padding:.5rem 1rem;border:0;border-radius:8px;background:#0E7B5D;color:#fff;font-weight:600;cursor:pointer}
  @media print{button{display:none}}`;

Report.open = function(title, body, filename){
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${this.css}</style></head><body>
    ${body}
    <p class="disc">Generated locally in your browser from Bharat Sahay's curated corpus — nothing was sent to a server. Not legal advice; always verify current rules on the official portal before applying.</p>
    <button onclick="print()">Print / save as PDF</button></` + `body></html>`;
  let w = null;
  try { w = open("", "_blank"); } catch {}
  if (!w){
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type:"text/html" }));
    a.download = filename || "bharat-sahay.html";
    a.click();
    Toast.show("Popup blocked — downloaded instead (open it to print/save PDF)", "i-info");
    return;
  }
  w.document.write(html); w.document.close();
  setTimeout(() => { try { w.print(); } catch {} }, 450);
};

Report.documents = function(){
  const have = Wallet.have();
  const universe = Wallet.universe();
  const ready = SCHEMES.map(s => ({ s, r:Wallet.readiness(s) })).sort((a,b) => b.r.pct - a.r.pct);
  const overall = Math.round(ready.reduce((n,x) => n + x.r.pct, 0) / (ready.length || 1));
  const body = `
    <h1>Document readiness checklist</h1>
    <p class="muted">Generated ${new Date().toLocaleString("en-IN")} · ${have.length} of ${universe.length} documents held · overall readiness ${overall}%</p>
    <h2>Documents to collect</h2>
    <table><tr><th></th><th>Document</th><th>Used by</th></tr>
      ${universe.map(d => `<tr><td><span class="box ${have.includes(d.name) ? "on" : ""}"></span></td><td>${esc(d.name)}</td><td>${d.count} scheme${d.count===1?"":"s"}</td></tr>`).join("")}
    </table>
    <h2>Readiness per scheme</h2>
    ${ready.map(x => `<h3>${esc(x.s.name)} — ${x.r.pct}%</h3>
      <div class="bar"><i style="width:${x.r.pct}%"></i></div>
      <p class="muted">${x.r.missing.length ? "Still needed: " + esc(x.r.missing.join(", ")) : "All mandatory documents ready."}</p>`).join("")}`;
  this.open("Bharat Sahay — document checklist", body, "bharat-sahay-documents.html");
};

Report.scheme = function(s){
  const profile = Store.get("profile", null);
  const r = Eligibility.evaluate(s, profile);
  const rd = Wallet.readiness(s);
  const body = `
    <h1>${esc(s.name)}</h1>
    <p class="muted">${esc(s.authority)} · ${esc(s.level === "state" ? (s.state + " state scheme") : "Central scheme")} · last verified ${esc(s.last_verified_at)}</p>
    <p>${esc(s.description)}</p>
    <h2>Your match: ${esc(r.status.label)} (confidence ${r.score}%)</h2>
    <ul>
      ${r.matched.map(m => `<li class="ok">✓ ${esc(m)}</li>`).join("")}
      ${r.unmet.map(m => `<li class="no">✗ ${esc(m)}</li>`).join("")}
      ${r.unknown.map(m => `<li>• ${esc(m)} (needs confirmation)</li>`).join("")}
    </ul>
    <h2>Benefits</h2>
    <table><tr><th>Benefit</th><th>Amount</th></tr>
      ${(s.benefits||[]).map(b => `<tr><td>${esc(b.title)} — ${esc(b.detail)}</td><td><b>${esc(b.amount)}</b></td></tr>`).join("")}
    </table>
    <h2>Documents (${rd.pct}% ready)</h2>
    <div class="bar"><i style="width:${rd.pct}%"></i></div>
    <table>${(s.documents||[]).map(d => `<tr><td><span class="box ${Wallet.have().includes(Wallet.canon(d.name)) ? "on" : ""}"></span>${esc(d.name)}</td><td>${d.mandatory ? "Mandatory" : "Optional"}</td></tr>`).join("")}</table>
    <h2>How to apply</h2>
    <ol>${(s.apply||[]).map(a => `<li>${esc(a)}</li>`).join("")}</ol>
    ${(s.faqs||[]).length ? `<h2>Questions people ask</h2>${s.faqs.map(f => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("")}` : ""}
    <h2>Official sources</h2>
    <ul>${(s.sources||[]).map(x => `<li>${esc(x.title)} — ${esc(x.url)}</li>`).join("")}</ul>`;
  this.open("Bharat Sahay — " + s.name, body, "bharat-sahay-" + s.slug + ".html");
};
