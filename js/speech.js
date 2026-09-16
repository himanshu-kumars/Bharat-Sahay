"use strict";
/* ---------- speech.js (Web Speech API: voice in · voice out) ---------- */
const Speech = {
  synth: ("speechSynthesis" in window) ? window.speechSynthesis : null,
  onend: null,
  pickVoice(lang){
    if (!this.synth) return null;
    const want = { hi:["hi-in"], pa:["pa-in", "hi-in"], en:["en-in", "en"] }[lang] || ["en"];
    const vs = this.synth.getVoices() || [];
    for (const w of want){
      const v = vs.find(x => (x.lang || "").toLowerCase().replace("_", "-").startsWith(w));
      if (v) return v;
    }
    return null;
  },
  say(text, lang){
    if (!this.synth) return false;
    this.synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = { hi:"hi-IN", pa:"pa-IN", en:"en-IN" }[lang] || "en-IN";
    const v = this.pickVoice(lang);
    if (v) u.voice = v;
    u.onend = () => { if (this.onend) this.onend(); };
    this.synth.speak(u);
    return true;
  },
  speaking(){ return !!this.synth && this.synth.speaking; },
  stop(){ if (this.synth) this.synth.cancel(); },
};
