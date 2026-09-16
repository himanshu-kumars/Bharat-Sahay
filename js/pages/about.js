"use strict";
/* ---------- pages/about.js ---------- */
const AboutPage = {
  render(){
    const fb = Store.get("feedback", []);
    const fbLine = fb.length
      ? `<p><strong>Feedback on this device:</strong> you rated ${fb.length} answer${fb.length > 1 ? "s" : ""} — ${Math.round(100 * fb.filter(x => x.v === "up").length / fb.length)}% marked helpful. Ratings stay in this browser only.</p>`
      : "";
    return `<div class="container" style="padding-block:3rem 1rem">
      <div class="prose">
        <span class="eyebrow"><span class="pulse-dot"></span>About</span>
        <h1 class="h1" style="margin:.6rem 0 1rem">Bharat Sahay — honest help with government services</h1>
        <p>Bharat Sahay is a citizen-facing assistant for the <strong>Bharat AI Innovation Arena</strong> hackathon (Problem Statement Q7: AI Multilingual Government Information Assistant). It helps Indian citizens discover schemes they may be eligible for, in the language they prefer, with every claim traced to an official source.</p>
        <h2 class="h2">How the pipeline works</h2>
        <p><strong>1 · A deterministic rule engine</strong> checks structured eligibility criteria (age, income, category, state, occupation, disability) against your profile. The AI never decides eligibility — the rules do, and they show their working.</p>
        <p><strong>2 · A multilingual retrieval layer (RAG)</strong> indexes every scheme in English, हिन्दी and ਪੰਜਾਬी — including romanised queries like “kisan yojana” — with a BM25 ranker over a synonym lexicon. Expand <em>“How I found this”</em> under any chat answer to inspect the retrieved passages and scores.</p>
        <p><strong>3 · An explanation layer</strong> (LLM in the backend, or a safe template engine in this frontend) turns retrieved, cited context into plain-language answers — it can only summarise what retrieval returned, so it cannot invent facts. Answer language is auto-detected from your question's script.</p>
        <p><strong>4 · A voice layer</strong> uses the browser's Web Speech API: dictate questions in your language, and press <em>Listen</em> to have answers read aloud.</p>
        <h2 class="h2">What this build is</h2>
        <p>This artifact runs in <strong>demo mode</strong>: a curated set of real, well-known central schemes with illustrative details, a local rule engine and a retrieval-grounded answer generator — so the full journey works even offline. A runnable backend ships in <code style="font-family:var(--font-mono);font-size:.85em">server/</code>: FastAPI with the same BM25 retriever and rule engine, a <code style="font-family:var(--font-mono);font-size:.85em">/api/chat</code> endpoint that calls any OpenAI-compatible LLM (Gemini / OpenAI / Groq) when a key is set, and the same safe fallback when it isn't. Point the frontend at it by setting <code style="font-family:var(--font-mono);font-size:.85em">CONFIG.DEMO_MODE = false</code>.</p>
        <p><a class="btn btn-secondary btn-sm" href="#/results">Get an eligibility report (printable)<svg class="ic" style="width:14px;height:14px"><use href="#i-doc"/></svg></a></p>
        <h2 class="h2">What it will never do</h2>
        <p>It does not submit applications, does not ask for Aadhaar numbers or OTPs, and does not guarantee legal eligibility. Final confirmation always happens on the official portal — which is why the portal link sits on every screen.</p>
        ${fbLine}
        <p style="margin-top:1.6rem"><a class="btn btn-primary" href="#/assistant">Ask Bharat Sahay<svg class="ic"><use href="#i-arrow"/></svg></a> <a class="btn btn-secondary" href="#/" style="margin-left:.5rem">Back to home</a></p>
      </div>
    </div>`;
  },
  after(){ Fx.initReveal(); },
};
