"use strict";
/* ---------- components.js ---------- */
const Cmp = {
  statusPill(status){
    return `<span class="status ${status.cls}"><svg class="ic"><use href="#${status.icon}"/></svg>${status.label}</span>`;
  },
  schemeCard(result, opts = {}){
    const s = result.scheme;
    const saved = Store.get("saved", []).includes(s.slug);
    return `<article class="card card-hover scheme-card" data-slug="${s.slug}">
      <div class="scheme-top">
        <div><h3 class="scheme-name">${esc(s.name)}</h3><p class="scheme-auth">${esc(s.authority)}</p></div>
        ${this.statusPill(result.status)}
      </div>
      <div class="scheme-meta">
        <span class="tag tag-cat">${CATEGORIES[s.category].label}</span>
        ${result.matched[0] ? `<span class="tag" style="background:var(--success-soft);color:var(--success);border-color:transparent">✓ ${esc(Utils.truncate(result.matched[0], 40))}</span>` : ""}
      </div>
      <p class="scheme-sum">${esc(s.summary)}</p>
      ${s.benefits[0] ? `<p class="small" style="font-weight:650;color:var(--primary-deep)">${esc(s.benefits[0].title)} · ${esc(s.benefits[0].amount)}</p>` : ""}
      <div class="why-card" data-why>
        <button class="why-head" aria-expanded="false">Why did this result appear?<svg class="ic chev" style="width:15px;height:15px"><use href="#i-chev"/></svg></button>
        <div class="why-body"><div><ul class="why-list">${this.whyRows(result)}</ul></div></div>
      </div>
      <div class="scheme-foot">
        <span class="src-line"><svg class="ic"><use href="#i-link"/></svg>${esc(s.sources[0].title.split("—")[0].trim())} · ${s.documents.length} docs</span>
        <div style="display:flex;gap:.5rem">
          <button class="icon-btn save-btn ${saved ? "saved" : ""}" data-save="${s.slug}" aria-pressed="${saved}" aria-label="${saved ? "Unsave" : "Save"} scheme" title="${saved ? "Unsave" : "Save"}"><svg class="ic" style="width:16px;height:16px"><use href="#i-bookmark"/></svg></button>
          <a class="btn btn-secondary btn-sm" href="#/schemes/${s.slug}">View details</a>
        </div>
      </div>
    </article>`;
  },
  whyRows(result){
    const rows = [
      ...result.matched.map(t => `<li class="why-row met"><svg class="ic"><use href="#i-check"/></svg><span>${esc(t)} — matches your profile</span></li>`),
      ...result.unknown.map(t => `<li class="why-row unknown"><svg class="ic"><use href="#i-alert"/></svg><span>${esc(t)} — additional information may be required</span></li>`),
      ...result.unmet.map(t => `<li class="why-row unmet"><svg class="ic"><use href="#i-x"/></svg><span>${esc(t)} — does not match</span></li>`),
    ];
    return rows.join("") || `<li class="why-row unknown"><svg class="ic"><use href="#i-info"/></svg><span>Add a profile so Bharat Sahay can explain its matches.</span></li>`;
  },
  sourceCard(src){
    return `<a class="source-card" href="${esc(src.url)}" target="_blank" rel="noopener noreferrer">
      <span class="source-ico"><svg class="ic" style="width:17px;height:17px"><use href="#i-shield"/></svg></span>
      <span style="min-width:0">
        <span class="source-title">${esc(src.title)}</span><br/>
        <span class="source-meta">Official document · Updated ${esc(src.updated)} <svg class="ic" style="width:11px;height:11px;display:inline;vertical-align:-1px"><use href="#i-ext"/></svg></span>
      </span>
    </a>`;
  },
  schemeCardSkeleton(){
    return `<div class="card scheme-card">
      <div class="skeleton" style="height:18px;width:70%"></div>
      <div class="skeleton" style="height:12px;width:45%"></div>
      <div class="skeleton" style="height:12px;width:100%"></div>
      <div class="skeleton" style="height:12px;width:88%"></div>
      <div class="skeleton" style="height:34px;width:100%;border-radius:10px"></div>
      <div class="skeleton" style="height:36px;width:100%"></div>
    </div>`;
  },
  saveBtn(slug, full = false){
    const saved = Store.get("saved", []).includes(slug);
    return full
      ? `<button class="btn ${saved ? "btn-accent" : "btn-secondary"}" data-save="${slug}"><svg class="ic" style="width:16px;height:16px"><use href="#i-bookmark"/></svg>${saved ? "Saved" : "Save scheme"}</button>`
      : `<button class="icon-btn save-btn ${saved ? "saved" : ""}" data-save="${slug}" aria-pressed="${saved}" aria-label="${saved ? "Unsave" : "Save"} scheme"><svg class="ic" style="width:16px;height:16px"><use href="#i-bookmark"/></svg></button>`;
  },
  toggleSave(slug){
    let saved = Store.get("saved", []);
    const isSaved = saved.includes(slug);
    saved = isSaved ? saved.filter(s => s !== slug) : [...saved, slug];
    Store.set("saved", saved);
    $$(`[data-save="${slug}"]`).forEach(b => {
      if (b.classList.contains("icon-btn")){ b.classList.toggle("saved", !isSaved); b.setAttribute("aria-pressed", String(!isSaved)); }
      else { b.classList.toggle("btn-accent", !isSaved); b.classList.toggle("btn-secondary", isSaved); b.innerHTML = `<svg class="ic" style="width:16px;height:16px"><use href="#i-bookmark"/></svg>${!isSaved ? "Saved" : "Save scheme"}`; }
    });
    Toast.show(isSaved ? "Removed from saved schemes" : "Scheme saved — find it under Saved");
  },
  bindCardEvents(scope = document){
    $$("[data-save]", scope).forEach(b => b.addEventListener("click", e => { e.preventDefault(); Cmp.toggleSave(b.dataset.save); }));
    $$("[data-why] .why-head", scope).forEach(btn => btn.addEventListener("click", () => {
      const card = btn.closest("[data-why]");
      const open = card.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    }));
  },
};
