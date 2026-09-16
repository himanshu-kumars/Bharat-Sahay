"use strict";
/* ---------- pages/assistant.js ---------- */
const Chat = {
  convoId: null,
  busy: false,
  convos(){ return Store.get("convos", []); },
  saveConvos(c){ Store.set("convos", c); },
  current(){ return this.convos().find(c => c.id === this.convoId); },
  render(){
    const convos = this.convos();
    const profile = Store.get("profile", null);
    return `<div class="assist-shell">
      <aside class="assist-side" id="assistSide" aria-label="Conversations">
        <div class="pad">
          <button class="btn btn-primary" style="width:100%" id="newConvo"><svg class="ic" style="width:15px;height:15px"><use href="#i-plus"/></svg>New conversation</button>
        </div>
        <div class="side-label">Recent</div>
        <div class="pad" style="padding-top:0" id="convoList">
          ${convos.length ? convos.map(c => `<button class="convo-item ${c.id === this.convoId ? "active" : ""}" data-convo="${c.id}"><svg class="ic" style="width:14px;height:14px"><use href="#i-chat"/></svg>${esc(Utils.truncate(c.title, 30))}</button>`).join("")
            : `<p class="caption" style="padding:.4rem .7rem">Start your first conversation with Bharat Sahay.</p>`}
        </div>
        <div class="side-label">Saved schemes</div>
        <div class="pad" style="padding-top:0" id="sideSaved"></div>
        <div style="margin-top:auto" class="pad">
          <div class="card" style="padding:.85rem .95rem">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem">
              <strong class="small">${profile ? "Your profile" : "No profile yet"}</strong>
              <a class="caption" href="#/profile" style="color:var(--primary-deep);font-weight:600">${profile ? "Edit" : "Add →"}</a>
            </div>
            <p class="caption" style="margin-top:.3rem">${profile ? [profile.age && profile.age + " yrs", profile.state, profile.occupation, profile.category].filter(Boolean).join(" · ") : "A short profile lets Bharat Sahay explain why schemes match you."}</p>
          </div>
          <button class="btn btn-ghost btn-sm" id="clearConvo" style="margin-top:.6rem;width:100%;color:var(--danger)"><svg class="ic" style="width:14px;height:14px"><use href="#i-trash"/></svg>Clear conversation</button>
        </div>
      </aside>
      <section class="chat-main">
        <div class="chat-head">
          <button class="icon-btn" id="sideToggle" aria-label="Open conversations" style="display:none"><svg class="ic" style="width:17px;height:17px"><use href="#i-menu"/></svg></button>
          <span class="preview-avatar" style="width:32px;height:32px;border-radius:10px"><svg class="ic" style="width:16px;height:16px;color:var(--primary-foreground)"><use href="#i-spark"/></svg></span>
          <div style="flex:1"><strong style="font-size:.95rem">Bharat Sahay</strong><div class="caption" style="font-size:.72rem">AI assistant · answers grounded in official sources</div></div>
          <span class="tag">${LANGS[Lang.current].native} · ${Lang.current.toUpperCase()}</span>
        </div>
        <div class="chat-thread" id="chatThread" aria-live="polite"></div>
        <div class="composer">
          <div class="composer-inner">
            <div class="composer-box">
              <textarea id="chatInput" rows="1" placeholder="Ask anything about government schemes… in English, हिन्दी or ਪੰਜਾਬੀ" aria-label="Message Bharat Sahay" maxlength="2000"></textarea>
              <button class="send-btn mic-btn" id="micBtn" aria-label="Speak your question" title="Voice input — Chrome / Edge, needs mic permission (works on HTTPS or localhost)"><svg class="ic" style="width:17px;height:17px"><use href="#i-mic"/></svg></button>
              <button class="send-btn" id="sendBtn" aria-label="Send message"><svg class="ic" style="width:17px;height:17px"><use href="#i-send"/></svg></button>
            </div>
            <div class="composer-hint"><span>Enter to send · 🎤 to dictate · answers can be read aloud with 🔊</span><span>Illustrative demo answers — verify on official portals</span></div>
          </div>
        </div>
      </section>
    </div>`;
  },
  renderSideSaved(){
    const saved = Store.get("saved", []);
    const el = $("#sideSaved");
    if (!el) return;
    el.innerHTML = saved.length
      ? saved.slice(0, 4).map(slug => { const s = SCHEMES.find(x => x.slug === slug); return s ? `<a class="convo-item" href="#/schemes/${s.slug}"><svg class="ic" style="width:14px;height:14px;color:var(--accent-deep)"><use href="#i-bookmark"/></svg>${esc(Utils.truncate(s.name, 28))}</a>` : ""; }).join("") + `<a class="caption" href="#/saved" style="display:block;padding:.4rem .7rem;color:var(--primary-deep);font-weight:600">View all →</a>`
      : `<p class="caption" style="padding:.4rem .7rem">Save schemes here so you can return to them later.</p>`;
  },
  welcome(){
    const thread = $("#chatThread");
    const L = Lang.current;
    const sugg = {
      en:["What scholarships are available for students?","What schemes can help with housing?","Explain this scheme simply","Translate this into Punjabi"],
      hi:["विद्यार्थियों के लिए कौन सी छात्रवृत्तियाँ हैं?","आवास के लिए कौन सी योजनाएँ हैं?","इस योजना को सरल भाषा में समझाइए","Translate this into Punjabi"],
      pa:["ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਕਿਹੜੀਆਂ ਸਕਾਲਰਸ਼ਿਪਾਂ ਹਨ?","ਆਵਾਸ ਲਈ ਕਿਹੜੀਆਂ ਸਕੀਮਾਂ ਹਨ?","ਇਸ ਸਕੀਮ ਨੂੰ ਸੌਖੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਮਝਾਓ","Translate this into Punjabi"],
    }[L] || [];
    const greet = {
      en:"Namaste! Ask me about any government scheme — scholarships, housing, health cover, farmer support. I answer in your language, show why each result matched, and cite the official source.",
      hi:"नमस्ते! किसी भी सरकारी योजना के बारे में पूछिए — छात्रवृत्ति, आवास, स्वास्थ्य बीमा, किसान सहायता। मैं आपकी भाषा में जवाब देता हूँ और आधिकारिक स्रोत दिखाता हूँ।",
      pa:"ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਕਿਸੇ ਵੀ ਸਰਕਾਰੀ ਸਕੀਮ ਬਾਰੇ ਪੁੱਛੋ — ਸਕਾਲਰਸ਼ਿਪ, ਆਵਾਸ, ਸਿਹਤ ਬੀਮਾ, ਕਿਸਾਨ ਮਦਦ। ਮੈਂ ਤੁਹਾਡੀ ਭਾਸ਼ਾ ਵਿੱਚ ਜਵਾਬ ਦਿੰਦਾ ਹਾਂ।",
    }[L];
    thread.innerHTML = `<div class="thread-inner">
      <div class="welcome-panel">
        <span class="big-mark"><svg class="ic" style="width:28px;height:28px"><use href="#i-spark"/></svg></span>
        <h2 class="h2">Bharat Sahay</h2>
        <p class="small" style="color:var(--muted-foreground);max-width:44ch">${greet}</p>
        <div class="followups">${sugg.map(s => `<button class="chip" data-sugg="${esc(s)}">${esc(s)}</button>`).join("")}</div>
      </div>
    </div>`;
    this.bindSugg(thread);
  },
  bindSugg(scope){ $$("[data-sugg]", scope).forEach(b => b.addEventListener("click", () => this.send(b.dataset.sugg))); },
  userBubble(text){
    const inner = $(".thread-inner") || (() => {
      const t = $("#chatThread");
      if (!t) return null;                       // page unmounted mid-flight
      t.innerHTML = `<div class="thread-inner"></div>`; return $(".thread-inner");
    })();
    if (!inner) return null;
    const div = document.createElement("div");
    div.className = "msg msg-user";
    div.textContent = text;
    inner.appendChild(div);
    this.scroll();
    return inner;
  },
  scroll(){ const t = $("#chatThread"); if (t) t.scrollTop = t.scrollHeight; },
  /* True while the chat page is still mounted. Router.render() wipes #view on
     navigation, so any async continuation (Api.chat) that resumes afterwards must
     stop instead of writing to detached/absent nodes. */
  alive(){ return !!$("#chatThread"); },
  typing(){
    const inner = $(".thread-inner");
    if (!inner) return;
    const div = document.createElement("div");
    div.className = "typing-dots"; div.id = "typingNow";
    div.innerHTML = "<i></i><i></i><i></i>";
    inner.appendChild(div); this.scroll();
  },
  async renderAssistant(res, instant = false){
    const inner = $(".thread-inner");
    if (!inner) return null;
    $("#typingNow")?.remove();
    Speech.stop();
    const aLang = (res.answerLang && LANGS[res.answerLang]) ? res.answerLang : Lang.current;
    const hasRag = res.rag && res.rag.chunks && res.rag.chunks.length;
    const block = document.createElement("div");
    block.className = "a-block";
    block.innerHTML = `
      <div class="a-head"><span class="preview-avatar"><svg class="ic" style="width:13px;height:13px"><use href="#i-spark"/></svg></span>Bharat Sahay · ${LANGS[aLang].native}${aLang !== Lang.current ? ' <span class="tag" title="Answer language detected from your question">auto</span>' : ""}</div>
      <p class="a-text" lang="${aLang}"></p>
      ${res.schemes && res.schemes.length ? `<div><div class="a-sec-title">Potential matches</div><div style="display:flex;flex-direction:column;gap:.6rem;margin-top:.6rem">${res.schemes.map(m => `
        <div class="match-row">
          <div class="match-top">
            <div><strong class="small" style="font-size:.92rem">${esc(m.scheme.name)}</strong><div class="caption">${esc(m.scheme.authority)}</div></div>
            ${Cmp.statusPill(m.status)}
          </div>
          <div class="why-card" data-why>
            <button class="why-head" aria-expanded="false" style="padding:.5rem .7rem;font-size:.8rem">Why did this result appear?<svg class="ic chev" style="width:14px;height:14px"><use href="#i-chev"/></svg></button>
            <div class="why-body"><div><ul class="why-list">${Cmp.whyRows(m)}</ul></div></div>
          </div>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap">
            <a class="btn btn-secondary btn-sm" href="#/schemes/${m.scheme.slug}">View scheme</a>
            ${Cmp.saveBtn(m.scheme.slug)}
          </div>
        </div>`).join("")}</div></div>` : ""}
      ${res.docs ? `<div><div class="a-sec-title">Required documents</div><div style="margin-top:.5rem">${res.docs.map(d => `<label class="doc-check ${d.mandatory ? "mandatory" : ""}"><input type="checkbox"/><span class="box"><svg class="ic" style="width:11px;height:11px"><use href="#i-check"/></svg></span><span>${esc(d.name)}${d.mandatory ? "" : ` <span class="caption">(optional)</span>`}</span></label>`).join("")}</div></div>` : ""}
      ${res.applySteps ? `<div><div class="a-sec-title">How to apply</div><ol class="apply-steps" style="margin-top:.6rem">${res.applySteps.map((s, i) => `<li><b>${i + 1}</b><span>${esc(s)}</span></li>`).join("")}</ol></div>` : ""}
      ${res.sources && res.sources.length ? `<div><div class="a-sec-title">Sources</div><div style="display:flex;flex-direction:column;gap:.5rem;margin-top:.6rem">${res.sources.map(s => Cmp.sourceCard(s)).join("")}</div></div>` : ""}
      <p class="caption" style="display:flex;gap:.4rem;align-items:center"><svg class="ic" style="width:13px;height:13px;color:var(--warning)"><use href="#i-info"/></svg>${esc(res.note)}</p>
      <div class="a-actions">
        ${hasRag ? `<button class="a-act" data-rag><svg class="ic" style="width:13px;height:13px"><use href="#i-search"/></svg>How I found this</button>` : ""}
        <button class="a-act" data-tts><svg class="ic" style="width:13px;height:13px"><use href="#i-sound"/></svg><span>Listen</span></button>
        <span style="flex:1"></span>
        <button class="a-act" data-fb="up"><svg class="ic" style="width:12px;height:12px"><use href="#i-check"/></svg>Helpful</button>
        <button class="a-act" data-fb="down"><svg class="ic" style="width:12px;height:12px"><use href="#i-x"/></svg>Not helpful</button>
      </div>
      ${hasRag ? `<div class="rag-box" data-ragbox hidden>
        <strong class="small">Retrieval trace — the passages this answer was allowed to use</strong>
        ${res.rag.tokens && res.rag.tokens.length ? `<div style="display:flex;flex-wrap:wrap;gap:.3rem"><span class="caption" style="margin-right:.3rem">query →</span>${res.rag.tokens.slice(0, 12).map(x => `<span class="tag">${esc(x)}</span>`).join("")}</div>` : ""}
        ${res.rag.chunks.map(c => `<div class="rag-chunk"><span class="rag-score">${typeof c.score === "number" ? c.score.toFixed(2) : esc(c.score)}</span><span><b>${esc(c.name)}</b>${(c.fields || []).map(f => `<br/><span class="caption">${esc(f.label)}: ${esc(f.txt)}</span>`).join("")}</span></div>`).join("")}
        <p class="caption">BM25 over ${SCHEMES.length} schemes — हिन्दी / ਪੰਜਾਬੀ titles and romanised queries expanded with a multilingual synonym lexicon. The answer can only use the passages above.</p>
      </div>` : ""}
      ${res.suggested && res.suggested.length ? `<div class="followups">${res.suggested.map(s => `<button class="chip" data-sugg="${esc(s)}">${esc(s)}</button>`).join("")}</div>` : ""}`;
    inner.appendChild(block);
    Cmp.bindCardEvents(block);
    this.bindSugg(block);
    const textEl = block.querySelector(".a-text");
    if (instant) textEl.textContent = res.answer;
    else await Fx.stream(textEl, res.answer, 9);
    const tts = $("[data-tts]", block);
    if (tts){
      if (!Speech.synth) tts.remove();
      else tts.addEventListener("click", () => {
        const lbl = $("span", tts);
        if (Speech.speaking()){ Speech.stop(); tts.classList.remove("on"); if (lbl) lbl.textContent = "Listen"; return; }
        Speech.say(res.answer, aLang);
        tts.classList.add("on"); if (lbl) lbl.textContent = "Stop";
        Speech.onend = () => { tts.classList.remove("on"); if (lbl) lbl.textContent = "Listen"; Speech.onend = null; };
      });
    }
    const ragBtn = $("[data-rag]", block);
    if (ragBtn) ragBtn.addEventListener("click", () => { const box = $("[data-ragbox]", block); if (box){ box.hidden = !box.hidden; ragBtn.classList.toggle("on", !box.hidden); } });
    $$("[data-fb]", block).forEach(b => b.addEventListener("click", () => {
      const fb = Store.get("feedback", []); fb.push({ v: b.dataset.fb, q: String(res.q || "").slice(0, 80), ts: Date.now() }); Store.set("feedback", fb.slice(-60));
      $$("[data-fb]", block).forEach(x => x.classList.remove("on")); b.classList.add("on");
      Toast.show(b.dataset.fb === "up" ? "Thanks — marked helpful" : "Thanks — noted, we will improve this answer", "i-check");
    }));
    this.scroll();
    return block;
  },

  async send(text){
    if (this.busy || !text.trim()) return;
    if (!this.alive()) return;                   // deferred ?q= autosend after navigation
    this.busy = true;
    const sendBtn = $("#sendBtn"); if (sendBtn) sendBtn.disabled = true;
    const input = $("#chatInput");
    if (input){ input.value = ""; input.style.height = "auto"; }
    const msg = Utils.truncate(text.trim(), 2000);
    const profile = Store.get("profile", null);
    this.userBubble(msg);
    this.typing();
    try {
      const res = await Api.chat(msg, Lang.current, profile);
      if (!this.alive()) { this.busy = false; return; }   // navigated away mid-request
      await this.renderAssistant(res);
      this.persistTurn(msg, res);
    } catch (err) {
      if (!this.alive()) { this.busy = false; return; }
      $("#typingNow")?.remove();
      const inner = $(".thread-inner");
      if (!inner) { this.busy = false; return; }
      const div = document.createElement("div");
      div.className = "err-card";
      div.innerHTML = `<svg class="ic"><use href="#i-alert"/></svg><div><strong>We couldn't reach the assistant right now.</strong><br/><span class="small">Check your connection and try again.</span> <button class="btn btn-secondary btn-sm" style="margin-top:.5rem" id="retryBtn">Try again</button></div>`;
      inner.appendChild(div);
      $("#retryBtn").addEventListener("click", () => { div.remove(); this.send(msg); });
    }
    this.busy = false;
    const sb = $("#sendBtn"); if (sb) sb.disabled = false;
    $("#chatInput")?.focus();
  },
  persistTurn(userMsg, res){
    let convos = this.convos();
    if (!this.convoId){
      this.convoId = Utils.uid();
      convos.unshift({ id:this.convoId, title:userMsg, created:Date.now(), messages:[] });
    }
    const c = convos.find(x => x.id === this.convoId);
    if (c){ (c.messages = c.messages || []).push({ role:"user", text:userMsg }, { role:"bot", res }); }
    this.saveConvos(convos.slice(0, 12));
    this.renderConvoList();
  },
  loadConvo(id){
    const c = this.convos().find(x => x.id === id);
    if (!c || !c.messages || !c.messages.length){ Toast.show("This conversation predates message saving — ask something new", "i-info"); return; }
    this.convoId = id;
    const thread = $("#chatThread"); if (!thread) return;
    thread.innerHTML = `<div class="thread-inner"></div>`;
    c.messages.forEach(m => { if (m.role === "user") this.userBubble(m.text); else this.renderAssistant(m.res, true); });
    this.renderConvoList();
    $("#assistSide")?.classList.remove("mobile-open");
    this.scroll();
  },
  renderConvoList(){
    const el = $("#convoList");
    if (!el) return;
    const convos = this.convos();
    el.innerHTML = convos.length ? convos.map(c => `<button class="convo-item ${c.id === this.convoId ? "active" : ""}" data-convo="${c.id}"><svg class="ic" style="width:14px;height:14px"><use href="#i-chat"/></svg>${esc(Utils.truncate(c.title, 30))}</button>`).join("")
      : `<p class="caption" style="padding:.4rem .7rem">Start your first conversation with Bharat Sahay.</p>`;
    $$("[data-convo]", el).forEach(b => b.addEventListener("click", () => this.loadConvo(b.dataset.convo)));
  },
  after(){
    this.welcome();
    this.renderConvoList();
    this.renderSideSaved();
    const input = $("#chatInput");
    const send = $("#sendBtn");
    input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 140) + "px"; });
    input.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey){ e.preventDefault(); this.send(input.value); }
    });
    send.addEventListener("click", () => this.send(input.value));
    $("#newConvo").addEventListener("click", () => { this.convoId = null; this.welcome(); this.renderConvoList(); $("#assistSide").classList.remove("mobile-open"); });
    $("#clearConvo").addEventListener("click", () => {
      Modal.open({ title:"Clear this conversation?", body:"The conversation list on this device will be removed. Saved schemes are not affected.", confirmText:"Clear", danger:true,
        onConfirm:() => { this.convoId = null; this.saveConvos([]); this.welcome(); this.renderConvoList(); Toast.show("Conversation cleared"); } });
    });
    const side = $("#assistSide");
    if (matchMedia("(max-width:860px)").matches) $("#sideToggle").style.display = "inline-flex";
    $("#sideToggle").addEventListener("click", () => side.classList.toggle("mobile-open"));
    const mic = $("#micBtn");
    if (mic){
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) mic.remove();
      else {
        let rec = null;
        const DEFAULT_PH = input.placeholder;
        mic.addEventListener("click", () => {
          if (rec){ rec.stop(); return; }
          rec = new SR();
          rec.lang = { en:"en-IN", hi:"hi-IN", pa:"pa-IN" }[Lang.current] || "en-IN";
          rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
          mic.classList.add("rec"); mic.setAttribute("aria-pressed", "true");
          input.placeholder = "Listening… speak now (tap the mic to stop)";
          rec.onresult = e => {
            let txt = "";
            for (let i = e.resultIndex; i < e.results.length; i++) txt += e.results[i][0].transcript;
            input.value = txt.trim();
            input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 140) + "px";
          };
          rec.onerror = ev => Toast.show("Microphone: " + (ev.error || "error") + " — needs permission and HTTPS (or localhost)", "i-alert");
          rec.onend = () => {
            mic.classList.remove("rec"); mic.setAttribute("aria-pressed", "false");
            input.placeholder = DEFAULT_PH;
            const v = input.value.trim(); rec = null;
            if (v && !this.busy) this.send(v);
          };
          try { rec.start(); } catch { Toast.show("Voice input could not start here", "i-alert"); rec = null; mic.classList.remove("rec"); }
        });
      }
    }
    input.focus();
    const q = Router.query.get("q");
    if (q) setTimeout(() => { if (this.alive()) this.send(q); }, 350);
  },
};
