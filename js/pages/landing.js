"use strict";
/* ---------- pages/landing.js ---------- */
const Landing = {
  heroPreviewHTML(){
    return `<div class="preview-wrap">
      <span class="sticker">Live demo preview</span>
      <div class="preview-card" aria-label="Assistant preview (demonstration)">
        <div class="preview-head">
          <span class="preview-avatar"><svg class="ic" style="width:18px;height:18px"><use href="#i-spark"/></svg></span>
          <div style="flex:1">
            <div class="preview-name">Bharat Sahay</div>
            <div class="preview-status"><i></i>Grounded in verified sources</div>
          </div>
          <span class="tag">EN · हिं · ਪੰ</span>
        </div>
        <div class="preview-body" id="previewBody"></div>
      </div>
      <aside class="float-docs" aria-hidden="true">
        <h5><svg class="ic"><use href="#i-doc"/></svg>Documents needed</h5>
        <ul>
          <li><svg class="ic"><use href="#i-check"/></svg>Aadhaar Card</li>
          <li><svg class="ic"><use href="#i-check"/></svg>Income certificate</li>
          <li><svg class="ic"><use href="#i-check"/></svg>Student certificate</li>
        </ul>
      </aside>
    </div>`;
  },
  async runPreview(){
    const body = $("#previewBody");
    if (!body) return;
    this._token = Utils.uid();
    const mine = this._token;
    const alive = () => $("#previewBody") && this._token === mine;
    const Q = "I am a 21-year-old student from Punjab. What education schemes may I qualify for?";
    const A = "Good question — here is what may apply to you, with why each matched:";
    const demoSchemes = [
      { nm:"Post-Matric Scholarship (SC)", sub:"Min. of Social Justice", cls:"l", lbl:"Likely" },
      { nm:"AICTE Pragati — for girl students", sub:"AICTE", cls:"p", lbl:"Possibly" },
      { nm:"PM YASASVI Scholarship", sub:"Classes 9–12", cls:"p", lbl:"Possibly" },
    ];
    while (alive()){
      body.innerHTML = "";
      const user = document.createElement("div"); user.className = "msg msg-user";
      body.appendChild(user);
      await Fx.type(user, Q, 22);
      if (!alive()) return;
      const dots = document.createElement("div"); dots.className = "typing-dots";
      dots.innerHTML = "<i></i><i></i><i></i>";
      body.appendChild(dots); await Utils.wait(900);
      if (!alive()) return;
      dots.remove();
      const bot = document.createElement("div"); bot.className = "msg msg-bot";
      body.appendChild(bot);
      await Fx.stream(body.closest(".preview-card") ? bot : bot, A, 12);
      for (const [i, s] of demoSchemes.entries()){
        if (!alive()) return;
        const row = document.createElement("div"); row.className = "mini-scheme";
        row.style.animationDelay = (i * .08) + "s";
        row.innerHTML = `<span><span class="nm">${esc(s.nm)}</span><br/><span class="sub">${esc(s.sub)}</span></span><span class="mini-status ${s.cls}">${s.lbl}</span>`;
        body.appendChild(row);
        await Utils.wait(240);
      }
      if (!alive()) return;
      const src = document.createElement("div"); src.className = "preview-src";
      src.innerHTML = `<svg class="ic"><use href="#i-shield"/></svg>Source: National Scholarship Portal · scholarships.gov.in <span style="margin-left:auto" class="tag">Demo</span>`;
      body.appendChild(src);
      await Utils.wait(4200);
    }
  },
  render(){
    const L = k => Lang.t(k);
    const chips = [
      "What scholarships are available for students?",
      "What schemes can help with housing?",
      "What support exists for farmers?",
      "Explain Ayushman Bharat simply",
      "What documents do I need?",
    ];
    const steps = [
      ["01","Tell us about yourself","A short, anonymous profile — age, state, study or work. No login, no Aadhaar, nothing stored on a server in this demo."],
      ["02","We find relevant information","The eligibility engine scans the curated scheme knowledge base and ranks what fits — in seconds, not office visits."],
      ["03","Understand why it matches","Every result opens into matched criteria, missing information and required documents, each traced to an official source."],
      ["04","Take the next step","Follow the plain-language application steps, then verify everything on the official portal before you act."],
    ];
    const feats = [
      ["i-chat","feat-3","Conversational search","Ask naturally instead of searching complicated portals — “what can a student from Punjab get?” just works.","you: “housing help for my family in Bihar?”"],
      ["i-globe","feat-3","Multilingual assistance","Get explanations in English, हिन्दी and ਪੰਜਾਬੀ — with the same meaning, not machine-mangled text.","assistant: “ਜੀ ਹਾਂ, ਇਹ ਸਕੀਮ ਤੁਹਾਡੇ ਲਈ…”"],
      ["i-scale","feat-2","Eligibility explanation","See exactly which rules matched you — age, income, category, state.","✓ Income range matches"],
      ["i-doc","feat-2","Required documents","A tick-off checklist for every scheme, mandatory items marked.","☑ Aadhaar · ☑ Income certificate"],
      ["i-shield","feat-3","Source grounding","Trace every answer back to the official portal or document it came from, with a last-verified date.","official_portal · Updated Jun 2025"],
      ["i-columns","feat-3","Scheme comparison","Put up to three schemes side by side — benefits, income limits, documents, application route.","₹6,000/yr vs ₹5,000/mo cover"],
      ["i-mic","feat-3","Voice in, voice out","Dictate your question in any supported language and have every answer read aloud — no typing, no squinting.","mic: “ਕਿਸਾਨ ਸਕੀਮਾਂ ਦੱਸੋ”"],
      ["i-search","feat-3","Retrieval you can inspect","Open “How I found this” under any answer to see the exact scheme passages and match scores behind it.","BM25 · score 0.87 · PM-KISAN"],
    ];
    const cats = Object.entries(CATEGORIES);
    const langSamples = {
      en:"“You may be eligible for a scholarship. Here is why it matched.”",
      hi:"“आप छात्रवृत्ति के लिए पात्र हो सकते हैं। देखिए यह क्यों मेल खाती है।”",
      pa:"“ਤੁਸੀਂ ਸਕਾਲਰਸ਼ਿਪ ਲਈ ਯੋਗ ਹੋ ਸਕਦੇ ਹੋ। ਵੇਖੋ ਇਹ ਕਿਉਂ ਮੇਲ ਖਾਂਦੀ ਹੈ।”",
    };
    const t = Lang.current;

    return `
    <!-- HERO -->
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <span class="eyebrow"><span class="pulse-dot"></span>${L("hero_eyebrow")}</span>
          <h1 class="display">${L("hero_h1a")}<br/><span class="hl-underline">${L("hero_h1b")}<svg viewBox="0 0 300 20" aria-hidden="true"><path d="M4 14 C 60 4, 150 4, 296 12"/></svg></span></h1>
          <p class="lede">${L("hero_sub")}</p>
          <div class="hero-ctas">
            <a class="btn btn-primary btn-lg" href="#/assistant">${L("cta_ask")}<svg class="ic"><use href="#i-arrow"/></svg></a>
            <a class="btn btn-secondary btn-lg" href="#/profile">${L("cta_check")}</a>
          </div>
          <div class="hero-trust">
            <span><svg class="ic"><use href="#i-check"/></svg>${L("trust_1")}</span>
            <span><svg class="ic"><use href="#i-check"/></svg>${L("trust_2")}</span>
            <span><svg class="ic"><use href="#i-check"/></svg>${L("trust_3")}</span>
          </div>
        </div>
        ${this.heroPreviewHTML()}
      </div>
    </section>

    <!-- TICKER -->
    <div class="ticker" aria-hidden="true">
      <div class="ticker-track" id="tickerTrack">
        ${[0,1].map(() => ["tick_1","tick_2","tick_3","tick_4","tick_5","tick_6"].map(k =>
          `<span class="ticker-item"><svg class="ic spark" style="width:13px;height:13px"><use href="#i-spark"/></svg>${L(k)}</span>`).join("")).join("")}
      </div>
    </div>

    <!-- POPULAR QUESTIONS -->
    <section class="section" style="padding-block:clamp(2.6rem,5vw,4rem)">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">${L("pop_title")}</span>
          <p class="small" style="color:var(--muted-foreground);margin-top:.4rem">${L("pop_sub")}</p>
        </div>
        <div class="q-chips reveal" style="--d:.08s">
          ${chips.map(c => `<button class="chip" data-ask="${esc(c)}"><svg class="ic" style="width:13px;height:13px;color:var(--primary)"><use href="#i-chat"/></svg>${esc(c)}</button>`).join("")}
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="section" id="how">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow"><svg class="ic" style="width:12px;height:12px"><use href="#i-wand"/></svg>${L("how_title")}</span>
          <h2 class="h2">${L("how_title")}</h2>
          <p class="lede">${L("how_sub")}</p>
        </div>
        <div class="steps">
          ${steps.map((s,i) => `<div class="step reveal" style="--d:${i*.08}s">
            <div class="step-num">${s[0]}<em>.</em></div>
            <div><h3 class="h3">${s[1]}</h3><p>${s[2]}</p></div>
          </div>`).join("")}
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow"><svg class="ic" style="width:12px;height:12px"><use href="#i-layers"/></svg>Capabilities</span>
          <h2 class="h2">${L("feat_title")}</h2>
          <p class="lede">${L("feat_sub")}</p>
        </div>
        <div class="bento">
          ${feats.map((f,i) => `<article class="card card-hover feat ${f[1]} reveal" style="--d:${(i%3)*.07}s">
            <span class="feat-ico"><svg class="ic" style="width:20px;height:20px"><use href="#${f[0]}"/></svg></span>
            <h3>${f[2]}</h3><p>${f[3]}</p>
            <span class="feat-demo">${esc(f[4])}</span>
          </article>`).join("")}
        </div>
      </div>
    </section>

    <!-- LANGUAGES -->
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow"><svg class="ic" style="width:12px;height:12px"><use href="#i-globe"/></svg>Languages</span>
          <h2 class="h2">${L("lang_title")}</h2>
          <p class="lede">${L("lang_sub")}</p>
        </div>
        <div class="lang-grid">
          ${Object.entries(LANGS).map(([code,l]) => `<button class="card card-hover lang-card reveal" data-langset="${code}" aria-pressed="${code === t}">
            <span class="tag">${code.toUpperCase()}</span>
            <div class="native-big" style="margin-top:.6rem">${l.native}</div>
            <p class="ex" data-langex="${code}">${code === t ? langSamples[code] : "Tap to preview"}</p>
          </button>`).join("")}
        </div>
        <p class="lang-more reveal"><svg class="ic" style="width:15px;height:15px;color:var(--primary)"><use href="#i-info"/></svg>The architecture supports adding Bengali, Tamil, Telugu, Marathi and more — one language file per language.</p>
      </div>
    </section>

    <!-- TRUST -->
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="trust-grid">
          <div>
            <div class="section-head reveal" style="margin-bottom:1.4rem">
              <span class="eyebrow"><svg class="ic" style="width:12px;height:12px"><use href="#i-shield"/></svg>Trust &amp; transparency</span>
              <h2 class="h2">${L("trust_title")}</h2>
              <p class="lede">${L("trust_sub")}</p>
            </div>
            <div class="trust-list">
              ${[
                ["i-shield","Official-source based","Every scheme links to its ministry portal or gazette — nothing is paraphrased from memory."],
                ["i-link","Source citations","Answers carry the exact source they were built from, with a last-verified date."],
                ["i-globe","Multilingual","English, हिन्दी and ਪੰਜਾਬੀ from day one — same grounded meaning in each."],
                ["i-scale","Explainable eligibility","A deterministic rule engine — not vibes — decides each match, and shows its working."],
              ].map((r,i) => `<div class="trust-row reveal" style="--d:${i*.06}s">
                <span class="trust-ico"><svg class="ic" style="width:17px;height:17px"><use href="#${r[0]}"/></svg></span>
                <div><h4>${r[1]}</h4><p>${r[2]}</p></div>
              </div>`).join("")}
            </div>
          </div>
          <aside class="trust-note reveal" style="--d:.1s">
            <span class="demo-pill">Demo knowledge base</span>
            <h3 class="h3">What this build demonstrates</h3>
            <p>This preview runs on a curated set of real, well-known central schemes with illustrative details. A real backend lives in <code style="font-family:var(--font-mono);font-size:.8em;color:var(--accent)">server/app.py</code> (FastAPI: same BM25 retriever + rule engine + optional LLM). It never invents facts — and it never files applications for you.</p>
            <div class="stat-row">
              <div class="stat"><b data-count="${SCHEMES.length}">0</b><span>schemes curated</span></div>
              <div class="stat"><b data-count="8">0</b><span>categories covered</span></div>
              <div class="stat"><b data-count="3">0</b><span>languages supported</span></div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow"><svg class="ic" style="width:12px;height:12px"><use href="#i-layers"/></svg>Directory</span>
          <h2 class="h2">${L("cat_title")}</h2>
          <p class="lede">${L("cat_sub")}</p>
        </div>
        <div class="cat-grid">
          ${cats.map(([key,c],i) => `<a class="card card-hover cat-card reveal" style="--d:${(i%4)*.06}s" href="#/results?category=${key}">
            <span class="cat-ico"><svg class="ic" style="width:18px;height:18px"><use href="#${c.icon}"/></svg></span>
            <span><strong>${c.label}</strong><br/><span class="caption">${SCHEMES.filter(s => s.category === key).length} scheme${SCHEMES.filter(s => s.category === key).length > 1 ? "s" : ""} in demo</span></span>
            <svg class="ic arrow"><use href="#i-arrow"/></svg>
          </a>`).join("")}
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="cta-band reveal">
          <div class="container" style="width:auto">
            <div>
              <h2 class="h1">${L("cta_title")}</h2>
              <p>${L("cta_sub")}</p>
            </div>
            <div style="display:flex;gap:.7rem;flex-wrap:wrap">
              <a class="btn btn-accent btn-lg" href="#/profile">${L("cta_btn")}<svg class="ic"><use href="#i-arrow"/></svg></a>
              <a class="btn btn-lg" style="background:rgba(242,241,230,.08);color:var(--paper-on-ink);border:1px solid rgba(242,241,230,.25)" href="#/assistant">${L("cta_btn2")}</a>
            </div>
          </div>
        </div>
      </div>
    </section>`;
  },
  after(){
    Fx.initReveal();
    this.runPreview();
    $$("[data-count]").forEach(el => {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ Fx.countUp(el, +el.dataset.count); io.disconnect(); } }), { threshold:.6 });
      io.observe(el);
    });
    $$("[data-ask]").forEach(b => b.addEventListener("click", () => Router.go("#/assistant?q=" + encodeURIComponent(b.dataset.ask))));
    $$("[data-langset]").forEach(b => b.addEventListener("click", () => {
      const code = b.dataset.langset;
      const samples = { en:"“You may be eligible for a scholarship. Here is why it matched.”", hi:"“आप छात्रवृत्ति के लिए पात्र हो सकते हैं। देखिए यह क्यों मेल खाती है।”", pa:"“ਤੁਸੀਂ ਸਕਾਲਰਸ਼ਿਪ ਲਈ ਯੋਗ ਹੋ ਸਕਦੇ ਹੋ। ਵੇਖੋ ਇਹ ਕਿਉਂ ਮੇਲ ਖਾਂਦੀ ਹੈ।”" };
      $$("[data-langex]").forEach(p => p.textContent = p.dataset.langex === code ? samples[code] : "Tap to preview");
      $$("[data-langset]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      Lang.set(code);
    }));
  },
};
