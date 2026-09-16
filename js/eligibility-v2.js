"use strict";
/* ============================================================
   eligibility-v2.js — upgrades the rule engine in place
   · understands state-level schemes, level, tags
   · produces a 0–100 confidence score
   · produces an estimated annual benefit value
   · explains WHAT to add to the profile to resolve unknowns
   ============================================================ */

/* criterion type → profile field */
const CRITERION_MAP = {
  student_status:"isStudent", age_min:"age", age_max:"age", income_max:"annualIncome",
  area_type:"areaType", disability:"hasDisability", state:"state",
  gender:"gender", category:"category", occupation:"occupation",
};

/* human-readable prompt for a missing field */
const MISSING_PROMPT = {
  age:"your age", annualIncome:"your annual family income", state:"your state",
  areaType:"whether you live in a rural or urban area", gender:"your gender",
  category:"your social category", occupation:"your occupation",
  isStudent:"whether you are currently studying", hasDisability:"whether you have a disability",
};

/* parse "₹6,000/year", "Up to ₹78,000", "₹1,250/month" → rupees per year */
function annualValueOf(amountText){
  const t = String(amountText || "");
  const nums = t.replace(/,/g, "").match(/\d+(?:\.\d+)?/g);
  if (!nums) return 0;
  const n = Math.max(...nums.map(Number));
  if (/month/i.test(t)) return n * 12;
  if (/lakh/i.test(t)) return n * 100000;
  if (/crore/i.test(t)) return n * 10000000;
  return n;
}

/* A loan ceiling, an insurance sum-assured or a deposit limit is
   borrowing/cover capacity — not money in hand. Only recurring or
   one-time transfers count towards the indicative annual value. */
const NON_CASH = /loan|cover|insurance|guarantee|deposit|credit|subsidy rate|guarantee cover|ceiling|policy benefit|legal remedy|gateway|free|advisory|days|units|lpcd|cashless|interest|reimburs/i;

Eligibility.annualValue = function(scheme){
  const cash = (scheme.benefits || []).map(b => annualValueOf(b.amount));
  return cash.length ? Math.max(...cash) : 0;
};

/* the conservative figure used in the portfolio total */
Eligibility.cashValue = function(scheme){
  // whole categories are capacity rather than income
  if (scheme.category === "insurance" || scheme.category === "business") return 0;
  const vals = (scheme.benefits || [])
    .filter(b => !NON_CASH.test(String(b.amount) + " " + String(b.title)))
    .map(b => annualValueOf(b.amount))
    .filter(v => v > 0 && v <= 200000);
  return vals.length ? Math.max(...vals) : 0;
};

Eligibility.missingFields = function(scheme, profile){
  const p = profile || {}, out = [];
  (scheme.criteria || []).forEach(c => {
    if (c.type === "unknown_note") return;
    const key = CRITERION_MAP[c.type] || c.type;
    const v = p[key];
    if (v === undefined || v === null || v === "") out.push(MISSING_PROMPT[key] || key);
  });
  return [...new Set(out)];
};

/* ---- wrap the original evaluator, keeping its behaviour intact ---- */
const _evaluate = Eligibility.evaluate.bind(Eligibility);
Eligibility.evaluate = function(scheme, profile){
  const r = _evaluate(scheme, profile);
  const total = r.matched.length + r.unmet.length + r.unknown.length || 1;
  // score: met criteria count full, unknowns count half, unmet are penalised hard
  let score = Math.round(((r.matched.length + r.unknown.length * 0.4) / total) * 100);
  if (r.unmet.length) score = Math.max(0, score - r.unmet.length * 35);
  r.score = Math.min(100, score);
  r.missing = Eligibility.missingFields(scheme, profile);
  r.annualValue = Eligibility.annualValue(scheme);
  r.stateRelevant = !scheme.state || !profile || !profile.state || scheme.state === profile.state;
  return r;
};

/* ---- ranking now respects score + state relevance + value ---- */
Eligibility.rank = function(profile){
  const order = { LIKELY_ELIGIBLE:0, POSSIBLY_ELIGIBLE:1, MORE_INFORMATION_NEEDED:2, NOT_MATCHED:3 };
  return SCHEMES.map(s => this.evaluate(s, profile))
    .sort((a, b) =>
      order[a.status.key] - order[b.status.key] ||
      (b.stateRelevant - a.stateRelevant) ||
      b.score - a.score ||
      b.annualValue - a.annualValue
    );
};

/* ---- portfolio summary: what is the whole basket worth? ---- */
Eligibility.portfolio = function(ranked){
  const good = ranked.filter(r => r.status.key === "LIKELY_ELIGIBLE" || r.status.key === "POSSIBLY_ELIGIBLE");
  const cashy = good.map(r => Eligibility.cashValue(r.scheme)).filter(v => v > 0);
  return {
    likely: ranked.filter(r => r.status.key === "LIKELY_ELIGIBLE").length,
    possible: ranked.filter(r => r.status.key === "POSSIBLY_ELIGIBLE").length,
    moreInfo: ranked.filter(r => r.status.key === "MORE_INFORMATION_NEEDED").length,
    notMatched: ranked.filter(r => r.status.key === "NOT_MATCHED").length,
    estimatedValue: cashy.reduce((n, v) => n + v, 0),
    docsNeeded: [...new Set(good.flatMap(r => (r.scheme.documents || []).filter(d => d.mandatory).map(d => d.name)))],
    topGaps: (() => {
      const count = {};
      ranked.filter(r => r.status.key !== "NOT_MATCHED").forEach(r => r.missing.forEach(m => { count[m] = (count[m] || 0) + 1; }));
      return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 4);
    })(),
  };
};
