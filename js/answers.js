"use strict";
/* ============================================================
   answers.js — DIRECT ANSWER ENGINE
   The retrieval layer already finds the right scheme. This layer
   reads the actual fact out of that scheme's structured fields and
   states it in the FIRST sentence, with the real number.

   "How much subsidy for 3kW solar?"  → "₹78,000."  (not "I searched…")
   "Age limit for Atal Pension?"      → "18 to 40 years."
   "Income limit for SC scholarship?" → "₹2,50,000 per year."

   Everything it says is pulled verbatim from data.js / data-extra.js,
   so it can never invent a figure that isn't on the page.
   ============================================================ */
const Answers = {

  /* ---------- 1. WHICH SCHEME is the question about? ---------- */
  norm(s){ return String(s || "").toLowerCase().replace(/[^a-z0-9\u0900-\u097F\u0A00-\u0A7F]+/g, " ").trim(); },

  /* explicit aliases people actually type */
  ALIASES:{
    "pm kisan":"pm-kisan", "pmkisan":"pm-kisan", "kisan samman":"pm-kisan",
    "fasal bima":"pm-kisan-fasal-bima", "crop insurance":"pm-kisan-fasal-bima",
    "ayushman":"pmjay", "pmjay":"pmjay", "jan arogya":"pmjay",
    "vay vandana":"ayushman-vay-vandana", "vaya vandana":"ayushman-vay-vandana",
    "surya ghar":"pm-surya-ghar", "suryaghar":"pm-surya-ghar", "solar":"pm-surya-ghar", "rooftop solar":"pm-surya-ghar",
    "सोलर":"pm-surya-ghar", "सूर्य घर":"pm-surya-ghar", "सौर":"pm-surya-ghar", "ਸੋਲਰ":"pm-surya-ghar", "ਸੂਰਜ ਘਰ":"pm-surya-ghar",
    "किसान":"pm-kisan", "ਕਿਸਾਨ":"pm-kisan", "आयुष्मान":"pmjay", "ਆਯੂਸ਼ਮਾਨ":"pmjay",
    "उज्ज्वला":"pm-ujjwala", "ਉੱਜਵਲਾ":"pm-ujjwala", "मुद्रा":"pm-mudra", "ਮੁਦਰਾ":"pm-mudra",
    "मनरेगा":"mgnrega", "ਮਨਰੇਗਾ":"mgnrega", "राशन":"pmgkay-nfsa", "ਰਾਸ਼ਨ":"pmgkay-nfsa",
    "विधवा पेंशन":"nsap-ignwps", "ਵਿਧਵਾ ਪੈਨਸ਼ਨ":"nsap-ignwps",
    "वृद्धावस्था पेंशन":"ignoaps", "ਬੁਢਾਪਾ ਪੈਨਸ਼ਨ":"ignoaps",
    "सुकन्या":"sukanya-samriddhi", "ਸੁਕੰਨਿਆ":"sukanya-samriddhi",
    "आशीरਵਾਦ":"pb-ashirwad", "ਆਸ਼ੀਰਵਾਦ":"pb-ashirwad", "शगुन":"pb-ashirwad",
    "mudra":"pm-mudra", "svanidhi":"pm-svanidhi", "vishwakarma":"pm-vishwakarma",
    "ujjwala":"pm-ujjwala", "atal pension":"atal-pension-yojana", "apy":"atal-pension-yojana",
    "sukanya":"sukanya-samriddhi", "scss":"scss", "pmegp":"pmegp", "udyam":"udyam-registration",
    "stand up india":"stand-up-india", "jan dhan":"jan-dhan", "pmjdy":"jan-dhan",
    "pmjjby":"pmjjby", "jeevan jyoti":"pmjjby", "pmsby":"pmsby", "suraksha bima":"pmsby",
    "mgnrega":"mgnrega", "nrega":"mgnrega", "manrega":"mgnrega",
    "vidyalaxmi":"pm-vidyalaxmi", "vidya laxmi":"pm-vidyalaxmi",
    "eshram":"eshram-card", "e shram":"eshram-card", "udid":"udid-card", "adip":"adip-scheme",
    "kcc":"kisan-credit-card", "kisan credit":"kisan-credit-card",
    "pmay g":"pmay-g", "awas gramin":"pmay-g", "pmay u":"pmay-u2", "awas urban":"pmay-u2",
    "pmmvy":"pmmvy", "matru vandana":"pmmvy", "pmkvy":"pmkvy", "kaushal vikas":"pmkvy",
    "ignoaps":"ignoaps", "old age pension":"ignoaps", "widow pension":"nsap-ignwps",
    "ignwps":"nsap-ignwps", "igndps":"nsap-igndps", "disability pension":"nsap-igndps",
    "nfbs":"nsap-nfbs", "ration":"pmgkay-nfsa", "nfsa":"pmgkay-nfsa", "free ration":"pmgkay-nfsa",
    "internship":"pm-internship", "sarbat sehat":"pb-sarbat-sehat-bima", "ashirwad":"pb-ashirwad",
    "shagun":"pb-ashirwad", "ladki bahin":"mh-ladki-bahin", "ladli behna":"mp-ladli-behna",
    "kanyashree":"wb-kanyashree", "kanya sumangala":"up-kanya-sumangala",
    "gruha lakshmi":"ka-gruha-lakshmi", "chiranjeevi":"rj-chiranjeevi",
    "lakhpati didi":"lakhpati-didi", "nmmss":"nmmss", "pragati":"aicte-pragati", "saksham":"aicte-saksham",
    "yasasvi":"pm-yasasvi", "pmsym":"pmsym", "shram yogi":"pmsym",
  },

  resolve(q, hits){
    const n = " " + this.norm(q) + " ";
    // a) explicit alias (longest first so "vay vandana" beats "ayushman")
    const alias = Object.keys(this.ALIASES).sort((a,b) => b.length - a.length)
      .find(k => /^[a-z0-9 ]+$/.test(k) ? (n.includes(" " + k + " ") || n.includes(" " + k)) : n.includes(k));
    if (alias){ const s = SchemeIndex.get(this.ALIASES[alias]); if (s) return s; }
    // b) scheme name / translated name appearing in the question
    let best = null, bestLen = 0;
    SCHEMES.forEach(s => {
      [s.name, ...Object.values(s.names || {})].forEach(nm => {
        const core = this.norm(String(nm).split(/[—(]/)[0]);
        if (core.length > 6 && n.includes(core) && core.length > bestLen){ best = s; bestLen = core.length; }
      });
    });
    if (best) return best;
    // c) fall back to the top retrieval hit
    return hits && hits.length ? hits[0].scheme : null;
  },

  /* ---------- 2. WHAT is being asked? ---------- */
  intent(q){
    const t = " " + String(q).toLowerCase() + " ";
    const any = (...w) => w.some(x => t.includes(x));
    if (any("how much","kitna","kitne","kitni","amount","paisa","paise","money","rupee","rupay","₹",
            "benefit amount","subsidy","subsidi","grant","stipend","pension amount","cover amount",
            "कितना","कितने","कितनी","राशि","पैसा","पैसे","रुपये","लाभ राशि","सब्सिडी","सहायता राशि","अनुदान",
            "ਕਿੰਨਾ","ਕਿੰਨੇ","ਕਿੰਨੀ","ਰਕਮ","ਪੈਸਾ","ਪੈਸੇ","ਸਬਸਿਡੀ","ਸਹਾਇਤਾ")) return "amount";
    if (any("age limit","age criteria","what age","how old","umar","minimum age","maximum age","age range",
            "age for","age require","age eligib","age bar","age band","what is the age","age to join",
            "उम्र","आयु","ਉਮਰ","ਆਯੂ")) return "age";
    if (any("income limit","income criteria","salary limit","income ceiling","how much income","annual income",
            "आय सीमा","आमदनी","कमाई","ਆਮਦਨ","ਆਮਦਨੀ")) return "income";
    if (any("who is eligible","who can","eligib","qualify","criteria","conditions","patrata",
            "कौन ले सकता","कौन पात्र","पात्रता","शर्तें","ਕੌਣ ਲੈ ਸਕਦਾ","ਯੋਗਤਾ","ਸ਼ਰਤਾਂ")) return "eligibility";
    if (any("document","paper","certificate","kagaz","required document","what do i need",
            "दस्तावे","कागज","प्रमाण पत्र","ਦਸਤਾਵੇਜ਼","ਕਾਗਜ਼")) return "documents";
    if (any("how to apply","how do i apply","apply","application","process","register","form","kaise kare",
            "आवेदन","कैसे करें","प्रक्रिया","पंजीकरण","ਅਰਜ਼ੀ","ਕਿਵੇਂ","ਪ੍ਰਕਿਰਿਆ")) return "apply";
    if (any("website","portal","link","official site","url","kaha","where to apply",
            "वेबसाइट","पोर्टल","लिंक","कहाँ","ਵੈਬਸਾਈਟ","ਪੋਰਟਲ","ਕਿੱਥੇ")) return "where";
    if (any("what is","what's","explain","tell me about","kya hai","about this scheme",
            "क्या है","बताइए","समझाइए","ਕੀ ਹੈ","ਦੱਸੋ")) return "what";
    if (any("last verified","updated","how current","kab update")) return "freshness";
    return null;
  },

  /* ---------- 3. READ the fact out of the scheme record ---------- */
  inr(n){ return "₹" + Number(n).toLocaleString("en-IN"); },

  /* pick the benefit line matching a capacity/tier mentioned in the query
     e.g. "3kW" → the "3 kW and above" benefit row */
  benefitFor(scheme, q){
    const bs = scheme.benefits || [];
    if (!bs.length) return null;
    const nums = (String(q).match(/\d+/g) || []).map(Number);
    if (nums.length){
      const hit = bs.find(b => {
        const hay = (b.title + " " + b.amount + " " + b.detail).toLowerCase();
        return nums.some(x => new RegExp("\\b" + x + "\\s*(kw|kilowatt|lakh|year|yr)?\\b").test(hay));
      });
      if (hit) return hit;
    }
    return bs[0];
  },

  ageRange(scheme){
    const c = scheme.criteria || [];
    const lo = c.find(x => x.type === "age_min"), hi = c.find(x => x.type === "age_max");
    return { lo: lo ? lo.value : null, hi: hi ? hi.value : null, loText: lo && lo.text, hiText: hi && hi.text };
  },

  incomeCap(scheme){
    const c = (scheme.criteria || []).find(x => x.type === "income_max");
    return c ? { value:c.value, text:c.text } : null;
  },

  /* ---------- 4. COMPOSE the direct answer ---------- */
  build(scheme, intent, q, T, profile){
    const s = scheme, nm = s.name;
    const where = s.level === "state" ? T(` (a ${s.state} state scheme)`, ` (${s.state} की राज्य योजना)`, ` (${s.state} ਦੀ ਰਾਜ ਸਕੀਮ)`) : "";

    if (intent === "amount"){
      const b = this.benefitFor(s, q);
      if (!b) return null;
      const others = (s.benefits || []).filter(x => x !== b).slice(0, 3);
      const extra = others.length
        ? T(`\n\nOther benefits: ${others.map(o => `${o.title} — ${o.amount}`).join("; ")}.`,
            `\n\nअन्य लाभ: ${others.map(o => `${o.title} — ${o.amount}`).join("; ")}।`,
            `\n\nਹੋਰ ਲਾਭ: ${others.map(o => `${o.title} — ${o.amount}`).join("; ")}।`)
        : "";
      // "Direct income support" reads as a noun phrase; "3 kW and above" is a tier label.
      // Phrase it as a label rather than forcing it into "that is the …" grammar.
      return T(
        `${b.amount} under ${nm}${where} — ${b.title}. ${b.detail}${extra}`,
        `${b.amount} — ${nm}${where} के तहत ${b.title}। ${b.detail}${extra}`,
        `${b.amount} — ${nm}${where} ਅਧੀਨ ${b.title}। ${b.detail}${extra}`);
    }

    if (intent === "age"){
      const a = this.ageRange(s);
      if (a.lo == null && a.hi == null)
        return T(`${nm} does not set a specific age limit in our record. The stated conditions are: ${(s.criteria||[]).map(c=>c.text).slice(0,3).join("; ")}.`,
                 `${nm} में हमारे रिकॉर्ड के अनुसार कोई निश्चित आयु सीमा नहीं है। शर्तें: ${(s.criteria||[]).map(c=>c.text).slice(0,3).join("; ")}।`,
                 `${nm} ਵਿੱਚ ਸਾਡੇ ਰਿਕਾਰਡ ਅਨੁਸਾਰ ਕੋਈ ਪੱਕੀ ਉਮਰ ਸੀਮਾ ਨਹੀਂ। ਸ਼ਰਤਾਂ: ${(s.criteria||[]).map(c=>c.text).slice(0,3).join("; ")}।`);
      const span = (a.lo != null && a.hi != null)
        ? T(`${a.lo} to ${a.hi} years`, `${a.lo} से ${a.hi} वर्ष`, `${a.lo} ਤੋਂ ${a.hi} ਸਾਲ`)
        : a.lo != null
          ? T(`${a.lo} years and above`, `${a.lo} वर्ष या उससे अधिक`, `${a.lo} ਸਾਲ ਜਾਂ ਵੱਧ`)
          : T(`up to ${a.hi} years`, `${a.hi} वर्ष तक`, `${a.hi} ਸਾਲ ਤੱਕ`);
      return T(`${span} — that is the age requirement for ${nm}${where}. ${[a.loText, a.hiText].filter(Boolean).join(" · ")}`,
               `${span} — ${nm}${where} के लिए यही आयु शर्त है। ${[a.loText, a.hiText].filter(Boolean).join(" · ")}`,
               `${span} — ${nm}${where} ਲਈ ਇਹੀ ਉਮਰ ਸ਼ਰਤ ਹੈ। ${[a.loText, a.hiText].filter(Boolean).join(" · ")}`);
    }

    if (intent === "income"){
      const c = this.incomeCap(s);
      if (!c) return T(`${nm} does not specify a family income ceiling in our record.`,
                       `${nm} में हमारे रिकॉर्ड के अनुसार कोई आय सीमा तय नहीं है।`,
                       `${nm} ਵਿੱਚ ਸਾਡੇ ਰਿਕਾਰਡ ਅਨੁਸਾਰ ਕੋਈ ਆਮਦਨ ਸੀਮਾ ਨਹੀਂ।`);
      const ok = profile && profile.annualIncome != null
        ? (Number(profile.annualIncome) <= Number(c.value)
            ? T(` Your recorded income (${this.inr(profile.annualIncome)}) is within this limit.`,
                ` आपकी दर्ज आय (${this.inr(profile.annualIncome)}) इस सीमा के भीतर है।`,
                ` ਤੁਹਾਡੀ ਦਰਜ ਆਮਦਨ (${this.inr(profile.annualIncome)}) ਇਸ ਸੀਮਾ ਅੰਦਰ ਹੈ।`)
            : T(` Your recorded income (${this.inr(profile.annualIncome)}) is above this limit.`,
                ` आपकी दर्ज आय (${this.inr(profile.annualIncome)}) इस सीमा से अधिक है।`,
                ` ਤੁਹਾਡੀ ਦਰਜ ਆਮਦਨ (${this.inr(profile.annualIncome)}) ਇਸ ਸੀਮਾ ਤੋਂ ਵੱਧ ਹੈ।`))
        : "";
      return T(`${this.inr(c.value)} per year — that is the family income ceiling for ${nm}${where}. ${c.text}.${ok}`,
               `${this.inr(c.value)} प्रति वर्ष — ${nm}${where} के लिए यही पारिवारिक आय सीमा है। ${c.text}।${ok}`,
               `${this.inr(c.value)} ਪ੍ਰਤੀ ਸਾਲ — ${nm}${where} ਲਈ ਇਹੀ ਪਰਿਵਾਰਕ ਆਮਦਨ ਸੀਮਾ ਹੈ। ${c.text}।${ok}`);
    }

    if (intent === "eligibility"){
      const list = (s.criteria || []).map(c => c.text).filter(Boolean);
      if (!list.length) return null;
      return T(`To qualify for ${nm}${where} you must meet these conditions: ${list.join("; ")}.`,
               `${nm}${where} के लिए पात्रता की शर्तें: ${list.join("; ")}।`,
               `${nm}${where} ਲਈ ਯੋਗਤਾ ਦੀਆਂ ਸ਼ਰਤਾਂ: ${list.join("; ")}।`);
    }

    if (intent === "where"){
      return T(`Apply for ${nm} on the official portal: ${s.official_url} — issued by ${s.authority}. Last verified ${s.last_verified_at}.`,
               `${nm} के लिए आधिकारिक पोर्टल: ${s.official_url} — ${s.authority} द्वारा। अंतिम जाँच ${s.last_verified_at}।`,
               `${nm} ਲਈ ਅਧਿਕਾਰਤ ਪੋਰਟਲ: ${s.official_url} — ${s.authority} ਵੱਲੋਂ। ਆਖ਼ਰੀ ਜਾਂਚ ${s.last_verified_at}।`);
    }

    if (intent === "freshness"){
      return T(`Our entry for ${nm} was last verified on ${s.last_verified_at}, against ${s.sources[0].title}.`,
               `${nm} की जानकारी ${s.last_verified_at} को ${s.sources[0].title} से जाँची गई थी।`,
               `${nm} ਦੀ ਜਾਣਕਾਰੀ ${s.last_verified_at} ਨੂੰ ${s.sources[0].title} ਤੋਂ ਜਾਂਚੀ ਗਈ ਸੀ।`);
    }

    if (intent === "what"){
      const top = (s.benefits || [])[0];
      return T(`${nm}${where} — ${s.summary} ${s.description}${top ? ` The headline benefit is ${top.amount}.` : ""}`,
               `${nm}${where} — ${s.summary} ${s.description}${top ? ` मुख्य लाभ: ${top.amount}।` : ""}`,
               `${nm}${where} — ${s.summary} ${s.description}${top ? ` ਮੁੱਖ ਲਾਭ: ${top.amount}।` : ""}`);
    }

    return null;
  },
};

/* ============================================================
   Wrap Brain.respond: answer the question first, keep every
   existing card, source, RAG trace and follow-up chip intact.
   ============================================================ */
const _respond = Brain.respond.bind(Brain);
Brain.respond = function(q, lang, profile){
  const out = _respond(q, lang, profile);
  try {
    Retrieval.build();
    const hits = Retrieval.search(q, 4);
    const scheme = Answers.resolve(q, hits);
    if (!scheme) return out;

    const L = out.answerLang || lang || "en";
    const T = (en, hi, pa) => L === "hi" ? hi : L === "pa" ? pa : en;
    const intent = Answers.intent(q);

    /* make sure the scheme we answered about is the first card shown */
    const rank = Eligibility.rank(profile || {});
    const bySlug = new Map(rank.map(m => [m.scheme.slug, m]));
    const primary = bySlug.get(scheme.slug);
    if (primary){
      out.schemes = [primary, ...(out.schemes || []).filter(m => m.scheme.slug !== scheme.slug)].slice(0, 3);
      out.sources = [...new Map(out.schemes.flatMap(m => m.scheme.sources.map(x => [x.url, x]))).values()].slice(0, 3);
    }

    /* intent-specific payloads so the cards below match the question */
    if (intent === "documents"){ out.docs = scheme.documents; out.applySteps = null; }
    if (intent === "apply"){ out.applySteps = scheme.apply; out.docs = null; }

    const direct = Answers.build(scheme, intent, q, T, profile);
    if (direct){
      out.answer = direct;
      out.answeredBy = { slug:scheme.slug, intent };
    } else if (intent === "documents"){
      const m = scheme.documents.filter(d => d.mandatory).length;
      out.answer = T(
        `${scheme.name} needs ${m} mandatory document${m === 1 ? "" : "s"}: ${scheme.documents.filter(d => d.mandatory).map(d => d.name).join(", ")}.`,
        `${scheme.name} के लिए ${m} अनिवार्य दस्तावेज़ चाहिए: ${scheme.documents.filter(d => d.mandatory).map(d => d.name).join(", ")}।`,
        `${scheme.name} ਲਈ ${m} ਲਾਜ਼ਮੀ ਦਸਤਾਵੇਜ਼ ਚਾਹੀਦੇ: ${scheme.documents.filter(d => d.mandatory).map(d => d.name).join(", ")}।`);
      out.answeredBy = { slug:scheme.slug, intent };
    } else if (intent === "apply"){
      out.answer = T(
        `To apply for ${scheme.name}: ${scheme.apply[0]} The full ${scheme.apply.length}-step route is below, and the official portal is ${scheme.official_url}.`,
        `${scheme.name} के लिए आवेदन: ${scheme.apply[0]} पूरी ${scheme.apply.length}-चरण प्रक्रिया नीचे है, आधिकारिक पोर्टल ${scheme.official_url} है।`,
        `${scheme.name} ਲਈ ਅਰਜ਼ੀ: ${scheme.apply[0]} ਪੂਰੀ ${scheme.apply.length}-ਪੜਾਅ ਪ੍ਰਕਿਰਿਆ ਹੇਠਾਂ ਹੈ, ਅਧਿਕਾਰਤ ਪੋਰਟਲ ${scheme.official_url} ਹੈ।`);
      out.answeredBy = { slug:scheme.slug, intent };
    }
  } catch (e){ /* never break the chat — fall back to the original reply */ }
  return out;
};
