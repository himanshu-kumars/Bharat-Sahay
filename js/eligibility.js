"use strict";
/* ---------- eligibility.js (rule engine per docs/03_USER_FLOW.md) ---------- */
const STATUS = {
  LIKELY:{ key:"LIKELY_ELIGIBLE", label:"Likely eligible", cls:"status-likely", icon:"i-check" },
  POSSIBLE:{ key:"POSSIBLY_ELIGIBLE", label:"Possibly eligible", cls:"status-possible", icon:"i-info" },
  MORE:{ key:"MORE_INFORMATION_NEEDED", label:"More information needed", cls:"status-moreinfo", icon:"i-alert" },
  NOT:{ key:"NOT_MATCHED", label:"Not matched", cls:"status-notmatched", icon:"i-x" },
};
const Eligibility = {
  evaluate(scheme, profile){
    const p = profile || {};
    const met = [], unmet = [], unknown = [];
    (scheme.criteria || []).forEach(c => {
      if (c.type === "unknown_note"){ unknown.push(c.text); return; }
      const keyMap = { student_status:"isStudent", age_min:"age", age_max:"age", income_max:"annualIncome", area_type:"areaType", disability:"hasDisability" };
      const v = p[keyMap[c.type] || c.type];
      if (v === undefined || v === null || v === ""){ unknown.push(c.text); return; }
      let ok = false;
      if (c.op === "in") ok = (Array.isArray(c.value) ? c.value : [c.value]).includes(v);
      else if (c.type === "income_max") ok = Number(v) <= Number(c.value);
      else if (c.type === "age_min") ok = Number(v) >= Number(c.value);
      else if (c.type === "age_max") ok = Number(v) <= Number(c.value);
      else ok = String(v) === String(c.value);
      (ok ? met : unmet).push(c.text);
    });
    let status;
    if (unmet.length) status = STATUS.NOT;
    else if (!unknown.length && met.length) status = STATUS.LIKELY;
    else if (met.length >= unknown.length) status = STATUS.POSSIBLE;
    else status = STATUS.MORE;
    return { scheme, status, matched:met, unmet, unknown };
  },
  rank(profile){
    const order = { LIKELY_ELIGIBLE:0, POSSIBLY_ELIGIBLE:1, MORE_INFORMATION_NEEDED:2, NOT_MATCHED:3 };
    return SCHEMES.map(s => this.evaluate(s, profile))
      .sort((a,b) => order[a.status.key] - order[b.status.key] || b.matched.length - a.matched.length);
  },
};
