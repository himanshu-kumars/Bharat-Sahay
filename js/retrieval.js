"use strict";
/* ---------- retrieval.js (multilingual RAG-lite: BM25 over the whole scheme corpus) ---------- */
const SYN_GROUPS = [
  ["scholarship","stipend","education","student","study","छात्रवृत्ति","पढ़ाई","विद्यार्थी","शिक्षा","ਪੜ੍ਹਾਈ","ਵਿਦਿਆਰਥੀ","ਸਿੱਖਿਆ","chatravritti","padhai","vidyarthi","parhai"],
  ["housing","house","home","आवास","मकान","घर","ਆਵਾਸ","ਘਰ","ਮਕਾਨ","ghar","makan","aawas","awass"],
  ["health","medical","hospital","illness","स्वास्थ्य","इलाज","अस्पताल","बीमार","ਸਿਹਤ","ਹਸਪਤਾਲ","ਇਲਾਜ","ilaj","aspataal","mariz"],
  ["farmer","farming","agriculture","crop","kisan","किसान","खेती","फसल","ਕਿਸਾਨ","ਖੇਤੀ","ਫ਼ਸਲ","kheti","fasal"],
  ["pension","retirement","senior","old age","पेंशन","बुजुर्ग","वृद्ध","ਪੈਨਸ਼ਨ","ਬਜ਼ੁਰਗ","bujurg","retirement"],
  ["job","employment","skill","training","work","रोज़गार","नौकरी","कौशल","प्रशिक्षण","ਨੌਕਰੀ","ਰੁਜ਼ਗਾਰ","ਹੁਨਰ","ਸਿਖਲਾਈ","naukri","rozgar","hunar"],
  ["loan","credit","money","finance","business","पैसा","ऋण","लोन","वित्त","ਪੈਸੇ","ਲੋਨ","ਧੰਦਾ","paisa"],
  ["women","girl","daughter","wife","महिला","लड़की","बेटी","पत्नी","ਔਰਤ","ਲੜਕੀ","ਬੇਟੀ","mahila","beti","ladki","aurat"],
  ["document","paper","certificate","required","क़ाग़ज़","दस्तावेज़","प्रमाण-पत्र","ਜ਼ਰੂਰੀ","ਕਾਗ਼ਜ਼","ਦਸਤਾਵੇਜ਼","ਦਸਤਾਵੇਜ਼","dastavez","kaghaz","kagaz"],
  ["apply","application","form","process","आवेदन","प्रक्रिया","फ़ॉर्म","ਅਰਜ਼ੀ","ਪ੍ਰਕਿਰਿਆ","ਫਾਰਮ","aavedan","arzi","foram"],
  ["insurance","cover","बीमा","ਵੀਮਾ","bima","suraksha"],
  ["gas","cylinder","cooktop","ujjwala","गैस","सिलेंडर","ਰਸੋਈ","ਗੈਸ","ਸਿਲੰਡਰ"],
  ["artisan","craft","toolkit","vishwakarma","कारीगर","उपकरण","ਕਾਰੀਗਰ","karigar"],
  ["disability","divyang","blind","locomotor","दिव्यांग","अपंग","ਦਿਵ્યાਂਗ","ਅਪਾਹਿਜ","divyang","apang"],
  ["mother","pregnancy","maternity","child","मातृ","गर्भवती","बच्चा","ਮਾਂ","ਬੱਚਾ","mata","garbhwati"],
  ["wage","labour","worker","मज़दूर","श्रमिक","ਮਜ਼ਦੂਰ","mazdoor","shramik","labour"],
];
const SYN_MAP = (() => {
  const m = Object.create(null);
  for (const g of SYN_GROUPS) for (const w of g) {
    if (typeof w !== "string") continue;
    m[w] = m[w] || new Set();
    for (const x of g) if (typeof x === "string" && x !== w) m[w].add(x);
  }
  return m;
})();

const Retrieval = {
  _built: false, docs: null, df: null, avg: 0,
  normalize(txt){ return String(txt ?? "").toLowerCase().replace(/[^\p{L}\p{N}\s]+/gu, " ").split(/\s+/).filter(w => w.length > 1); },
  tokenize(txt, expand){
    const base = this.normalize(txt);
    if (!expand) return base;
    const out = new Set(base);
    for (const w of base){ const syn = SYN_MAP[w]; if (syn) for (const x of syn) out.add(x); }
    return [...out];
  },
  build(){
    if (this._built) return;
    this.docs = SCHEMES.map(s => {
      const bag = Object.create(null);
      const add = (txt, wt) => { for (const tk of this.tokenize(txt)) bag[tk] = (bag[tk] || 0) + wt; };
      add(s.name, 3); add(s.names && s.names.hi, 3); add(s.names && s.names.pa, 3);
      add(s.summary, 2); add(s.description, 1.4);
      add(CATEGORIES[s.category] && CATEGORIES[s.category].label, 1.2);
      add(s.benefits.map(b => b.title + " " + b.detail).join(" "), 1.4);
      add(s.documents.map(d => d.name).join(" "), 1);
      add(s.criteria.map(c => c.text).join(" "), 1);
      (s.apply || []).forEach(a => add(a, .8));
      const len = Object.values(bag).reduce((a, b) => a + b, 0);
      return { s, bag, len };
    });
    this.df = Object.create(null);
    for (const d of this.docs) for (const tk of Object.keys(d.bag)) this.df[tk] = (this.df[tk] || 0) + 1;
    this.avg = this.docs.reduce((a, d) => a + d.len, 0) / (this.docs.length || 1);
    this._built = true;
  },
  search(q, k = 3){
    this.build();
    const toks = this.tokenize(q, true);
    if (!toks.length) return [];
    const K1 = 1.2, B = .75, N = this.docs.length;
    const scored = this.docs.map(d => {
      let sc = 0;
      for (const tk of toks){
        const tf = d.bag[tk] || 0; if (!tf) continue;
        const idf = Math.log(1 + (N - (this.df[tk] || 0) + .5) / ((this.df[tk] || 0) + .5));
        sc += idf * (tf * (K1 + 1)) / (tf + K1 * (1 - B + B * d.len / this.avg));
      }
      return { d, sc };
    }).filter(x => x.sc > 0).sort((a, b) => b.sc - a.sc).slice(0, k);
    if (!scored.length) return [];
    const max = scored[0].sc, tkset = new Set(toks);
    return scored.map(x => {
      const s = x.d.s, fields = [];
      const chk = (label, txt) => { if (!txt) return; if (this.normalize(txt).some(w => tkset.has(w))) fields.push({ label, txt: String(txt) }); };
      chk("scheme name", s.name); chk("हिन्दी नाम", s.names && s.names.hi); chk("ਪੰਜਾਬੀ ਨਾਮ", s.names && s.names.pa);
      chk("summary", s.summary);
      chk("benefits", s.benefits.map(b => b.title + " — " + b.detail).join(" · "));
      chk("documents", s.documents.map(dd => dd.name).join(", "));
      chk("eligibility", s.criteria.map(cc => cc.text).join(" · "));
      return { scheme: s, score: +(x.sc / max).toFixed(2), fields: fields.slice(0, 3) };
    });
  },
};
