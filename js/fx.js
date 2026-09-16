"use strict";
/* ---------- fx.js (reveal · stream · count-up · hero loop) ---------- */
const Fx = {
  observer: null,
  initReveal(){
    if (this.observer) this.observer.disconnect();
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting){ en.target.classList.add("in"); this.observer.unobserve(en.target); } });
    }, { threshold:.12 });
    $$(".reveal").forEach(el => this.observer.observe(el));
  },
  async stream(el, text, speed = 14){
    if (Utils.reduced()){ el.textContent = text; return; }
    el.classList.add("caret");
    const thread = el.closest(".chat-thread") || $("#chatThread");
    for (let i = 0; i < text.length; i++){
      el.textContent += text[i];
      if (i % 2 === 0 && thread) thread.scrollTop = thread.scrollHeight;
      await Utils.wait(text[i] === "." || text[i] === "," ? speed * 4 : speed);
    }
    el.classList.remove("caret");
    if (thread) thread.scrollTop = thread.scrollHeight;
  },
  async type(el, text, speed = 34){
    if (Utils.reduced()){ el.textContent = text; return; }
    el.classList.add("caret");
    for (const ch of text){ el.textContent += ch; await Utils.wait(speed); }
    el.classList.remove("caret");
  },
  countUp(el, target, dur = 1100){
    if (Utils.reduced()){ el.textContent = target; return; }
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },
};
