"use strict";
/* ============================================================
   palette.js — NEW: Ctrl/Cmd+K command palette
   Instant fuzzy jump to any scheme, category, page or action.
   Keyboard-first, screen-reader labelled, zero dependencies.
   ============================================================ */
const Palette = {
  open:false, items:[], active:0,

  actions(){
    return [
      { t:"Ask the assistant", s:"Chat about any scheme in your language", href:"#/assistant", icon:"i-chat", k:"page" },
      { t:"Check eligibility", s:"Two-minute profile", href:"#/profile", icon:"i-users", k:"page" },
      { t:"Explore all schemes", s:`Browse the full catalogue of ${SCHEMES.length}`, href:"#/explore", icon:"i-search", k:"page" },
      { t:"Eligibility results", s:"Your personalised matches", href:"#/results", icon:"i-layers", k:"page" },
      { t:"Document wallet", s:"See how application-ready you are", href:"#/wallet", icon:"i-doc", k:"page" },
      { t:"Database insights", s:"Charts about the knowledge base", href:"#/insights", icon:"i-columns", k:"page" },
      { t:"Compare schemes", s:"Side-by-side comparison", href:"#/compare", icon:"i-scale", k:"page" },
      { t:"Saved schemes", s:"Your bookmarks", href:"#/saved", icon:"i-bookmark", k:"page" },
      { t:"About Bharat Sahay", s:"How it works and what it will not do", href:"#/about", icon:"i-info", k:"page" },
      { t:"Toggle dark mode", s:"Switch the colour theme", act:() => $("#themeBtn").click(), icon:"i-spark", k:"action" },
      ...Object.entries(CATEGORIES).map(([key,c]) => ({
        t:c.label, s:`${SCHEMES.filter(x => x.category === key).length} schemes in this category`,
        href:`#/explore?category=${key}`, icon:c.icon, k:"category",
      })),
      ...SCHEMES.map(s => ({
        t:s.name, s:`${s.authority}${s.state ? " · " + s.state : ""}`,
        href:`#/schemes/${s.slug}`, icon:CATEGORIES[s.category] ? CATEGORIES[s.category].icon : "i-doc",
        k: s.level === "state" ? "state scheme" : "scheme",
        extra:[...(s.tags||[]), ...Object.values(s.names||{}), s.summary].join(" "),
      })),
    ];
  },

  score(item, q){
    if (!q) return item.k === "page" ? 100 : 1;
    const hay = (item.t + " " + item.s + " " + (item.extra || "")).toLowerCase();
    const title = item.t.toLowerCase();
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.every(t => hay.includes(t))) return 0;
    let sc = 40;
    if (title.startsWith(q.toLowerCase())) sc += 60;
    else if (title.includes(q.toLowerCase())) sc += 30;
    if (item.k === "page" || item.k === "action") sc += 12;
    return sc;
  },

  mount(){
    if ($("#palette")) return;
    const el = document.createElement("div");
    el.id = "palette"; el.className = "palette-scrim"; el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Command palette");
    el.innerHTML = `<div class="palette">
      <div class="palette-head">
        <svg class="ic" style="width:17px;height:17px;color:var(--muted-foreground)"><use href="#i-search"/></svg>
        <input id="palInput" type="text" placeholder="Search schemes, pages and actions…" autocomplete="off" spellcheck="false" aria-label="Search" aria-controls="palList" aria-expanded="true"/>
        <kbd class="palette-kbd">Esc</kbd>
      </div>
      <ul class="palette-list" id="palList" role="listbox" aria-label="Results"></ul>
      <div class="palette-foot">
        <span><kbd class="palette-kbd">↑</kbd><kbd class="palette-kbd">↓</kbd> navigate</span>
        <span><kbd class="palette-kbd">↵</kbd> open</span>
        <span>${SCHEMES.length} schemes indexed</span>
      </div>
    </div>`;
    document.body.appendChild(el);
    el.addEventListener("click", e => { if (e.target === el) this.close(); });
    $("#palInput").addEventListener("input", () => { this.active = 0; this.draw(); });
    $("#palInput").addEventListener("keydown", e => {
      if (e.key === "ArrowDown"){ e.preventDefault(); this.active = Math.min(this.items.length - 1, this.active + 1); this.draw(true); }
      else if (e.key === "ArrowUp"){ e.preventDefault(); this.active = Math.max(0, this.active - 1); this.draw(true); }
      else if (e.key === "Enter"){ e.preventDefault(); this.run(this.items[this.active]); }
      else if (e.key === "Escape"){ this.close(); }
    });
  },

  draw(keepQuery){
    const q = $("#palInput").value.trim();
    this.items = this.actions().map(i => ({ ...i, _s:this.score(i, q) }))
      .filter(i => i._s > 0).sort((a,b) => b._s - a._s).slice(0, 40);
    if (this.active >= this.items.length) this.active = 0;
    $("#palList").innerHTML = this.items.length
      ? this.items.map((i, n) => `<li role="option" aria-selected="${n === this.active}" class="palette-item ${n === this.active ? "active" : ""}" data-i="${n}">
          <svg class="ic" style="width:16px;height:16px;color:var(--primary)"><use href="#${i.icon}"/></svg>
          <span style="flex:1;min-width:0"><span class="pi-t">${esc(i.t)}</span><span class="pi-s">${esc(i.s)}</span></span>
          <span class="tag" style="flex:none">${esc(i.k)}</span>
        </li>`).join("")
      : `<li class="palette-empty">No match for “${esc(q)}”. Try a ministry, a benefit or a document name.</li>`;
    $$("#palList .palette-item").forEach(li => {
      li.addEventListener("click", () => this.run(this.items[+li.dataset.i]));
      li.addEventListener("mousemove", () => { this.active = +li.dataset.i; this.draw(true); });
    });
    const act = $("#palList .active"); if (act && keepQuery) act.scrollIntoView({ block:"nearest" });
  },

  run(item){
    if (!item) return;
    this.close();
    if (item.act) item.act();
    else if (item.href) location.hash = item.href;
  },

  show(){
    this.mount(); this.open = true; this.active = 0;
    $("#palette").classList.add("show");
    document.body.style.overflow = "hidden";
    $("#palInput").value = ""; this.draw();
    setTimeout(() => $("#palInput").focus(), 30);
  },

  close(){
    this.open = false;
    const el = $("#palette"); if (el) el.classList.remove("show");
    document.body.style.overflow = "";
  },

  init(){
    document.addEventListener("keydown", e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"){ e.preventDefault(); this.open ? this.close() : this.show(); }
      else if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && !this.open){ e.preventDefault(); this.show(); }
    });
  },
};
