"use strict";
/* ---------- pages/saved.js ---------- */
const SavedPage = {
  render(){
    const saved = Store.get("saved", []).map(slug => SCHEMES.find(s => s.slug === slug)).filter(Boolean);
    const profile = Store.get("profile", null);
    return `<div class="container" style="padding-block:2.4rem 0">
      <span class="eyebrow"><span class="pulse-dot"></span>Your list</span>
      <h1 class="h1" style="margin:.5rem 0 1.4rem">Saved schemes</h1>
      ${saved.length
        ? `<div style="display:flex;gap:.6rem;margin-bottom:1.4rem;flex-wrap:wrap">
             <a class="btn btn-secondary btn-sm" href="#/compare"><svg class="ic" style="width:15px;height:15px"><use href="#i-columns"/></svg>Open compare</a>
             <button class="btn btn-ghost btn-sm" id="clearSaved" style="color:var(--danger)"><svg class="ic" style="width:15px;height:15px"><use href="#i-trash"/></svg>Clear all</button>
           </div>
           <div class="results-grid">${saved.map(s => Cmp.schemeCard(Eligibility.evaluate(s, profile))).join("")}</div>`
        : `<div class="empty"><svg class="ic"><use href="#i-bookmark"/></svg><strong>No saved schemes</strong><p class="small" style="color:var(--muted-foreground)">Save schemes here so you can return to them later.</p><a class="btn btn-primary btn-sm" href="#/results">Explore schemes</a></div>`}
    </div>`;
  },
  after(){
    Cmp.bindCardEvents(document);
    $("#clearSaved")?.addEventListener("click", () => {
      Modal.open({ title:"Clear all saved schemes?", body:"This removes every saved scheme stored on this device.", confirmText:"Clear", danger:true,
        onConfirm:() => { Store.set("saved", []); Toast.show("Saved list cleared"); Router.render(); } });
    });
  },
};
