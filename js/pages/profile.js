"use strict";
/* ---------- pages/profile.js ---------- */
const ProfilePage = {
  step: 1,
  draft: {},
  render(){
    const p = Store.get("profile", null);
    this.draft = p ? { ...p } : {};
    this.step = 1;
    const d = this.draft;
    const incomeBands = [["0","Below ₹1,00,000",100000],["1","₹1,00,000 – ₹2,50,000",250000],["2","₹2,50,000 – ₹5,00,000",500000],["3","₹5,00,000 – ₹8,00,000",800000],["4","Above ₹8,00,000",1000000]];
    return `<div class="container profile-shell">
      <aside class="profile-rail">
        <span class="eyebrow"><span class="pulse-dot"></span>Profile</span>
        <h2 class="h2" style="margin-top:.6rem">Tell us a little about yourself</h2>
        <p class="small" style="color:var(--muted-foreground);margin-top:.5rem">Nothing leaves this device in the demo. Only age and state are required — everything else sharpens the matches.</p>
        <div class="prog-bar" role="progressbar" aria-valuemin="1" aria-valuemax="4" aria-valuenow="1" id="progBar"><i style="width:25%"></i></div>
        <div class="prog-steps" id="progSteps">
          ${["Basic details","Location","Education / occupation","Income & criteria"].map((s,i) =>
            `<div class="prog-step ${i === 0 ? "current" : ""}" data-ps="${i+1}"><i>${i+1}</i>${s}</div>`).join("")}
        </div>
      </aside>
      <form class="card form-card" id="profileForm" novalidate>
        <div class="form-step active" data-step="1">
          <h3 class="h3" style="margin-bottom:1.1rem">Basic details</h3>
          <div class="grid" style="grid-template-columns:1fr 1fr;gap:1.1rem">
            <div class="field" id="f-age">
              <label for="age">Age <span style="color:var(--danger)">*</span></label>
              <input class="input" id="age" name="age" type="number" min="1" max="110" inputmode="numeric" placeholder="e.g. 21" value="${esc(d.age ?? "")}" required />
              <span class="err">Please enter an age between 1 and 110.</span>
            </div>
            <div class="field">
              <label for="gender">Gender <span class="caption">(optional)</span></label>
              <select class="input" id="gender" name="gender">
                <option value="">Prefer not to say</option>
                ${["female","male","other"].map(g => `<option value="${g}" ${d.gender === g ? "selected" : ""}>${g[0].toUpperCase()+g.slice(1)}</option>`).join("")}
              </select>
            </div>
          </div>
          <div class="field" style="margin-top:1.1rem">
            <label>Community category <span class="caption">(optional, helps match reserved scholarships)</span></label>
            <div class="radio-grid">
              ${["General","OBC","SC","ST","EWS"].map(c => `<label class="radio-card"><input type="radio" name="category" value="${c}" ${d.category === c ? "checked" : ""}/><span>${c}</span></label>`).join("")}
              <label class="radio-card"><input type="radio" name="category" value="" ${!d.category ? "checked" : ""}/><span>Prefer not to say</span></label>
            </div>
          </div>
        </div>

        <div class="form-step" data-step="2">
          <h3 class="h3" style="margin-bottom:1.1rem">Location</h3>
          <div class="grid" style="grid-template-columns:1fr 1fr;gap:1.1rem">
            <div class="field" id="f-state">
              <label for="state">State <span style="color:var(--danger)">*</span></label>
              <select class="input" id="state" name="state" required>
                <option value="">Select state…</option>
                ${STATES.map(s => `<option value="${s}" ${d.state === s ? "selected" : ""}>${s}</option>`).join("")}
              </select>
              <span class="err">Please choose your state.</span>
            </div>
            <div class="field">
              <label>Area type <span class="caption">(optional)</span></label>
              <div class="radio-grid">
                <label class="radio-card"><input type="radio" name="areaType" value="rural" ${d.areaType === "rural" ? "checked" : ""}/><span>Rural</span></label>
                <label class="radio-card"><input type="radio" name="areaType" value="urban" ${d.areaType === "urban" ? "checked" : ""}/><span>Urban</span></label>
                <label class="radio-card"><input type="radio" name="areaType" value="" ${!d.areaType ? "checked" : ""}/><span>Prefer not to say</span></label>
              </div>
            </div>
          </div>
        </div>

        <div class="form-step" data-step="3">
          <h3 class="h3" style="margin-bottom:1.1rem">Education / occupation</h3>
          <div class="field">
            <label>Your current situation <span class="caption">(optional)</span></label>
            <div class="radio-grid">
              ${[["student","Student"],["employed","Salaried"],["self_employed","Self-employed"],["farmer","Farmer"],["unemployed","Looking for work"],["homemaker","Homemaker"]].map(o =>
                `<label class="radio-card"><input type="radio" name="occupation" value="${o[0]}" ${d.occupation === o[0] ? "checked" : ""}/><span>${o[1]}</span></label>`).join("")}
            </div>
          </div>
          <div class="field" style="margin-top:1.1rem">
            <label>Are you currently studying? <span class="caption">(optional)</span></label>
            <div class="radio-grid" style="max-width:340px">
              <label class="radio-card"><input type="radio" name="isStudent" value="yes" ${d.isStudent ? "checked" : ""}/><span>Yes, studying</span></label>
              <label class="radio-card"><input type="radio" name="isStudent" value="no" ${d.isStudent === false ? "checked" : ""}/><span>No</span></label>
            </div>
          </div>
        </div>

        <div class="form-step" data-step="4">
          <h3 class="h3" style="margin-bottom:1.1rem">Income &amp; relevant criteria</h3>
          <div class="field">
            <label>Annual family income <span class="caption">(optional — most schemes use this)</span></label>
            <div class="radio-grid">
              ${incomeBands.map(b => `<label class="radio-card"><input type="radio" name="income" value="${b[2]}" ${String(d.annualIncome) === String(b[2]) ? "checked" : ""}/><span>${b[1]}</span></label>`).join("")}
            </div>
          </div>
          <div class="field" style="margin-top:1.1rem">
            <label>Does anyone in the household have a certified disability? <span class="caption">(optional)</span></label>
            <div class="radio-grid" style="max-width:340px">
              <label class="radio-card"><input type="radio" name="disability" value="yes" ${d.hasDisability ? "checked" : ""}/><span>Yes</span></label>
              <label class="radio-card"><input type="radio" name="disability" value="no" ${d.hasDisability === false ? "checked" : ""}/><span>No</span></label>
            </div>
          </div>
          <div class="verify-banner" style="margin-top:1.4rem">
            <svg class="ic"><use href="#i-shield"/></svg>
            <span>We only use this to narrow results. Bharat Sahay never asks for Aadhaar numbers, OTPs or bank passwords.</span>
          </div>
        </div>

        <div class="form-nav">
          <button type="button" class="btn btn-ghost" id="pfBack" disabled><svg class="ic" style="width:15px;height:15px;transform:rotate(180deg)"><use href="#i-arrow"/></svg>Back</button>
          <div style="display:flex;gap:.6rem">
            <button type="button" class="btn btn-primary" id="pfNext">Continue<svg class="ic" style="width:15px;height:15px"><use href="#i-arrow"/></svg></button>
          </div>
        </div>
      </form>
    </div>`;
  },
  collect(form){
    const fd = new FormData(form);
    const d = this.draft;
    d.age = fd.get("age") ? Number(fd.get("age")) : null;
    if (fd.get("gender")) d.gender = fd.get("gender"); else delete d.gender;
    if (fd.get("category")) d.category = fd.get("category"); else delete d.category;
    if (fd.get("state")) d.state = fd.get("state");
    if (fd.get("areaType")) d.areaType = fd.get("areaType"); else delete d.areaType;
    if (fd.get("occupation")) d.occupation = fd.get("occupation"); else delete d.occupation;
    d.isStudent = fd.get("isStudent") ? fd.get("isStudent") === "yes" : null;
    if (fd.get("income")) d.annualIncome = Number(fd.get("income")); else delete d.annualIncome;
    if (fd.get("disability")) d.hasDisability = fd.get("disability") === "yes"; else delete d.hasDisability;
  },
  validate(step){
    let ok = true;
    if (step === 1){
      const age = Number($("#age")?.value);
      $("#f-age").classList.toggle("invalid", !(age >= 1 && age <= 110));
      ok = age >= 1 && age <= 110;
    }
    if (step === 2){
      const st = $("#state")?.value;
      $("#f-state").classList.toggle("invalid", !st);
      ok = !!st;
    }
    return ok;
  },
  goto(n, form){
    this.step = n;
    $$(".form-step").forEach(s => s.classList.toggle("active", +s.dataset.step === n));
    $$(".prog-step").forEach(s => {
      const i = +s.dataset.ps;
      s.classList.toggle("current", i === n);
      s.classList.toggle("done", i < n);
      $("i", s).textContent = i < n ? "✓" : i;
    });
    $("#progBar i").style.width = (n * 25) + "%";
    $("#progBar").setAttribute("aria-valuenow", n);
    $("#pfBack").disabled = n === 1;
    const next = $("#pfNext");
    next.innerHTML = n === 4
      ? `Find relevant schemes<svg class="ic" style="width:15px;height:15px"><use href="#i-spark"/></svg>`
      : `Continue<svg class="ic" style="width:15px;height:15px"><use href="#i-arrow"/></svg>`;
    form.scrollIntoView({ behavior: Utils.reduced() ? "auto" : "smooth", block: "start" });
  },
  after(){
    const form = $("#profileForm");
    this.goto(this.step, form);
    $("#pfBack").addEventListener("click", () => { this.collect(form); this.goto(this.step - 1, form); });
    $("#pfNext").addEventListener("click", () => {
      this.collect(form);
      if (!this.validate(this.step)) { Toast.show("Please fill the required fields", "i-alert"); return; }
      if (this.step < 4){ this.goto(this.step + 1, form); return; }
      Store.set("profile", this.draft);
      Toast.show("Profile saved — checking which schemes may fit you…", "i-spark");
      Router.go("#/results");
    });
  },
};
