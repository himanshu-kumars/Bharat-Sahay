"use strict";
/* ============================================================
   pages/insights.js — NEW: database insights dashboard
   Pure inline SVG charts (no libraries, no network)
   ============================================================ */
const InsightsPage = {
  bar(rows, opts = {}){
    const max = Math.max(1, ...rows.map(r => r.v));
    const w = 640, rowH = 30, h = rows.length * rowH + 8;
    const track = w - 230;              // full width available for a bar
    const minW = 6;                     // keeps a "1" still visible
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(opts.label || "chart")}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:${h}px;max-height:${h}px">
      ${rows.map((r, i) => {
        const y = i * rowH + 4;
        // strictly proportional: value/max of the track, floored only for visibility
        const bw = Math.max(minW, (r.v / max) * track);
        return `<g>
          <text x="0" y="${y + 15}" font-size="12.5" font-family="system-ui,sans-serif" fill="currentColor" opacity=".78">${esc(Utils.truncate(r.k, 26))}</text>
          <rect x="186" y="${y + 4}" width="${track}" height="15" rx="7.5" fill="currentColor" opacity=".07"/>
          <rect x="186" y="${y + 4}" width="${bw}" height="15" rx="7.5" fill="${r.c || "var(--primary)"}" opacity=".92"/>
          <text x="${186 + Math.max(bw, minW) + 8}" y="${y + 16}" font-size="12" font-family="ui-monospace,monospace" fill="currentColor" opacity=".62">${r.v}</text>
        </g>`;
      }).join("")}
    </svg>`;
  },

  donut(rows){
    const total = rows.reduce((n, r) => n + r.v, 0) || 1;
    let a = -Math.PI / 2;
    const R = 62, r0 = 40, cx = 76, cy = 76;
    const arcs = rows.map(row => {
      const sweep = (row.v / total) * Math.PI * 2, b = a + sweep;
      const p = (rad, R) => [cx + R * Math.cos(rad), cy + R * Math.sin(rad)];
      const [x1,y1] = p(a,R), [x2,y2] = p(b,R), [x3,y3] = p(b,r0), [x4,y4] = p(a,r0);
      const large = sweep > Math.PI ? 1 : 0;
      a = b;
      return `<path d="M${x1} ${y1} A${R} ${R} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${r0} ${r0} 0 ${large} 0 ${x4} ${y4} Z" fill="${row.c}"/>`;
    }).join("");
    return `<div style="display:flex;gap:1.4rem;align-items:center;flex-wrap:wrap">
      <svg viewBox="0 0 152 152" style="width:152px;flex:none">${arcs}
        <text x="76" y="72" text-anchor="middle" font-size="24" font-weight="700" font-family="system-ui" fill="currentColor">${total}</text>
        <text x="76" y="90" text-anchor="middle" font-size="10" font-family="system-ui" fill="currentColor" opacity=".6">schemes</text>
      </svg>
      <ul style="display:grid;gap:.45rem;min-width:180px">
        ${rows.map(r => `<li class="small" style="display:flex;align-items:center;gap:.5rem">
          <span style="width:10px;height:10px;border-radius:3px;background:${r.c};flex:none"></span>
          <span style="flex:1">${esc(r.k)}</span><b>${r.v}</b></li>`).join("")}
      </ul>
    </div>`;
  },

  async render(){
    const st = SchemeIndex.stats();
    const palette = ["#0E7B5D","#E8A33D","#1E7B4F","#A96E12","#5E6A62","#BC4632","#0A5C45","#C9A227","#2E6F8E","#7A4E9B","#3E8E7E","#B06A3B"];

    const catRows = Object.entries(CATEGORIES)
      .map(([k,c]) => ({ k:c.label, v:SCHEMES.filter(s => s.category === k).length }))
      .filter(r => r.v > 0).sort((a,b) => b.v - a.v);

    const minRows = Object.entries(SCHEMES.reduce((m,s) => { m[s.authority] = (m[s.authority]||0)+1; return m; }, {}))
      .map(([k,v]) => ({ k:k.replace(/^(Ministry|Department) of /,"").replace(/,.*$/,""), v }))
      .sort((a,b) => b.v - a.v).slice(0, 10);

    const stateRows = Object.entries(SCHEMES.filter(s => s.state).reduce((m,s) => { m[s.state]=(m[s.state]||0)+1; return m; }, {}))
      .map(([k,v]) => ({ k, v, c:"var(--accent-deep)" })).sort((a,b) => b.v - a.v);

    const docRows = Object.entries(SCHEMES.flatMap(s => (s.documents||[]).map(d => d.name))
      .reduce((m,d) => { m[d]=(m[d]||0)+1; return m; }, {}))
      .map(([k,v]) => ({ k, v, c:"var(--primary-deep)" })).sort((a,b) => b.v - a.v).slice(0, 10);

    const levelRows = [
      { k:"Central schemes", v:st.central, c:"#0E7B5D" },
      { k:"State schemes", v:st.state, c:"#E8A33D" },
    ];

    const verifRows = Object.entries(SCHEMES.reduce((m,s) => {
      const y = String(s.last_verified_at||"").slice(0,7) || "unknown"; m[y]=(m[y]||0)+1; return m;
    }, {})).map(([k,v]) => ({ k, v, c:"var(--muted-foreground)" })).sort((a,b) => a.k.localeCompare(b.k));

    const kpi = (n, l, sub) => `<div class="card" style="padding:1.2rem 1.3rem">
      <div style="font-family:var(--font-display);font-size:2.1rem;font-weight:800;line-height:1;color:var(--primary-deep)">${n}</div>
      <div class="small" style="font-weight:650;margin-top:.35rem">${l}</div>
      <div class="caption">${sub}</div></div>`;

    return `<div class="container">
      <div class="results-head">
        <div>
          <span class="eyebrow"><span class="pulse-dot"></span>Database insights</span>
          <h1 class="h1" style="margin-top:.5rem">What is inside the knowledge base</h1>
          <p class="small" style="color:var(--muted-foreground);margin-top:.4rem">Every chart is computed live from the scheme corpus that powers the assistant — no external calls.</p>
        </div>
        <a class="btn btn-secondary btn-sm" href="#/explore"><svg class="ic" style="width:15px;height:15px"><use href="#i-search"/></svg>Browse catalogue</a>
      </div>

      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(178px,1fr));margin-bottom:1.4rem">
        ${kpi(st.total, "Schemes curated", "central and state combined")}
        ${kpi(st.categories, "Categories", "from education to energy")}
        ${kpi(st.ministries, "Ministries & departments", "issuing authorities")}
        ${kpi(st.statesCovered, "States covered", "state-specific schemes")}
        ${kpi(st.benefits, "Benefit lines", "individual entitlements")}
        ${kpi(st.documents, "Distinct documents", "in checklists")}
        ${kpi(st.sources, "Official sources", "every claim is linked")}
        ${kpi(SchemeIndex.allTags().length, "Topic tags", "used for retrieval")}
      </div>

      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(310px,1fr))">
        <section class="card detail-sec"><h3 class="h3"><svg class="ic"><use href="#i-layers"/></svg>Central vs state</h3>${this.donut(levelRows)}</section>
        <section class="card detail-sec"><h3 class="h3"><svg class="ic"><use href="#i-house"/></svg>State-level schemes</h3>${this.bar(stateRows, { label:"schemes per state" })}</section>
      </div>

      <section class="card detail-sec" style="margin-top:1.2rem">
        <h3 class="h3"><svg class="ic"><use href="#i-columns"/></svg>Schemes by category</h3>
        ${this.bar(catRows.map((r,i) => ({ ...r, c:palette[i % palette.length] })), { label:"schemes per category" })}
      </section>

      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(310px,1fr));margin-top:1.2rem">
        <section class="card detail-sec"><h3 class="h3"><svg class="ic"><use href="#i-shield"/></svg>Top issuing authorities</h3>${this.bar(minRows, { label:"schemes per ministry" })}</section>
        <section class="card detail-sec"><h3 class="h3"><svg class="ic"><use href="#i-doc"/></svg>Most-requested documents</h3>${this.bar(docRows, { label:"documents across schemes" })}
          <p class="caption" style="margin-top:.7rem">Collect these few first — they unlock the majority of applications.</p></section>
      </div>

      <section class="card detail-sec" style="margin-top:1.2rem">
        <h3 class="h3"><svg class="ic"><use href="#i-check"/></svg>Freshness — when each entry was last verified</h3>
        ${this.bar(verifRows, { label:"verification months" })}
        <p class="caption" style="margin-top:.7rem">Bharat Sahay never presents a claim without a last-verified date and a link to the official portal.</p>
      </section>
    </div>`;
  },
  async after(){},
};
