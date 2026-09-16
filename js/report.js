"use strict";
/* ---------- report.js (printable / savable eligibility report — 100% client-side) ---------- */
const Report = {
  eligibility(list, profile){
    const prof = profile
      ? [profile.age && profile.age + " yrs", profile.gender, profile.state, profile.category, profile.occupation && String(profile.occupation).replace("_", " "), profile.areaType, profile.annualIncome && ("income ≤ " + Utils.inr(profile.annualIncome))].filter(Boolean).join(" · ")
      : "No profile entered — matches are general";
    const secs = list.map(r => `<section><h3>${esc(r.scheme.name)}<span class="st">${r.status.label}</span></h3><p>${esc(r.scheme.summary)}</p><ul>${
      r.matched.map(m => `<li class="ok">✓ ${esc(m)}</li>`).join("")}${
      r.unmet.map(m => `<li class="no">✗ ${esc(m)}</li>`).join("")}${
      r.unknown.map(m => `<li>• ${esc(m)}</li>`).join("")}</ul>
      <p><b>Documents:</b> ${r.scheme.documents.map(d => esc(d.name) + (d.mandatory ? "" : " (optional)")).join(" · ")}</p>
      <p><b>Official source:</b> ${esc(r.scheme.sources[0].url)}</p></section>`).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Bharat Sahay — eligibility report</title><style>
      body{font-family:system-ui,sans-serif;max-width:820px;margin:0 auto;padding:2rem;color:#152420}
      h1{font-size:1.35rem;margin-bottom:.2rem}.muted{color:#68756c;font-size:.82rem}
      h3{margin:1.3rem 0 .2rem;font-size:1.02rem}p,li{font-size:.9rem;line-height:1.55}
      ul{padding-left:1.1rem;margin:.3rem 0}.ok{color:#1E7B4F}.no{color:#BC4632}
      .st{font-size:.66rem;border:1px solid #9aa8a0;border-radius:99px;padding:.08rem .5rem;margin-left:.5rem;font-family:monospace}
      .disc{border-top:1px solid #cfd6d0;margin-top:2rem;padding-top:.8rem;font-size:.75rem;color:#68756c}
      button{margin-top:1rem;padding:.5rem 1rem;border:0;border-radius:8px;background:#0E7B5D;color:#fff;font-weight:600;cursor:pointer}
      @media print{button{display:none}}</style></head><body>
      <h1>Bharat Sahay — eligibility report</h1>
      <p class="muted">Generated ${new Date().toLocaleString("en-IN")} · Profile: ${esc(prof)} · ${list.length} schemes</p>
      ${secs}
      <p class="disc">Demo report generated locally in your browser from illustrative, curated data — nothing was sent to a server. Not legal advice; always verify current rules and apply on the official portal.</p>
      <button onclick="print()">Print / save as PDF</button></` + `body></html>`;
    let w = null;
    try { w = open("", "_blank"); } catch {}
    if (!w){
      const b = new Blob([html], { type:"text/html" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = "bharat-sahay-report.html";
      a.click();
      Toast.show("Popup blocked — report downloaded instead (open it to print/save PDF)", "i-info");
      return;
    }
    w.document.write(html);
    w.document.close();
    setTimeout(() => { try { w.print(); } catch {} }, 450);
  },
};
